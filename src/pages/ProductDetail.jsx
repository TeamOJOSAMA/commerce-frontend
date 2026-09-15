import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProduct } from '../api/products';
import { addCartItem } from '../api/cart';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { DEMO_TOKEN } from '../mocks/demoData';
import ImagePlaceholder from '../components/common/ImagePlaceholder';

const formatPrice = (price) => `${Number(price).toLocaleString()}원`;

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => !!state.token);
  const isDemo = useAuthStore((state) => state.token === DEMO_TOKEN);
  const refreshCart = useCartStore((state) => state.refresh);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProduct(productId).then(setProduct);
  }, [productId]);

  const requireLogin = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return true;
    }
    return false;
  };

  const handleAddToCart = async () => {
    if (requireLogin()) return;
    if (isDemo) {
      setMessage('데모 모드에서는 실제 장바구니 담기를 체험할 수 없어요. 데모 계정 대신 실제로 로그인하면 사용할 수 있어요!');
      return;
    }
    await addCartItem(productId, quantity);
    await refreshCart();
    setMessage('장바구니에 담았습니다.');
  };

  const handleBuyNow = async () => {
    if (requireLogin()) return;
    if (isDemo) {
      setMessage('데모 모드에서는 실제 결제까지는 진행할 수 없어요. 데모 계정 대신 실제로 로그인하면 사용할 수 있어요!');
      return;
    }
    const cartItem = await addCartItem(productId, quantity);
    await refreshCart();
    navigate(`/checkout?cartItemIds=${cartItem.cartItemId}`);
  };

  if (!product) {
    return <div className="text-gray-400">불러오는 중...</div>;
  }

  const hasEvent = product.eventPrice != null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {product.imageUrl ? (
        <img src={product.imageUrl} alt={product.name} className="clay aspect-square w-full object-cover" />
      ) : (
        <ImagePlaceholder className="clay aspect-square w-full" />
      )}

      <div>
        <h1 className="mb-1 text-2xl font-bold">{product.name}</h1>
        <p className="mb-3 text-gray-500">{product.description}</p>

        {hasEvent ? (
          <div className="mb-3">
            <div className="text-gray-400 line-through">{formatPrice(product.price)}</div>
            <div className="text-xl font-bold">
              {formatPrice(product.eventPrice)}{' '}
              <span className="text-red-500">{product.discountRate}%</span>
            </div>
          </div>
        ) : (
          <div className="mb-3 text-xl font-bold">{formatPrice(product.price)}</div>
        )}

        <div className="mb-4 text-sm text-gray-500">재고 {product.stock}개 · 상태 {product.status}</div>

        <div className="mb-4 flex items-center gap-3">
          <span>수량</span>
          <button
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="h-8 w-8 rounded border"
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
            className="h-8 w-8 rounded border"
          >
            +
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleAddToCart} className="clay flex-1 py-3">
            장바구니 담기
          </button>
          <button onClick={handleBuyNow} className="clay-accent flex-1 py-3">
            바로 구매하기
          </button>
        </div>

        {message && (
          <p className={`mt-3 text-sm ${isDemo ? '' : 'text-green-600'}`} style={isDemo ? { color: 'var(--red)' } : undefined}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
