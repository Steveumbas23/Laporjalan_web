import { useEffect, useMemo, useRef, useState } from 'react'
import '../../../assets/style.css'
import { apiFetch, getApiBase } from '../../../lib/api'
import { clearStoredUser, readStoredUser, writeStoredUser } from '../../../lib/auth'
import { ensureCsrfToken } from '../../../lib/csrf'

const Header = () => {
  const [navOpen, setNavOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(() => readStoredUser())
  const profileRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current) return
      if (!profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiFetch('/me', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) {
          clearStoredUser()
          setUser(null)
          return
        }
        const data = (await response.json()) as { user?: { full_name?: string; email?: string } }
        writeStoredUser(data.user || null)
        setUser(data.user || null)
      } catch {
        setUser(readStoredUser())
      }
    }
    void loadUser()
  }, [])

  const initials = useMemo(() => {
    const source = user?.full_name || user?.email || ''
    if (!source) return ''
    const parts = source.trim().split(/\s+/).slice(0, 2)
    const letters = parts.map((part) => part[0]?.toUpperCase()).join('')
    return letters || source[0]?.toUpperCase() || ''
  }, [user])

  return (
    <header className="lj-header lj-header--landing">
      <div className="lj-container">
        <div className="lj-brand-text" aria-label="Lapor Jalan">
          <span className="lj-brand-outline">Lapor</span>
          <span className="lj-brand-strong">Jalan</span>
        </div>

        <nav
          id="lj-nav"
          className={`lj-nav${navOpen ? ' is-open' : ''}`}
          aria-label="Navigasi utama"
        >
          <a className="lj-link" href="/#beranda" onClick={() => setNavOpen(false)}>
            Beranda
          </a>
          <a className="lj-link" href="/#tentang" onClick={() => setNavOpen(false)}>
            Tentang
          </a>
          <a className="lj-link" href="/#fitur" onClick={() => setNavOpen(false)}>
            Fitur
          </a>
          <a className="lj-link" href="/map" onClick={() => setNavOpen(false)}>
            Map
          </a>
          {!user && (
            <a className="lj-btn" href="/signin" onClick={() => setNavOpen(false)}>
              Masuk
            </a>
          )}
        </nav>

        <button
          type="button"
          className={`lj-burger${navOpen ? ' is-open' : ''}`}
          aria-label="Buka menu"
          aria-expanded={navOpen}
          aria-controls="lj-nav"
          onClick={() => setNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        {user && (
          <div className="lj-profile" ref={profileRef}>
            <button
              type="button"
              className="lj-profile-btn"
              aria-label="Buka profil"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen((open) => !open)}
            >
              {initials || 'U'}
            </button>

            {profileOpen && (
              <div className="lj-profile-pop" role="dialog" aria-label="Menu profil">
                <div className="lj-profile-info">
                  <div className="lj-profile-name">{user.full_name || '-'}</div>
                  <div className="lj-profile-email">{user.email || '-'}</div>
                </div>
                <button
                  type="button"
                  className="lj-profile-logout"
                  onClick={async () => {
                    try {
                      const csrfToken = await ensureCsrfToken(getApiBase())
                      await apiFetch('/logout', {
                        method: 'POST',
                        credentials: 'include',
                        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': csrfToken },
                      })
                    } finally {
                      clearStoredUser()
                      setUser(null)
                      window.location.href = '/'
                    }
                  }}
                >
                  Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
