import { useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AppLayout } from './components/Layout/AppLayout'
import { PlantInspector } from './components/PlantInspector'
import { plants } from './data/mockData'
import { useMenuItems } from './hooks/useMenuItems'
import { CaracteristicasPage } from './pages/CaracteristicasPage'
import { DashboardPage } from './pages/DashboardPage'
import { PlantsPage } from './pages/PlantsPage'
import { SimpleModulePage } from './pages/SimpleModulePage'
import type { Plant } from './types/plant'
import type { ViewId } from './types/navigation'

type SimpleModuleView = 'clients' | 'providers' | 'images' | 'settings'

const moduleContent: Record<
  SimpleModuleView,
  {
    title: string
    description: string
    cards: Array<{ title: string; body: string; meta: string }>
  }
> = {
  clients: {
    title: 'Gestión de clientes',
    description: 'Perfiles claros para proyectos, contactos, presupuestos y estado de obra.',
    cards: [
      {
        title: 'Residencia Díaz',
        body: 'Proyecto en ejecución con presupuesto separado por diseño, materiales y mano de obra.',
        meta: 'En ejecución',
      },
      {
        title: 'Hotel Costa Verde',
        body: 'Necesita especies resistentes a viento, salinidad y bajo mantenimiento.',
        meta: 'Visita pendiente',
      },
      {
        title: 'Casa Los Álamos',
        body: 'Jardín contemporáneo con plantas estructurales, gramíneas y floración violeta.',
        meta: 'En diseño',
      },
    ],
  },
  providers: {
    title: 'Gestión de proveedores',
    description: 'Viveros, listas de precio, disponibilidad y especies asociadas.',
    cards: [
      {
        title: 'Vivero Andino',
        body: 'Especialista en formios, gramíneas y plantas rústicas para proyectos costeros.',
        meta: '142 especies',
      },
      {
        title: 'Plantas del Valle',
        body: 'Buen stock para herbáceas, cubresuelos y floración estacional.',
        meta: '98 especies',
      },
      {
        title: 'Vivero del Sur',
        body: 'Proveedor recomendado para nativas, praderas y paisajismo naturalista.',
        meta: '76 especies',
      },
    ],
  },
  images: {
    title: 'Administración de imágenes',
    description: 'Carga separada de PNG cenital y PNG de corte para cada especie.',
    cards: [
      {
        title: 'Vista en planta',
        body: 'Silueta cenital escaneada desde acuarela para ubicar especies sobre el plano 2D.',
        meta: '618 listas',
      },
      {
        title: 'Vista en corte',
        body: 'Alzado frontal para componer alturas, masas y niveles en cortes técnicos.',
        meta: '402 listas',
      },
      {
        title: 'Control de calidad',
        body: 'Estados sugeridos: pendiente de escaneo, necesita recorte, listo para plano.',
        meta: '14 pendientes',
      },
    ],
  },
  settings: {
    title: 'Parámetros y catálogos',
    description: 'Configuración de tipos, opciones y campos dinámicos para crecer por fases.',
    cards: [
      {
        title: 'Catálogos',
        body: 'Tipos de tercero, tipos de imagen, estilos, colores, estaciones y portes.',
        meta: '42 valores',
      },
      {
        title: 'Características',
        body: 'Exposición solar, riego, heladas, suelo, altura, copa, floración y estilo.',
        meta: '11 campos base',
      },
      {
        title: 'Parámetros generales',
        body: 'Unidades, moneda, reglas visuales, estados y porcentajes de contingencia.',
        meta: 'Preparado para crecer',
      },
    ],
  },
}

const titles: Record<ViewId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Inicio',
    subtitle: 'Vista diaria para plantas, proyectos, presupuestos e imágenes pendientes.',
  },
  plants: {
    title: 'Plantas',
    subtitle: 'Banco técnico de especies con filtros ambientales, morfológicos y estéticos.',
  },
  clients: {
    title: 'Clientes',
    subtitle: 'Relación comercial y contexto de proyectos de paisajismo.',
  },
  providers: {
    title: 'Proveedores',
    subtitle: 'Viveros, precios base y disponibilidad por especie.',
  },
  images: {
    title: 'Imágenes',
    subtitle: 'Gestión de vistas en planta y corte para diseño gráfico.',
  },
  settings: {
    title: 'Parámetros',
    subtitle: 'Catálogos y características dinámicas del sistema.',
  },
  caracteristicas: {
    title: 'Características',
    subtitle: 'Gestión de campos dinámicos y sus opciones de valor.',
  },
}

function AppContent() {
  const menuItems = useMenuItems()
  const [useSidebar, setUseSidebar] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const [selectedPlant, setSelectedPlant] = useState<Plant>(plants[1])
  const [isInspectorOpen, setIsInspectorOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname.replace('/', '') || 'dashboard'
  const activeView = currentPath as ViewId

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant)
    setIsInspectorOpen(true)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    const foundPlant = plants.find((plant) =>
      `${plant.scientificName} ${plant.commonName} ${plant.style}`.toLowerCase().includes(value.toLowerCase()),
    )

    if (foundPlant) {
      handleSelectPlant(foundPlant)
    }
  }

  const showInspector = ['dashboard', 'plants', 'images'].includes(activeView)

  return (
    <AppLayout
      activeView={activeView}
      title={titles[activeView].title}
      subtitle={titles[activeView].subtitle}
      menuItems={menuItems}
      useSidebar={useSidebar}
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      onChangeView={(view) => navigate(`/${view}`)}
      onToggleNavigation={() => setUseSidebar((current) => !current)}
    >
      <div className={showInspector && isInspectorOpen ? 'workspace with-inspector' : 'workspace'}>
        <Routes>
          <Route path="/" element={<DashboardPage selectedPlant={selectedPlant} onSelectPlant={handleSelectPlant} />} />
          <Route path="/dashboard" element={<DashboardPage selectedPlant={selectedPlant} onSelectPlant={handleSelectPlant} />} />
          <Route path="/plants" element={<PlantsPage selectedPlant={selectedPlant} onSelectPlant={handleSelectPlant} />} />
          <Route path="/clients" element={<SimpleModulePage title={moduleContent.clients.title} description={moduleContent.clients.description} cards={moduleContent.clients.cards} />} />
          <Route path="/providers" element={<SimpleModulePage title={moduleContent.providers.title} description={moduleContent.providers.description} cards={moduleContent.providers.cards} />} />
          <Route path="/images" element={<SimpleModulePage title={moduleContent.images.title} description={moduleContent.images.description} cards={moduleContent.images.cards} />} />
          <Route path="/caracteristicas" element={<CaracteristicasPage />} />
          <Route path="/settings" element={<SimpleModulePage title={moduleContent.settings.title} description={moduleContent.settings.description} cards={moduleContent.settings.cards} />} />
        </Routes>
        {showInspector && (
          <PlantInspector plant={selectedPlant} isOpen={isInspectorOpen} onClose={() => setIsInspectorOpen(false)} />
        )}
      </div>
    </AppLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
