import { useEffect, useMemo, useState } from 'react'
import { CatalogoService } from '../../services/api/CatalogoService'
import type { Catalogo } from '../../services/api/CatalogoService'
import { TerceroService } from '../../services/api/TerceroService'
import type { Tercero, TerceroPayload } from '../../services/api/TerceroService'
import { Icon } from '../components/Layout/Icon'
import { ProviderFormModal } from '../components/proveedores/ProviderFormModal'
import { ProviderTable } from '../components/proveedores/ProviderTable'

const terceroService = new TerceroService()
const catalogoService = new CatalogoService()

interface ProvidersPageProps {
  searchValue: string
}

const matchesSearch = (provider: Tercero, searchValue: string) => {
  const search = searchValue.trim().toLowerCase()

  if (!search) return true

  return [
    provider.codigo,
    provider.nombre,
    provider.identificacion,
    provider.telefono,
    provider.email,
    provider.direccion,
    provider.observaciones,
  ].some((value) => (value ?? '').toLowerCase().includes(search))
}

export function ProvidersPage({ searchValue }: ProvidersPageProps) {
  const [providers, setProviders] = useState<Tercero[]>([])
  const [tiposTercero, setTiposTercero] = useState<Catalogo[]>([])
  const [loading, setLoading] = useState(true)
  const [configurationError, setConfigurationError] = useState<string | null>(null)
  const [editingProvider, setEditingProvider] = useState<Tercero | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingProviderId, setDeletingProviderId] = useState<number | null>(null)

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const [providersData, tiposData] = await Promise.all([
          terceroService.getProveedores(),
          catalogoService.getByGroup('tipos_tercero'),
        ])

        setProviders(providersData)
        setTiposTercero(tiposData)
      } catch (error) {
        setConfigurationError(error instanceof Error ? error.message : 'No se pudieron cargar los proveedores.')
      } finally {
        setLoading(false)
      }
    }

    loadProviders()
  }, [])

  const proveedorTipoId = useMemo(
    () => tiposTercero.find((tipo) => tipo.codigo === 'proveedor')?.id ?? null,
    [tiposTercero],
  )
  const filteredProviders = providers.filter(
    (provider) => provider.tipo_tercero?.codigo === 'proveedor' && matchesSearch(provider, searchValue),
  )

  const handleCreateProvider = () => {
    setEditingProvider(null)
    setIsFormOpen(true)
  }

  const handleSubmitProvider = async (payload: TerceroPayload) => {
    if (editingProvider) {
      const updatedProvider = await terceroService.update(editingProvider.id, payload)
      setProviders((current) => current.map((provider) => (provider.id === updatedProvider.id ? updatedProvider : provider)))
    } else {
      const createdProvider = await terceroService.create(payload)
      setProviders((current) => [createdProvider, ...current])
    }

    setIsFormOpen(false)
    setEditingProvider(null)
  }

  const handleDeleteProvider = async (provider: Tercero) => {
    if (deletingProviderId) return

    try {
      setDeletingProviderId(provider.id)
      await terceroService.remove(provider.id)
      setProviders((current) => current.filter((currentProvider) => currentProvider.id !== provider.id))
    } finally {
      setDeletingProviderId(null)
    }
  }

  return (
    <section className="panel full-panel">
      <div className="panel-header">
        <div>
          <h2>Gestion de proveedores</h2>
          <p>Directorio de viveros, aliados y contactos comerciales de suministro.</p>
        </div>
        <div className="filter-row">
          <button className="primary-button plant-create-button" type="button" onClick={handleCreateProvider} disabled={!proveedorTipoId}>
            <Icon name="plus" />
            Nuevo proveedor
          </button>
        </div>
      </div>

      {configurationError ? (
        <div className="form-error providers-page-error">{configurationError}</div>
      ) : (
        <div className="data-table providers-table">
          <div className="table-head provider-row">
            <span>Proveedor</span>
            <span>Identificacion</span>
            <span>Telefono</span>
            <span>Email</span>
            <span>Direccion</span>
            <span>Acciones</span>
          </div>
          <ProviderTable
            providers={filteredProviders}
            deletingProviderId={deletingProviderId}
            loading={loading}
            onEdit={(provider) => {
              setEditingProvider(provider)
              setIsFormOpen(true)
            }}
            onDelete={handleDeleteProvider}
          />
        </div>
      )}

      {isFormOpen && (
        <ProviderFormModal
          provider={editingProvider}
          proveedorTipoId={proveedorTipoId}
          onClose={() => {
            setIsFormOpen(false)
            setEditingProvider(null)
          }}
          onSubmit={handleSubmitProvider}
        />
      )}
    </section>
  )
}
