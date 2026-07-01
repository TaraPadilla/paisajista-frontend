import { useEffect, useMemo, useState } from 'react'
import { TerceroService } from '../../../services/api/TerceroService'
import type { Tercero } from '../../../services/api/TerceroService'

const terceroService = new TerceroService()

interface ProviderSelectorModalProps {
  selectedProviderId?: number | null
  onClose: () => void
  onSelect: (provider: Tercero) => void
}

export function ProviderSelectorModal({ selectedProviderId, onClose, onSelect }: ProviderSelectorModalProps) {
  const [providers, setProviders] = useState<Tercero[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await terceroService.getProveedores()
        setProviders(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los proveedores.')
      } finally {
        setLoading(false)
      }
    }

    loadProviders()
  }, [])

  const filteredProviders = useMemo(() => {
    const search = searchValue.trim().toLowerCase()

    if (!search) {
      return providers
    }

    return providers.filter((provider) =>
      [
        provider.nombre,
        provider.codigo,
        provider.identificacion,
        provider.telefono,
        provider.email,
      ].some((value) => (value ?? '').toLowerCase().includes(search)),
    )
  }, [providers, searchValue])

  return (
    <div className="modal-overlay">
      <div className="modal-content provider-selector-modal">
        <div className="modal-header">
          <h3>Seleccionar proveedor</h3>
          <button className="icon-button ghost" type="button" onClick={onClose}>
            X
          </button>
        </div>
        <div className="provider-selector-body">
          <div className="panel-search">
            <input
              className="search-input"
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar proveedor..."
              type="text"
              value={searchValue}
            />
          </div>
          <div className="provider-selector-list">
            {error ? (
              <div className="form-error">{error}</div>
            ) : loading ? (
              <div className="empty-state inline-empty-state">Cargando proveedores...</div>
            ) : filteredProviders.length === 0 ? (
              <div className="empty-state inline-empty-state">No hay proveedores encontrados</div>
            ) : (
              filteredProviders.map((provider) => (
                <button
                  className={selectedProviderId === provider.id ? 'provider-selector-row selected' : 'provider-selector-row'}
                  key={provider.id}
                  onClick={() => onSelect(provider)}
                  type="button"
                >
                  <span>
                    <strong>{provider.nombre}</strong>
                    <small>{provider.codigo}</small>
                  </span>
                  <em>{provider.telefono || provider.email || 'Sin contacto'}</em>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
