import client from './client';

export const getOrderPreview = (cartItemIds = [], userCouponId = null) =>
  client.get('/orders/preview', {
    params: { cartItemIds, ...(userCouponId ? { userCouponId } : {}) },
  }); // -> OrderPreviewResponse

// request: { cartItemIds, userCouponId }
export const createOrder = (request) =>
  client.post('/orders', request); // -> CreateOrderResponse { order, payment }

export const getOrders = () => client.get('/orders'); // -> OrderSummaryResponse[]

export const getOrder = (orderId) => client.get(`/orders/${orderId}`); // -> OrderResponse

export const cancelOrder = (orderId) => client.post(`/orders/${orderId}/cancel`);
