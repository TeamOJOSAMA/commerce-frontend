import client from './client';

export const createChatRoom = (title) => client.post('/chat-rooms', { title }); // -> ChatRoomCreateResponse

export const getMyChatRooms = (status) =>
  client.get('/chat-rooms/me', { params: { status, size: 50 } }); // -> PageResponse<CustomerChatRoomResponse>

export const getChatMessages = (chatRoomId, { cursor, size = 30, direction = 'BEFORE' } = {}) =>
  client.get(`/chat-rooms/${chatRoomId}/messages`, {
    params: { cursor, size, direction },
  }); // -> ChatMessageSliceResponse

export const escalateChatRoom = (chatRoomId) => client.post(`/chat-rooms/${chatRoomId}/escalate`); // -> InquiryStatusUpdateResponse
