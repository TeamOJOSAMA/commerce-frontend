import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchProducts } from '../api/products';
import ProductCard from '../components/common/ProductCard';
import { CATEGORIES } from '../constants/categories';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const name = searchParams.get('name') ?? '';
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page') ?? 0);

  const [productPage, setProductPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    searchProducts(
      { category: category || undefined, name: name || undefined, status: status || undefined },
      page,
      12
    )
      .then(setProductPage)
      .catch(() => setProductPage(null))
      .finally(() => setLoading(false));
  }, [category, name, status, page]);

  const goToPage = (nextPage) => {
    setSearchParams((params) => {
      params.set('page', nextPage);
      return params;
    });
  };

  const categoryLabel = CATEGORIES.find((item) => item.value === category)?.label ?? '전체 상품';
  const pageTitle = name
    ? `'${name}' 검색 결과`
    : status === 'ON_EVENT'
      ? '타임세일'
      : categoryLabel;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{pageTitle}</h1>
      <p className="mb-4 text-gray-500">총 {productPage?.totalElements ?? 0}개의 상품</p>

      {loading ? (
        <div className="text-gray-400">불러오는 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {productPage?.content?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {productPage?.content?.length === 0 && (
            <div className="mt-10 text-center text-gray-400">조건에 맞는 상품이 없습니다.</div>
          )}

          <div className="mt-6 flex justify-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => goToPage(page - 1)}
              className="rounded border px-3 py-1 disabled:opacity-30"
            >
              이전
            </button>
            <span className="px-2 py-1">{page + 1} / {Math.max(productPage?.totalPages ?? 1, 1)}</span>
            <button
              disabled={productPage && page >= productPage.totalPages - 1}
              onClick={() => goToPage(page + 1)}
              className="rounded border px-3 py-1 disabled:opacity-30"
            >
              다음
            </button>
          </div>
        </>
      )}
    </div>
  );
}
