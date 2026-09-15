import { create } from 'zustand';

// 로그인 토큰은 새로고침해도 유지되어야 하니 localStorage에 같이 저장한다.
const STORAGE_KEY = 'commerce_token';

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(STORAGE_KEY),

  isLoggedIn: () => !!get().token,

  login: (token) => {
    localStorage.setItem(STORAGE_KEY, token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ token: null });
  },
}));
