import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// vite.config.js의 프록시 설정으로 /api 요청은 개발 중엔 로컬 백엔드로 전달된다.
const client = axios.create({
  baseURL: '/api',
});

// 로그인 토큰(이미 "Bearer " 접두어 포함된 문자열)을 모든 요청에 자동으로 붙인다.
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

// 백엔드가 성공 응답을 {code, message, data}로 감싸서 보내므로, 실제 필요한 data만 꺼내서 돌려준다.
client.interceptors.response.use(
  (response) => response.data?.data,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰이 만료되었거나 유효하지 않으면 로그인 정보를 지운다.
      useAuthStore.getState().logout();
    }
    // 에러 응답은 {code, message} 형태(ApiErrorResponse)이므로 message를 그대로 꺼내서 붙여준다.
    const message = error.response?.data?.message ?? '요청 처리 중 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

export default client;
