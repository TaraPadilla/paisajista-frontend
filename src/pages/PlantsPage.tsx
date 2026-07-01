import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlantaService } from '../../services/api/PlantaService'
import type { Planta } from '../../services/api/PlantaService'
import { Icon } from '../components/Layout/Icon'
import { TableLoadingState } from '../components/shared/TableLoadingState'
import type { Plant } from '../types/plant'

const plantaService = new PlantaService()

const plantColors: Plant['color'][] = ['green', 'violet', 'wine', 'gold', 'blue']
const emptyValue = 'Sin definir'

const getCaracteristicaValue = (planta: Planta, codigo: string): string => {
  const values = planta.caracteristicas
    ?.filter((item) => item.caracteristica?.codigo === codigo)
    .map((item) => item.caracteristica_opcion?.nombre || item.valor)
    .filter((value): value is string => Boolean(value && value.trim()))

  return values && values.length > 0 ? values.join(', ') : emptyValue
}

const getPlantImageUrl = (planta: Planta): string | null => {
  if (planta.imagen_principal?.url) {
    return planta.imagen_principal.url
  }

  const imagenes = planta.imagenes ?? []
  const corte = imagenes.find((imagen) => imagen.tipo_imagen?.codigo === 'corte')
  const cenital = imagenes.find((imagen) => imagen.tipo_imagen?.codigo === 'cenital')

  return corte?.url ?? cenital?.url ?? null
}

const getPlantImageUrlByCode = (planta: Planta, code: 'cenital' | 'corte'): string | null => {
  return planta.imagenes?.find((imagen) => imagen.tipo_imagen?.codigo === code)?.url ?? null
}

const getPlantProviders = (planta: Planta): string[] => {
  return planta.proveedores
    ?.map((proveedor) => proveedor.tercero?.nombre)
    .filter((provider): provider is string => Boolean(provider)) ?? []
}

const getPlantBasePrice = (planta: Planta): string => {
  const precio = planta.proveedores?.[0]?.precio

  return typeof precio === 'number' ? precio.toLocaleString('es-CO') : emptyValue
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
  providers: getPlantProviders(planta),
  basePrice: getPlantBasePrice(planta),
  color: plantColors[index % plantColors.length],
})

interface PlantsPageProps {
  selectedPlant: Plant
  searchValue: string
  onSelectPlant: (plant: Plant) => void
}

const envCellClassName = (value: string) => (value === emptyValue ? 'plant-env-cell is-empty' : 'plant-env-cell')

const normalizeSearch = (value: string) => value.trim().toLowerCase()

const plantMatchesSearch = (plant: Plant, searchValue: string) => {
  const search = normalizeSearch(searchValue)

  if (!search) return true

  return [
    plant.commonName,
    plant.scientificName,
    plant.sunlight,
    plant.water,
    plant.soil,
    plant.coldResistance,
    plant.plantType,
    plant.foliageType,
    plant.landscapeStyle,
    plant.predominantColor,
    plant.floweringSeason,
  ].some((value) => value.toLowerCase().includes(search))
}

export function PlantsPage({ selectedPlant, searchValue, onSelectPlant }: PlantsPageProps) {
  const navigate = useNavigate()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingPlantId, setDeletingPlantId] = useState<number | null>(null)
  useEffect(() => {
    const loadPlants = async () => {
      try {
        const data = await plantaService.getAll()
        const nextPlants = data.map(toPlantView)
        setPlants(nextPlants)
      } catch (error) {
        console.error('Error loading plantas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlants()
  }, [])

  const filteredPlants = plants.filter((plant) => plantMatchesSearch(plant, searchValue))

  const handleDeletePlant = async (plantId: number) => {
    if (deletingPlantId) return

    try {
      setDeletingPlantId(plantId)
      await plantaService.remove(plantId)

      setPlants((current) => {
        const nextPlants = current.filter((plant) => plant.id !== plantId)

        if (selectedPlant.id === plantId && nextPlants.length > 0) {
          onSelectPlant(nextPlants[0])
        }

        return nextPlants
      })
    } catch (error) {
      console.error('Error deleting planta:', error)
    } finally {
      setDeletingPlantId(null)
    }
  }

  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>Gestion de plantas</h2>
          <p>Identidad botanica y lectura ambiental rapida de cada ficha.</p>
        </div>
        <div className="filter-row">
          <button className="primary-button plant-create-button" type="button" onClick={() => navigate('/plants/new')}>
            <Icon name="plus" />
            Nueva planta
          </button>
        </div>
      </div>
      <div className="data-table plants-table">
        <div className="table-head">
          <span>Planta</span>
          <span>Exposicion</span>
          <span>Riego</span>
          <span>Suelo</span>
          <span>Frio</span>
          <span>Acciones</span>
        </div>
        {loading ? (
          <TableLoadingState title="Cargando plantas" detail="Preparando el listado de especies..." />
        ) : filteredPlants.length === 0 ? (
          <div className="empty-state">No hay plantas registradas</div>
        ) : (
          filteredPlants.map((plant) => (
            <div
              className={selectedPlant.id === plant.id ? 'table-row selected' : 'table-row'}
              key={plant.id}
              onClick={() => onSelectPlant(plant)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  onSelectPlant(plant)
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span className="table-plant">
                {plant.imageUrl ? (
                  <img className="plant-thumb image-thumb" src={plant.imageUrl} alt={plant.commonName} />
                ) : (
                  <i className={`plant-thumb ${plant.color}`} />
                )}
                <span>
                  <strong>{plant.commonName}</strong>
                  <small>{plant.scientificName}</small>
                </span>
              </span>
              <span className={envCellClassName(plant.sunlight)}>{plant.sunlight}</span>
              <span className={envCellClassName(plant.water)}>{plant.water}</span>
              <span className={envCellClassName(plant.soil)}>{plant.soil}</span>
              <span className={envCellClassName(plant.coldResistance)}>{plant.coldResistance}</span>
              <div className="action-buttons" onClick={(event) => event.stopPropagation()}>
                <button className="secondary-button table-action-button" type="button" onClick={() => navigate(`/plants/${plant.id}/edit`)}>
                  Editar
                </button>
                <button
                  className="danger-action table-action-button"
                  type="button"
                  onClick={() => handleDeletePlant(plant.id)}
                  disabled={deletingPlantId === plant.id}
                >
                  {deletingPlantId === plant.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
