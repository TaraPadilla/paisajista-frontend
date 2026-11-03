import { Icon } from './Icon'
import { ThemeSwitch } from '../shared/ThemeSwitch'

interface AppHeaderProps {
  userName: string
  onLogout: () => void
  loggingOut: boolean
  useSidebar: boolean
  onToggleNavigation: () => void
  searchValue: string
  onSearchChange: (value: string) => void
}

export function AppHeader({
  userName,
  onLogout,
  loggingOut,
  useSidebar,
  onToggleNavigation,
  searchValue,
  onSearchChange,
}: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="header-title">
        <img className="header-logo" src="/logo.png" alt="El Paisajista" />
        <div>
          <span className="eyebrow">Sistema</span>
          <h1>El Paisajista</h1>
          <p>Biblioteca tecnica y diseno de proyectos.</p>
        </div>
      </div>

      <label className="command-search">
        <Icon name="search" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar plantas, clientes, proveedores..."
          type="search"
        />
      </label>

      <div className="header-actions">
        <ThemeSwitch />
        <button
          className="icon-button nav-toggle-button"
          type="button"
          onClick={onToggleNavigation}
          title={useSidebar ? 'Ocultar menu lateral' : 'Mostrar menu lateral'}
          aria-label={useSidebar ? 'Ocultar menu lateral' : 'Mostrar menu lateral'}
        >
          <Icon name="layout" />
        </button>
        <div className="user-chip">
          <span>{userName.slice(0, 2).toUpperCase()}</span>
          <strong>{userName}</strong>
        </div>
        <button
          className="icon-button logout-button"
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          aria-busy={loggingOut}
          aria-label={loggingOut ? 'Cerrando sesión' : 'Cerrar sesión'}
          title={loggingOut ? 'Cerrando sesión' : 'Cerrar sesión'}
        >
          <Icon name="logout" />
        </button>
      </div>
    </header>
  )
}
