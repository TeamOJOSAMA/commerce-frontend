import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder, cancelOrder } from '../../api/orders';
import { createRefund, completeRefund } from '../../api/refunds';
import { useAuthStore } from '../../store/authStore';
import { DEMO_TOKEN, DEMO_ORDER_DETAILS } from '../../mocks/demoData';
import { formatOrderStatus, formatOrderDate } from '../../constants/orderStatus';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';
import { getProductImageUrl } from '../../constants/productImages';

const formatPrice = (price) => `${Number(price).toLocaleString()}원`;

export default function OrderDetail() {
  const { orderId } = useParams();
  const isDemo = useAuthStore((state) => state.token === DEMO_TOKEN);
  const [order, setOrder] = useState(null);

  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundType, setRefundType] = useState('FULL');
  const [refundReason, setRefundReason] = useState('');
  const [refundSelections, setRefundSelections] = useState({}); // { [orderItemId]: quantity }
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState('');

  const load = () => {
    if (isDemo) {
      setOrder(DEMO_ORDER_DETAILS[orderId] ?? null);
      return;
    }
    return getOrder(orderId).then(setOrder);
  };

  useEffect(() => { load(); }, [orderId, isDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    if (isDemo) {
      setOrder((prev) => ({ ...prev, displayStatus: 'CANCELLED' }));
      return;
    }
    await cancelOrder(orderId);
    load();
  };

  const toggleRefundItem = (orderItemId, maxQuantity) => {
    setRefundSelections((prev) => {
      const next = { ...prev };
      if (orderItemId in next) {
        delete next[orderItemId];
      } else {
        next[orderItemId] = maxQuantity;
      }
      return next;
    });
  };

  const updateRefundQuantity = (orderItemId, quantity, maxQuantity) => {
    const clamped = Math.min(Math.max(quantity, 1), maxQuantity);
    setRefundSelections((prev) => ({ ...prev, [orderItemId]: clamped }));
  };

  const resetRefundForm = () => {
    setShowRefundForm(false);
    setRefundType('FULL');
    setRefundReason('');
    setRefundSelections({});
    setRefundError('');
  };

  const handleSubmitRefund = async () => {
    if (!refundReason.trim()) {
      setRefundError('환불 사유를 입력해주세요.');
      return;
    }
    if (refundType === 'PARTIAL' && Object.keys(refundSelections).length === 0) {
      setRefundError('환불할 상품을 하나 이상 선택해주세요.');
      return;
    }

    setSubmittingRefund(true);
    setRefundError('');

    if (isDemo) {
      // 데모 모드에는 실제 환불 API가 없어 화면 상태만 흉내 낸다.
      setOrder((prev) => ({
        ...prev,
        displayStatus: refundType === 'FULL' ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundReason: refundReason.trim(),
      }));
      setSubmittingRefund(false);
      resetRefundForm();
      return;
    }

    try {
      const payload = {
        paymentId: order.paymentId,
        refundType,
        reason: refundReason.trim(),
        ...(refundType === 'PARTIAL' && {
          items: Object.entries(refundSelections).map(([orderItemId, quantity]) => ({
            orderItemId: Number(orderItemId),
            quantity,
          })),
        }),
      };

      // 실제 승인 절차 없는 모의 환불 흐름: 접수 직후 바로 완료 처리한다 (결제 모의 승인과 동일한 방식).
      const refund = await createRefund(payload);
      await completeRefund(refund.id);
      resetRefundForm();
      load();
    } catch (err) {
      setRefundError(err.message);
    } finally {
      setSubmittingRefund(false);
    }
  };

  if (!order) {
    return <div className="text-gray-400">불러오는 중...</div>;
  }

  return (
    <div>
      <Link to="/mypage/orders" className="mb-3 inline-block text-sm hover:text-black" style={{ color: 'var(--text-muted)' }}>
        ← 주문 내역으로
      </Link>

      <div className="mb-4 flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--line)' }}>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {formatOrderDate(order.createdAt)} &nbsp;|&nbsp; 주문번호 : {order.orderNumber}
        </div>
        <span
          className="rounded px-2 py-1 text-xs font-semibold text-white"
          style={{ background: 'var(--ink)' }}
        >
          {formatOrderStatus(order.displayStatus)}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-5 md:col-span-2">
          {order.items.map((item) => {
            // 이벤트 할인 항목은 쿠폰 할인 대상이 아니라서(couponDiscountShare가 항상 0) 두 표시가 겹치지 않는다.
            const hasEventDiscount = item.discountRate != null;
            const hasCouponDiscount = !hasEventDiscount && item.couponDiscountShare > 0;
            const couponDiscountRate = hasCouponDiscount
              ? Math.round((item.couponDiscountShare / item.subTotal) * 100)
              : 0;
            const imageUrl = item.imageUrl ?? getProductImageUrl({ name: item.productName });

            return (
              <div key={item.orderItemId} className="clay flex items-center gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded" style={{ background: 'var(--paper-2)' }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlaceholder className="h-full w-full" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{item.productName}</div>
                  <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                    수량 {item.quantity}
                  </div>
                  {item.refundedQuantity > 0 && (
                    <div className="mt-0.5 text-xs font-semibold" style={{ color: 'var(--red)' }}>
                      {item.refundedQuantity}개 환불됨
                      {item.refundedQuantity < item.quantity &&
                        ` · 남은 수량 ${item.quantity - item.refundedQuantity}개`}
                    </div>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  {hasEventDiscount ? (
                    <>
                      <div className="text-xs text-gray-400 line-through">
                        {formatPrice(item.originalPrice * item.quantity)}
                      </div>
                      <div>
                        <span className="mr-1 text-sm font-bold" style={{ color: 'var(--red)' }}>
                          {item.discountRate}%
                        </span>
                        <span className="font-bold">{formatPrice(item.paidAmount)}</span>
                      </div>
                    </>
                  ) : hasCouponDiscount ? (
                    <>
                      <div className="text-xs text-gray-400 line-through">{formatPrice(item.subTotal)}</div>
                      <div>
                        <span className="mr-1 text-sm font-bold" style={{ color: 'var(--red)' }}>
                          {couponDiscountRate}%
                        </span>
                        <span className="font-bold">{formatPrice(item.paidAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="font-bold">{formatPrice(item.paidAmount)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="clay h-fit p-6">
          <h2 className="mb-4 text-lg font-bold">결제 정보</h2>
          <div
            className="mb-4 flex items-baseline justify-between border-b pb-4 text-lg font-bold"
            style={{ borderColor: 'var(--line)' }}
          >
            <span className="text-base font-normal">총 결제 금액</span>
            <span>{formatPrice(order.paymentAmount)}</span>
          </div>

          {(order.displayStatus === 'REFUNDED' || order.displayStatus === 'PARTIALLY_REFUNDED') &&
            order.refundReason && (
              <div className="mb-4 rounded p-3 text-sm" style={{ background: 'var(--paper-2)' }}>
                <div className="mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>
                  환불 사유
                </div>
                <div>{order.refundReason}</div>
              </div>
            )}

          {order.displayStatus === 'PAYMENT_PENDING' && (
            <button
              onClick={handleCancel}
              className="w-full rounded border py-2.5 text-sm hover:border-black"
              style={{ borderColor: 'var(--line)' }}
            >
              주문 취소
            </button>
          )}

          {(order.displayStatus === 'PAID' || order.displayStatus === 'PARTIALLY_REFUNDED') && !showRefundForm && (
            <button
              onClick={() => setShowRefundForm(true)}
              className="w-full rounded border py-2.5 text-sm hover:border-black"
              style={{ borderColor: 'var(--line)' }}
            >
              환불 신청
            </button>
          )}
        </div>
      </div>

      {showRefundForm && (
        <div className="clay mt-4 p-5">
          <h3 className="mb-3 font-bold">환불 신청</h3>

          <div className="mb-3 flex gap-4 text-sm">
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="refundType"
                checked={refundType === 'FULL'}
                onChange={() => setRefundType('FULL')}
              />
              전체 환불
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="radio"
                name="refundType"
                checked={refundType === 'PARTIAL'}
                onChange={() => setRefundType('PARTIAL')}
              />
              부분 환불
            </label>
          </div>

          {refundType === 'PARTIAL' && (
            <div className="mb-3 flex flex-col gap-2">
              {order.items.map((item) => {
                // 이미 앞서 환불(요청+완료 불문)된 수량은 빼고, 남은 만큼만 다시 환불 요청할 수 있다.
                const remaining = item.quantity - (item.refundedQuantity ?? 0);
                if (remaining <= 0) return null;

                const selectedQuantity = refundSelections[item.orderItemId];
                const isSelected = selectedQuantity !== undefined;
                return (
                  <div key={item.orderItemId} className="flex items-center gap-3 text-sm">
                    <label className="flex flex-1 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRefundItem(item.orderItemId, remaining)}
                      />
                      {item.productName} (환불 가능 {remaining}개)
                    </label>
                    {isSelected && (
                      <input
                        type="number"
                        min={1}
                        max={remaining}
                        value={selectedQuantity}
                        onChange={(event) =>
                          updateRefundQuantity(item.orderItemId, Number(event.target.value), remaining)
                        }
                        className="w-16 rounded border px-2 py-1 text-center text-sm"
                        style={{ borderColor: 'var(--line)' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <textarea
            value={refundReason}
            onChange={(event) => setRefundReason(event.target.value)}
            placeholder="환불 사유를 입력해주세요."
            rows={2}
            className="mb-3 w-full rounded border px-3 py-2 text-sm outline-none focus:border-black"
            style={{ borderColor: 'var(--line)' }}
          />

          {refundError && (
            <p className="mb-3 text-sm" style={{ color: 'var(--red)' }}>
              {refundError}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmitRefund}
              disabled={submittingRefund}
              className="clay-accent px-4 py-2 text-sm disabled:opacity-40"
            >
              {submittingRefund ? '처리 중...' : '환불 신청하기'}
            </button>
            <button
              onClick={resetRefundForm}
              className="rounded border px-4 py-2 text-sm hover:border-black"
              style={{ borderColor: 'var(--line)' }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
