import { Link } from 'react-router-dom';
import ImagePlaceholder from './ImagePlaceholder';

const formatPrice = (price) => `${Number(price).toLocaleString()}원`;

export default function ProductCard({ product }) {
  const hasEvent = product.eventPrice != null;

  return (
    <Link to={`/products/${product.id}`} className="clay block overflow-hidden hover:border-black">
      <div className="relative aspect-square w-full">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
        {hasEvent && (
          <span
            className="absolute top-2 left-2 rounded px-1.5 py-0.5 text-[11px] font-extrabold text-white"
            style={{ background: 'var(--red)' }}
          >
            할인
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="mb-2 line-clamp-2 min-h-[2.6em] text-sm leading-tight text-gray-700">
          {product.name}
        </div>

        {hasEvent ? (
          <div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-sm font-extrabold" style={{ color: 'var(--red)' }}>
                {product.discountRate}%
              </span>
              <span className="text-sm font-extrabold">{formatPrice(product.eventPrice)}</span>
            </div>
            <div className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</div>
          </div>
        ) : (
          <div className="text-sm font-extrabold">{formatPrice(product.price)}</div>
        )}
      </div>
    </Link>
  );
}
