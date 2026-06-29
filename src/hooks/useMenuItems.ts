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
    id: 'caracteristicas',
    label: 'Características',
    description: 'Campos dinámicos y opciones',
    icon: 'list',
  },
  {
    id: 'settings',
    label: 'Parámetros',
    description: 'Catálogos y campos dinámicos',
    icon: 'settings',
  },
]
