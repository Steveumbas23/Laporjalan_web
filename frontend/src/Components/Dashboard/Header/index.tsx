import React, { useEffect, useRef, useState } from 'react';
import '../../../assets/style.css';
import { apiFetch, getApiBase } from '../../../lib/api';
import { clearStoredUser, readStoredUser, writeStoredUser } from '../../../lib/auth';
import { ensureCsrfToken, resetCsrfToken } from '../../../lib/csrf';

type HeaderProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(
    () => readStoredUser()
  );
  const profileRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiFetch('/me', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          clearStoredUser();
          setUser(null);
          return;
        }
        const data = (await response.json()) as { user?: { full_name?: string; email?: string } };
        writeStoredUser(data.user || null);
        setUser(data.user || null);
      } catch {
        setUser(readStoredUser());
      }
    };
    void loadUser();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('lj-no-scroll', logoutOpen);
    return () => {
      document.body.classList.remove('lj-no-scroll');
    };
  }, [logoutOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (profileRef.current.contains(event.target as Node)) return;
      setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileOpen]);

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const confirmLogout = async () => {
    try {
      const csrfToken = await ensureCsrfToken(getApiBase());
      await apiFetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': csrfToken },
      });
    } finally {
      resetCsrfToken();
      clearStoredUser();
      setUser(null);
      window.location.href = '/admin/signin';
    }
  };

  const avatarLabel = user?.full_name?.trim()?.[0]?.toUpperCase() || 'U';

  return (
    <header className="lj-dashboard-header">
      <button
        className="lj-dashboard-menu"
        type="button"
        aria-label="Open menu"
        aria-pressed={isSidebarOpen}
        onClick={onToggleSidebar}
      >
        <span />
        <span />
        <span />
      </button>

      <div className="lj-dashboard-search">
        <input type="text" placeholder="Search" />
      </div>

      {user ? (
        <div className="lj-profile" ref={profileRef}>
          <button
            type="button"
            className="lj-profile-btn"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
          >
            {avatarLabel}
          </button>
          {profileOpen ? (
            <div className="lj-profile-pop">
              <div className="lj-profile-name">{user.full_name || 'Admin'}</div>
              <div className="lj-profile-email">{user.email || '-'}</div>
              <button type="button" className="lj-profile-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="lj-dashboard-avatar" aria-label="Profile" />
      )}

      {logoutOpen ? (
        <div className="lj-modal-backdrop" role="dialog" aria-modal="true">
          <div className="lj-modal">
            <div className="lj-modal-icon" aria-hidden="true">
              !
            </div>
            <div className="lj-modal-title">Konfirmasi Logout</div>
            <div className="lj-modal-text">
              Apakah kamu yakin ingin keluar dari akun ini?
            </div>
            <div className="lj-modal-actions">
              <button
                type="button"
                className="lj-modal-btn is-ghost"
                onClick={() => setLogoutOpen(false)}
              >
                Batal
              </button>
              <button type="button" className="lj-modal-btn" onClick={confirmLogout}>
                Ya, keluar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
