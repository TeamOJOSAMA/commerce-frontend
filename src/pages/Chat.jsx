import { useEffect, useRef, useState } from 'react';
import { createChatRoom, getMyChatRooms, getChatMessages } from '../api/chat';
import { createStompClient, decodeUserId } from '../lib/chatSocket';
import { useAuthStore } from '../store/authStore';
import { DEMO_TOKEN, DEMO_CHAT_ROOMS, DEMO_CHAT_AUTO_REPLIES } from '../mocks/demoData';
import { formatInquiryStatus } from '../constants/inquiryStatus';

const ESCALATE_MESSAGE = '상담사 연결';

const formatRoomTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${m}.${d}`;
};

const formatMessageTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function Chat() {
  const token = useAuthStore((state) => state.token);
  const isDemo = token === DEMO_TOKEN;

  return isDemo ? <DemoChat /> : <LiveChat token={token} />;
}

// ────────────────────────────── 데모 모드: 프론트에서만 흉내 낸 대화 ──────────────────────────────
function DemoChat() {
  const [rooms, setRooms] = useState(DEMO_CHAT_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState(DEMO_CHAT_ROOMS[0].chatRoomId);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  const activeRoom = rooms.find((room) => room.chatRoomId === activeRoomId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages]);

  const appendMessage = (roomId, message) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.chatRoomId === roomId ? { ...room, messages: [...room.messages, message] } : room
      )
    );
  };

  const handleSend = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    appendMessage(activeRoomId, { id: Date.now(), from: 'me', text });
    setDraft('');

    window.setTimeout(() => {
      const reply = DEMO_CHAT_AUTO_REPLIES[Math.floor(Math.random() * DEMO_CHAT_AUTO_REPLIES.length)];
      appendMessage(activeRoomId, { id: Date.now() + 1, from: 'agent', text: reply });
    }, 700);
  };

  return (
    <div className="clay mx-auto flex h-[560px] max-w-4xl overflow-hidden">
      <RoomList
        title="문의 내역"
        rooms={rooms.map((room) => ({
          chatRoomId: room.chatRoomId,
          title: room.title,
          inquiryStatus: room.inquiryStatus,
          updatedAt: room.updatedAt,
          preview: room.messages[room.messages.length - 1]?.text,
        }))}
        activeRoomId={activeRoomId}
        onSelect={setActiveRoomId}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <RoomHeader title={activeRoom.title} subtitle={`${activeRoom.assigneeName ? `${activeRoom.assigneeName} 상담원` : '상담원 연결 대기중'} · 데모 화면`} />

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {activeRoom.messages.map((message) => (
            <MessageBubble key={message.id} isMine={message.from === 'me'} text={message.text} />
          ))}
          <div ref={bottomRef} />
        </div>

        <MessageForm value={draft} onChange={setDraft} onSubmit={handleSend} />
      </div>
    </div>
  );
}

// ────────────────────────────── 실사용: 실제 STOMP 연결 ──────────────────────────────
function LiveChat({ token }) {
  const myUserId = decodeUserId(token);

  const [rooms, setRooms] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [draft, setDraft] = useState('');

  const bottomRef = useRef(null);
  const stompClientRef = useRef(null);

  // STOMP 연결은 마운트 시 한 번만 맺는다.
  useEffect(() => {
    const client = createStompClient(token);
    stompClientRef.current = client;

    client.onConnect = () => setConnected(true);
    client.onWebSocketClose = () => setConnected(false);
    client.activate();

    return () => {
      client.deactivate();
      stompClientRef.current = null;
    };
  }, [token]);

  // 내 문의 목록을 불러오고, 없으면 새 문의 작성 폼을 바로 띄운다.
  useEffect(() => {
    getMyChatRooms().then((page) => {
      const content = page?.content ?? [];
      setRooms(content);
      if (content.length > 0) {
        setActiveRoomId(content[0].chatRoomId);
      } else {
        setShowNewRoomForm(true);
      }
    });
  }, []);

  // 활성 방을 구독하고 대화 내역을 불러온다. 방이 바뀌거나 재연결되면 다시 실행된다.
  useEffect(() => {
    if (!connected || !activeRoomId) return;
    const client = stompClientRef.current;
    if (!client) return;

    setMessages([]);
    getChatMessages(activeRoomId).then((slice) => {
      // BEFORE 방향은 최신순으로 내려오므로 화면 표시 순서에 맞게 뒤집는다.
      setMessages([...(slice?.messages ?? [])].reverse());
    });

    const messageSub = client.subscribe(`/sub/chat-rooms/${activeRoomId}`, (frame) => {
      setMessages((prev) => [...prev, JSON.parse(frame.body)]);
    });

    const statusSub = client.subscribe(`/sub/chat-rooms/${activeRoomId}/status`, (frame) => {
      const nextStatus = frame.body;
      setRooms((prev) =>
        prev.map((room) => (room.chatRoomId === activeRoomId ? { ...room, inquiryStatus: nextStatus } : room))
      );
    });

    const errorSub = client.subscribe(`/sub/chat-rooms/${activeRoomId}/errors`, (frame) => {
      console.error('채팅 오류:', frame.body);
    });

    return () => {
      messageSub.unsubscribe();
      statusSub.unsubscribe();
      errorSub.unsubscribe();
    };
  }, [connected, activeRoomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const publish = (content) => {
    if (!connected || !activeRoomId) return;
    stompClientRef.current.publish({
      destination: `/pub/chat-rooms/${activeRoomId}/messages`,
      body: JSON.stringify({ content }),
    });
  };

  const handleSend = (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    publish(text);
    setDraft('');
  };

  const handleEscalate = () => publish(ESCALATE_MESSAGE);

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    const title = newRoomTitle.trim();
    if (!title) return;

    setCreatingRoom(true);
    try {
      const room = await createChatRoom(title);
      setRooms((prev) => [
        {
          chatRoomId: room.chatRoomId,
          title: room.title,
          inquiryStatus: room.inquiryStatus,
          assigneeName: null,
          createdAt: room.createdAt,
          updatedAt: room.createdAt,
        },
        ...(prev ?? []),
      ]);
      setActiveRoomId(room.chatRoomId);
      setShowNewRoomForm(false);
      setNewRoomTitle('');
    } finally {
      setCreatingRoom(false);
    }
  };

  const activeRoom = rooms?.find((room) => room.chatRoomId === activeRoomId);

  return (
    <div className="clay mx-auto flex h-[560px] max-w-4xl overflow-hidden">
      <div className="flex w-64 shrink-0 flex-col border-r" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center justify-between border-b px-4 py-4" style={{ borderColor: 'var(--line)' }}>
          <div className="font-bold">문의 내역</div>
          <button
            onClick={() => setShowNewRoomForm((value) => !value)}
            className="rounded px-2 py-1 text-xs hover:border-black"
            style={{ border: '1px solid var(--line)' }}
          >
            + 새 문의
          </button>
        </div>

        {showNewRoomForm && (
          <form onSubmit={handleCreateRoom} className="flex flex-col gap-2 border-b p-3" style={{ borderColor: 'var(--line)' }}>
            <input
              value={newRoomTitle}
              onChange={(event) => setNewRoomTitle(event.target.value)}
              placeholder="문의 제목 (예: 배송 문의)"
              maxLength={30}
              className="rounded border px-2 py-1.5 text-sm outline-none focus:border-black"
              style={{ borderColor: 'var(--line)' }}
            />
            <button
              type="submit"
              disabled={creatingRoom || !newRoomTitle.trim()}
              className="clay-accent py-1.5 text-sm disabled:opacity-40"
            >
              {creatingRoom ? '접수 중...' : '문의 시작하기'}
            </button>
          </form>
        )}

        <RoomList
          rooms={(rooms ?? []).map((room) => ({
            chatRoomId: room.chatRoomId,
            title: room.title,
            inquiryStatus: room.inquiryStatus,
            updatedAt: room.updatedAt,
            preview: room.assigneeName ? `${room.assigneeName} 상담원 배정됨` : null,
          }))}
          activeRoomId={activeRoomId}
          onSelect={setActiveRoomId}
          bare
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {!activeRoom ? (
          <div className="flex flex-1 items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {rooms === null ? '불러오는 중...' : '왼쪽에서 "+ 새 문의"로 문의를 시작해보세요.'}
          </div>
        ) : (
          <>
            <RoomHeader
              title={activeRoom.title}
              subtitle={`${formatInquiryStatus(activeRoom.inquiryStatus)}${activeRoom.assigneeName ? ` · ${activeRoom.assigneeName} 상담원` : ''}${connected ? '' : ' · 연결 중...'}`}
              action={
                activeRoom.inquiryStatus === 'BOT_HANDLING' ? (
                  <button
                    onClick={handleEscalate}
                    className="shrink-0 rounded border px-3 py-1.5 text-xs hover:border-black"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    상담원 연결
                  </button>
                ) : null
              }
            />

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  대화를 시작해보세요.
                </div>
              )}
              {messages.map((message) =>
                message.messageType === 'ENTER' || message.messageType === 'LEAVE' ? (
                  <div key={message.chatMessageId} className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                    {message.content}
                  </div>
                ) : (
                  <MessageBubble
                    key={message.chatMessageId}
                    isMine={message.senderId === myUserId}
                    senderName={message.senderId === myUserId ? null : message.senderName}
                    text={message.content}
                    time={formatMessageTime(message.createdAt)}
                  />
                )
              )}
              <div ref={bottomRef} />
            </div>

            <MessageForm
              value={draft}
              onChange={setDraft}
              onSubmit={handleSend}
              disabled={!connected || activeRoom.inquiryStatus === 'COMPLETED'}
              placeholder={activeRoom.inquiryStatus === 'COMPLETED' ? '완료된 문의입니다.' : '메시지를 입력하세요'}
            />
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────── 공용 조각 ──────────────────────────────
function RoomList({ title, rooms, activeRoomId, onSelect, bare }) {
  return (
    <div className={bare ? 'flex-1 overflow-y-auto' : 'flex w-64 shrink-0 flex-col border-r'} style={bare ? {} : { borderColor: 'var(--line)' }}>
      {!bare && (
        <div className="border-b px-4 py-4" style={{ borderColor: 'var(--line)' }}>
          <div className="font-bold">{title}</div>
        </div>
      )}
      <div className={bare ? '' : 'flex-1 overflow-y-auto'}>
        {rooms.length === 0 && (
          <div className="px-4 py-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            문의 내역이 없습니다.
          </div>
        )}
        {rooms.map((room) => {
          const isActive = room.chatRoomId === activeRoomId;
          return (
            <button
              key={room.chatRoomId}
              onClick={() => onSelect(room.chatRoomId)}
              className="flex w-full flex-col gap-1 border-b px-4 py-3 text-left"
              style={{
                borderColor: 'var(--line)',
                background: isActive ? 'var(--paper-2)' : 'transparent',
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="break-words text-sm font-semibold">{room.title}</span>
                <span className="shrink-0 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {formatRoomTime(room.updatedAt)}
                </span>
              </div>
              {room.preview && (
                <div className="break-words text-xs" style={{ color: 'var(--text-muted)' }}>
                  {room.preview}
                </div>
              )}
              <span
                className="mt-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                style={{ background: room.inquiryStatus === 'COMPLETED' ? 'var(--text-muted)' : 'var(--ink)' }}
              >
                {formatInquiryStatus(room.inquiryStatus)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RoomHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b px-5 py-4" style={{ borderColor: 'var(--line)' }}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg">💬</span>
        <div className="min-w-0">
          <div className="break-words font-bold">{title}</div>
          <div className="break-words text-xs" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </div>
        </div>
      </div>
      {action}
    </div>
  );
}

export function MessageBubble({ isMine, senderName, text, time }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[75%] flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {senderName && (
          <span className="mb-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {senderName}
          </span>
        )}
        <div className="flex items-end gap-1.5">
          {isMine && time && (
            <span className="shrink-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {time}
            </span>
          )}
          <div
            className="w-72 break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
            style={
              isMine
                ? { background: 'var(--ink)', color: '#fff', borderBottomRightRadius: 4 }
                : { background: 'var(--paper-2)', color: 'var(--text-dark)', borderBottomLeftRadius: 4 }
            }
          >
            {text}
          </div>
          {!isMine && time && (
            <span className="shrink-0 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {time}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessageForm({ value, onChange, onSubmit, disabled, placeholder = '메시지를 입력하세요' }) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 border-t p-3" style={{ borderColor: 'var(--line)' }}>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 rounded-full border px-4 py-2.5 text-sm outline-none focus:border-black disabled:opacity-50"
        style={{ borderColor: 'var(--line)' }}
      />
      <button
        type="submit"
        disabled={disabled}
        className="clay-accent flex h-10 w-10 shrink-0 items-center justify-center disabled:opacity-40"
      >
        ➤
      </button>
    </form>
  );
}
