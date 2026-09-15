# commerce-frontend (갈팡질팡)

React + Vite + Tailwind 기반 커머스 프론트엔드. 백엔드는 별도 저장소([Commerce](https://github.com/TeamOJOSAMA/Commerce), `feat/front` 브랜치)에 있다.

## 실행

```bash
npm install
npm run dev
```

`http://localhost:5173`. `/api`, `/api/ws-stomp`(채팅) 요청은 vite가 `localhost:8080`으로 프록시한다 — 백엔드가 그 포트에 떠 있어야 정상 동작한다. 백엔드 실행 방법과 더미 데이터 세팅은 [Commerce 저장소 README](https://github.com/TeamOJOSAMA/Commerce#readme) 참고.

## 로그인 방법 두 가지

- **데모 계정으로 체험하기** (로그인 화면 버튼) — 백엔드 없이도 목업 데이터로 전체 화면 UI를 둘러볼 수 있다. 단 장바구니 담기, 결제, 채팅 등 실제 동작이 필요한 곳은 안내 문구만 뜨고 실제로 처리되지 않는다.
- **실제 로그인** — 백엔드 테스트 계정(`kim@test.com` / `test1234` 등, Commerce README 참고)으로 로그인하면 장바구니·주문·환불·실시간 채팅까지 전부 실제로 동작한다. **시연할 땐 이쪽을 써야 한다.**

## 주요 페이지
- `/` , `/products` — 상품 목록/검색/카테고리, 이벤트(할인) 상품 표시
- `/products/:id` — 상품 상세, 장바구니 담기/바로 구매
- `/cart` — 장바구니
- `/checkout` — 주문서 작성/결제
- `/mypage`, `/mypage/orders`, `/mypage/orders/:id` — 마이페이지, 주문 내역/상세, 환불 신청
- `/chat` — 실시간 채팅 상담 (STOMP WebSocket)
