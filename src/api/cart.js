import client from './client';

export const getCart = () => client.get('/carts/items'); // -> GetCartResponse

export const addCartItem = (productId, quantity) =>
  client.post(`/carts/items/${productId}`, { quantity }); // -> AddToCartResponse

export const updateCartItemQuantity = (cartItemId, quantity) =>
  client.patch(`/carts/items/${cartItemId}`, { quantity }); // -> UpdateQuantityResponse

export const deleteCartItem = (cartItemId) =>
  client.delete(`/carts/items/${cartItemId}`); // 204 No Content
