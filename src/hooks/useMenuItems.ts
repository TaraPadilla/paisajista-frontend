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
    description: 'Banco tecnico de especies',
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
  // Implementar a futuro: modulo independiente para administrar imagenes de plantas.
  // {
  //   id: 'images',
  //   label: 'Imagenes',
  //   description: 'Vista en planta y corte',
  //   icon: 'image',
  // },
  {
    id: 'settings',
    label: 'Parametros',
    description: 'Catalogos y campos dinamicos',
    icon: 'settings',
  },
]
