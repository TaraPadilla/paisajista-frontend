import type { ReactNode } from 'react'
import type { MenuItem, ViewId } from '../../types/navigation'
import { AppHeader } from './AppHeader'
import { Sidebar } from './Sidebar'
import { TopMenu } from './TopMenu'

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

      {useSidebar ? (
        <div className="layout-body">
          <Sidebar activeView={activeView} items={menuItems} onChangeView={onChangeView} />
          <main className="content-area">{children}</main>
        </div>
      ) : (
        <>
          <TopMenu activeView={activeView} items={menuItems} onChangeView={onChangeView} />
          <main className="content-area">{children}</main>
        </>
      )}
    </div>
  )
}
