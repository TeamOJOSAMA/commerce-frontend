import { useParams } from 'react-router-dom';

const INFO_CONTENT = {
  terms: {
    title: '이용약관',
    paragraphs: [
      '제1조 (목적) 이 약관은 갈팡질팡(이하 "회사")이 제공하는 전자상거래 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.',
      '제2조 (정의) "서비스"란 회사가 운영하는 웹사이트를 통해 상품 정보를 제공하고 구매를 중개하는 일체의 서비스를 말하며, "회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.',
      '제3조 (약관의 효력 및 변경) 회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시 적용일자 및 사유를 명시하여 사전 공지합니다.',
      '제4조 (서비스의 제공 및 중단) 회사는 시스템 점검, 교체 및 고장, 통신 두절 등의 사유가 발생한 경우 서비스 제공을 일시적으로 중단할 수 있습니다.',
    ],
  },
  privacy: {
    title: '개인정보처리방침',
    paragraphs: [
      '갈팡질팡은 회원의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수하고 있습니다.',
      '1. 수집하는 개인정보 항목: 이름, 이메일, 비밀번호, 배송지 주소, 연락처 등 서비스 제공에 필요한 최소한의 정보를 수집합니다.',
      '2. 개인정보의 수집 및 이용 목적: 회원 가입 및 관리, 상품 주문 및 배송, 결제 처리, 고객 상담 등을 위해 이용됩니다.',
      '3. 개인정보의 보유 및 이용 기간: 회원 탈퇴 시 지체 없이 파기하며, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 안전하게 보관합니다.',
      '4. 회원은 언제든지 자신의 개인정보를 조회하거나 수정, 삭제를 요청할 수 있습니다.',
    ],
  },
  support: {
    title: '고객센터',
    paragraphs: [
      '운영시간: 평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)',
      '전화 문의: 1544-0000',
      '이메일 문의: support@galpangjilpang.com',
      '자주 묻는 질문(FAQ)과 1:1 문의 게시판은 준비 중입니다. 급한 문의는 실시간 채팅 상담을 이용해주세요.',
    ],
  },
  partner: {
    title: '입점문의',
    paragraphs: [
      '갈팡질팡과 함께할 판매 파트너를 모집합니다.',
      '입점 절차: 입점 신청서 작성 → 서류 심사 → 계약 체결 → 상품 등록 → 판매 개시 순으로 진행됩니다.',
      '입점 문의: partner@galpangjilpang.com 으로 사업자등록증과 취급 상품 카테고리를 함께 보내주시면 담당자가 순차적으로 연락드립니다.',
    ],
  },
};

export default function InfoPage() {
  const { type } = useParams();
  const info = INFO_CONTENT[type] ?? INFO_CONTENT.terms;

  return (
    <div className="clay mx-auto max-w-3xl p-8">
      <h1 className="mb-6 text-2xl font-bold">{info.title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-gray-600">
        {info.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}
