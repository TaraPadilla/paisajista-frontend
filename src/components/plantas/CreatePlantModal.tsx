import { useEffect, useState, type FormEvent } from 'react'
import { CaracteristicaService } from '../../../services/api/CaracteristicaService'
import type { Caracteristica } from '../../../services/api/CaracteristicaService'
import type { PlantaCaracteristicaPayload } from '../../../services/api/PlantaCaracteristicaService'
import type { PlantaPayload } from '../../../services/api/PlantaService'
import { getCaracteristicaFieldKind, groupCaracteristicasByTipo } from '../caracteristicas/caracteristicaField'

const caracteristicaService = new CaracteristicaService()

interface CreatePlantModalProps {
  initialValues?: PlantaPayload
  submitLabel?: string
  title?: string
  onClose: () => void
  onCreate: (planta: PlantaPayload, caracteristicas: Array<Omit<PlantaCaracteristicaPayload, 'planta_id'>>) => Promise<void>
}

export function CreatePlantModal({
  initialValues,
  submitLabel = 'Guardar',
  title = 'Nueva planta',
  onClose,
  onCreate,
}: CreatePlantModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([])
  const [loadingCaracteristicas, setLoadingCaracteristicas] = useState(true)
  const [configurationError, setConfigurationError] = useState<string | null>(null)

  useEffect(() => {
    const loadCaracteristicas = async () => {
      try {
        const data = await caracteristicaService.getAll()
        groupCaracteristicasByTipo(data)
        setCaracteristicas(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'No se pudieron cargar las características.'
        setConfigurationError(message)
      } finally {
        setLoadingCaracteristicas(false)
      }
    }

    loadCaracteristicas()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)
    setSubmitting(true)

    try {
      await onCreate(
        {
          nombre_comun: formData.get('nombre_comun') as string,
          nombre_cientifico: (formData.get('nombre_cientifico') as string) || null,
          descripcion: (formData.get('descripcion') as string) || null,
          observaciones: (formData.get('observaciones') as string) || null,
        },
        collectCaracteristicaValues(formData),
      )
    } finally {
      setSubmitting(false)
    }
  }

  const caracteristicaGroups = configurationError ? [] : groupCaracteristicasByTipo(caracteristicas)

  const collectCaracteristicaValues = (formData: FormData): Array<Omit<PlantaCaracteristicaPayload, 'planta_id'>> => {
    const values: Array<Omit<PlantaCaracteristicaPayload, 'planta_id'>> = []

    caracteristicas.forEach((caracteristica) => {
      const fieldKind = getCaracteristicaFieldKind(caracteristica)
      const fieldName = `caracteristica_${caracteristica.id}`

      if (fieldKind === 'checkbox') {
        formData.getAll(fieldName).forEach((value) => {
          values.push({
            caracteristica_id: caracteristica.id,
            caracteristica_opcion_id: Number(value),
            valor: null,
          })
        })
        return
      }

      const rawValue = formData.get(fieldName)

      if (!rawValue) {
        return
      }

      if (fieldKind === 'radio' || fieldKind === 'select') {
        values.push({
          caracteristica_id: caracteristica.id,
          caracteristica_opcion_id: Number(rawValue),
          valor: null,
        })
        return
      }

      values.push({
        caracteristica_id: caracteristica.id,
        caracteristica_opcion_id: null,
        valor: String(rawValue),
      })
    })

    return values
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-button ghost" type="button" onClick={onClose} disabled={submitting}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre común</label>
            <input name="nombre_comun" defaultValue={initialValues?.nombre_comun ?? ''} required />
          </div>
          <div className="form-group">
            <label>Nombre científico</label>
            <input name="nombre_cientifico" defaultValue={initialValues?.nombre_cientifico ?? ''} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea name="descripcion" rows={3} defaultValue={initialValues?.descripcion ?? ''} />
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea name="observaciones" rows={3} defaultValue={initialValues?.observaciones ?? ''} />
          </div>
          {loadingCaracteristicas ? (
            <div className="empty-state inline-empty-state">Cargando características...</div>
          ) : configurationError ? (
            <div className="form-error">{configurationError}</div>
          ) : (
            <div className="characteristic-form-sections">
              {caracteristicaGroups.map((group) => (
                <fieldset className="characteristic-section" key={group.tipoCodigo}>
                  <legend>{group.tipoNombre}</legend>
                  {group.caracteristicas.map((caracteristica) => {
                    const fieldKind = getCaracteristicaFieldKind(caracteristica)
                    const fieldName = `caracteristica_${caracteristica.id}`

                    if (fieldKind === 'checkbox') {
                      return (
                        <div className="form-group" key={caracteristica.id}>
                          <label>{caracteristica.nombre}</label>
                          <div className="option-grid">
                            {caracteristica.opciones?.map((opcion) => (
                              <label className="option-pill" key={opcion.id}>
                                <input name={fieldName} type="checkbox" value={opcion.id} disabled={submitting} />
                                {opcion.nombre}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    if (fieldKind === 'radio') {
                      return (
                        <div className="form-group" key={caracteristica.id}>
                          <label>{caracteristica.nombre}</label>
                          <div className="option-grid">
                            {caracteristica.opciones?.map((opcion) => (
                              <label className="option-pill" key={opcion.id}>
                                <input name={fieldName} type="radio" value={opcion.id} disabled={submitting} />
                                {opcion.nombre}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    }

                    if (fieldKind === 'select') {
                      return (
                        <div className="form-group" key={caracteristica.id}>
                          <label>{caracteristica.nombre}</label>
                          <select name={fieldName} disabled={submitting}>
                            <option value="">Seleccionar</option>
                            {caracteristica.opciones?.map((opcion) => (
                              <option key={opcion.id} value={opcion.id}>
                                {opcion.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    }

                    return (
                      <div className="form-group" key={caracteristica.id}>
                        <label>{caracteristica.nombre}</label>
                        <input
                          name={fieldName}
                          type={fieldKind === 'number' ? 'number' : 'text'}
                          step={fieldKind === 'number' && caracteristica.tipo_dato.codigo === 'decimal' ? '0.01' : undefined}
                          disabled={submitting}
                        />
                      </div>
                    )
                  })}
                </fieldset>
              ))}
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
