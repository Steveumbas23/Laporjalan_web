import React, { useState } from 'react';
import '../../../assets/style.css';
import { apiFetch, getApiBase } from '../../../lib/api';
import { ensureCsrfToken } from '../../../lib/csrf';

const AdminSignIn: React.FC = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const readJsonSafe = async <T,>(response: Response): Promise<T> => {
    const text = await response.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(text || 'Response bukan JSON');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get('email') || '').trim(),
      password: String(formData.get('password') || ''),
    };

    try {
      const csrfToken = await ensureCsrfToken(getApiBase());
      const response = await apiFetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await readJsonSafe<{ message?: string }>(response);
        throw new Error(data?.message || 'Login gagal');
      }

      const data = await readJsonSafe<{ user?: { full_name?: string; email?: string; role?: string } }>(response);
      if (data?.user?.role !== 'admin') {
        const token = await ensureCsrfToken(getApiBase());
        await apiFetch('/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { Accept: 'application/json', 'X-XSRF-TOKEN': token },
        });
        throw new Error('Akun ini bukan admin.');
      }

      localStorage.setItem('lj-user', JSON.stringify(data.user));
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lj-auth-page">
      <div className="lj-auth-card">
        <h1 className="lj-auth-title">Admin Sign In</h1>
        <p className="lj-auth-subtitle">Masuk sebagai admin untuk membuka dashboard.</p>
        <form className="lj-auth-form" onSubmit={handleSubmit} autoComplete="off">
          <label className="lj-auth-field">
            <span>Email / Username</span>
            <input
              type="text"
              name="email"
              placeholder="Masukkan email atau username admin"
              autoComplete="username"
              required
            />
          </label>
          <label className="lj-auth-field">
            <span>Password</span>
            <div className="lj-auth-password">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="lj-auth-eye"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5" />
                    <path d="M9.2 5.4A10.6 10.6 0 0 1 12 5c5.5 0 9.5 4.4 10.7 6-0.4 0.6-1.3 2-2.9 3.4" />
                    <path d="M6.1 6.1C3.8 7.6 2.2 9.8 1.3 11c1.2 1.7 5.2 6 10.7 6 1.6 0 3.1-0.4 4.3-0.9" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M1.3 11C2.5 9.3 6.5 5 12 5s9.5 4.4 10.7 6c-1.2 1.7-5.2 6-10.7 6S2.5 12.7 1.3 11z" />
                    <circle cx="12" cy="11" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </label>
          <button type="submit" className="lj-auth-button">
            {loading ? 'Memproses...' : 'Masuk Admin'}
          </button>
        </form>
        {error ? <p className="lj-auth-error">{error}</p> : null}
        <p className="lj-auth-switch">
          Login sebagai user? <a href="/signin">Masuk User</a>
        </p>
      </div>
    </div>
  );
};

export default AdminSignIn;
