import { create } from 'zustand';
import { getCart } from '../api/cart';
import { useAuthStore } from './authStore';
import { DEMO_TOKEN, DEMO_CART } from '../mocks/demoData';

// 헤더의 장바구니 배지 숫자를 여러 페이지에서 공유하기 위한 스토어.
// 장바구니에 변화가 생기는 액션(담기/수량변경/삭제) 이후에는 refresh()를 호출해서 맞춰준다.
export const useCartStore = create((set) => ({
  itemCount: 0,

  refresh: async () => {
    if (useAuthStore.getState().token === DEMO_TOKEN) {
      set({ itemCount: DEMO_CART.items.length });
      return;
    }
    try {
      const cart = await getCart();
      set({ itemCount: cart?.items?.length ?? 0 });
    } catch {
      set({ itemCount: 0 });
    }
  },

  reset: () => set({ itemCount: 0 }),
}));
