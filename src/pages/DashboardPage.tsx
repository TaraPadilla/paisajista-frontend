import { useEffect, useMemo, useState } from 'react'
import { PlantaService } from '../../services/api/PlantaService'
import type { Planta } from '../../services/api/PlantaService'
import { TerceroService } from '../../services/api/TerceroService'
import type { Plant } from '../types/plant'

interface DashboardPageProps {
  selectedPlant: Plant
  onSelectPlant: (plant: Plant) => void
}

const plantaService = new PlantaService()
const terceroService = new TerceroService()
const plantColors: Plant['color'][] = ['green', 'violet', 'wine', 'gold', 'blue']
const emptyValue = 'Sin definir'

const getCaracteristicaValue = (planta: Planta, codigo: string): string => {
  const match = planta.caracteristicas?.find((item) => item.caracteristica?.codigo === codigo)

  return match?.caracteristica_opcion?.nombre || match?.valor || emptyValue
}

const getPlantImageUrlByCode = (planta: Planta, code: 'cenital' | 'corte'): string | null => {
  return planta.imagenes?.find((imagen) => imagen.tipo_imagen?.codigo === code)?.url ?? null
}

const getPlantImageUrl = (planta: Planta): string | null => {
  if (planta.imagen_principal?.url) {
    return planta.imagen_principal.url
  }

  return getPlantImageUrlByCode(planta, 'corte') ?? getPlantImageUrlByCode(planta, 'cenital')
}

const toPlantView = (planta: Planta, index: number): Plant => ({
  id: planta.id,
  scientificName: planta.nombre_cientifico || 'Sin nombre cientifico',
  commonName: planta.nombre_comun,
  sunlight: getCaracteristicaValue(planta, 'exposicion_solar'),
  water: getCaracteristicaValue(planta, 'riego'),
  soil: getCaracteristicaValue(planta, 'tipo_suelo'),
  coldResistance: getCaracteristicaValue(planta, 'resistencia_frio'),
  plantType: getCaracteristicaValue(planta, 'tipo_planta'),
  foliageType: getCaracteristicaValue(planta, 'tipo_follaje'),
  maxHeight: getCaracteristicaValue(planta, 'altura_maxima'),
  canopyDiameter: getCaracteristicaValue(planta, 'diametro_copa'),
  landscapeStyle: getCaracteristicaValue(planta, 'estilo_paisajistico'),
  predominantColor: getCaracteristicaValue(planta, 'color_predominante'),
  floweringSeason: getCaracteristicaValue(planta, 'epoca_floracion'),
  imageUrl: getPlantImageUrl(planta),
  cenitalImageUrl: getPlantImageUrlByCode(planta, 'cenital'),
  corteImageUrl: getPlantImageUrlByCode(planta, 'corte'),
  style: planta.observaciones || emptyValue,
  type: planta.descripcion || emptyValue,
  bloom: emptyValue,
  height: emptyValue,
  canopy: emptyValue,
  providers: [],
  basePrice: emptyValue,
  color: plantColors[index % plantColors.length],
})

export function DashboardPage({ selectedPlant, onSelectPlant }: DashboardPageProps) {
  const [plants, setPlants] = useState<Plant[]>([])
  const [clientsCount, setClientsCount] = useState(0)
  const [providersCount, setProvidersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [plantasData, clientesData, proveedoresData] = await Promise.all([
          plantaService.getAll(),
          terceroService.getClientes(),
          terceroService.getProveedores(),
        ])

        setPlants(plantasData.map(toPlantView))
        setClientsCount(clientesData.length)
        setProvidersCount(proveedoresData.length)
      } catch (error) {
        setDashboardError(error instanceof Error ? error.message : 'No se pudo cargar el dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const plantsWithImages = plants.filter((plant) => plant.cenitalImageUrl || plant.corteImageUrl).length
  const recentPlants = plants.slice(0, 6)
  const stats = useMemo(
    () => [
      {
        label: 'Plantas activas',
        value: loading ? '...' : String(plants.length),
        detail: 'Registros en catalogo',
      },
      {
        label: 'Plantas con imagenes',
        value: loading ? '...' : String(plantsWithImages),
        detail: plants.length > 0 ? `${Math.round((plantsWithImages / plants.length) * 100)}% del catalogo` : 'Sin imagenes cargadas',
      },
      {
        label: 'Clientes',
        value: loading ? '...' : String(clientsCount),
        detail: 'Terceros tipo cliente',
      },
      {
        label: 'Proveedores',
        value: loading ? '...' : String(providersCount),
        detail: 'Terceros tipo proveedor',
      },
    ],
    [clientsCount, loading, plants.length, plantsWithImages, providersCount],
  )

  return (
    <div className="dashboard-grid">
      <section className="stats-row">
        {stats.map((stat) => (
          <article className="metric-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>

      <section className="panel plant-panel">
        <div className="panel-header">
          <div>
            <h2>Banco de plantas</h2>
            <p>Especies listas para revisar por ambiente, morfologia y criterio estetico.</p>
          </div>
          <span className="status-chip">{loading ? 'Cargando' : `${plants.length} especies`}</span>
        </div>
        <div className="plant-list">
          {dashboardError ? (
            <div className="form-error dashboard-error">{dashboardError}</div>
          ) : loading ? (
            <div className="empty-state">Cargando plantas...</div>
          ) : recentPlants.length === 0 ? (
            <div className="empty-state">No hay plantas registradas</div>
          ) : (
            recentPlants.map((plant) => (
              <button
                className={selectedPlant.id === plant.id ? 'plant-row selected' : 'plant-row'}
                key={plant.id}
                type="button"
                onClick={() => onSelectPlant(plant)}
              >
                {plant.imageUrl ? (
                  <img className="plant-thumb image-thumb" src={plant.imageUrl} alt={plant.commonName} />
                ) : (
                  <span className={`plant-thumb ${plant.color}`} />
                )}
                <span>
                  <strong>{plant.scientificName}</strong>
                  <small>{plant.commonName}</small>
                </span>
                <em>{plant.sunlight}</em>
                <em>{plant.water}</em>
                <b>{plant.corteImageUrl || plant.cenitalImageUrl ? 'Con imagen' : 'Sin imagen'}</b>
              </button>
            ))
          )}
        </div>
      </section>

      <section className="panel project-panel">
        <div className="panel-header">
          <div>
            <h2>Resumen operativo</h2>
            <p>Lectura rapida del contenido cargado en el sistema.</p>
          </div>
          <span className="status-chip">Activo</span>
        </div>
        <div className="budget-layout">
          <div>
            <span className="label">Cobertura de imagenes</span>
            <strong className="money">{plants.length > 0 ? `${Math.round((plantsWithImages / plants.length) * 100)}%` : '0%'}</strong>
            <p>Porcentaje de plantas que tienen al menos una vista cargada.</p>
          </div>
          <div className="donut">{plants.length > 0 ? `${Math.round((plantsWithImages / plants.length) * 100)}%` : '0%'}</div>
          <ul className="budget-list">
            <li><span>Plantas</span><b>{plants.length}</b></li>
            <li><span>Clientes</span><b>{clientsCount}</b></li>
            <li><span>Proveedores</span><b>{providersCount}</b></li>
          </ul>
        </div>
      </section>
    </div>
  )
}
