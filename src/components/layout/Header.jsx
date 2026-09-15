import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { CATEGORIES } from '../../constants/categories';

export default function Header() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => !!state.token);
  const logout = useAuthStore((state) => state.logout);
  const itemCount = useCartStore((state) => state.itemCount);

  const [keyword, setKeyword] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/products?name=${encodeURIComponent(keyword)}`);
  };

  const handleAccountClick = () => {
    if (isLoggedIn) {
      navigate('/mypage');
    } else {
      navigate('/login');
    }
  };

  return (
    <header style={{ background: 'var(--ink)' }}>
      <div className="wrap flex items-center gap-7 py-4">
        <Link
          to="/"
          className="whitespace-nowrap text-xl font-black tracking-tight text-white"
        >
          갈팡<span style={{ color: 'var(--red)' }}>질팡</span>
        </Link>

        <form
          onSubmit={handleSearch}
          className="flex h-11 flex-1 items-center rounded-full pl-5 pr-1.5"
          style={{ background: 'var(--paper)' }}
        >
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            type="text"
            placeholder="오늘은 뭘 사야 할지 검색해보세요"
            className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            aria-label="검색"
            className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-full text-white"
            style={{ background: 'var(--ink)' }}
          >
            🔍
          </button>
        </form>

        <div className="flex items-center gap-5 whitespace-nowrap text-sm text-white/80">
          <button onClick={handleAccountClick} className="hover:text-white">
            {isLoggedIn ? '내정보' : '로그인'}
          </button>

          <Link to="/mypage/orders" className="hover:text-white">
            주문
          </Link>

          <Link to="/chat" className="hover:text-white">
            채팅
          </Link>

          <Link to="/cart" className="relative hover:text-white">
            장바구니
            {itemCount > 0 && (
              <span
                className="absolute -right-3 -top-2 rounded-full px-1.5 text-[10px] font-bold text-white"
                style={{ background: 'var(--red)' }}
              >
                {itemCount}
              </span>
            )}
          </Link>

          {isLoggedIn && (
            <button onClick={logout} className="text-white/50 hover:text-white">
              로그아웃
            </button>
          )}
        </div>
      </div>

      <nav
        className="border-t"
        style={{ borderColor: 'rgba(255,255,255,0.12)' }}
        aria-label="카테고리"
      >
        <div className="wrap flex gap-6 overflow-x-auto py-3 [scrollbar-width:none]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="shrink-0 border-b-2 border-transparent pb-0.5 text-sm font-medium whitespace-nowrap text-white/70 hover:text-white"
              style={link.highlight ? { color: 'var(--red)', opacity: 1 } : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

const NAV_LINKS = [
  { label: '전체', to: '/products' },
  ...CATEGORIES.map((category) => ({
    label: category.label,
    to: `/products?category=${category.value}`,
  })),
  { label: '타임세일', to: '/products?status=ON_EVENT' },
  { label: '한정쿠폰', to: '/coupons', highlight: true },
];
