import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { CatalogoService } from '../../services/api/CatalogoService'
import type { Catalogo } from '../../services/api/CatalogoService'
import { CaracteristicaService } from '../../services/api/CaracteristicaService'
import type { Caracteristica } from '../../services/api/CaracteristicaService'
import { CaracteristicaOpcionService } from '../../services/api/CaracteristicaOpcionService'
import type { CaracteristicaOpcion } from '../../services/api/CaracteristicaOpcionService'

const caracteristicaService = new CaracteristicaService()
const caracteristicaOpcionService = new CaracteristicaOpcionService()
const catalogoService = new CatalogoService()

type CaracteristicaPayload = Pick<
  Caracteristica,
  'nombre' | 'codigo' | 'tipo_caracteristica_id' | 'tipo_dato_id' | 'tipo_campo_id' | 'permite_multiples' | 'orden'
>

export function CaracteristicasPage() {
  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([])
  const [selectedCaracteristica, setSelectedCaracteristica] = useState<Caracteristica | null>(null)
  const [editingCaracteristica, setEditingCaracteristica] = useState<Caracteristica | null>(null)
  const [opciones, setOpciones] = useState<CaracteristicaOpcion[]>([])
  const [tipoCaracteristicas, setTipoCaracteristicas] = useState<Catalogo[]>([])
  const [tipoDatos, setTipoDatos] = useState<Catalogo[]>([])
  const [tipoCampos, setTipoCampos] = useState<Catalogo[]>([])
  const [searchCaracteristica, setSearchCaracteristica] = useState('')
  const [searchOpcion, setSearchOpcion] = useState('')
  const [showCaracteristicaModal, setShowCaracteristicaModal] = useState(false)
  const [showOpcionModal, setShowOpcionModal] = useState(false)
  const [submittingOpcion, setSubmittingOpcion] = useState(false)
  const [loading, setLoading] = useState(true)
  const [configurationError, setConfigurationError] = useState<string | null>(null)

  useEffect(() => {
    const loadCaracteristicas = async () => {
      try {
        const [caracteristicasData, tipoCaracteristicasData, tipoDatosData, tipoCamposData] = await Promise.all([
          caracteristicaService.getAll(),
          catalogoService.getByGroup('tipo_caracteristica'),
          catalogoService.getByGroup('tipo_dato'),
          catalogoService.getByGroup('tipo_campo'),
        ])

        setCaracteristicas(caracteristicasData)
        setTipoCaracteristicas(tipoCaracteristicasData)
        setTipoDatos(tipoDatosData)
        setTipoCampos(tipoCamposData)
      } catch (error) {
        setConfigurationError(error instanceof Error ? error.message : 'No se pudieron cargar las caracteristicas.')
      } finally {
        setLoading(false)
      }
    }

    loadCaracteristicas()
  }, [])

  const filteredCaracteristicas = useMemo(() => {
    const search = searchCaracteristica.trim().toLowerCase()

    return (caracteristicas || []).filter((caracteristica) => {
      if (!search) return true

      return [
        caracteristica.nombre,
        caracteristica.codigo,
        caracteristica.tipo_caracteristica?.nombre,
        caracteristica.tipo_dato?.nombre,
        caracteristica.tipo_campo?.nombre,
      ].some((value) => (value ?? '').toLowerCase().includes(search))
    })
  }, [caracteristicas, searchCaracteristica])

  const filteredOpciones = (opciones || []).filter((opcion) =>
    opcion.nombre.toLowerCase().includes(searchOpcion.toLowerCase())
    || (opcion.codigo && opcion.codigo.toLowerCase().includes(searchOpcion.toLowerCase())),
  )

  const handleSelectCaracteristica = (caracteristica: Caracteristica) => {
    setSelectedCaracteristica(caracteristica)
    setOpciones(caracteristica.opciones || [])
  }

  const handleOpenCreateCaracteristica = () => {
    setEditingCaracteristica(null)
    setShowCaracteristicaModal(true)
  }

  const handleOpenEditCaracteristica = (caracteristica: Caracteristica) => {
    setEditingCaracteristica(caracteristica)
    setShowCaracteristicaModal(true)
  }

  const upsertCaracteristicaState = (caracteristica: Caracteristica) => {
    setCaracteristicas((current) => {
      const exists = current.some((item) => item.id === caracteristica.id)

      return exists
        ? current.map((item) => (item.id === caracteristica.id ? caracteristica : item))
        : [...current, caracteristica]
    })

    if (selectedCaracteristica?.id === caracteristica.id) {
      setSelectedCaracteristica(caracteristica)
      setOpciones(caracteristica.opciones || [])
    }
  }

  const handleSubmitCaracteristica = async (payload: CaracteristicaPayload) => {
    try {
      const savedCaracteristica = editingCaracteristica
        ? await caracteristicaService.update(editingCaracteristica.id, payload)
        : await caracteristicaService.create(payload)

      upsertCaracteristicaState(savedCaracteristica)
      setShowCaracteristicaModal(false)
      setEditingCaracteristica(null)
    } catch (error) {
      console.error('Error saving caracteristica:', error)
    }
  }

  const handleCreateOpcion = async (data: Partial<CaracteristicaOpcion>) => {
    if (!selectedCaracteristica) return
    if (submittingOpcion) return

    try {
      setSubmittingOpcion(true)
      const newOpcion = await caracteristicaOpcionService.create({
        ...data,
        caracteristica_id: selectedCaracteristica.id,
      } as Omit<CaracteristicaOpcion, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'caracteristica'>)
      const nextOpciones = [...opciones, newOpcion]
      const nextSelectedCaracteristica = {
        ...selectedCaracteristica,
        opciones: nextOpciones,
      }

      setOpciones(nextOpciones)
      setSelectedCaracteristica(nextSelectedCaracteristica)
      setCaracteristicas((current) =>
        current.map((caracteristica) =>
          caracteristica.id === selectedCaracteristica.id ? nextSelectedCaracteristica : caracteristica,
        ),
      )
      setShowOpcionModal(false)
    } catch (error) {
      console.error('Error creating opcion:', error)
    } finally {
      setSubmittingOpcion(false)
    }
  }

  const handleDeleteCaracteristica = async (id: number) => {
    try {
      await caracteristicaService.remove(id)
      setCaracteristicas(caracteristicas.filter((caracteristica) => caracteristica.id !== id))

      if (selectedCaracteristica?.id === id) {
        setSelectedCaracteristica(null)
        setOpciones([])
      }
    } catch (error) {
      console.error('Error deleting caracteristica:', error)
    }
  }

  const handleDeleteOpcion = async (id: number) => {
    if (!selectedCaracteristica) return

    try {
      await caracteristicaOpcionService.remove(id)
      const nextOpciones = opciones.filter((opcion) => opcion.id !== id)
      const nextSelectedCaracteristica = {
        ...selectedCaracteristica,
        opciones: nextOpciones,
      }

      setOpciones(nextOpciones)
      setSelectedCaracteristica(nextSelectedCaracteristica)
      setCaracteristicas((current) =>
        current.map((caracteristica) =>
          caracteristica.id === selectedCaracteristica.id ? nextSelectedCaracteristica : caracteristica,
        ),
      )
    } catch (error) {
      console.error('Error deleting opcion:', error)
    }
  }

  return (
    <div className="caracteristicas-layout">
      <section className="panel caracteristicas-panel">
        <div className="panel-header">
          <div>
            <h2>Caracteristicas</h2>
            <p>Campos dinamicos para clasificar plantas.</p>
          </div>
          <button
            className="primary-button"
            type="button"
            onClick={handleOpenCreateCaracteristica}
          >
            + Nueva Caracteristica
          </button>
        </div>
        <div className="panel-search">
          <input
            type="text"
            placeholder="Buscar caracteristicas..."
            value={searchCaracteristica}
            onChange={(event) => setSearchCaracteristica(event.target.value)}
            className="search-input"
          />
        </div>
        <div className="caracteristicas-list">
          {configurationError ? (
            <div className="form-error caracteristicas-error">{configurationError}</div>
          ) : loading ? (
            <div className="empty-state">Cargando caracteristicas...</div>
          ) : filteredCaracteristicas.length === 0 ? (
            <div className="empty-state">No hay caracteristicas encontradas</div>
          ) : (
            filteredCaracteristicas.map((caracteristica) => (
              <div
                className={selectedCaracteristica?.id === caracteristica.id ? 'caracteristica-row selected' : 'caracteristica-row'}
                key={caracteristica.id}
              >
                <button
                  className="caracteristica-select"
                  type="button"
                  onClick={() => handleSelectCaracteristica(caracteristica)}
                >
                  <span className="caracteristica-info">
                    <strong>{caracteristica.nombre}</strong>
                    <small>{caracteristica.codigo || 'Sin codigo'}</small>
                    <em>{caracteristica.tipo_caracteristica?.nombre || 'Sin tipo'}</em>
                  </span>
                  <span className="caracteristica-count">
                    {(caracteristica.opciones || []).length} opciones
                  </span>
                </button>
                <div className="action-buttons">
                  <button
                    className="secondary-button table-action-button"
                    type="button"
                    onClick={() => handleOpenEditCaracteristica(caracteristica)}
                    title="Editar caracteristica"
                  >
                    Editar
                  </button>
                  <button
                    className="danger-action table-action-button"
                    type="button"
                    onClick={() => handleDeleteCaracteristica(caracteristica.id)}
                    title="Eliminar caracteristica"
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
        {selectedCaracteristica ? (
          <>
            <div className="panel-header">
              <div>
                <h2>Opciones: {selectedCaracteristica.nombre}</h2>
                <p>
                  {selectedCaracteristica.tipo_caracteristica?.nombre || 'Sin tipo'} · {selectedCaracteristica.tipo_campo?.nombre || 'Sin campo'}
                </p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => setShowOpcionModal(true)}
              >
                + Nueva Opcion
              </button>
            </div>
            <div className="panel-search">
              <input
                type="text"
                placeholder="Buscar opciones..."
                value={searchOpcion}
                onChange={(event) => setSearchOpcion(event.target.value)}
                className="search-input"
              />
            </div>
            <div className="opciones-summary">
              <span className="summary-item">
                <strong>{filteredOpciones.length}</strong> activos
              </span>
              <span className="summary-item">
                <strong>{opciones.length}</strong> total
              </span>
            </div>
            <div className="data-table">
              <div className="table-head">
                <span>Orden</span>
                <span>Codigo</span>
                <span>Nombre</span>
                <span>Descripcion</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>
              {filteredOpciones.map((opcion) => (
                <div className="table-row" key={opcion.id}>
                  <span>{opcion.orden}</span>
                  <span>{opcion.codigo}</span>
                  <span>{opcion.nombre}</span>
                  <span>{opcion.descripcion || '-'}</span>
                  <span className="status-chip">Activo</span>
                  <div className="action-buttons">
                    <button
                      className="danger-action table-action-button"
                      type="button"
                      onClick={() => handleDeleteOpcion(opcion.id)}
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Selecciona una caracteristica para ver sus opciones</p>
          </div>
        )}
      </section>

      {showCaracteristicaModal && (
        <CaracteristicaModal
          caracteristica={editingCaracteristica}
          tipoCaracteristicas={tipoCaracteristicas}
          tipoDatos={tipoDatos}
          tipoCampos={tipoCampos}
          onClose={() => {
            setShowCaracteristicaModal(false)
            setEditingCaracteristica(null)
          }}
          onSubmit={handleSubmitCaracteristica}
        />
      )}

      {showOpcionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nueva Opcion</h3>
              <button
                className="icon-button ghost"
                type="button"
                onClick={() => setShowOpcionModal(false)}
                disabled={submittingOpcion}
              >
                X
              </button>
            </div>
            <form onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              handleCreateOpcion({
                codigo: formData.get('codigo') as string,
                nombre: formData.get('nombre') as string,
                descripcion: formData.get('descripcion') as string,
                orden: parseInt(formData.get('orden') as string) || 0,
              })
            }}>
              <div className="form-group">
                <label>Codigo</label>
                <input name="codigo" required disabled={submittingOpcion} />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" required disabled={submittingOpcion} />
              </div>
              <div className="form-group">
                <label>Descripcion</label>
                <input name="descripcion" disabled={submittingOpcion} />
              </div>
              <div className="form-group">
                <label>Orden</label>
                <input name="orden" type="number" defaultValue="0" disabled={submittingOpcion} />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowOpcionModal(false)} disabled={submittingOpcion}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button" disabled={submittingOpcion}>
                  {submittingOpcion ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function CaracteristicaModal({
  caracteristica,
  tipoCaracteristicas,
  tipoDatos,
  tipoCampos,
  onClose,
  onSubmit,
}: {
  caracteristica: Caracteristica | null
  tipoCaracteristicas: Catalogo[]
  tipoDatos: Catalogo[]
  tipoCampos: Catalogo[]
  onClose: () => void
  onSubmit: (payload: CaracteristicaPayload) => Promise<void>
}) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)

    setSubmitting(true)

    try {
      await onSubmit({
        nombre: String(formData.get('nombre') ?? '').trim(),
        codigo: String(formData.get('codigo') ?? '').trim() || null,
        tipo_caracteristica_id: Number(formData.get('tipo_caracteristica_id')),
        tipo_dato_id: Number(formData.get('tipo_dato_id')),
        tipo_campo_id: Number(formData.get('tipo_campo_id')),
        permite_multiples: formData.get('permite_multiples') === 'true',
        orden: parseInt(String(formData.get('orden') ?? '0')) || 0,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content caracteristica-modal">
        <div className="modal-header">
          <h3>{caracteristica ? 'Editar Caracteristica' : 'Nueva Caracteristica'}</h3>
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
            <label>Nombre</label>
            <input name="nombre" defaultValue={caracteristica?.nombre ?? ''} required disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Codigo</label>
            <input name="codigo" defaultValue={caracteristica?.codigo ?? ''} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Tipo de caracteristica</label>
            <select name="tipo_caracteristica_id" defaultValue={caracteristica?.tipo_caracteristica_id ?? ''} required disabled={submitting}>
              <option value="">Seleccionar</option>
              {tipoCaracteristicas.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>Tipo de dato</label>
              <select name="tipo_dato_id" defaultValue={caracteristica?.tipo_dato_id ?? ''} required disabled={submitting}>
                <option value="">Seleccionar</option>
                {tipoDatos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de campo</label>
              <select name="tipo_campo_id" defaultValue={caracteristica?.tipo_campo_id ?? ''} required disabled={submitting}>
                <option value="">Seleccionar</option>
                {tipoCampos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>Permite multiples</label>
              <select name="permite_multiples" defaultValue={String(Boolean(caracteristica?.permite_multiples))} disabled={submitting}>
                <option value="false">No</option>
                <option value="true">Si</option>
              </select>
            </div>
            <div className="form-group">
              <label>Orden</label>
              <input name="orden" type="number" defaultValue={caracteristica?.orden ?? 0} disabled={submitting} />
            </div>
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
