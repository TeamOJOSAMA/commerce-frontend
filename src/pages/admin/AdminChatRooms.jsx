import { useEffect, useState } from 'react';
import { getAllChatRooms, updateChatRoomStatus } from '../../api/chat';
import { formatOrderDate } from '../../constants/orderStatus';

const STATUS_LABELS = {
  BOT_HANDLING: '봇 응대중',
  WAITING: '상담원 대기',
  IN_PROGRESS: '상담중',
  COMPLETED: '완료',
};
const STATUS_COLORS = {
  BOT_HANDLING: 'var(--text-muted)',
  WAITING: 'var(--red)',
  IN_PROGRESS: 'var(--ink)',
  COMPLETED: 'var(--text-muted)',
};

export default function AdminChatRooms() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [roomPage, setRoomPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingRoomId, setSavingRoomId] = useState(null);

  const load = () => {
    setLoading(true);
    getAllChatRooms(statusFilter, page)
      .then(setRoomPage)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTransition = async (chatRoomId, nextStatus) => {
    setError('');
    setSavingRoomId(chatRoomId);
    try {
      await updateChatRoomStatus(chatRoomId, nextStatus);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingRoomId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">상담 관리</h1>
      <p className="mb-4 text-gray-500">총 {roomPage?.totalElements ?? 0}건</p>

      <div className="mb-4 flex gap-2">
        {[{ value: '', label: '전체' }, ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))].map(
          (tab) => (
            <button
              key={tab.value || 'ALL'}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(0);
              }}
              className="rounded-full border px-4 py-1.5 text-sm"
              style={
                statusFilter === tab.value
                  ? { background: 'var(--ink)', color: 'white', borderColor: 'var(--ink)' }
                  : { borderColor: 'var(--line)' }
              }
            >
              {tab.label}
            </button>
          )
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="text-gray-400">불러오는 중...</div>
      ) : !roomPage || roomPage.content.length === 0 ? (
        <div className="text-gray-400">해당하는 문의가 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {roomPage.content.map((room) => (
            <div key={room.chatRoomId} className="clay flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="break-words font-semibold">{room.title}</div>
                <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                  고객 {room.customerName} · {formatOrderDate(room.updatedAt)} 업데이트
                  {room.assigneeName && ` · 담당 ${room.assigneeName}`}
                </div>
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: STATUS_COLORS[room.inquiryStatus] }}
              >
                {STATUS_LABELS[room.inquiryStatus] ?? room.inquiryStatus}
              </span>

              {room.inquiryStatus === 'WAITING' && (
                <button
                  onClick={() => handleTransition(room.chatRoomId, 'IN_PROGRESS')}
                  disabled={savingRoomId === room.chatRoomId}
                  className="clay-accent shrink-0 px-4 py-2 text-sm disabled:opacity-40"
                >
                  내가 담당하기
                </button>
              )}
              {room.inquiryStatus === 'IN_PROGRESS' && (
                <button
                  onClick={() => handleTransition(room.chatRoomId, 'COMPLETED')}
                  disabled={savingRoomId === room.chatRoomId}
                  className="shrink-0 rounded border px-4 py-2 text-sm hover:border-black disabled:opacity-40"
                  style={{ borderColor: 'var(--line)' }}
                >
                  완료 처리
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {roomPage && roomPage.totalPages > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            style={{ borderColor: 'var(--line)' }}
          >
            이전
          </button>
          <span className="px-2 py-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            {page + 1} / {roomPage.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!roomPage.hasNext}
            className="rounded border px-3 py-1.5 text-sm disabled:opacity-40"
            style={{ borderColor: 'var(--line)' }}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}
