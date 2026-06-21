import type { MenuItem, ViewId } from '../../types/navigation'
import { Icon } from './Icon'

interface TopMenuProps {
  activeView: ViewId
  items: MenuItem[]
  onChangeView: (view: ViewId) => void
}

export function TopMenu({ activeView, items, onChangeView }: TopMenuProps) {
  return (
    <nav className="top-menu" aria-label="Menú superior">
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
  )
}
