import { create } from 'zustand';
import { decodeJwtPayload } from '../lib/jwt';

// 로그인 토큰은 새로고침해도 유지되어야 하니 localStorage에 같이 저장한다.
const STORAGE_KEY = 'commerce_token';

// 관리자 메뉴 노출 여부 판단에 쓴다. 토큰의 role 클레임을 읽을 뿐 서명 검증은 하지 않는다
// (서버가 각 API 요청마다 다시 검증하므로 여기서는 화면 분기용으로만 신뢰한다).
const roleFromToken = (token) => decodeJwtPayload(token)?.role ?? null;

const initialToken = localStorage.getItem(STORAGE_KEY);

export const useAuthStore = create((set, get) => ({
  token: initialToken,
  role: roleFromToken(initialToken),

  isLoggedIn: () => !!get().token,

  login: (token) => {
    localStorage.setItem(STORAGE_KEY, token);
    set({ token, role: roleFromToken(token) });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null, role: null });
  },
}));
