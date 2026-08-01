import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Home as HomeIcon, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function Header() {
  const [theme, setTheme] = useState('dark');
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Public, customer-facing pages get a clean, minimal header —
  // no broker/sign-up clutter in front of a lead who's just browsing.
  const isPublicLeadPage =
    location.pathname.startsWith('/broker/') || location.pathname.startsWith('/property/');

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      <Link to="/" className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#1a1a1d,#000)', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <HomeIcon size={15} color="#e8eaed" />
        </div>
        <span className="font-display font-semibold text-xl silver-text">Estanza</span>
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-8 h-8 rounded-lg flex items-center justify-center border"
          style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {isPublicLeadPage ? null : session ? (
          <>
            <Link to="/dashboard" className="hidden sm:inline font-medium">
              Dashboard
            </Link>
            <Link
              to="/settings"
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
              title="Settings"
            >
              <SettingsIcon size={15} />
            </Link>
            <button
              onClick={async () => {
                await signOut();
                navigate('/');
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{ background: 'var(--surface2)', borderColor: 'var(--border)' }}
              title="Log out"
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <Link
              to="/auth"
              className="px-4 py-2 rounded-lg font-semibold text-sm"
              style={{ background: 'linear-gradient(135deg,#e8eaed,#b8bcc2)', color: '#0a0a0c' }}
            >
              Login
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
