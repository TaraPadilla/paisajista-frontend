import type { Plant } from '../../types/plant'

interface PlantInspectorProps {
  plant: Plant
  isOpen: boolean
  onClose: () => void
}

const emptyValue = 'Sin definir'

const hasText = (value: string) => value.trim() !== '' && value !== emptyValue

const plantViews = (plant: Plant) => [
  {
    label: 'Vista en planta',
    url: plant.cenitalImageUrl,
  },
  {
    label: 'Vista en corte',
    url: plant.corteImageUrl,
  },
]

const inspectorGroups = (plant: Plant) => [
  {
    title: 'Requerimientos ambientales',
    items: [
      ['Exposicion', plant.sunlight],
      ['Riego', plant.water],
      ['Resistencia frio', plant.coldResistance],
      ['Tipo de suelo', plant.soil],
    ],
  },
  {
    title: 'Morfologia y dimensiones',
    items: [
      ['Tipo de planta', plant.plantType],
      ['Tipo de follaje', plant.foliageType],
      ['Altura maxima', plant.maxHeight],
      ['Diametro copa', plant.canopyDiameter],
    ],
  },
  {
    title: 'Criterios esteticos',
    items: [
      ['Estilo', plant.landscapeStyle],
      ['Color', plant.predominantColor],
      ['Floracion', plant.floweringSeason],
    ],
  },
]

export function PlantInspector({ plant, isOpen, onClose }: PlantInspectorProps) {
  if (!isOpen) {
    return null
  }

  const hasDescription = hasText(plant.type)
  const hasObservations = hasText(plant.style)
  const providers = plant.providers.length > 0 ? plant.providers.join(', ') : emptyValue
  const availableViews = plantViews(plant).filter((view) => view.url)

  return (
    <aside className="plant-inspector" aria-label="Ficha tecnica de planta">
      <div className="inspector-head">
        <div>
          <span className="eyebrow">Ficha botanica</span>
          <h2>{plant.commonName}</h2>
          <p>{plant.scientificName}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Cerrar ficha">x</button>
      </div>

      {plant.imageUrl ? (
        <img className="inspector-hero image-hero" src={plant.imageUrl} alt={plant.commonName} />
      ) : (
        <div className={`inspector-hero ${plant.color}`}>
          <span>{plant.commonName.slice(0, 1)}</span>
        </div>
      )}

      {inspectorGroups(plant).map((group) => (
        <section className="inspector-section" key={group.title}>
          <h3>{group.title}</h3>
          <dl className="technical-list compact">
            {group.items.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd className={value === emptyValue ? 'is-empty' : undefined}>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}

      <section className="inspector-section">
        <h3>Proveedor</h3>
        <dl className="technical-list compact">
          <div>
            <dt>Proveedor</dt>
            <dd className={providers === emptyValue ? 'is-empty' : undefined}>{providers}</dd>
          </div>
          <div>
            <dt>Precio</dt>
            <dd className={plant.basePrice === emptyValue ? 'is-empty' : undefined}>{plant.basePrice}</dd>
          </div>
        </dl>
      </section>

      {(hasDescription || hasObservations) && (
        <section className="inspector-section">
          <h3>Notas</h3>
          <div className="inspector-notes">
            {hasDescription && <p>{plant.type}</p>}
            {hasObservations && <p>{plant.style}</p>}
          </div>
        </section>
      )}

      {availableViews.length > 0 && (
        <section className="inspector-section">
          <h3>Vistas disponibles</h3>
          <div className="inspector-view-grid">
            {availableViews.map((view) => (
              <figure className="inspector-view-card" key={view.label}>
                <img src={view.url ?? ''} alt={`${view.label} de ${plant.commonName}`} />
                <figcaption>{view.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <div className="inspector-status">
        <span>Estado</span>
        <strong>Ficha activa</strong>
      </div>
    </aside>
  )
}
