import { useEffect, useState } from 'react'
import { CaracteristicaService } from '../../services/api/CaracteristicaService'
import { CatalogoService } from '../../services/api/CatalogoService'
import { SimpleModulePage } from './SimpleModulePage'

const catalogoService = new CatalogoService()
const caracteristicaService = new CaracteristicaService()

const settingsContent = {
  title: 'Parámetros y catálogos',
  description: 'Configuración de tipos, opciones y campos dinámicos para crecer por fases.',
}

export function SettingsPage() {
  const [catalogosCount, setCatalogosCount] = useState<number | null>(null)
  const [caracteristicasCount, setCaracteristicasCount] = useState<number | null>(null)

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [catalogos, caracteristicas] = await Promise.all([
          catalogoService.getAll(),
          caracteristicaService.getAll(),
        ])

        setCatalogosCount(catalogos.length)
        setCaracteristicasCount(caracteristicas.length)
      } catch (error) {
        console.error('Error loading settings counts:', error)
        setCatalogosCount(0)
        setCaracteristicasCount(0)
      }
    }

    loadCounts()
  }, [])

  return (
    <SimpleModulePage
      title={settingsContent.title}
      description={settingsContent.description}
      cards={[
        {
          title: 'Catálogos',
          body: 'Tipos de tercero, tipos de imagen, estilos, colores, estaciones y portes.',
          meta: catalogosCount === null ? 'Cargando valores...' : `${catalogosCount} valores`,
          route: '/catalogos',
        },
        {
          title: 'Características',
          body: 'Exposición solar, riego, heladas, suelo, altura, copa, floración y estilo.',
          meta: caracteristicasCount === null ? 'Cargando campos...' : `${caracteristicasCount} campos base`,
          route: '/caracteristicas',
        },
        {
          title: 'Parámetros generales',
          body: 'Unidades, moneda, reglas visuales, estados y porcentajes de contingencia.',
          meta: 'Preparado para crecer',
        },
      ]}
    />
  )
}
