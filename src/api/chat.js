import client from './client';

export const createChatRoom = (title) => client.post('/chat-rooms', { title }); // -> ChatRoomCreateResponse

export const getMyChatRooms = (status) =>
  client.get('/chat-rooms/me', { params: { status, size: 50 } }); // -> PageResponse<CustomerChatRoomResponse>

export const getChatMessages = (chatRoomId, { cursor, size = 30, direction = 'BEFORE' } = {}) =>
  client.get(`/chat-rooms/${chatRoomId}/messages`, {
    params: { cursor, size, direction },
  }); // -> ChatMessageSliceResponse

export const escalateChatRoom = (chatRoomId) => client.post(`/chat-rooms/${chatRoomId}/escalate`); // -> InquiryStatusUpdateResponse

// 관리자 - 전체 문의(채팅방) 목록. status가 없으면 전체.
export const getAllChatRooms = (status, page = 0, size = 20) =>
  client.get('/chat-rooms', { params: { status: status || undefined, page, size } }); // -> PageResponse<AdminChatRoomResponse>

// 관리자 - 문의 상태 변경. WAITING -> IN_PROGRESS로 바꾸면 호출한 관리자 본인이 담당자로 지정된다.
export const updateChatRoomStatus = (chatRoomId, inquiryStatus) =>
  client.patch(`/chat-rooms/${chatRoomId}/status`, { inquiryStatus }); // -> InquiryStatusUpdateResponse
