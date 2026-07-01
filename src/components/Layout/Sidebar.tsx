import type { MenuItem, ViewId } from '../../types/navigation'
import { Icon } from './Icon'

interface SidebarProps {
  activeView: ViewId
  items: MenuItem[]
  title: string
  subtitle: string
  onChangeView: (view: ViewId) => void
  onClose: () => void
}

export function Sidebar({ activeView, items, title, subtitle, onChangeView, onClose }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Menu lateral">
      <div className="brand-card">
        <div>
          <strong>{title}</strong>
          <span>{subtitle}</span>
        </div>
        <button className="sidebar-close-button" type="button" onClick={onClose} aria-label="Cerrar menu lateral">
          x
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
    </aside>
  )
}
