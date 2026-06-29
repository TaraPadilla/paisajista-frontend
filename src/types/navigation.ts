export type ViewId =
  | 'dashboard'
  | 'plants'
  | 'clients'
  | 'providers'
  | 'images'
  | 'settings'
  | 'caracteristicas'

export interface MenuItem {
  id: ViewId
  label: string
  description: string
  icon: string
}
