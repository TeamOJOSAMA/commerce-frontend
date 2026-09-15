import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMe } from '../../api/users';
import { getOrders } from '../../api/orders';
import { useAuthStore } from '../../store/authStore';
import { DEMO_TOKEN, DEMO_USER, DEMO_ORDERS } from '../../mocks/demoData';
import { formatOrderStatus, formatOrderDate } from '../../constants/orderStatus';

const RECENT_ORDER_COUNT = 3;
const formatPrice = (price) => `${Number(price).toLocaleString()}원`;

// TODO: "내가 보유한 쿠폰" 조회 API가 아직 없어서(발급 API도 주석 처리된 상태) 목업 데이터로만 화면을 구성한다.
const MOCK_MY_COUPONS = [
  { userCouponId: 1, name: '가을 시즌 할인쿠폰', discountRate: 15, minimumOrderAmount: 50000, maximumDiscountAmount: 10000, status: 'AVAILABLE', expiresAt: '2026-09-28T23:59:59' },
  { userCouponId: 2, name: '신규 회원 환영 쿠폰', discountRate: 10, minimumOrderAmount: 30000, maximumDiscountAmount: 5000, status: 'AVAILABLE', expiresAt: '2026-09-20T23:59:59' },
  { userCouponId: 3, name: '여름 세일 쿠폰', discountRate: 20, minimumOrderAmount: 40000, maximumDiscountAmount: 8000, status: 'USED', expiresAt: '2026-08-30T23:59:59' },
  { userCouponId: 4, name: '봄맞이 할인쿠폰', discountRate: 10, minimumOrderAmount: 20000, maximumDiscountAmount: 3000, status: 'EXPIRED', expiresAt: '2026-06-01T23:59:59' },
];

const COUPON_STATUS_LABELS = { AVAILABLE: '사용 가능', USED: '사용 완료', EXPIRED: '기간 만료' };

export default function MyPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isDemo = useAuthStore((state) => state.token === DEMO_TOKEN);

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (isDemo) {
      setUser(DEMO_USER);
      return;
    }
    getMe().then(setUser);
  }, [isDemo]);

  useEffect(() => {
    if (isDemo) {
      setOrders(DEMO_ORDERS);
      return;
    }
    getOrders().then((page) => setOrders(page?.content ?? []));
  }, [isDemo]);

  // 헤더의 쿠폰 링크(#coupons)로 들어왔을 때 해당 섹션으로 스크롤한다.
  useEffect(() => {
    if (!user) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">마이페이지</h1>
        <button
          onClick={handleLogout}
          className="text-sm hover:text-black"
          style={{ color: 'var(--text-muted)' }}
        >
          로그아웃
        </button>
      </div>

      <section id="info">
        <h2 className="mb-3 text-lg font-bold">내 정보</h2>
        {!user ? (
          <div className="text-gray-400">불러오는 중...</div>
        ) : (
          <div className="clay p-5">
            <Row label="이름" value={user.name} />
            <Row label="이메일" value={user.email} />
            <Row label="회원 등급" value={user.role} />
          </div>
        )}
      </section>

      <section id="coupons">
        <h2 className="mb-1 text-lg font-bold">내 쿠폰</h2>
        <p className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
          보유 쿠폰 조회 API가 아직 준비되지 않아, 지금은 화면만 볼 수 있는 목업입니다.
        </p>

        <div className="flex flex-col gap-3">
          {MOCK_MY_COUPONS.map((coupon) => {
            const isUsable = coupon.status === 'AVAILABLE';
            return (
              <div key={coupon.userCouponId} className="clay flex items-center justify-between p-4" style={{ opacity: isUsable ? 1 : 0.5 }}>
                <div>
                  <span
                    className="mr-2 rounded px-2 py-0.5 text-xs font-semibold text-white"
                    style={{ background: isUsable ? 'var(--red)' : 'var(--text-muted)' }}
                  >
                    {COUPON_STATUS_LABELS[coupon.status]}
                  </span>
                  <div className="mt-1 text-lg font-bold">{coupon.discountRate}% 할인쿠폰</div>
                  <div className="text-sm text-gray-600">{coupon.name}</div>
                  <div className="text-xs text-gray-400">
                    {formatPrice(coupon.minimumOrderAmount)} 이상 구매 시 · 최대 {formatPrice(coupon.maximumDiscountAmount)} 할인 · {formatOrderDate(coupon.expiresAt)}까지
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="orders">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">주문 내역</h2>
          <Link to="/mypage/orders" className="text-sm hover:text-black" style={{ color: 'var(--text-muted)' }}>
            전체 보기 →
          </Link>
        </div>

        {!orders ? (
          <div className="text-gray-400">불러오는 중...</div>
        ) : orders.length === 0 ? (
          <div className="text-gray-400">주문 내역이 없습니다.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {orders.slice(0, RECENT_ORDER_COUNT).map((order) => (
              <Link
                key={order.orderId}
                to={`/mypage/orders/${order.orderId}`}
                className="clay flex items-center justify-between gap-3 p-4 hover:border-black"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatOrderDate(order.createdAt)}
                  </div>
                  <div className="break-words font-semibold">{order.orderName}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    {formatOrderStatus(order.displayStatus)}
                  </div>
                  <div className="font-bold">{formatPrice(order.paymentAmount)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex border-b py-3 text-sm last:border-0" style={{ borderColor: 'var(--line)' }}>
      <span className="w-28" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
