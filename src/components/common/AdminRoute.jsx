import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

// 로그인은 했지만 ADMIN이 아니면 홈으로 돌려보낸다. 실제 접근 제한은 백엔드가
// SecurityConfig(/api/admin/**)와 @PreAuthorize로 이미 강제하므로, 이건 화면 노출만 막는 가드다.
export default function AdminRoute() {
  const isLoggedIn = useAuthStore((state) => !!state.token);
  const role = useAuthStore((state) => state.role);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
