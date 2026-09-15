import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOrderPreview, createOrder } from '../api/orders';
import { approvePayment } from '../api/payments';
import { useCartStore } from '../store/cartStore';

const formatPrice = (price) => `${Number(price).toLocaleString()}원`;

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refreshCartBadge = useCartStore((state) => state.refresh);

  const cartItemIdsParam = searchParams.get('cartItemIds') ?? '';
  const cartItemIds = cartItemIdsParam
    .split(',')
    .filter(Boolean)
    .map(Number);

  // 같은 주문 시도가 두 번 전송돼도 주문이 중복 생성되지 않도록 요청마다 새로 보내는 키.
  // 재시도(같은 시도)에는 같은 키를 유지하고, 선택 상품이 바뀌는(새 시도) 경우에만 새로 만든다.
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [cartItemIdsParam]);

  const [preview, setPreview] = useState(null);
  const [userCouponId, setUserCouponId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cartItemIds.length === 0) return;
    getOrderPreview(cartItemIds).then(setPreview);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePay = async () => {
    setSubmitting(true);
    setError('');
    try {
      const order = await createOrder({
        cartItemIds,
        userCouponId: userCouponId ? Number(userCouponId) : null,
        idempotencyKey,
        expectedPaymentAmount: preview.paymentAmount,
      });

      // 실제 PG 연동 없는 모의 결제 흐름: 주문 생성 직후 바로 승인 처리한다.
      await approvePayment(order.paymentId);
      await refreshCartBadge();

      navigate(`/mypage/orders/${order.orderId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItemIds.length === 0) {
    return <div className="text-gray-400">주문할 상품이 선택되지 않았습니다.</div>;
  }

  if (!preview) {
    return <div className="text-gray-400">불러오는 중...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">주문서 작성</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <h2 className="mb-3 font-bold">1. 주문 상품</h2>
          {preview.items.map((item) => {
            const hasEvent = item.discountRate != null;
            return (
              <div
                key={item.cartItemId}
                className="mb-2 flex items-start gap-3 border-b pb-2 text-sm"
                style={{ borderColor: 'var(--line)' }}
              >
                <span className="min-w-0 flex-1 break-words">{item.productName}</span>
                <span className="w-16 shrink-0 text-center" style={{ color: 'var(--text-muted)' }}>
                  수량 {item.quantity}
                </span>
                <span className="w-28 shrink-0 text-right">
                  {hasEvent ? (
                    <>
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(item.originalPrice * item.quantity)}
                      </div>
                      <div>
                        <span className="mr-1 text-xs font-bold" style={{ color: 'var(--red)' }}>
                          {item.discountRate}%
                        </span>
                        {formatPrice(item.subTotal)}
                      </div>
                    </>
                  ) : (
                    formatPrice(item.subTotal)
                  )}
                </span>
              </div>
            );
          })}

          <h2 className="mt-6 mb-2 font-bold">2. 쿠폰 사용</h2>
          {/* TODO: 보유 쿠폰 목록 API가 아직 없어서 ID를 직접 입력하는 임시 방식이다. */}
          <input
            value={userCouponId}
            onChange={(event) => setUserCouponId(event.target.value)}
            placeholder="보유 쿠폰 ID (쿠폰 목록 API 준비 중)"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="clay h-fit p-7">
          <h2 className="mb-5 text-lg font-bold">주문 요약</h2>
          <div className="mb-2 flex justify-between text-base">
            <span>상품 금액</span>
            <span>{formatPrice(preview.totalAmount)}</span>
          </div>
          {preview.couponDiscountAmount > 0 && (
            <div className="mb-2 flex justify-between text-base" style={{ color: 'var(--red)' }}>
              <span>쿠폰 할인</span>
              <span>-{formatPrice(preview.couponDiscountAmount)}</span>
            </div>
          )}
          <div
            className="mb-5 flex items-baseline justify-between border-t pt-4 text-2xl font-bold"
            style={{ borderColor: 'var(--line)' }}
          >
            <span className="text-base font-normal">총 결제 금액</span>
            <span style={{ color: 'var(--red)' }}>{formatPrice(preview.paymentAmount)}</span>
          </div>

          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

          <button
            onClick={handlePay}
            disabled={submitting}
            className="w-full rounded py-4 text-base font-bold text-white disabled:opacity-40"
            style={{ background: 'var(--ink)' }}
          >
            {submitting ? '처리 중...' : `${formatPrice(preview.paymentAmount)} 결제하기`}
          </button>
        </div>
      </div>
    </div>
  );
}
