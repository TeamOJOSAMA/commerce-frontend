import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// SockJS 핸드셰이크는 permitAll이라 HTTP 헤더로 인증할 수 없다.
// 서버(StompAuthChannelInterceptor)는 STOMP CONNECT 프레임의 Authorization 헤더로 인증한다.
export const createStompClient = (token) =>
  new Client({
    webSocketFactory: () => new SockJS('/api/ws-stomp'),
    connectHeaders: { Authorization: token },
    reconnectDelay: 3000,
  });

// 메시지가 내가 보낸 것인지 판정하기 위해 토큰의 sub(userId) 클레임만 읽는다.
// 서명 검증은 서버가 이미 했으므로 여기서는 표시 용도로 페이로드만 디코딩한다.
export const decodeUserId = (bearerToken) => {
  try {
    const jwt = bearerToken.replace(/^Bearer\s+/, '');
    const payload = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    return Number(JSON.parse(atob(padded)).sub);
  } catch {
    return null;
  }
};
