import { plants } from '../data/mockData'
import type { Plant } from '../types/plant'

interface PlantsPageProps {
  selectedPlant: Plant
  onSelectPlant: (plant: Plant) => void
}

export function PlantsPage({ selectedPlant, onSelectPlant }: PlantsPageProps) {
  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>Gestión de plantas</h2>
          <p>Vista administrativa tipo Airtable para mantener fichas técnicas completas.</p>
        </div>
        <div className="filter-row">
          <button type="button">Luz</button>
          <button type="button">Riego</button>
          <button type="button">Estilo</button>
          <button type="button">Porte</button>
        </div>
      </div>
      <div className="data-table">
        <div className="table-head">
          <span>Planta</span>
          <span>Luz</span>
          <span>Riego</span>
          <span>Estilo</span>
          <span>Altura</span>
          <span>Precio</span>
        </div>
        {plants.map((plant) => (
          <button
            className={selectedPlant.id === plant.id ? 'table-row selected' : 'table-row'}
            key={plant.id}
            type="button"
            onClick={() => onSelectPlant(plant)}
          >
            <span className="table-plant">
              <i className={`plant-thumb ${plant.color}`} />
              <span>
                <strong>{plant.scientificName}</strong>
                <small>{plant.commonName}</small>
              </span>
            </span>
            <span>{plant.sunlight}</span>
            <span>{plant.water}</span>
            <span>{plant.style}</span>
            <span>{plant.height}</span>
            <b>{plant.basePrice}</b>
          </button>
        ))}
      </div>
    </section>
  )
}
