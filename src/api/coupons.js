import client from './client';

// 발급 가능한(ACTIVE) 쿠폰 목록. 로그인 없이도 조회 가능하다.
export const getActiveCoupons = () => client.get('/coupons', { params: { couponStatus: 'ACTIVE' } }); // -> PageResponse<CouponResponse>

// 쿠폰을 내 계정으로 발급받는다. 로그인이 필요하다.
export const issueCoupon = (couponId) => client.post(`/coupons/${couponId}/issue`); // -> UserCouponResponse

// 내가 보유한 쿠폰 목록.
export const getMyCoupons = () => client.get('/users/me/coupons'); // -> PageResponse<UserCouponResponse>
