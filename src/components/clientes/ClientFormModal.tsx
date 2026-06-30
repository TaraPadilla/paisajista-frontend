import { useState, type FormEvent } from 'react'
import type { Tercero, TerceroPayload } from '../../../services/api/TerceroService'

interface ClientFormModalProps {
  client?: Tercero | null
  clienteTipoId: number | null
  onClose: () => void
  onSubmit: (payload: TerceroPayload) => Promise<void>
}

export function ClientFormModal({ client, clienteTipoId, onClose, onSubmit }: ClientFormModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const formData = new FormData(event.currentTarget)

    setSubmitting(true)

    try {
      await onSubmit({
        tipo_tercero_id: clienteTipoId,
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
      <div className="modal-content client-modal">
        <div className="modal-header">
          <h3>{client ? 'Editar cliente' : 'Nuevo cliente'}</h3>
          <button className="icon-button ghost" type="button" onClick={onClose} disabled={submitting}>
            X
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Identificacion</label>
            <input name="identificacion" defaultValue={client?.identificacion ?? ''} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" defaultValue={client?.nombre ?? ''} required disabled={submitting} />
          </div>
          <div className="form-grid two-columns">
            <div className="form-group">
              <label>Telefono</label>
              <input name="telefono" defaultValue={client?.telefono ?? ''} disabled={submitting} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" defaultValue={client?.email ?? ''} disabled={submitting} />
            </div>
          </div>
          <div className="form-group">
            <label>Direccion</label>
            <textarea name="direccion" rows={2} defaultValue={client?.direccion ?? ''} disabled={submitting} />
          </div>
          <div className="form-group">
            <label>Observaciones</label>
            <textarea name="observaciones" rows={3} defaultValue={client?.observaciones ?? ''} disabled={submitting} />
          </div>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="primary-button" disabled={submitting || !clienteTipoId}>
              {submitting ? 'Guardando...' : client ? 'Actualizar cliente' : 'Guardar cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
