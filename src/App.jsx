import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import InfoPage from './pages/InfoPage';

import MyPage from './pages/mypage/MyPage';
import OrdersPage from './pages/mypage/OrdersPage';
import OrderDetail from './pages/mypage/OrderDetail';

import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';

function App() {
  const isLoggedIn = useAuthStore((state) => !!state.token);
  const refreshCart = useCartStore((state) => state.refresh);

  // 새로고침 시 로그인 상태가 남아있으면 장바구니 배지 숫자도 다시 맞춘다.
  useEffect(() => {
    if (isLoggedIn) refreshCart();
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/info/:type" element={<InfoPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />

            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/orders" element={<OrdersPage />} />
            <Route path="/mypage/orders/:orderId" element={<OrderDetail />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
