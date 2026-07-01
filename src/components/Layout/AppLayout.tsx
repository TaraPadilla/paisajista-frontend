import type { ReactNode } from 'react'
import type { MenuItem, ViewId } from '../../types/navigation'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  activeView: ViewId
  title: string
  subtitle: string
  menuItems: MenuItem[]
  useSidebar: boolean
  searchValue: string
  onSearchChange: (value: string) => void
  onChangeView: (view: ViewId) => void
  onToggleNavigation: () => void
  children: ReactNode
}

export function AppLayout({
  activeView,
  title,
  subtitle,
  menuItems,
  useSidebar,
  searchValue,
  onSearchChange,
  onChangeView,
  onToggleNavigation,
  children,
}: AppLayoutProps) {
  return (
    <div className={useSidebar ? 'app-shell with-sidebar' : 'app-shell'}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        useSidebar={useSidebar}
        onToggleNavigation={onToggleNavigation}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

      <div className={useSidebar ? 'layout-body' : 'layout-body sidebar-closed'}>
        {!useSidebar && (
          <button
            className="sidebar-open-button"
            type="button"
            onClick={onToggleNavigation}
            aria-label="Abrir menú lateral"
            title="Abrir menú lateral"
          >
            ☰
          </button>
        )}
        {useSidebar && (
          <Sidebar
            activeView={activeView}
            items={menuItems}
            title={title}
            subtitle={subtitle}
            onChangeView={onChangeView}
            onClose={onToggleNavigation}
          />
        )}
        <main className="content-area">{children}</main>
      </div>
    </div>
  )
}
