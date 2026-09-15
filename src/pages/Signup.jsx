import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signup(form);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
      <h1 className="mb-6 text-center text-xl font-extrabold tracking-tight">회원가입</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          required
          value={form.name}
          onChange={update('name')}
          placeholder="이름"
          className="rounded border px-3 py-2.5 text-sm outline-none focus:border-black"
          style={{ borderColor: 'var(--line)' }}
        />
        <input
          type="email"
          required
          value={form.email}
          onChange={update('email')}
          placeholder="이메일"
          className="rounded border px-3 py-2.5 text-sm outline-none focus:border-black"
          style={{ borderColor: 'var(--line)' }}
        />
        <input
          type="password"
          required
          value={form.password}
          onChange={update('password')}
          placeholder="비밀번호 (8자 이상)"
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
          회원가입
        </button>
      </form>

      <p className="mt-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-semibold" style={{ color: 'var(--red)' }}>
          로그인
        </Link>
      </p>
    </div>
  );
}
