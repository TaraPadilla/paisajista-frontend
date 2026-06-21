import type { MenuItem } from '../types/navigation'

export const useMenuItems = (): MenuItem[] => [
  {
    id: 'dashboard',
    label: 'Inicio',
    description: 'Resumen operativo del estudio',
    icon: 'home',
  },
  {
    id: 'plants',
    label: 'Plantas',
    description: 'Banco técnico de especies',
    icon: 'sprout',
  },
  {
    id: 'visual-catalog',
    label: 'Catálogo visual',
    description: 'Exploración por estilo y color',
    icon: 'gallery',
  },
  {
    id: 'clients',
    label: 'Clientes',
    description: 'Proyectos y contactos',
    icon: 'users',
  },
  {
    id: 'providers',
    label: 'Proveedores',
    description: 'Viveros, precios y stock',
    icon: 'briefcase',
  },
  {
    id: 'images',
    label: 'Imágenes',
    description: 'Vista en planta y corte',
    icon: 'image',
  },
  {
    id: 'settings',
    label: 'Parámetros',
    description: 'Catálogos y campos dinámicos',
    icon: 'settings',
  },
]
