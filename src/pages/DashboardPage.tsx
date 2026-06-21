import { plants, stats } from '../data/mockData'
import type { Plant } from '../types/plant'

interface DashboardPageProps {
  selectedPlant: Plant
  onSelectPlant: (plant: Plant) => void
}

export function DashboardPage({ selectedPlant, onSelectPlant }: DashboardPageProps) {
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
            <p>Especies listas para filtrar por ambiente, morfología y criterio estético.</p>
          </div>
          <button className="secondary-button" type="button">Más filtros</button>
        </div>
        <div className="plant-list">
          {plants.map((plant) => (
            <button
              className={selectedPlant.id === plant.id ? 'plant-row selected' : 'plant-row'}
              key={plant.id}
              type="button"
              onClick={() => onSelectPlant(plant)}
            >
              <span className={`plant-thumb ${plant.color}`} />
              <span>
                <strong>{plant.scientificName}</strong>
                <small>{plant.commonName}</small>
              </span>
              <em>{plant.sunlight}</em>
              <em>{plant.water}</em>
              <b>{plant.basePrice}</b>
            </button>
          ))}
        </div>
      </section>

      <section className="panel project-panel">
        <div className="panel-header">
          <div>
            <h2>Proyecto activo</h2>
            <p>Jardín Residencial - Los Álamos</p>
          </div>
          <span className="status-chip">En diseño</span>
        </div>
        <div className="budget-layout">
          <div>
            <span className="label">Presupuesto estimado</span>
            <strong className="money">$ 1.245.800</strong>
            <p>Incluye diseño, plantas, materiales y mano de obra.</p>
          </div>
          <div className="donut">68%</div>
          <ul className="budget-list">
            <li><span>Plantas</span><b>$ 842.300</b></li>
            <li><span>Materiales</span><b>$ 213.500</b></li>
            <li><span>Mano de obra</span><b>$ 190.000</b></li>
          </ul>
        </div>
      </section>

      <section className="panel design-panel">
        <div className="panel-header">
          <div>
            <h2>Tablero de diseño</h2>
            <p>Mock visual para plano 2D, escala de copa y vista en corte.</p>
          </div>
          <span className="segmented"><b>2D</b><span>3D</span></span>
        </div>
        <div className="plan-board">
          <span className="pool" />
          <span className="house" />
          <span className="plan-plant violet" />
          <span className="plan-plant wine" />
          <span className="plan-plant green" />
          <span className="path" />
          <small>0 - 1.5 m</small>
        </div>
        <div className="elevation-strip">
          <span className="front-plant wine" />
          <span className="front-plant violet" />
          <span className="person-scale" />
          <span className="front-plant green large" />
        </div>
      </section>
    </div>
  )
}
