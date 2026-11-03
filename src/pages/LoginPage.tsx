import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { signIn } from '../../services/api/SessionService'
import { ThemeSwitch } from '../components/shared/ThemeSwitch'

export function LoginPage({ onLogin }: { onLogin: (user: { name: string }) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      onLogin(await signIn(String(fields.get('email')).trim(), String(fields.get('password'))))
    } catch (failure) {
      const status = isAxiosError(failure) ? failure.response?.status : undefined
      setError(status === 422 ? 'El correo o la contraseña son incorrectos.'
        : status === 429 ? 'Demasiados intentos. Espera un minuto y vuelve a intentar.'
        : 'No se pudo iniciar sesión. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-screen">
      <form className="panel login-form" onSubmit={submit}>
        <div className="login-brand">
          <img src="/logo.png" alt="El Paisajista" width="56" height="56" />
          <ThemeSwitch />
        </div>
        <h1>Iniciar sesión</h1>
        <label className="form-group">
          Correo electrónico
          <input name="email" type="email" autoComplete="username" required maxLength={255} />
        </label>
        <label className="form-group">
          Contraseña
          <input name="password" type="password" autoComplete="current-password" required maxLength={255} />
        </label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="primary-button" disabled={busy} type="submit">
          {busy ? 'Ingresando…' : 'Ingresar'}
        </button>
        {import.meta.env.DEV && (
          <aside aria-label="Cuenta de prueba">
            <small>
              Cuenta de prueba<br />
              Correo: <code>test@example.com</code><br />
              Contraseña: <code>password</code>
            </small>
          </aside>
        )}
      </form>
    </main>
  )
}
