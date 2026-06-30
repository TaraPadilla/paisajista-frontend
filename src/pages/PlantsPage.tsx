import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlantaService } from '../../services/api/PlantaService'
import type { Planta } from '../../services/api/PlantaService'
import { Icon } from '../components/Layout/Icon'
import type { Plant } from '../types/plant'

const plantaService = new PlantaService()

const plantColors: Plant['color'][] = ['green', 'violet', 'wine', 'gold', 'blue']

const toPlantView = (planta: Planta, index: number): Plant => ({
  id: planta.id,
  scientificName: planta.nombre_cientifico || 'Sin nombre científico',
  commonName: planta.nombre_comun,
  sunlight: 'Sin definir',
  water: 'Sin definir',
  style: planta.observaciones || 'Sin definir',
  type: planta.descripcion || 'Sin definir',
  bloom: 'Sin definir',
  height: 'Sin definir',
  canopy: 'Sin definir',
  providers: [],
  basePrice: 'Sin definir',
  color: plantColors[index % plantColors.length],
})

interface PlantsPageProps {
  selectedPlant: Plant
  onSelectPlant: (plant: Plant) => void
}

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
          <h2>Gestión de plantas</h2>
          <p>Vista administrativa tipo Airtable para mantener fichas técnicas completas.</p>
        </div>
        <div className="filter-row">
          <button className="primary-button plant-create-button" type="button" onClick={() => navigate('/plants/new')}>
            <Icon name="plus" />
            Nueva planta
          </button>
          <button type="button">Luz</button>
          <button type="button">Riego</button>
          <button type="button">Estilo</button>
          <button type="button">Porte</button>
        </div>
      </div>
      <div className="data-table plants-table">
        <div className="table-head">
          <span>Planta</span>
          <span>Luz</span>
          <span>Riego</span>
          <span>Estilo</span>
          <span>Altura</span>
          <span>Precio</span>
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
                <i className={`plant-thumb ${plant.color}`} />
                <span>
                  <strong>{plant.commonName}</strong>
                  <small>{plant.scientificName}</small>
                </span>
              </span>
              <span>{plant.sunlight}</span>
              <span>{plant.water}</span>
              <span>{plant.style}</span>
              <span>{plant.height}</span>
              <b>{plant.basePrice}</b>
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
