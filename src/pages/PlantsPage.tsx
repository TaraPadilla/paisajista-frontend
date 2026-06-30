import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlantaService } from '../../services/api/PlantaService'
import type { Planta } from '../../services/api/PlantaService'
import { Icon } from '../components/Layout/Icon'
import type { Plant } from '../types/plant'

const plantaService = new PlantaService()

const plantColors: Plant['color'][] = ['green', 'violet', 'wine', 'gold', 'blue']
const emptyValue = 'Sin definir'

const getCaracteristicaValue = (planta: Planta, codigo: string): string => {
  const match = planta.caracteristicas?.find((item) => item.caracteristica?.codigo === codigo)

  return match?.caracteristica_opcion?.nombre || match?.valor || emptyValue
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
  imageUrl: planta.imagen_principal?.url ?? null,
  style: planta.observaciones || emptyValue,
  type: planta.descripcion || emptyValue,
  bloom: emptyValue,
  height: emptyValue,
  canopy: emptyValue,
  providers: [],
  basePrice: emptyValue,
  color: plantColors[index % plantColors.length],
})

interface PlantsPageProps {
  selectedPlant: Plant
  onSelectPlant: (plant: Plant) => void
}

const envCellClassName = (value: string) => (value === emptyValue ? 'plant-env-cell is-empty' : 'plant-env-cell')

export function PlantsPage({ selectedPlant, onSelectPlant }: PlantsPageProps) {
  const navigate = useNavigate()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingPlantId, setDeletingPlantId] = useState<number | null>(null)
  const initialSelectedPlantId = useRef(selectedPlant.id)
  const onSelectPlantRef = useRef(onSelectPlant)

  useEffect(() => {
    const loadPlants = async () => {
      try {
        const data = await plantaService.getAll()
        const nextPlants = data.map(toPlantView)
        setPlants(nextPlants)

        if (nextPlants.length > 0 && !nextPlants.some((plant) => plant.id === initialSelectedPlantId.current)) {
          onSelectPlantRef.current(nextPlants[0])
        }
      } catch (error) {
        console.error('Error loading plantas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPlants()
  }, [])

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
          <div className="empty-state">Cargando plantas...</div>
        ) : plants.length === 0 ? (
          <div className="empty-state">No hay plantas registradas</div>
        ) : (
          plants.map((plant) => (
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
