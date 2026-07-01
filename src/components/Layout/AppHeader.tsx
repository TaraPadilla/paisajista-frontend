import { Icon } from './Icon'

interface AppHeaderProps {
  useSidebar: boolean
  onToggleNavigation: () => void
  searchValue: string
  onSearchChange: (value: string) => void
}

export function AppHeader({
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
          <span>GP</span>
          <div>
            <strong>Geronimo Parilla</strong>
            <small>Paisajista</small>
          </div>
        </div>
      </div>
    </header>
  )
}
