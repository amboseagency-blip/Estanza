import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Auth() {
  const [mode, setMode] = useState('signup');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { session, signUp, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Already logged in? Don't show the login form again — go straight in.
  useEffect(() => {
    if (session) navigate('/dashboard', { replace: true });
  }, [session, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signUp(displayName, email, password);
        if (!data.session) {
          setError('Account created. Check your email to confirm, then sign in.');
          setMode('login');
        } else {
          navigate('/dashboard');
        }
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    try {
      await signInWithGoogle();
      // Supabase redirects the browser to Google, then back to /dashboard.
      // No navigate() needed here — the page will actually leave this component.
    } catch (err) {
      setError(err.message || 'Could not start Google sign-in.');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <h2 className="font-display text-3xl mb-1">
        {mode === 'signup' ? 'Create your broker account' : 'Welcome back'}
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Only brokers log in. Your leads never need an account.
      </p>

      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <Field label="Full name" value={displayName} onChange={setDisplayName} placeholder="Rajesh Sharma" />
        )}
        <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        <Field label="Password" value={password} onChange={setPassword} placeholder="At least 6 characters" type="password" />

        {error && <p className="text-sm mb-4" style={{ color: '#ef4444' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold"
          style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c', opacity: loading ? 0.6 : 1 }}
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or</span>
        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18z"/>
          <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33z"/>
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-muted)' }}>
        {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
        <span
          className="font-semibold cursor-pointer"
          style={{ color: 'var(--text)' }}
          onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Sign in' : 'Create account'}
        </span>
      </p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="mb-4">
      <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="w-full px-3 py-2.5 rounded-lg text-sm border outline-none"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
      />
    </div>
  );
}
