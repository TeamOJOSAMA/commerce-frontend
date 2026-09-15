import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOrders, getOrder } from '../../api/orders';
import { addCartItem } from '../../api/cart';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { DEMO_TOKEN, DEMO_ORDERS } from '../../mocks/demoData';
import { formatOrderStatus, formatOrderDateWithWeekday } from '../../constants/orderStatus';
import ImagePlaceholder from '../../components/common/ImagePlaceholder';

const formatPrice = (price) => `${Number(price).toLocaleString()}원`;

// 주문을 날짜별로 묶는다. 백엔드가 이미 최신순으로 내려주므로 그룹 등장 순서도 그대로 유지된다.
const groupByDate = (orders) => {
  const groups = [];
  const indexByDate = new Map();
  for (const order of orders) {
    const dateLabel = formatOrderDateWithWeekday(order.createdAt);
    if (!indexByDate.has(dateLabel)) {
      indexByDate.set(dateLabel, groups.length);
      groups.push({ dateLabel, orders: [] });
    }
    groups[indexByDate.get(dateLabel)].orders.push(order);
  }
  return groups;
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const isDemo = useAuthStore((state) => state.token === DEMO_TOKEN);
  const refreshCartBadge = useCartStore((state) => state.refresh);
  const [orders, setOrders] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (isDemo) {
      setOrders(DEMO_ORDERS);
      return;
    }
    getOrders().then((page) => setOrders(page?.content ?? []));
  }, [isDemo]);

  const filteredOrders = (orders ?? []).filter((order) =>
    order.orderName?.toLowerCase().includes(keyword.trim().toLowerCase())
  );
  const groups = groupByDate(filteredOrders);

  const handleRebuy = async (event, orderId) => {
    event.preventDefault();
    event.stopPropagation();

    if (isDemo) {
      setNotice('데모 모드에서는 재구매를 체험할 수 없어요. 데모 계정 대신 실제로 로그인하면 사용할 수 있어요!');
      return;
    }

    const order = await getOrder(orderId);
    for (const item of order.items) {
      await addCartItem(item.productId, item.quantity);
    }
    await refreshCartBadge();
    navigate('/cart');
  };

  return (
    <div>
      <Link to="/mypage" className="mb-3 inline-block text-sm hover:text-black" style={{ color: 'var(--text-muted)' }}>
        ← 마이페이지로
      </Link>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="mb-1 text-2xl font-bold">주문 내역</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            총 {orders?.length ?? 0}건의 주문
          </p>
        </div>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="상품명으로 주문 검색"
          className="w-full max-w-xs rounded border px-3 py-2 text-sm outline-none focus:border-black"
          style={{ borderColor: 'var(--line)' }}
        />
      </div>
      {notice && (
        <p className="mb-4 text-xs" style={{ color: 'var(--red)' }}>{notice}</p>
      )}

      {!orders ? (
        <div className="mt-3 text-gray-400">불러오는 중...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-3 text-gray-400">
          {keyword ? '검색 결과가 없습니다.' : '주문 내역이 없습니다.'}
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-8">
          {groups.map((group) => (
            <div key={group.dateLabel}>
              <div className="mb-3 flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--line)' }}>
                <h2 className="text-base font-bold">{group.dateLabel}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {group.orders.map((order) => (
                  <div key={order.orderId} className="clay flex items-center gap-6 p-5">
                    <span
                      className="w-28 shrink-0 rounded px-2 py-1.5 text-center text-xs font-semibold text-white"
                      style={{ background: 'var(--ink)' }}
                    >
                      {formatOrderStatus(order.displayStatus)}
                    </span>

                    <Link to={`/mypage/orders/${order.orderId}`} className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded" style={{ background: 'var(--paper-2)' }}>
                        {order.representativeImageUrl ? (
                          <img src={order.representativeImageUrl} alt={order.orderName} className="h-full w-full object-cover" />
                        ) : (
                          <ImagePlaceholder className="h-full w-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="break-words font-semibold">{order.orderName}</div>
                        <div className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>총 {order.totalQuantity}개</div>
                      </div>
                    </Link>

                    <div className="w-32 shrink-0 text-right text-lg font-bold">
                      {formatPrice(order.paymentAmount)}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Link
                        to={`/mypage/orders/${order.orderId}`}
                        className="rounded border px-4 py-2 text-center text-sm hover:border-black"
                        style={{ borderColor: 'var(--line)' }}
                      >
                        주문 상세
                      </Link>
                      <button onClick={(event) => handleRebuy(event, order.orderId)} className="clay-accent px-4 py-2 text-sm">
                        재구매
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
