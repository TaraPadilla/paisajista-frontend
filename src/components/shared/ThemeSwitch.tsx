import { useEffect, useState } from 'react'

const systemTheme = '(prefers-color-scheme: dark)'

function isDark() {
  const theme = document.documentElement.dataset.theme
  return theme ? theme === 'dark' : window.matchMedia(systemTheme).matches
}

export function ThemeSwitch() {
  const [dark, setDark] = useState(isDark)

  useEffect(() => {
    const media = window.matchMedia(systemTheme)
    const sync = () => setDark(isDark())
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  function toggle() {
    const theme = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    setDark(!dark)
    try {
      localStorage.setItem('paisajista-theme', theme)
    } catch {
      // The theme remains active for this page.
    }
  }

  return (
    <button className="icon-button theme-switch" type="button" role="switch"
      aria-label="Modo oscuro" aria-checked={dark}
      title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} onClick={toggle}>
      <span aria-hidden="true">{dark ? '\u2600' : '\u263E'}</span>
    </button>
  )
}
