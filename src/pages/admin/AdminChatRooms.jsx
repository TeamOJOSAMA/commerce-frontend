import { useEffect, useRef, useState } from 'react';
import { getAllChatRooms, getChatMessages, updateChatRoomStatus } from '../../api/chat';
import { createStompClient, decodeUserId } from '../../lib/chatSocket';
import { useAuthStore } from '../../store/authStore';
import { formatInquiryStatus } from '../../constants/inquiryStatus';
import { formatOrderDate } from '../../constants/orderStatus';
import { MessageBubble, MessageForm, RoomHeader } from '../Chat';

const STATUS_TABS = [
  { value: '', label: '전체' },
  { value: 'BOT_HANDLING', label: '봇 응대중' },
  { value: 'WAITING', label: '상담원 대기' },
  { value: 'IN_PROGRESS', label: '상담중' },
  { value: 'COMPLETED', label: '완료' },
];

const formatMessageTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function AdminChatRooms() {
  const token = useAuthStore((state) => state.token);
  const myUserId = decodeUserId(token);

  const [statusFilter, setStatusFilter] = useState('');
  const [roomPage, setRoomPage] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [error, setError] = useState('');

  const [activeRoomId, setActiveRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [draft, setDraft] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const bottomRef = useRef(null);
  const stompClientRef = useRef(null);

  const loadRooms = () => {
    setLoadingRooms(true);
    getAllChatRooms(statusFilter)
      .then(setRoomPage)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingRooms(false));
  };

  useEffect(() => {
    loadRooms();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  // STOMP 연결은 마운트 시 한 번만 맺는다. 고객용 Chat.jsx의 LiveChat과 같은 패턴이다.
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

  // 선택한 방을 구독하고 대화 내역을 불러온다.
  useEffect(() => {
    if (!connected || !activeRoomId) return;
    const client = stompClientRef.current;
    if (!client) return;

    setMessages([]);
    getChatMessages(activeRoomId).then((slice) => {
      setMessages([...(slice?.messages ?? [])].reverse());
    });

    const messageSub = client.subscribe(`/sub/chat-rooms/${activeRoomId}`, (frame) => {
      setMessages((prev) => [...prev, JSON.parse(frame.body)]);
    });

    // 상태가 바뀌면(예: 고객이 상담원 연결을 요청) 목록을 다시 불러와 뱃지/액션을 맞춘다.
    const statusSub = client.subscribe(`/sub/chat-rooms/${activeRoomId}/status`, () => {
      loadRooms();
    });

    const errorSub = client.subscribe(`/sub/chat-rooms/${activeRoomId}/errors`, (frame) => {
      console.error('채팅 오류:', frame.body);
    });

    return () => {
      messageSub.unsubscribe();
      statusSub.unsubscribe();
      errorSub.unsubscribe();
    };
  }, [connected, activeRoomId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleTransition = async (chatRoomId, nextStatus) => {
    setError('');
    setActionLoading(true);
    try {
      await updateChatRoomStatus(chatRoomId, nextStatus);
      loadRooms();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const rooms = roomPage?.content ?? [];
  const activeRoom = rooms.find((room) => room.chatRoomId === activeRoomId);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">상담 관리</h1>
      <p className="mb-4 text-gray-500">총 {roomPage?.totalElements ?? 0}건</p>

      <div className="mb-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value || 'ALL'}
            onClick={() => setStatusFilter(tab.value)}
            className="rounded-full border px-4 py-1.5 text-sm"
            style={
              statusFilter === tab.value
                ? { background: 'var(--ink)', color: 'white', borderColor: 'var(--ink)' }
                : { borderColor: 'var(--line)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="clay flex h-[560px] overflow-hidden">
        <div className="flex w-72 shrink-0 flex-col overflow-y-auto border-r" style={{ borderColor: 'var(--line)' }}>
          {loadingRooms ? (
            <div className="p-4 text-sm text-gray-400">불러오는 중...</div>
          ) : rooms.length === 0 ? (
            <div className="p-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              해당하는 문의가 없습니다.
            </div>
          ) : (
            rooms.map((room) => {
              const isActive = room.chatRoomId === activeRoomId;
              return (
                <button
                  key={room.chatRoomId}
                  onClick={() => setActiveRoomId(room.chatRoomId)}
                  className="flex w-full flex-col gap-1 border-b px-4 py-3 text-left"
                  style={{ borderColor: 'var(--line)', background: isActive ? 'var(--paper-2)' : 'transparent' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="break-words text-sm font-semibold">{room.title}</span>
                    <span className="shrink-0 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {formatOrderDate(room.updatedAt)}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    고객 {room.customerName}
                    {room.assigneeName && ` · 담당 ${room.assigneeName}`}
                  </div>
                  <span
                    className="mt-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    style={{ background: room.inquiryStatus === 'COMPLETED' ? 'var(--text-muted)' : 'var(--ink)' }}
                  >
                    {formatInquiryStatus(room.inquiryStatus)}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          {!activeRoom ? (
            <div className="flex flex-1 items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
              왼쪽에서 문의를 선택하세요.
            </div>
          ) : (
            <>
              <RoomHeader
                title={activeRoom.title}
                subtitle={`고객 ${activeRoom.customerName} · ${formatInquiryStatus(activeRoom.inquiryStatus)}${connected ? '' : ' · 연결 중...'}`}
                action={
                  activeRoom.inquiryStatus === 'WAITING' ? (
                    <button
                      onClick={() => handleTransition(activeRoom.chatRoomId, 'IN_PROGRESS')}
                      disabled={actionLoading}
                      className="clay-accent shrink-0 px-4 py-1.5 text-xs disabled:opacity-40"
                    >
                      내가 담당하기
                    </button>
                  ) : activeRoom.inquiryStatus === 'IN_PROGRESS' ? (
                    <button
                      onClick={() => handleTransition(activeRoom.chatRoomId, 'COMPLETED')}
                      disabled={actionLoading}
                      className="shrink-0 rounded border px-4 py-1.5 text-xs hover:border-black disabled:opacity-40"
                      style={{ borderColor: 'var(--line)' }}
                    >
                      완료 처리
                    </button>
                  ) : null
                }
              />

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
                {messages.length === 0 && (
                  <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    대화 내역이 없습니다.
                  </div>
                )}
                {messages.map((message) =>
                  message.messageType === 'ENTER' || message.messageType === 'LEAVE' ? (
                    <div
                      key={message.chatMessageId}
                      className="text-center text-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
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
    </div>
  );
}
