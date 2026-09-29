import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { getNavigation } from '../config/navigation'
import { useAuth } from '../hooks/useAuth'
import type { ReactNode as ReactNodeType } from 'react'

type AppShellProps = { children: ReactNodeType }

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const items = getNavigation(user?.peran || [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="sidebar-brand">
          <img className="sidebar-brand-mark" src="/icon.svg" alt="Logo SISPAT" />
          <div>
            <strong>SISPAT</strong>
            <span>RT Empat</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Menu utama">
          {items.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FontAwesomeIcon icon={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className="sidebar-logout" onClick={handleLogout} disabled={loggingOut}>
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
          <span>{loggingOut ? 'Keluar...' : 'Logout'}</span>
        </button>
      </aside>

      {sidebarOpen && <button type="button" className="sidebar-overlay" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)} />}

      <section className="app-main">
        <header className="app-header">
          <button type="button" className="menu-toggle" aria-label="Buka menu" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="header-search"><span>⌕</span><input placeholder="Search" aria-label="Search" /></div>
          <div className="header-user"><span>{user?.nama_pengguna}</span><small>{user?.peran[0]}</small></div>
        </header>
        <div className="app-content">{children}</div>
      </section>
    </div>
  )
}
