// 백엔드 OrderDisplayStatus(주문+취소사유+환불을 합친 진행 상태) 한글 라벨.
export const ORDER_STATUS_LABELS = {
  PAYMENT_PENDING: '결제 대기중',
  PAID: '결제 완료',
  REFUND_REQUESTED: '환불 접수됨',
  PARTIALLY_REFUNDED: '부분 환불 완료',
  REFUNDED: '환불 완료',
  PAYMENT_FAILED: '결제 실패',
  CANCELLED: '주문 취소',
};

export const formatOrderStatus = (displayStatus) => ORDER_STATUS_LABELS[displayStatus] ?? displayStatus;

export const formatOrderDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 목록 날짜 그룹 헤더용: "25.10.04(토)" 형식.
export const formatOrderDateWithWeekday = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const w = WEEKDAYS[date.getDay()];
  return `${y}.${m}.${d}(${w})`;
};
