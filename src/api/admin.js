import client from './client';

// 관리자 - 유저 목록 조회(역할로 필터 가능). role이 없으면 전체.
export const getUsers = (role, page = 0, size = 20) =>
  client.get('/admin/users', { params: { role: role || undefined, page, size } }); // -> PageResponse<UserResponse>

// 관리자 - 유저 권한(역할) 변경
export const updateUserRole = (userId, role) => client.patch(`/admin/users/${userId}/role`, { role });
