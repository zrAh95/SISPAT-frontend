import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../components/Modal'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      setSuccess(true)
      window.setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
    } catch (requestError) {
      setSuccess(false)
      setError(requestError instanceof Error ? requestError.message : 'Login gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-canvas">
      <div className="login-brand">
        <h1>SISPAT</h1>
        <p>Sistem Informasi Ronda Khusus RT Empat</p>
      </div>

      <section className="login-card" aria-labelledby="login-title">
        <h2 id="login-title">Halo Warga !</h2>
        <p className="login-subtitle">Silakan isi form login terlebih dahulu</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-shell">
            <UserIcon />
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nama"
              autoComplete="username"
              required
            />
          </div>

          <div className="input-shell">
            <LockIcon />
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="submit-button" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <p className="login-help">Lupa Password? Hubungi developer atau admin RT.</p>

        <Modal
          isOpen={Boolean(error) || success}
          variant={success ? 'success' : 'error'}
          title={success ? 'Login berhasil' : 'Login gagal'}
          message={success ? 'Anda akan diarahkan ke dashboard.' : error}
          onClose={() => {
            setError('')
            if (success) navigate('/dashboard', { replace: true })
          }}
        />
      </section>

      <div className="login-rings" aria-hidden="true">
        <span className="ring ring-one" />
        <span className="ring ring-two" />
        <span className="ring ring-three" />
        <span className="ring ring-four" />
        <span className="ring ring-five" />
        <span className="ring ring-six" />
      </div>
    </main>
  )
}

function UserIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3-5 7-5s6.3 1.6 7 5" /></svg>
}

function LockIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
}
