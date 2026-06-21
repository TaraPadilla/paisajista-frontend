import { plants } from '../data/mockData'
import type { Plant } from '../types/plant'

interface VisualCatalogPageProps {
  onSelectPlant: (plant: Plant) => void
}

export function VisualCatalogPage({ onSelectPlant }: VisualCatalogPageProps) {
  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>Catálogo visual de especies</h2>
          <p>Exploración rápida para propuestas por estilo, color, textura y estación.</p>
        </div>
        <button className="secondary-button" type="button">Crear colección</button>
      </div>
      <div className="catalog-grid">
        {plants.map((plant) => (
          <button className="catalog-card" key={plant.id} type="button" onClick={() => onSelectPlant(plant)}>
            <span className={`catalog-art ${plant.color}`}>
              <i />
            </span>
            <strong>{plant.scientificName}</strong>
            <small>{plant.commonName}</small>
            <span className="chip-row">
              <em>{plant.style}</em>
              <em>{plant.water}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
