import type { Tercero } from '../../../services/api/TerceroService'

interface ProviderTableProps {
  providers: Tercero[]
  deletingProviderId: number | null
  loading: boolean
  onEdit: (provider: Tercero) => void
  onDelete: (provider: Tercero) => void
}

const emptyValue = 'Sin definir'

export function ProviderTable({ providers, deletingProviderId, loading, onEdit, onDelete }: ProviderTableProps) {
  if (loading) {
    return <div className="empty-state">Cargando proveedores...</div>
  }

  if (providers.length === 0) {
    return <div className="empty-state">No hay proveedores registrados</div>
  }

  return (
    <>
      {providers.map((provider) => (
        <div className="table-row provider-row" key={provider.id}>
          <span className="provider-main-cell">
            <strong>{provider.nombre}</strong>
            <small>{provider.codigo}</small>
          </span>
          <span>{provider.identificacion || emptyValue}</span>
          <span>{provider.telefono || emptyValue}</span>
          <span>{provider.email || emptyValue}</span>
          <span>{provider.direccion || emptyValue}</span>
          <div className="action-buttons">
            <button className="secondary-button table-action-button" type="button" onClick={() => onEdit(provider)}>
              Editar
            </button>
            <button
              className="danger-action table-action-button"
              type="button"
              onClick={() => onDelete(provider)}
              disabled={deletingProviderId === provider.id}
            >
              {deletingProviderId === provider.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      ))}
    </>
  )
}
