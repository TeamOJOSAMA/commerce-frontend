import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { getPopularProducts } from '../api/products';
import ProductCard from '../components/common/ProductCard';

const pad = (n) => String(n).padStart(2, '0');

function useCountdownToMidnight() {
  const [text, setText] = useState('00:00:00');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      const diff = Math.max(0, end - now);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setText(`${pad(h)}:${pad(m)}:${pad(s)}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return text;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const timerText = useCountdownToMidnight();

  useEffect(() => {
    getPopularProducts(0, 16)
      .then((page) => setProducts(page?.content ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;
    gsap.fromTo(
      heroRef.current.children,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 }
    );
  }, []);

  const flashDeals = products.filter((product) => product.eventPrice != null);

  return (
    <div>
      {/* 히어로 배너 - 뷰포트 양끝까지 꽉 차는 풀블리드 배경, 내용만 1240px로 정렬 */}
      <section
        className="relative left-1/2 -mt-6 mb-10 w-screen -translate-x-1/2 overflow-hidden"
        style={{ background: 'var(--ink)' }}
      >
        <div className="wrap grid items-center gap-10 py-16 md:grid-cols-[1.1fr_0.9fr]">
          <div ref={heroRef}>
            <h1 className="text-4xl leading-tight font-black tracking-tight text-white md:text-5xl">
              오늘 뭐 살지,
              <br />
              <span
                style={{
                  backgroundImage: 'linear-gradient(var(--red), var(--red))',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '100% 10px',
                  backgroundPosition: '0 88%',
                }}
              >
                갈팡질팡
              </span>
              하다가
              <br />
              여기서 끝났어요.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/65">
              고민만 하다 하루 다 갈 뻔했죠. 잘 팔리는 것부터, 오늘만 싼 것까지 — 갈팡질팡이 대신
              골라드립니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#deals"
                className="rounded-full px-6 py-3.5 text-sm font-bold text-white"
                style={{ background: 'var(--red)' }}
              >
                번개딜 보러가기
              </a>
              <a
                href="#popular"
                className="rounded-full border border-white/40 px-6 py-3.5 text-sm font-bold text-white hover:border-white"
              >
                지금 뜨는 상품
              </a>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[320px]" aria-hidden="true">
            <div
              className="absolute top-[6%] left-[2%] h-[64%] w-[64%] rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #ff6b60, var(--red) 70%)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute right-0 bottom-[4%] h-[58%] w-[58%] rounded-full"
              style={{
                background: 'radial-gradient(circle at 65% 35%, #5578f0, var(--blue) 70%)',
                mixBlendMode: 'screen',
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 flex aspect-square w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-center text-sm leading-tight font-black"
              style={{ background: 'var(--paper)', color: 'var(--ink)', boxShadow: '0 12px 30px rgba(0,0,0,0.35)' }}
            >
              오늘의
              <br />
              고민 종료
            </div>
          </div>
        </div>
      </section>

      {/* 번개딜 - 실제 이벤트가(eventPrice) 적용된 인기 상품을 가로 스크롤로 노출 */}
      <section id="deals" className="mb-10">
        <div className="mb-4 flex items-center gap-3.5">
          <h2 className="text-xl font-extrabold tracking-tight">번개딜</h2>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold text-white [font-variant-numeric:tabular-nums]"
            style={{ background: 'var(--ink)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--red)' }} />
            <span>{timerText}</span> 남음
          </div>
        </div>

        {loading ? (
          <div className="text-gray-400">불러오는 중...</div>
        ) : flashDeals.length === 0 ? (
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            지금은 진행 중인 번개딜이 없어요.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1.5 [scrollbar-width:thin]">
            {flashDeals.map((product) => (
              <div
                key={product.id}
                className="shrink-0 basis-[calc((100%-1rem)/2)] sm:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-5rem)/6)]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="popular">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold tracking-tight">오늘의 인기 상품</h2>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            가장 많이 담긴 순
          </span>
        </div>
        {loading ? (
          <div className="text-gray-400">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
