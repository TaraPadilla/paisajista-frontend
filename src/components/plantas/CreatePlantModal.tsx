import type { FormEvent } from 'react'
import type { PlantaPayload } from '../../../services/api/PlantaService'

interface CreatePlantModalProps {
  initialValues?: PlantaPayload
  submitLabel?: string
  title?: string
  onClose: () => void
  onCreate: (planta: PlantaPayload) => Promise<void>
}

export function CreatePlantModal({
  initialValues,
  submitLabel = 'Guardar',
  title = 'Nueva planta',
  onClose,
  onCreate,
}: CreatePlantModalProps) {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    await onCreate({
      nombre_comun: formData.get('nombre_comun') as string,
      nombre_cientifico: (formData.get('nombre_cientifico') as string) || null,
      descripcion: (formData.get('descripcion') as string) || null,
      observaciones: (formData.get('observaciones') as string) || null,
    })
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="icon-button ghost" type="button" onClick={onClose}>
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
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-button">
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
