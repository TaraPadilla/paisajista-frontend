import type { MenuItem, ViewId } from '../../types/navigation'
import { Icon } from './Icon'

interface SidebarProps {
  activeView: ViewId
  items: MenuItem[]
  onChangeView: (view: ViewId) => void
}

export function Sidebar({ activeView, items, onChangeView }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Menú lateral">
      <div className="brand-card">
        <div className="brand-mark">
          <Icon name="sprout" />
        </div>
        <div>
          <strong>El Paisajista</strong>
          <span>Biblioteca técnica y diseño</span>
        </div>
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
