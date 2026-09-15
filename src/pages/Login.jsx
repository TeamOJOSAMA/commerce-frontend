import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { DEMO_TOKEN, DEMO_CREDENTIALS } from '../mocks/demoData';

export default function Login() {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.login);
  const refreshCart = useCartStore((state) => state.refresh);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { token } = await login({ email, password });
      setToken(token);
      await refreshCart();
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setToken(DEMO_TOKEN);
    await refreshCart();
    navigate('/');
  };

  return (
    <div className="clay mx-auto max-w-sm p-8">
      <Link
        to="/"
        className="mb-6 block text-center text-lg font-black tracking-tight"
        style={{ color: 'var(--text-dark)' }}
      >
        갈팡<span style={{ color: 'var(--red)' }}>질팡</span>
      </Link>
      <h1 className="mb-6 text-center text-xl font-extrabold tracking-tight">로그인</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일"
          className="rounded border px-3 py-2.5 text-sm outline-none focus:border-black"
          style={{ borderColor: 'var(--line)' }}
        />
        <input
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          className="rounded border px-3 py-2.5 text-sm outline-none focus:border-black"
          style={{ borderColor: 'var(--line)' }}
        />

        {error && (
          <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="clay-accent py-3 text-sm font-bold disabled:opacity-40"
        >
          로그인
        </button>
      </form>

      <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        아직 회원이 아니신가요?{' '}
        <Link to="/signup" className="font-semibold" style={{ color: 'var(--red)' }}>
          회원가입
        </Link>
      </p>

      <div className="my-5 flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
        또는
        <span className="h-px flex-1" style={{ background: 'var(--line)' }} />
      </div>

      <button
        type="button"
        onClick={handleDemoLogin}
        className="w-full rounded-full border py-3 text-sm font-bold hover:border-black"
        style={{ borderColor: 'var(--line)' }}
      >
        데모 계정으로 체험하기
      </button>
      <p className="mt-2 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        백엔드 서버 없이 장바구니·주문·채팅 화면을 바로 둘러볼 수 있어요.
        <br />
        (데모 계정: {DEMO_CREDENTIALS.email})
      </p>
    </div>
  );
}
