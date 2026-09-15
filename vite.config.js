import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // sockjs-client는 Node의 전역 global을 참조하므로 브라우저에서 globalThis로 대신 채워준다.
  define: {
    global: 'globalThis',
  },
  server: {
    port: 5173,
    proxy: {
      // 백엔드가 /api 프리픽스를 쓰므로, 개발 중엔 이 프록시로 CORS 없이 바로 호출한다.
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true, // STOMP(SockJS) 웹소켓 업그레이드도 /api/ws-stomp로 같이 프록시한다
      },
    },
  },
})
