import { useEffect, useMemo, useState } from 'react'
import { DashboardService } from '../../services/api/DashboardService'
import type { Plant } from '../types/plant'

interface DashboardPageProps {
  selectedPlant: Plant
  searchValue: string
  onSelectPlant: (plant: Plant) => void
}

const dashboardService = new DashboardService()

export function DashboardPage({ selectedPlant: _selectedPlant, searchValue: _searchValue, onSelectPlant: _onSelectPlant }: DashboardPageProps) {
  const [plantsCount, setPlantsCount] = useState(0)
  const [plantsWithImages, setPlantsWithImages] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [providersCount, setProvidersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const resumen = await dashboardService.getResumen()

        setPlantsCount(resumen.counts.plantas)
        setPlantsWithImages(resumen.counts.plantas_con_imagenes)
        setClientsCount(resumen.counts.clientes)
        setProvidersCount(resumen.counts.proveedores)
      } catch (error) {
        setDashboardError(error instanceof Error ? error.message : 'No se pudo cargar el dashboard.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const imageCoverage = plantsCount > 0 ? Math.round((plantsWithImages / plantsCount) * 100) : 0

  const stats = useMemo(
    () => [
      {
        label: 'Plantas activas',
        value: loading ? '...' : String(plantsCount),
        detail: 'Registros en catalogo',
      },
      {
        label: 'Plantas con imagenes',
        value: loading ? '...' : String(plantsWithImages),
        detail: plantsCount > 0 ? `${imageCoverage}% del catalogo` : 'Sin imagenes cargadas',
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
    [clientsCount, imageCoverage, loading, plantsCount, plantsWithImages, providersCount],
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

      {dashboardError && (
        <section className="panel full-panel">
          <div className="form-error dashboard-error">{dashboardError}</div>
        </section>
      )}

      <section className="panel project-panel full-panel">
        <div className="panel-header">
          <div>
            <h2>Resumen operativo</h2>
            <p>Lectura rapida del contenido cargado en el sistema.</p>
          </div>
          <span className="status-chip">{loading ? 'Cargando' : 'Activo'}</span>
        </div>
        <div className="budget-layout">
          <div>
            <span className="label">Cobertura de imagenes</span>
            <strong className="money">{loading ? '...' : `${imageCoverage}%`}</strong>
            <p>Porcentaje de plantas que tienen al menos una vista cargada.</p>
          </div>
          <div className="donut">{loading ? '...' : `${imageCoverage}%`}</div>
          <ul className="budget-list">
            <li><span>Plantas</span><b>{plantsCount}</b></li>
            <li><span>Clientes</span><b>{clientsCount}</b></li>
            <li><span>Proveedores</span><b>{providersCount}</b></li>
          </ul>
        </div>
      </section>
    </div>
  )
}
