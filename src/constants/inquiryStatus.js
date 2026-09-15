// 백엔드 InquiryStatus(문의 처리 상태) 한글 라벨.
export const INQUIRY_STATUS_LABELS = {
  BOT_HANDLING: '봇 상담중',
  WAITING: '상담원 연결 대기',
  IN_PROGRESS: '상담원 상담중',
  COMPLETED: '상담 완료',
};

export const formatInquiryStatus = (inquiryStatus) => INQUIRY_STATUS_LABELS[inquiryStatus] ?? inquiryStatus;
