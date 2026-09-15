import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// 갈팡질팡 사이트 디자인: 다크 헤더(카테고리 내비 포함) + 본문 + 다크 푸터, 좌측 사이드바 없음
export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="wrap flex-1 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
