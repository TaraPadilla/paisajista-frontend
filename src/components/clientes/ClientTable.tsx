import type { Tercero } from '../../../services/api/TerceroService'

interface ClientTableProps {
  clients: Tercero[]
  deletingClientId: number | null
  loading: boolean
  onEdit: (client: Tercero) => void
  onDelete: (client: Tercero) => void
}

const emptyValue = 'Sin definir'

export function ClientTable({ clients, deletingClientId, loading, onEdit, onDelete }: ClientTableProps) {
  if (loading) {
    return <div className="empty-state">Cargando clientes...</div>
  }

  if (clients.length === 0) {
    return <div className="empty-state">No hay clientes registrados</div>
  }

  return (
    <>
      {clients.map((client) => (
        <div className="table-row client-row" key={client.id}>
          <span className="client-main-cell">
            <strong>{client.nombre}</strong>
            <small>{client.codigo}</small>
          </span>
          <span>{client.identificacion || emptyValue}</span>
          <span>{client.telefono || emptyValue}</span>
          <span>{client.email || emptyValue}</span>
          <span>{client.direccion || emptyValue}</span>
          <div className="action-buttons">
            <button className="secondary-button table-action-button" type="button" onClick={() => onEdit(client)}>
              Editar
            </button>
            <button
              className="danger-action table-action-button"
              type="button"
              onClick={() => onDelete(client)}
              disabled={deletingClientId === client.id}
            >
              {deletingClientId === client.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      ))}
    </>
  )
}
