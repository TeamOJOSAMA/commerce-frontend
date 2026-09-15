import client from './client';

// request: { name, category, minPrice, maxPrice, status }, page/size는 별도 파라미터로 합친다.
export const searchProducts = (request = {}, page = 0, size = 12) =>
  client.get('/products', { params: { ...request, page, size } }); // -> Page<ProductResponse>

export const getProduct = (productId) =>
  client.get(`/products/${productId}`); // -> ProductResponse

export const getPopularProducts = (page = 0, size = 8) =>
  client.get('/products/popular', { params: { page, size } }); // -> Page<ProductResponse>
