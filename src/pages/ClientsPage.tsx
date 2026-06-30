import { useEffect, useMemo, useState } from 'react'
import { CatalogoService } from '../../services/api/CatalogoService'
import type { Catalogo } from '../../services/api/CatalogoService'
import { TerceroService } from '../../services/api/TerceroService'
import type { Tercero, TerceroPayload } from '../../services/api/TerceroService'
import { ClientFormModal } from '../components/clientes/ClientFormModal'
import { ClientTable } from '../components/clientes/ClientTable'
import { Icon } from '../components/Layout/Icon'

const terceroService = new TerceroService()
const catalogoService = new CatalogoService()

interface ClientsPageProps {
  searchValue: string
}

const matchesSearch = (client: Tercero, searchValue: string) => {
  const search = searchValue.trim().toLowerCase()

  if (!search) return true

  return [
    client.codigo,
    client.nombre,
    client.identificacion,
    client.telefono,
    client.email,
    client.direccion,
    client.observaciones,
  ].some((value) => (value ?? '').toLowerCase().includes(search))
}

export function ClientsPage({ searchValue }: ClientsPageProps) {
  const [clients, setClients] = useState<Tercero[]>([])
  const [tiposTercero, setTiposTercero] = useState<Catalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [configurationError, setConfigurationError] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<Tercero | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null)

  useEffect(() => {
    const loadClients = async () => {
      try {
        const [clientsData, tiposData] = await Promise.all([
          terceroService.getClientes(),
          catalogoService.getByGroup('tipos_tercero'),
        ])

        setClients(clientsData)
        setTiposTercero(tiposData)
      } catch (error) {
        setConfigurationError(error instanceof Error ? error.message : 'No se pudieron cargar los clientes.')
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  const clienteTipoId = useMemo(
    () => tiposTercero.find((tipo) => tipo.codigo === 'cliente')?.id ?? null,
    [tiposTercero],
  )
  const filteredClients = clients.filter(
    (client) => client.tipo_tercero?.codigo === 'cliente' && matchesSearch(client, searchValue),
  )

  const handleCreateClient = () => {
    setEditingClient(null)
    setIsFormOpen(true)
  }

  const handleSubmitClient = async (payload: TerceroPayload) => {
    if (editingClient) {
      const updatedClient = await terceroService.update(editingClient.id, payload)
      setClients((current) => current.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
    } else {
      const createdClient = await terceroService.create(payload)
      setClients((current) => [createdClient, ...current])
    }

    setIsFormOpen(false)
    setEditingClient(null)
  }

  const handleDeleteClient = async (client: Tercero) => {
    if (deletingClientId) return

    try {
      setDeletingClientId(client.id)
      await terceroService.remove(client.id)
      setClients((current) => current.filter((currentClient) => currentClient.id !== client.id))
    } finally {
      setDeletingClientId(null)
    }
  }

  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>Gestion de clientes</h2>
          <p>Directorio comercial con contacto, identificacion y notas de proyecto.</p>
        </div>
        <div className="filter-row">
          <button className="primary-button plant-create-button" type="button" onClick={handleCreateClient} disabled={!clienteTipoId}>
            <Icon name="plus" />
            Nuevo cliente
          </button>
        </div>
      </div>

      {configurationError ? (
        <div className="form-error clients-page-error">{configurationError}</div>
      ) : (
        <div className="data-table clients-table">
          <div className="table-head client-row">
            <span>Cliente</span>
            <span>Identificacion</span>
            <span>Telefono</span>
            <span>Email</span>
            <span>Direccion</span>
            <span>Acciones</span>
          </div>
          <ClientTable
            clients={filteredClients}
            deletingClientId={deletingClientId}
            loading={loading}
            onEdit={(client) => {
              setEditingClient(client)
              setIsFormOpen(true)
            }}
            onDelete={handleDeleteClient}
          />
        </div>
      )}

      {isFormOpen && (
        <ClientFormModal
          client={editingClient}
          clienteTipoId={clienteTipoId}
          onClose={() => {
            setIsFormOpen(false)
            setEditingClient(null)
          }}
          onSubmit={handleSubmitClient}
        />
      )}
    </section>
  )
}
