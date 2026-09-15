import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveCoupons, issueCoupon } from '../api/coupons';
import { useAuthStore } from '../store/authStore';
import { DEMO_TOKEN, DEMO_ACTIVE_COUPONS } from '../mocks/demoData';
import { formatOrderDate } from '../constants/orderStatus';

const formatPrice = (price) => `${Number(price).toLocaleString()}원`;

export default function Coupons() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => !!state.token);
  const isDemo = useAuthStore((state) => state.token === DEMO_TOKEN);

  const [coupons, setCoupons] = useState(null);
  const [issuedIds, setIssuedIds] = useState([]);
  const [notice, setNotice] = useState('');

  const load = () => {
    if (isDemo) {
      setCoupons(DEMO_ACTIVE_COUPONS);
      return;
    }
    getActiveCoupons().then((page) => setCoupons(page?.content ?? []));
  };

  useEffect(() => {
    load();
  }, [isDemo]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIssue = async (coupon) => {
    setNotice('');

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (isDemo) {
      setNotice('데모 모드에서는 실제로 쿠폰을 발급받을 수 없어요. 실제 계정으로 로그인해서 체험해보세요!');
      return;
    }

    try {
      await issueCoupon(coupon.couponId);
      setIssuedIds((ids) => [...ids, coupon.couponId]);
      setNotice(`"${coupon.couponName}" 쿠폰을 받았어요. 마이페이지 > 내 쿠폰에서 확인하세요.`);
    } catch (error) {
      setNotice(error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">한정쿠폰</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          수량이 한정되어 있어요. 먼저 받아가는 만큼 내 쿠폰함에 담깁니다.
        </p>
      </div>

      {notice && (
        <div className="clay p-3 text-sm" style={{ color: 'var(--red)' }}>
          {notice}
        </div>
      )}

      {!coupons ? (
        <div className="text-gray-400">불러오는 중...</div>
      ) : coupons.length === 0 ? (
        <div className="text-gray-400">지금 받을 수 있는 쿠폰이 없어요.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.map((coupon) => {
            const soldOut = coupon.issuedQuantity >= coupon.totalQuantity;
            const alreadyIssued = issuedIds.includes(coupon.couponId);
            const disabled = soldOut || alreadyIssued;

            return (
              <div key={coupon.couponId} className="clay flex items-center justify-between p-5">
                <div>
                  <div className="text-lg font-bold">{coupon.discountRate}% 할인쿠폰</div>
                  <div className="text-sm text-gray-600">{coupon.couponName}</div>
                  <div className="mt-1 text-xs text-gray-400">
                    {formatPrice(coupon.minimumOrderAmount)} 이상 구매 시 · 최대 {formatPrice(coupon.maximumDiscountAmount)} 할인
                    {coupon.issueEndsAt && ` · ${formatOrderDate(coupon.issueEndsAt)}까지`}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {coupon.issuedQuantity} / {coupon.totalQuantity}개 발급됨
                  </div>
                </div>

                <button
                  onClick={() => handleIssue(coupon)}
                  disabled={disabled}
                  className="shrink-0 rounded-full px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: 'var(--red)' }}
                >
                  {alreadyIssued ? '받음' : soldOut ? '소진' : '받기'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
