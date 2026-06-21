import type { Plant } from '../types/plant'

interface PlantInspectorProps {
  plant: Plant
  isOpen: boolean
  onClose: () => void
}

export function PlantInspector({ plant, isOpen, onClose }: PlantInspectorProps) {
  if (!isOpen) {
    return null
  }

  return (
    <aside className="plant-inspector" aria-label="Ficha técnica de planta">
      <div className="inspector-head">
        <div>
          <h2>{plant.scientificName}</h2>
          <p>{plant.commonName}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar ficha">×</button>
      </div>
      <div className={`inspector-hero ${plant.color}`} />
      <dl className="technical-list">
        <div><dt>Exposición solar</dt><dd>{plant.sunlight}</dd></div>
        <div><dt>Riego</dt><dd>{plant.water}</dd></div>
        <div><dt>Altura</dt><dd>{plant.height}</dd></div>
        <div><dt>Diámetro de copa</dt><dd>{plant.canopy}</dd></div>
        <div><dt>Proveedores</dt><dd>{plant.providers.join(', ')}</dd></div>
        <div><dt>Precio base</dt><dd>{plant.basePrice}</dd></div>
      </dl>
      <h3>Imágenes técnicas</h3>
      <div className="asset-grid">
        <div>
          <span>Vista en planta</span>
          <i className={`asset-top ${plant.color}`} />
        </div>
        <div>
          <span>Vista en corte</span>
          <i className={`asset-cut ${plant.color}`} />
        </div>
      </div>
    </aside>
  )
}
