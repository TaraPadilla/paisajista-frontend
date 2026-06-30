import type { MenuItem, ViewId } from '../../types/navigation'
import { Icon } from './Icon'

interface SidebarProps {
  activeView: ViewId
  items: MenuItem[]
  onChangeView: (view: ViewId) => void
  onClose: () => void
}

export function Sidebar({ activeView, items, onChangeView, onClose }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Menú lateral">
      <div className="brand-card">
        <div className="brand-mark">
          <img src="/logo.png" alt="El Paisajista" />
        </div>
        <div>
          <strong>El Paisajista</strong>
          <span>Biblioteca técnica y diseño</span>
        </div>
        <button className="sidebar-close-button" type="button" onClick={onClose} aria-label="Cerrar menú lateral">
          ×
        </button>
      </div>

      <nav className="side-nav">
        {items.map((item) => (
          <button
            className={activeView === item.id ? 'active' : ''}
            key={item.id}
            type="button"
            onClick={() => onChangeView(item.id)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="workspace-card">
          <span>Workspace</span>
          <strong>Estudio Los Álamos</strong>
        </div>
      </div>
    </aside>
  )
}
