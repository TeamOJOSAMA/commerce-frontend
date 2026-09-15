import client from './client';

export const approvePayment = (paymentId) =>
  client.post(`/payments/${paymentId}/approve`); // -> PaymentResponse

export const failPayment = (paymentId, failReason) =>
  client.post(`/payments/${paymentId}/fail`, { failReason });

export const getPayment = (paymentId) => client.get(`/payments/${paymentId}`);
