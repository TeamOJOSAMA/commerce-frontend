import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-6" style={{ background: 'var(--ink)', color: 'rgba(246,244,239,0.6)' }}>
      <div className="wrap py-8">
        <div className="mb-3 text-lg font-black text-white">갈팡질팡</div>
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <Link to="/info/terms" className="hover:text-white">이용약관</Link>
          <Link to="/info/privacy" className="hover:text-white">개인정보처리방침</Link>
          <Link to="/info/support" className="hover:text-white">고객센터</Link>
          <Link to="/info/partner" className="hover:text-white">입점문의</Link>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-0.5 text-[11px] sm:grid-cols-4">
          <span>상호명: 주식회사 갈팡질팡</span>
          <span>대표이사: 김갈팡 (마음 정하는 중)</span>
          <span>사업자등록번호: 999-88-77665</span>
          <span>통신판매업신고: 제2026-서울갈팡-0417호</span>
          <span>주소: 서울특별시 갈팡구 질팡로 42, 마음정하지못한빌딩 7층 (오늘은 여기)</span>
          <span>고객센터: 1544-0000 (결정장애 상담은 24시간)</span>
          <span>이메일: hello@galpangjilpang.com</span>
          <span>호스팅 제공: 방랑 클라우드</span>
        </div>

        <p className="text-xs leading-relaxed">
          (주)갈팡질팡컴퍼니 · 통신판매중개자로서 거래 당사자가 아닙니다.
          <br />
          상품 정보 및 거래에 대한 책임은 각 판매자에게 있습니다.
          <br />
          © 2026 갈팡질팡 Company Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
