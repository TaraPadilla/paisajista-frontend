import { useState, useEffect } from 'react'
import { CaracteristicaService } from '../../services/api/CaracteristicaService'
import type { Caracteristica } from '../../services/api/CaracteristicaService'
import { CaracteristicaOpcionService } from '../../services/api/CaracteristicaOpcionService'
import type { CaracteristicaOpcion } from '../../services/api/CaracteristicaOpcionService'

const caracteristicaService = new CaracteristicaService()
const caracteristicaOpcionService = new CaracteristicaOpcionService()

export function CaracteristicasPage() {
  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([])
  const [selectedCaracteristica, setSelectedCaracteristica] = useState<Caracteristica | null>(null)
  const [opciones, setOpciones] = useState<CaracteristicaOpcion[]>([])
  const [searchCaracteristica, setSearchCaracteristica] = useState('')
  const [searchOpcion, setSearchOpcion] = useState('')
  const [showCaracteristicaModal, setShowCaracteristicaModal] = useState(false)
  const [showOpcionModal, setShowOpcionModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar características al montar el componente
  useEffect(() => {
    const loadCaracteristicas = async () => {
      try {
        const data = await caracteristicaService.getAll()
        setCaracteristicas(data)
      } catch (error) {
        console.error('Error loading caracteristicas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCaracteristicas()
  }, [])

  const filteredCaracteristicas = (caracteristicas || []).filter(c =>
    c.nombre.toLowerCase().includes(searchCaracteristica.toLowerCase()) ||
    (c.codigo && c.codigo.toLowerCase().includes(searchCaracteristica.toLowerCase()))
  )

  const filteredOpciones = (opciones || []).filter(o =>
    o.nombre.toLowerCase().includes(searchOpcion.toLowerCase()) ||
    (o.codigo && o.codigo.toLowerCase().includes(searchOpcion.toLowerCase()))
  )

  const handleSelectCaracteristica = (caracteristica: Caracteristica) => {
    setSelectedCaracteristica(caracteristica)
    // Usar las opciones que ya vienen incluidas en la característica
    setOpciones(caracteristica.opciones || [])
  }

  const handleCreateCaracteristica = async (data: Partial<Caracteristica>) => {
    try {
      const newCaracteristica = await caracteristicaService.create(data as Omit<Caracteristica, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'tipo_dato' | 'tipo_campo'>)
      setCaracteristicas([...caracteristicas, newCaracteristica])
      setShowCaracteristicaModal(false)
    } catch (error) {
      console.error('Error creating caracteristica:', error)
    }
  }

  const handleCreateOpcion = async (data: Partial<CaracteristicaOpcion>) => {
    if (!selectedCaracteristica) return
    try {
      const newOpcion = await caracteristicaOpcionService.create({
        ...data,
        caracteristica_id: selectedCaracteristica.id
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
    }
  }

  const handleDeleteCaracteristica = async (id: number) => {
    try {
      await caracteristicaService.remove(id)
      setCaracteristicas(caracteristicas.filter(c => c.id !== id))
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
      const nextOpciones = opciones.filter(o => o.id !== id)
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
      {/* Panel Izquierdo - Lista de Características */}
      <section className="panel caracteristicas-panel">
        <div className="panel-header">
          <div>
            <h2>Características</h2>
            <p>Campos dinámicos para clasificar plantas.</p>
          </div>
          <button 
            className="primary-button" 
            type="button"
            onClick={() => setShowCaracteristicaModal(true)}
          >
            + Nueva Característica
          </button>
        </div>
        <div className="panel-search">
          <input
            type="text"
            placeholder="Buscar características..."
            value={searchCaracteristica}
            onChange={(e) => setSearchCaracteristica(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="caracteristicas-list">
          {loading ? (
            <div className="empty-state">Cargando características...</div>
          ) : filteredCaracteristicas.length === 0 ? (
            <div className="empty-state">No hay características encontradas</div>
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
                    <small>{caracteristica.codigo || 'Sin código'}</small>
                  </span>
                  <span className="caracteristica-count">
                    {(caracteristica.opciones || []).length} opciones
                  </span>
                </button>
                <button
                  className="danger-action"
                  type="button"
                  onClick={() => handleDeleteCaracteristica(caracteristica.id)}
                  title="Eliminar característica"
                >
                  Eliminar
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Panel Derecho - Opciones de la Característica Seleccionada */}
      <section className="panel opciones-panel">
        {selectedCaracteristica ? (
          <>
            <div className="panel-header">
              <div>
                <h2>Opciones: {selectedCaracteristica.nombre}</h2>
                <p>Valores disponibles para esta característica.</p>
              </div>
              <button 
                className="primary-button" 
                type="button"
                onClick={() => setShowOpcionModal(true)}
              >
                + Nueva Opción
              </button>
            </div>
            <div className="panel-search">
              <input
                type="text"
                placeholder="Buscar opciones..."
                value={searchOpcion}
                onChange={(e) => setSearchOpcion(e.target.value)}
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
                <span>Código</span>
                <span>Nombre</span>
                <span>Descripción</span>
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
                      className="icon-button ghost"
                      type="button"
                      onClick={() => {/* Edit logic */}}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="icon-button ghost"
                      type="button"
                      onClick={() => handleDeleteOpcion(opcion.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>Selecciona una característica para ver sus opciones</p>
          </div>
        )}
      </section>

      {/* Modal Nueva Característica */}
      {showCaracteristicaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nueva Característica</h3>
              <button 
                className="icon-button ghost"
                type="button"
                onClick={() => setShowCaracteristicaModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleCreateCaracteristica({
                nombre: formData.get('nombre') as string,
                codigo: formData.get('codigo') as string,
                permite_multiples: formData.get('permite_multiples') === 'true',
                orden: parseInt(formData.get('orden') as string) || 0,
              })
            }}>
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" required />
              </div>
              <div className="form-group">
                <label>Código</label>
                <input name="codigo" />
              </div>
              <div className="form-group">
                <label>Permite múltiples</label>
                <select name="permite_multiples">
                  <option value="false">No</option>
                  <option value="true">Sí</option>
                </select>
              </div>
              <div className="form-group">
                <label>Orden</label>
                <input name="orden" type="number" defaultValue="0" />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowCaracteristicaModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Opción */}
      {showOpcionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nueva Opción</h3>
              <button 
                className="icon-button ghost"
                type="button"
                onClick={() => setShowOpcionModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleCreateOpcion({
                codigo: formData.get('codigo') as string,
                nombre: formData.get('nombre') as string,
                descripcion: formData.get('descripcion') as string,
                orden: parseInt(formData.get('orden') as string) || 0,
              })
            }}>
              <div className="form-group">
                <label>Código</label>
                <input name="codigo" required />
              </div>
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" required />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input name="descripcion" />
              </div>
              <div className="form-group">
                <label>Orden</label>
                <input name="orden" type="number" defaultValue="0" />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowOpcionModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
