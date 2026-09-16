import { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../../api/admin';

const ROLE_LABELS = { USER: '일반 회원', SELLER: '판매자', ADMIN: '관리자' };
const ROLE_OPTIONS = ['USER', 'SELLER', 'ADMIN'];

export default function AdminUsers() {
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [userPage, setUserPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingUserId, setSavingUserId] = useState(null);

  const load = () => {
    setLoading(true);
    getUsers(roleFilter, page)
      .then(setUserPage)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [roleFilter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSavingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingUserId(null);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">회원 관리</h1>
      <p className="mb-4 text-gray-500">총 {userPage?.totalElements ?? 0}명</p>

      <div className="mb-4 flex gap-2">
        {[{ value: '', label: '전체' }, ...ROLE_OPTIONS.map((r) => ({ value: r, label: ROLE_LABELS[r] }))].map(
          (tab) => (
            <button
              key={tab.value || 'ALL'}
              onClick={() => {
                setRoleFilter(tab.value);
                setPage(0);
              }}
              className="rounded-full border px-4 py-1.5 text-sm"
              style={
                roleFilter === tab.value
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
      ) : !userPage || userPage.content.length === 0 ? (
        <div className="text-gray-400">해당하는 회원이 없습니다.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {userPage.content.map((user) => (
            <div key={user.id} className="clay flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{user.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {user.email}
                </div>
              </div>
              <span
                className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ background: user.role === 'ADMIN' ? 'var(--red)' : 'var(--ink)' }}
              >
                {ROLE_LABELS[user.role] ?? user.role}
              </span>
              <select
                value={user.role}
                disabled={savingUserId === user.id}
                onChange={(event) => handleRoleChange(user.id, event.target.value)}
                className="shrink-0 rounded border px-2 py-1.5 text-sm disabled:opacity-40"
                style={{ borderColor: 'var(--line)' }}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}로 변경
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {userPage && userPage.totalPages > 1 && (
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
            {page + 1} / {userPage.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!userPage.hasNext}
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
