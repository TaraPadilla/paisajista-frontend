import { Icon } from './Icon'

interface AppHeaderProps {
  title: string
  subtitle: string
  useSidebar: boolean
  onToggleNavigation: () => void
  searchValue: string
  onSearchChange: (value: string) => void
}

export function AppHeader({
  title,
  subtitle,
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
          <span className="eyebrow">Estudio activo</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
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
        <kbd>⌘ K</kbd>
      </label>

      <div className="header-actions">
        <button
          className="icon-button nav-toggle-button"
          type="button"
          onClick={onToggleNavigation}
          title={useSidebar ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
          aria-label={useSidebar ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
        >
          <Icon name="layout" />
        </button>
        <button className="icon-button ghost" type="button" title="Notificaciones">
          <Icon name="bell" />
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
