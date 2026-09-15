import client from './client';

export const createRefund = (payload) => client.post('/refunds', payload); // -> RefundResponse

export const completeRefund = (refundId) => client.post(`/refunds/${refundId}/complete`); // -> RefundResponse
