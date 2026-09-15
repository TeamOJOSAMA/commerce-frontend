import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItemQuantity, deleteCartItem } from '../api/cart';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { DEMO_TOKEN, DEMO_CART } from '../mocks/demoData';
import ImagePlaceholder from '../components/common/ImagePlaceholder';

const formatPrice = (price) => `${Number(price).toLocaleString()}원`;
const SHIPPING_FEE = 0;

export default function Cart() {
  const navigate = useNavigate();
  const refreshCartBadge = useCartStore((state) => state.refresh);
  const isDemo = useAuthStore((state) => state.token === DEMO_TOKEN);
  const [cart, setCart] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [demoNotice, setDemoNotice] = useState('');

  const load = () => {
    if (isDemo) {
      const demoCart = structuredClone(DEMO_CART);
      setCart(demoCart);
      setSelectedIds(demoCart.items.map((item) => item.cartItemId));
      return;
    }
    getCart().then((data) => {
      setCart(data);
      setSelectedIds(data.items.map((item) => item.cartItemId));
    });
  };

  useEffect(() => {
    load();
  }, [isDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = (cartItemId) => {
    setSelectedIds((ids) =>
      ids.includes(cartItemId) ? ids.filter((id) => id !== cartItemId) : [...ids, cartItemId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((ids) => (ids.length === cart.items.length ? [] : cart.items.map((item) => item.cartItemId)));
  };

  const handleQuantityChange = async (cartItemId, quantity) => {
    if (quantity < 1) return;
    if (isDemo) {
      setCart((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.cartItemId === cartItemId
            ? { ...item, quantity, subtotal: (item.eventPrice ?? item.price) * quantity }
            : item
        ),
      }));
      return;
    }
    await updateCartItemQuantity(cartItemId, quantity);
    load();
  };

  const handleDelete = async (cartItemId) => {
    if (isDemo) {
      setCart((prev) => ({ ...prev, items: prev.items.filter((item) => item.cartItemId !== cartItemId) }));
      setSelectedIds((ids) => ids.filter((id) => id !== cartItemId));
      return;
    }
    await deleteCartItem(cartItemId);
    await refreshCartBadge();
    load();
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (isDemo) {
      setCart((prev) => ({ ...prev, items: prev.items.filter((item) => !selectedIds.includes(item.cartItemId)) }));
      setSelectedIds([]);
      return;
    }
    await Promise.all(selectedIds.map((cartItemId) => deleteCartItem(cartItemId)));
    await refreshCartBadge();
    setSelectedIds([]);
    load();
  };

  const handleOrder = (cartItemIds) => {
    if (cartItemIds.length === 0) return;
    if (isDemo) {
      setDemoNotice('데모 모드에서는 실제 결제까지는 진행할 수 없어요. 장바구니 담기/수량 변경/삭제는 자유롭게 체험해보세요!');
      return;
    }
    navigate(`/checkout?cartItemIds=${cartItemIds.join(',')}`);
  };

  if (!cart) {
    return <div className="text-gray-400">불러오는 중...</div>;
  }

  const allSelected = cart.items.length > 0 && selectedIds.length === cart.items.length;
  const selectedItems = cart.items.filter((item) => selectedIds.includes(item.cartItemId));
  const selectedTotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-2xl font-bold">장바구니</h1>
        <ol className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <li className="font-bold" style={{ color: 'var(--ink)' }}>01. 장바구니</li>
          <li>›</li>
          <li>02. 주문서 작성</li>
          <li>›</li>
          <li>03. 주문 완료</li>
        </ol>
      </div>

      {cart.items.length === 0 ? (
        <div className="text-gray-400">장바구니가 비어 있습니다.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--line)' }}>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                전체선택 ({selectedIds.length}/{cart.items.length})
              </label>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className="text-sm hover:text-black disabled:opacity-40"
                style={{ color: 'var(--text-muted)' }}
              >
                선택삭제
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {cart.items.map((item) => {
                const hasEvent = item.eventPrice != null;
                return (
                  <div key={item.cartItemId} className="clay flex items-center gap-4 p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.cartItemId)}
                      onChange={() => toggleSelect(item.cartItemId)}
                    />
                    <Link
                      to={`/products/${item.productId}`}
                      className="block h-20 w-20 shrink-0 overflow-hidden rounded"
                      style={{ background: 'var(--paper-2)' }}
                    >
                      <ImagePlaceholder className="h-full w-full" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link to={`/products/${item.productId}`} className="font-semibold hover:underline">
                        {item.productName}
                      </Link>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                          className="h-7 w-7 rounded border"
                          style={{ borderColor: 'var(--line)' }}
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                          className="h-7 w-7 rounded border"
                          style={{ borderColor: 'var(--line)' }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {hasEvent ? (
                        <>
                          <div className="text-xs text-gray-400 line-through">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          <div>
                            <span className="mr-1 text-sm font-bold" style={{ color: 'var(--red)' }}>
                              {item.discountRate}%
                            </span>
                            <span className="font-bold">{formatPrice(item.subtotal)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="font-bold">{formatPrice(item.subtotal)}</div>
                      )}
                      <button
                        onClick={() => handleOrder([item.cartItemId])}
                        className="mt-2 rounded border px-3 py-1.5 text-xs hover:border-black"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        바로 구매
                      </button>
                    </div>
                    <button onClick={() => handleDelete(item.cartItemId)} className="shrink-0 text-gray-400 hover:text-black">
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="clay h-fit p-7">
            <h2 className="mb-5 text-lg font-bold">주문 요약</h2>
            <div className="mb-2 flex justify-between text-base">
              <span>총 상품 금액 ({selectedItems.length}건)</span>
              <span>{formatPrice(selectedTotal)}</span>
            </div>
            <div className="mb-4 flex justify-between text-base">
              <span>총 배송비</span>
              <span>{formatPrice(SHIPPING_FEE)}</span>
            </div>
            <div
              className="mb-5 flex items-baseline justify-between border-t pt-4 text-lg font-bold"
              style={{ borderColor: 'var(--line)' }}
            >
              <span className="text-base font-normal">총 결제 금액</span>
              <span style={{ color: 'var(--red)' }}>{formatPrice(selectedTotal + SHIPPING_FEE)}</span>
            </div>
            <button
              onClick={() => handleOrder(selectedIds)}
              disabled={selectedIds.length === 0}
              className="w-full rounded py-4 text-base font-bold text-white disabled:opacity-40"
              style={{ background: 'var(--ink)' }}
            >
              주문하기
            </button>
            {demoNotice && (
              <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {demoNotice}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
