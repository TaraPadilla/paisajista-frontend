import { useState, type FormEvent } from 'react'
import type { Tercero, TerceroPayload } from '../../../services/api/TerceroService'

interface ProviderFormModalProps {
  provider?: Tercero | null
  proveedorTipoId: number | null
  onClose: () => void
  onSubmit: (payload: TerceroPayload) => Promise<void>
}

export function ProviderFormModal({ provider, proveedorTipoId, onClose, onSubmit }: ProviderFormModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)

    setSubmitting(true)

    try {
      await onSubmit({
        tipo_tercero_id: proveedorTipoId,
        nombre: String(formData.get('nombre') ?? '').trim(),
        identificacion: String(formData.get('identificacion') ?? '').trim() || null,
        telefono: String(formData.get('telefono') ?? '').trim() || null,
        email: String(formData.get('email') ?? '').trim() || null,
        direccion: String(formData.get('direccion') ?? '').trim() || null,
        observaciones: String(formData.get('observaciones') ?? '').trim() || null,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content provider-modal">
        <div className="modal-header">
          <h3>{provider ? 'Editar proveedor' : 'Nuevo proveedor'}</h3>
          <button className="icon-button ghost" type="button" onClick={onClose} disabled={submitting}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Identificacion</label>
            <input name="identificacion" defaultValue={provider?.identificacion ?? ''} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" defaultValue={provider?.nombre ?? ''} required disabled={submitting} />
          </div>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>Telefono</label>
              <input name="telefono" defaultValue={provider?.telefono ?? ''} disabled={submitting} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" defaultValue={provider?.email ?? ''} disabled={submitting} />
            </div>
          </div>
          <div className="form-group">
            <label>Direccion</label>
            <textarea name="direccion" rows={2} defaultValue={provider?.direccion ?? ''} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea name="observaciones" rows={3} defaultValue={provider?.observaciones ?? ''} disabled={submitting} />
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={submitting || !proveedorTipoId}>
              {submitting ? 'Guardando...' : provider ? 'Actualizar proveedor' : 'Guardar proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
