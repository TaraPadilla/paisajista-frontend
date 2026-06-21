export type ViewId =
  | 'dashboard'
  | 'plants'
  | 'clients'
  | 'providers'
  | 'images'
  | 'settings'

export interface MenuItem {
  id: ViewId
  label: string
  description: string
  icon: string
}
