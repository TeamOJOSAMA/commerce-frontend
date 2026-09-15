// 백엔드 없이도 채팅·장바구니·주문 화면을 확인할 수 있도록 만든 데모 계정용 더미 데이터.
// 로그인 화면의 "데모 계정으로 체험하기" 버튼을 누르면 이 토큰이 저장되고,
// Cart/Orders/OrderDetail은 실제 API 대신 아래 데이터를 사용한다.
export const DEMO_TOKEN = 'DEMO-TOKEN';

export const DEMO_CREDENTIALS = {
  email: 'demo@galpangjilpang.com',
  password: 'demo1234',
};

export const DEMO_USER = {
  name: '데모 사용자',
  email: DEMO_CREDENTIALS.email,
  role: 'USER',
};

export const DEMO_CART = {
  items: [
    { cartItemId: 1, productId: 101, productName: '베이직 크루넥 니트 (5color)', price: 23900, eventPrice: 21500, discountRate: 10, quantity: 2 },
    { cartItemId: 2, productId: 102, productName: '무선 기계식 키보드', price: 54900, quantity: 1 },
    { cartItemId: 3, productId: 103, productName: '저자극 세탁세제 3L', price: 11900, quantity: 3 },
  ].map((item) => ({ ...item, subtotal: (item.eventPrice ?? item.price) * item.quantity })),
};

export const DEMO_ORDERS = [
  {
    orderId: 9001,
    orderNumber: 'ORD-20260910-DEMO001',
    orderName: '베이직 크루넥 니트 (5color) 외 1건',
    createdAt: '2026-09-10T14:22:00',
    paymentAmount: 47800,
    displayStatus: 'PAYMENT_PENDING',
  },
  {
    orderId: 9002,
    orderNumber: 'ORD-20260905-DEMO002',
    orderName: '무선 기계식 키보드',
    createdAt: '2026-09-05T09:10:00',
    paymentAmount: 54900,
    displayStatus: 'PAID',
  },
  {
    orderId: 9003,
    orderNumber: 'ORD-20260828-DEMO003',
    orderName: '저자극 세탁세제 3L',
    createdAt: '2026-08-28T18:41:00',
    paymentAmount: 35700,
    displayStatus: 'CANCELLED',
  },
  {
    orderId: 9004,
    orderNumber: 'ORD-20260820-DEMO004',
    orderName: '무선 마우스',
    createdAt: '2026-08-20T11:05:00',
    paymentAmount: 32900,
    displayStatus: 'REFUNDED',
  },
];

export const DEMO_ORDER_DETAILS = {
  9001: {
    orderNumber: 'ORD-20260910-DEMO001',
    createdAt: '2026-09-10T14:22:00',
    displayStatus: 'PAYMENT_PENDING',
    paymentAmount: 47800,
    items: [
      {
        orderItemId: 1,
        productId: 101,
        productName: '베이직 크루넥 니트 (5color)',
        quantity: 2,
        subTotal: 39800,
        couponDiscountShare: 4000,
        paidAmount: 35800,
      },
      {
        orderItemId: 2,
        productId: 103,
        productName: '저자극 세탁세제 3L',
        quantity: 1,
        subTotal: 12000,
        couponDiscountShare: 0,
        paidAmount: 12000,
        originalPrice: 15000,
        discountRate: 20,
      },
    ],
  },
  9002: {
    orderNumber: 'ORD-20260905-DEMO002',
    createdAt: '2026-09-05T09:10:00',
    displayStatus: 'PAID',
    paymentAmount: 54900,
    items: [
      {
        orderItemId: 3,
        productId: 102,
        productName: '무선 기계식 키보드',
        quantity: 1,
        subTotal: 54900,
        couponDiscountShare: 0,
        paidAmount: 54900,
      },
    ],
  },
  9003: {
    orderNumber: 'ORD-20260828-DEMO003',
    createdAt: '2026-08-28T18:41:00',
    displayStatus: 'CANCELLED',
    paymentAmount: 35700,
    items: [
      {
        orderItemId: 4,
        productId: 103,
        productName: '저자극 세탁세제 3L',
        quantity: 3,
        subTotal: 35700,
        couponDiscountShare: 0,
        paidAmount: 35700,
      },
    ],
  },
  9004: {
    orderNumber: 'ORD-20260820-DEMO004',
    createdAt: '2026-08-20T11:05:00',
    displayStatus: 'REFUNDED',
    paymentAmount: 32900,
    refundReason: '색상이 화면과 달라서 환불 요청합니다.',
    items: [
      {
        orderItemId: 5,
        productId: 102,
        productName: '무선 마우스',
        quantity: 1,
        subTotal: 32900,
        couponDiscountShare: 0,
        paidAmount: 32900,
      },
    ],
  },
};

// 채팅창 옆 채팅방 목록에 쓰이는 문의 스레드 더미 데이터. 백엔드 ChatRoom/InquiryStatus 모양을 그대로 따라간다.
export const DEMO_CHAT_ROOMS = [
  {
    chatRoomId: 1,
    title: '배송 문의',
    inquiryStatus: 'IN_PROGRESS',
    assigneeName: '김상담',
    updatedAt: '2026-09-14T10:32:00',
    messages: [
      { id: 1, from: 'agent', text: '안녕하세요! 갈팡질팡 고객센터입니다. 무엇을 도와드릴까요?' },
      { id: 2, from: 'me', text: '주문한 상품 배송 조회는 어디서 하나요?' },
      { id: 3, from: 'agent', text: '마이페이지 > 주문 내역에서 확인하실 수 있어요. 주문번호 알려주시면 바로 조회해드릴게요!' },
    ],
  },
  {
    chatRoomId: 2,
    title: '교환/환불 문의',
    inquiryStatus: 'WAITING',
    assigneeName: null,
    updatedAt: '2026-09-13T18:05:00',
    messages: [
      { id: 1, from: 'agent', text: '상담원 연결을 도와드릴게요. 잠시만 기다려주세요!' },
      { id: 2, from: 'me', text: '사이즈가 안 맞아서 교환하고 싶어요.' },
    ],
  },
  {
    chatRoomId: 3,
    title: '상품 문의',
    inquiryStatus: 'COMPLETED',
    assigneeName: '박상담',
    updatedAt: '2026-09-10T09:47:00',
    messages: [
      { id: 1, from: 'me', text: '이 니트 소재가 어떻게 되나요?' },
      { id: 2, from: 'agent', text: '울 혼방 소재로 부드럽고 보온성이 좋아요!' },
      { id: 3, from: 'me', text: '감사합니다, 확인했어요.' },
    ],
  },
];

// 마이페이지 "내 쿠폰"에 쓰이는 보유 쿠폰 더미 데이터. 백엔드 UserCouponResponse 모양을 따라간다.
export const DEMO_MY_COUPONS = [
  { userCouponId: 1, couponId: 1, couponName: '가을 시즌 할인쿠폰', discountRate: 15, minimumOrderAmount: 50000, maximumDiscountAmount: 10000, status: 'AVAILABLE', expiresAt: '2026-09-28T23:59:59' },
  { userCouponId: 2, couponId: 2, couponName: '신규 회원 환영 쿠폰', discountRate: 10, minimumOrderAmount: 30000, maximumDiscountAmount: 5000, status: 'AVAILABLE', expiresAt: '2026-09-20T23:59:59' },
  { userCouponId: 3, couponId: 3, couponName: '여름 세일 쿠폰', discountRate: 20, minimumOrderAmount: 40000, maximumDiscountAmount: 8000, status: 'USED', expiresAt: '2026-08-30T23:59:59' },
  { userCouponId: 4, couponId: 4, couponName: '봄맞이 할인쿠폰', discountRate: 10, minimumOrderAmount: 20000, maximumDiscountAmount: 3000, status: 'EXPIRED', expiresAt: '2026-06-01T23:59:59' },
];

// 한정쿠폰(발급 가능 쿠폰) 페이지에 쓰이는 더미 데이터. 백엔드 CouponResponse 모양을 따라간다.
export const DEMO_ACTIVE_COUPONS = [
  { couponId: 10, couponName: '추석맞이 특가 쿠폰', discountRate: 25, minimumOrderAmount: 30000, maximumDiscountAmount: 15000, totalQuantity: 100, issuedQuantity: 87, status: 'ACTIVE', issueEndsAt: '2026-09-30T23:59:59' },
  { couponId: 11, couponName: '전상품 5% 쿠폰', discountRate: 5, minimumOrderAmount: 10000, maximumDiscountAmount: 5000, totalQuantity: 500, issuedQuantity: 120, status: 'ACTIVE', issueEndsAt: '2026-10-15T23:59:59' },
  { couponId: 12, couponName: '마감임박 한정 쿠폰', discountRate: 30, minimumOrderAmount: 50000, maximumDiscountAmount: 20000, totalQuantity: 50, issuedQuantity: 50, status: 'ACTIVE', issueEndsAt: '2026-09-18T23:59:59' },
];

export const DEMO_CHAT_AUTO_REPLIES = [
  '네, 확인해보겠습니다!',
  '조금만 기다려주세요 :)',
  '말씀하신 내용 담당 부서에 전달했어요.',
  '추가로 궁금하신 점 있으신가요?',
];
