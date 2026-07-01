import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CatalogoService } from '../../services/api/CatalogoService'
import type { Catalogo, CatalogoPayload } from '../../services/api/CatalogoService'

const catalogoService = new CatalogoService()

interface CatalogoGroup {
  grupo: string
  items: Catalogo[]
}

interface GroupPayload {
  grupo: string
  codigo: string
  nombre: string
  descripcion: string | null
  orden: number
}

export function CatalogosPage() {
  const [catalogos, setCatalogos] = useState<Catalogo[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [editingCatalogo, setEditingCatalogo] = useState<Catalogo | null>(null)
  const [editingGroup, setEditingGroup] = useState<CatalogoGroup | null>(null)
  const [searchGroup, setSearchGroup] = useState('')
  const [searchCatalogo, setSearchCatalogo] = useState('')
  const [showCatalogoModal, setShowCatalogoModal] = useState(false)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [configurationError, setConfigurationError] = useState<string | null>(null)

  useEffect(() => {
    const loadCatalogos = async () => {
      try {
        const data = await catalogoService.getAll()

        setCatalogos(data)
        setSelectedGroup(data[0]?.grupo ?? null)
      } catch (error) {
        setConfigurationError(error instanceof Error ? error.message : 'No se pudieron cargar los catalogos.')
      } finally {
        setLoading(false)
      }
    }

    loadCatalogos()
  }, [])

  const groups = useMemo<CatalogoGroup[]>(() => {
    const groupedCatalogos = new Map<string, Catalogo[]>()

    catalogos.forEach((catalogo) => {
      const currentGroup = groupedCatalogos.get(catalogo.grupo) ?? []
      groupedCatalogos.set(catalogo.grupo, [...currentGroup, catalogo])
    })

    return Array.from(groupedCatalogos.entries())
      .map(([grupo, items]) => ({
        grupo,
        items: items.toSorted((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre)),
      }))
      .toSorted((a, b) => a.grupo.localeCompare(b.grupo))
  }, [catalogos])

  const filteredGroups = useMemo(() => {
    const search = searchGroup.trim().toLowerCase()

    return groups.filter((group) => {
      if (!search) return true

      return [group.grupo, formatGroupName(group.grupo)]
        .some((value) => value.toLowerCase().includes(search))
    })
  }, [groups, searchGroup])

  const selectedCatalogos = useMemo(() => {
    const search = searchCatalogo.trim().toLowerCase()
    const group = groups.find((item) => item.grupo === selectedGroup)

    return (group?.items ?? []).filter((catalogo) => {
      if (!search) return true

      return [catalogo.nombre, catalogo.codigo, catalogo.descripcion]
        .some((value) => (value ?? '').toLowerCase().includes(search))
    })
  }, [groups, searchCatalogo, selectedGroup])

  const selectedGroupData = groups.find((group) => group.grupo === selectedGroup) ?? null
  const selectedGroupTotal = selectedGroupData?.items.length ?? 0

  const handleOpenCreateGroup = () => {
    setEditingGroup(null)
    setShowGroupModal(true)
  }

  const handleOpenEditGroup = (group: CatalogoGroup) => {
    setEditingGroup(group)
    setShowGroupModal(true)
  }

  const handleOpenCreateCatalogo = () => {
    setEditingCatalogo(null)
    setShowCatalogoModal(true)
  }

  const handleOpenEditCatalogo = (catalogo: Catalogo) => {
    setEditingCatalogo(catalogo)
    setShowCatalogoModal(true)
  }

  const upsertCatalogoState = (catalogo: Catalogo) => {
    setCatalogos((current) => {
      const exists = current.some((item) => item.id === catalogo.id)

      return exists
        ? current.map((item) => (item.id === catalogo.id ? catalogo : item))
        : [...current, catalogo]
    })
    setSelectedGroup(catalogo.grupo)
  }

  const handleSubmitGroup = async (payload: GroupPayload) => {
    try {
      if (!editingGroup) {
        const savedCatalogo = await catalogoService.create(payload)

        upsertCatalogoState(savedCatalogo)
      } else {
        const updatedCatalogos = await Promise.all(
          editingGroup.items.map((catalogo) =>
            catalogoService.update(catalogo.id, {
              grupo: payload.grupo,
              codigo: catalogo.codigo,
              nombre: catalogo.nombre,
              descripcion: catalogo.descripcion,
              orden: catalogo.orden,
            }),
          ),
        )

        setCatalogos((current) =>
          current.map((catalogo) => updatedCatalogos.find((updated) => updated.id === catalogo.id) ?? catalogo),
        )
        setSelectedGroup(payload.grupo)
      }

      setShowGroupModal(false)
      setEditingGroup(null)
    } catch (error) {
      console.error('Error saving catalogo group:', error)
    }
  }

  const handleSubmitCatalogo = async (payload: CatalogoPayload) => {
    try {
      const savedCatalogo = editingCatalogo
        ? await catalogoService.update(editingCatalogo.id, payload)
        : await catalogoService.create(payload)

      upsertCatalogoState(savedCatalogo)
      setShowCatalogoModal(false)
      setEditingCatalogo(null)
    } catch (error) {
      console.error('Error saving catalogo:', error)
    }
  }

  const handleDeleteGroup = async (group: CatalogoGroup) => {
    try {
      await Promise.all(group.items.map((catalogo) => catalogoService.remove(catalogo.id)))
      setCatalogos((current) => current.filter((catalogo) => catalogo.grupo !== group.grupo))

      if (selectedGroup === group.grupo) {
        const nextGroup = groups.find((item) => item.grupo !== group.grupo)
        setSelectedGroup(nextGroup?.grupo ?? null)
      }
    } catch (error) {
      console.error('Error deleting catalogo group:', error)
    }
  }

  const handleDeleteCatalogo = async (id: number) => {
    try {
      await catalogoService.remove(id)
      setCatalogos((current) => current.filter((catalogo) => catalogo.id !== id))
    } catch (error) {
      console.error('Error deleting catalogo:', error)
    }
  }

  return (
    <div className="caracteristicas-layout catalogos-layout">
      <section className="panel caracteristicas-panel">
        <div className="panel-header">
          <div>
            <h2>Catalogos</h2>
            <p>Padres de valores reutilizables del sistema.</p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={handleOpenCreateGroup}
          >
            + Nuevo catalogo
          </button>
        </div>
        <div className="panel-search">
          <input
            type="text"
            placeholder="Buscar catalogos..."
            value={searchGroup}
            onChange={(event) => setSearchGroup(event.target.value)}
            className="search-input"
          />
        </div>
        <div className="caracteristicas-list">
          {configurationError ? (
            <div className="form-error caracteristicas-error">{configurationError}</div>
          ) : loading ? (
            <div className="empty-state">Cargando catalogos...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="empty-state">No hay catalogos encontrados</div>
          ) : (
            filteredGroups.map((group) => (
              <div
                className={selectedGroup === group.grupo ? 'caracteristica-row selected' : 'caracteristica-row'}
                key={group.grupo}
              >
                <button
                  className="caracteristica-select"
                  type="button"
                  onClick={() => setSelectedGroup(group.grupo)}
                >
                  <span className="caracteristica-info">
                    <strong>{formatGroupName(group.grupo)}</strong>
                    <small>{group.grupo}</small>
                  </span>
                  <span className="caracteristica-count">
                    {group.items.length} opciones
                  </span>
                </button>
                <div className="action-buttons">
                  <button
                    className="secondary-button table-action-button"
                    type="button"
                    onClick={() => handleOpenEditGroup(group)}
                    title="Editar catalogo"
                  >
                    Editar
                  </button>
                  <button
                    className="danger-action table-action-button"
                    type="button"
                    onClick={() => handleDeleteGroup(group)}
                    title="Eliminar catalogo"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="panel opciones-panel">
        {selectedGroup ? (
          <>
            <div className="panel-header">
              <div>
                <h2>Opciones: {formatGroupName(selectedGroup)}</h2>
                <p>Valores del catalogo {selectedGroup}.</p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={handleOpenCreateCatalogo}
              >
                + Nueva opcion
              </button>
            </div>
            <div className="panel-search">
              <input
                type="text"
                placeholder="Buscar opciones..."
                value={searchCatalogo}
                onChange={(event) => setSearchCatalogo(event.target.value)}
                className="search-input"
              />
            </div>
            <div className="opciones-summary">
              <span className="summary-item">
                <strong>{selectedCatalogos.length}</strong> visibles
              </span>
              <span className="summary-item">
                <strong>{selectedGroupTotal}</strong> total
              </span>
            </div>
            <div className="data-table catalogos-table">
              <div className="table-head">
                <span>Orden</span>
                <span>Codigo</span>
                <span>Nombre</span>
                <span>Descripcion</span>
                <span>Acciones</span>
              </div>
              {selectedCatalogos.length === 0 ? (
                <div className="empty-state">No hay opciones encontradas</div>
              ) : (
                selectedCatalogos.map((catalogo) => (
                  <div className="table-row" key={catalogo.id}>
                    <span>{catalogo.orden}</span>
                    <span>{catalogo.codigo}</span>
                    <span>{catalogo.nombre}</span>
                    <span>{catalogo.descripcion || '-'}</span>
                    <div className="action-buttons">
                      <button
                        className="secondary-button table-action-button"
                        type="button"
                        onClick={() => handleOpenEditCatalogo(catalogo)}
                        title="Editar opcion"
                      >
                        Editar
                      </button>
                      <button
                        className="danger-action table-action-button"
                        type="button"
                        onClick={() => handleDeleteCatalogo(catalogo.id)}
                        title="Eliminar opcion"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Selecciona un catalogo para ver sus opciones</p>
          </div>
        )}
      </section>

      {showGroupModal && (
        <CatalogoGroupModal
          group={editingGroup}
          onClose={() => {
            setShowGroupModal(false)
            setEditingGroup(null)
          }}
          onSubmit={handleSubmitGroup}
        />
      )}

      {showCatalogoModal && (
        <CatalogoModal
          catalogo={editingCatalogo}
          defaultGroup={selectedGroup ?? ''}
          onClose={() => {
            setShowCatalogoModal(false)
            setEditingCatalogo(null)
          }}
          onSubmit={handleSubmitCatalogo}
        />
      )}
    </div>
  )
}

function CatalogoGroupModal({
  group,
  onClose,
  onSubmit,
}: {
  group: CatalogoGroup | null
  onClose: () => void
  onSubmit: (payload: GroupPayload) => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)
  const firstItem = group?.items[0] ?? null
  const isEditing = Boolean(group)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)
    const grupo = String(formData.get('grupo') ?? '').trim()

    setSubmitting(true)

    try {
      await onSubmit({
        grupo,
        codigo: String(formData.get('codigo') ?? '').trim(),
        nombre: String(formData.get('nombre') ?? '').trim(),
        descripcion: String(formData.get('descripcion') ?? '').trim() || null,
        orden: parseInt(String(formData.get('orden') ?? '0')) || 0,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content catalogo-modal">
        <div className="modal-header">
          <h3>{isEditing ? 'Editar catalogo' : 'Nuevo catalogo'}</h3>
          <button
            className="icon-button ghost"
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Codigo del catalogo</label>
            <input name="grupo" defaultValue={group?.grupo ?? ''} required disabled={submitting} />
          </div>
          {!isEditing && (
            <>
              <div className="form-grid two-columns">
                <div className="form-group">
                  <label>Codigo primera opcion</label>
                  <input name="codigo" required disabled={submitting} />
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input name="orden" type="number" defaultValue="0" disabled={submitting} />
                </div>
              </div>
              <div className="form-group">
                <label>Nombre primera opcion</label>
                <input name="nombre" required disabled={submitting} />
              </div>
              <div className="form-group">
                <label>Descripcion</label>
                <textarea name="descripcion" disabled={submitting} />
              </div>
            </>
          )}
          {isEditing && (
            <>
              <input name="codigo" type="hidden" value={firstItem?.codigo ?? group?.grupo ?? ''} readOnly />
              <input name="nombre" type="hidden" value={firstItem?.nombre ?? formatGroupName(group?.grupo ?? '')} readOnly />
              <input name="descripcion" type="hidden" value={firstItem?.descripcion ?? ''} readOnly />
              <input name="orden" type="hidden" value={firstItem?.orden ?? 0} readOnly />
              <p className="modal-help">
                Este cambio renombra el padre y mantiene sus opciones.
              </p>
            </>
          )}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CatalogoModal({
  catalogo,
  defaultGroup,
  onClose,
  onSubmit,
}: {
  catalogo: Catalogo | null
  defaultGroup: string
  onClose: () => void
  onSubmit: (payload: CatalogoPayload) => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)

    setSubmitting(true)

    try {
      await onSubmit({
        grupo: String(formData.get('grupo') ?? '').trim(),
        codigo: String(formData.get('codigo') ?? '').trim(),
        nombre: String(formData.get('nombre') ?? '').trim(),
        descripcion: String(formData.get('descripcion') ?? '').trim() || null,
        orden: parseInt(String(formData.get('orden') ?? '0')) || 0,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content catalogo-modal">
        <div className="modal-header">
          <h3>{catalogo ? 'Editar opcion' : 'Nueva opcion'}</h3>
          <button
            className="icon-button ghost"
            type="button"
            onClick={onClose}
            disabled={submitting}
          >
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>Catalogo padre</label>
              <input name="grupo" defaultValue={catalogo?.grupo ?? defaultGroup} required disabled={submitting} />
            </div>
            <div className="form-group">
              <label>Codigo</label>
              <input name="codigo" defaultValue={catalogo?.codigo ?? ''} required disabled={submitting} />
            </div>
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" defaultValue={catalogo?.nombre ?? ''} required disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Descripcion</label>
            <textarea name="descripcion" defaultValue={catalogo?.descripcion ?? ''} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Orden</label>
            <input name="orden" type="number" defaultValue={catalogo?.orden ?? 0} disabled={submitting} />
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function formatGroupName(grupo: string) {
  return grupo
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
