import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CaracteristicaService } from '../../services/api/CaracteristicaService'
import type { Caracteristica } from '../../services/api/CaracteristicaService'
import type { PlantaCaracteristicaPayload } from '../../services/api/PlantaCaracteristicaService'
import type { PlantaProveedor, PlantaProveedorPayload } from '../../services/api/PlantaProveedorService'
import { PlantaService } from '../../services/api/PlantaService'
import type { PlantaImagen, PlantaPayload } from '../../services/api/PlantaService'
import {
  getCaracteristicaFieldKind,
  groupCaracteristicasByTipo,
  type CaracteristicaGroup,
} from '../components/caracteristicas/caracteristicaField'
import { ProviderSelectorModal } from '../components/proveedores/ProviderSelectorModal'
import { TableLoadingState } from '../components/shared/TableLoadingState'

type EditorSection = 'identidad' | string
type FieldValue = string | string[]
type PlantImageCode = 'cenital' | 'corte'
type PlantImageFiles = Record<PlantImageCode, File | null>
type PlantImagePreviews = Record<PlantImageCode, string | null>
type PlantProviderValue = Omit<PlantaProveedorPayload, 'planta_id'> & {
  tercero?: PlantaProveedor['tercero'] | null
}

const plantaService = new PlantaService()
const caracteristicaService = new CaracteristicaService()

export function PlantEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const editingPlantId = id ? Number(id) : null
  const [activeSection, setActiveSection] = useState<EditorSection>('identidad')
  const [submitting, setSubmitting] = useState(false)
  const [loadingPlant, setLoadingPlant] = useState(Boolean(editingPlantId))
  const [loadingCaracteristicas, setLoadingCaracteristicas] = useState(true)
  const [configurationError, setConfigurationError] = useState<string | null>(null)
  const [caracteristicas, setCaracteristicas] = useState<Caracteristica[]>([])
  const [baseValues, setBaseValues] = useState<PlantaPayload>({
    nombre_comun: '',
    nombre_cientifico: null,
    descripcion: null,
    observaciones: null,
  })
  const [fieldValues, setFieldValues] = useState<Record<number, FieldValue>>({})
  const [providerValue, setProviderValue] = useState<PlantProviderValue | null>(null)
  const [showProviderSelector, setShowProviderSelector] = useState(false)
  const [imageFiles, setImageFiles] = useState<PlantImageFiles>({ cenital: null, corte: null })
  const [currentImages, setCurrentImages] = useState<PlantaImagen[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<PlantImagePreviews>({ cenital: null, corte: null })

  useEffect(() => {
    const loadCaracteristicas = async () => {
      try {
        const data = await caracteristicaService.getAll()
        groupCaracteristicasByTipo(data)
        setCaracteristicas(data)
      } catch (error) {
        setConfigurationError(error instanceof Error ? error.message : 'No se pudieron cargar las características.')
      } finally {
        setLoadingCaracteristicas(false)
      }
    }

    loadCaracteristicas()
  }, [])

  useEffect(() => {
    if (!editingPlantId) return
    if (caracteristicas.length === 0) return

    const loadPlant = async () => {
      try {
        const planta = await plantaService.getById(editingPlantId)
        setBaseValues({
          nombre_comun: planta.nombre_comun,
          nombre_cientifico: planta.nombre_cientifico,
          descripcion: planta.descripcion,
          observaciones: planta.observaciones,
        })
        setFieldValues(toFieldValues(planta.caracteristicas ?? [], caracteristicas))
        setProviderValue(toProviderValue(planta.proveedores?.[0] ?? null))
        setCurrentImages(planta.imagenes ?? [])
      } catch (error) {
        setConfigurationError(error instanceof Error ? error.message : 'No se pudo cargar la planta.')
      } finally {
        setLoadingPlant(false)
      }
    }

    loadPlant()
  }, [editingPlantId, caracteristicas])

  useEffect(() => {
    const nextPreviewUrls: PlantImagePreviews = {
      cenital: imageFiles.cenital ? URL.createObjectURL(imageFiles.cenital) : null,
      corte: imageFiles.corte ? URL.createObjectURL(imageFiles.corte) : null,
    }

    setImagePreviewUrls(nextPreviewUrls)

    return () => {
      Object.values(nextPreviewUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url)
      })
    }
  }, [imageFiles])

  const groups = useMemo<CaracteristicaGroup[]>(() => {
    if (configurationError) {
      return []
    }

    try {
      return groupCaracteristicasByTipo(caracteristicas)
    } catch {
      return []
    }
  }, [caracteristicas, configurationError])

  const activeGroup = groups.find((group) => group.tipoCodigo === activeSection)
  const completedSections = [
    Boolean(baseValues.nombre_comun.trim()),
    groups.some((group) => group.tipoCodigo === 'requerimientos_ambientales' && hasGroupValues(group, fieldValues)),
    groups.some((group) => group.tipoCodigo === 'morfologia_dimensiones' && hasGroupValues(group, fieldValues)),
    groups.some((group) => group.tipoCodigo === 'criterios_esteticos' && hasGroupValues(group, fieldValues)),
  ].filter(Boolean).length

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting || loadingCaracteristicas || loadingPlant || configurationError) return

    setSubmitting(true)

    try {
      const caracteristicaValues = collectCaracteristicaValues(caracteristicas, fieldValues)
      const payload = {
        ...normalizePlantaPayload(baseValues),
        caracteristicas: caracteristicaValues,
        proveedores: providerValue ? [normalizeProviderValue(providerValue)] : [],
      }
      const formData = buildPlantaFormData(payload, imageFiles)

      if (editingPlantId) {
        await plantaService.update(editingPlantId, formData)
      } else {
        await plantaService.create(formData)
      }

      navigate('/plants')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="plant-editor-page">
      <form className="plant-editor-shell" onSubmit={handleSubmit}>
        <header className="plant-editor-header">
          <div>
            <span>{editingPlantId ? 'Editar ficha técnica' : 'Nueva ficha técnica'}</span>
            <h2>{editingPlantId ? 'Editar planta' : 'Nueva planta'}</h2>
          </div>
          <div className="plant-editor-actions">
            <button className="secondary-button" type="button" onClick={() => navigate('/plants')} disabled={submitting}>
              Cancelar
            </button>
            <button className="primary-button" type="submit" disabled={submitting || loadingCaracteristicas || loadingPlant || Boolean(configurationError)}>
              {submitting ? 'Guardando...' : editingPlantId ? 'Actualizar planta' : 'Guardar planta'}
            </button>
          </div>
        </header>

        <div className="plant-editor-body">
          <aside className="plant-editor-nav">
            <button
              className={activeSection === 'identidad' ? 'active' : ''}
              type="button"
              onClick={() => setActiveSection('identidad')}
            >
              <strong>Identidad</strong>
              <span>Datos base</span>
            </button>
            {groups.map((group) => (
              <button
                className={activeSection === group.tipoCodigo ? 'active' : ''}
                key={group.tipoCodigo}
                type="button"
                onClick={() => setActiveSection(group.tipoCodigo)}
              >
                <strong>{group.tipoNombre}</strong>
                <span>{group.caracteristicas.length} campos</span>
              </button>
            ))}
          </aside>

          <main className="plant-editor-panel">
            {loadingPlant ? (
              <TableLoadingState title="Cargando planta" detail="Preparando la ficha tecnica..." />
            ) : activeSection === 'identidad' ? (
              <IdentitySection
                baseValues={baseValues}
                currentImages={currentImages}
                imageFiles={imageFiles}
                imagePreviewUrls={imagePreviewUrls}
                onChange={setBaseValues}
                onImageChange={setImageFiles}
                onOpenProviderSelector={() => setShowProviderSelector(true)}
                onProviderChange={setProviderValue}
                providerValue={providerValue}
                submitting={submitting}
              />
            ) : loadingCaracteristicas ? (
              <div className="empty-state inline-empty-state">Cargando características...</div>
            ) : configurationError ? (
              <div className="form-error">{configurationError}</div>
            ) : activeGroup ? (
              <CharacteristicSection
                group={activeGroup}
                values={fieldValues}
                submitting={submitting}
                onChange={setFieldValues}
              />
            ) : (
              <div className="form-error">Sección de características no encontrada.</div>
            )}
          </main>

          <aside className="plant-editor-preview">
            <span>Vista previa</span>
            <h3>{baseValues.nombre_comun || 'Nombre común'}</h3>
            <p>{baseValues.nombre_cientifico || 'Nombre científico'}</p>
            {imagePreviewUrls.corte || getImageByCode(currentImages, 'corte')?.url ? (
              <img
                className="plant-preview-swatch image-preview-swatch"
                src={imagePreviewUrls.corte || getImageByCode(currentImages, 'corte')?.url || ''}
                alt={baseValues.nombre_comun || 'Vista en corte'}
              />
            ) : (
              <div className="plant-preview-swatch" />
            )}
            <div className="plant-editor-progress">
              <div>
                <strong>{completedSections}/4</strong>
                <small>secciones iniciadas</small>
              </div>
              <progress max={4} value={completedSections} />
            </div>
            <ul>
              <li className={baseValues.nombre_comun.trim() ? 'done' : ''}>Identidad</li>
              {groups.map((group) => (
                <li className={hasGroupValues(group, fieldValues) ? 'done' : ''} key={group.tipoCodigo}>
                  {group.tipoNombre}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </form>
      {showProviderSelector && (
        <ProviderSelectorModal
          selectedProviderId={providerValue?.tercero_id ?? null}
          onClose={() => setShowProviderSelector(false)}
          onSelect={(provider) => {
            setProviderValue((current) => ({
              tercero_id: provider.id,
              tercero: {
                id: provider.id,
                codigo: provider.codigo,
                nombre: provider.nombre,
              },
              precio: current?.precio ?? 0,
              observaciones: current?.observaciones ?? null,
            }))
            setShowProviderSelector(false)
          }}
        />
      )}
    </section>
  )
}

function IdentitySection({
  baseValues,
  currentImages,
  imageFiles,
  imagePreviewUrls,
  onChange,
  onImageChange,
  onOpenProviderSelector,
  onProviderChange,
  providerValue,
  submitting,
}: {
  baseValues: PlantaPayload
  currentImages: PlantaImagen[]
  imageFiles: PlantImageFiles
  imagePreviewUrls: PlantImagePreviews
  onChange: (values: PlantaPayload) => void
  onImageChange: (values: PlantImageFiles) => void
  onOpenProviderSelector: () => void
  onProviderChange: (value: PlantProviderValue | null) => void
  providerValue: PlantProviderValue | null
  submitting: boolean
}) {
  return (
    <>
      <div className="plant-editor-section-title">
        <span>Identidad</span>
        <h3>Datos esenciales de la planta</h3>
      </div>
      <div className="form-grid two-columns">
        <div className="form-group">
          <label>Nombre común</label>
          <input
            value={baseValues.nombre_comun}
            onChange={(event) => onChange({ ...baseValues, nombre_comun: event.target.value })}
            disabled={submitting}
            required
          />
        </div>
        <div className="form-group">
          <label>Nombre científico</label>
          <input
            value={baseValues.nombre_cientifico ?? ''}
            onChange={(event) => onChange({ ...baseValues, nombre_cientifico: event.target.value || null })}
            disabled={submitting}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Descripción</label>
        <textarea
          value={baseValues.descripcion ?? ''}
          onChange={(event) => onChange({ ...baseValues, descripcion: event.target.value || null })}
          disabled={submitting}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label>Observaciones</label>
        <textarea
          value={baseValues.observaciones ?? ''}
          onChange={(event) => onChange({ ...baseValues, observaciones: event.target.value || null })}
          disabled={submitting}
          rows={3}
        />
      </div>
      <div className="plant-editor-section-title compact-title">
        <span>Proveedor</span>
        <h3>Proveedor asociado</h3>
      </div>
      <div className="plant-provider-field">
        <div className="plant-provider-summary">
          {providerValue?.tercero ? (
            <>
              <strong>{providerValue.tercero.nombre}</strong>
              <small>{providerValue.tercero.codigo}</small>
            </>
          ) : (
            <>
              <strong>Sin proveedor seleccionado</strong>
              <small>Busca y selecciona un proveedor registrado</small>
            </>
          )}
        </div>
        <div className="plant-provider-actions">
          <button className="secondary-button" type="button" onClick={onOpenProviderSelector} disabled={submitting}>
            Buscar proveedor
          </button>
          {providerValue && (
            <button className="danger-action" type="button" onClick={() => onProviderChange(null)} disabled={submitting}>
              Quitar
            </button>
          )}
        </div>
      </div>
      {providerValue && (
        <div className="form-grid two-columns">
          <div className="form-group">
            <label>Precio proveedor</label>
            <input
              disabled={submitting}
              min="0"
              onChange={(event) => onProviderChange({ ...providerValue, precio: Number(event.target.value) || 0 })}
              step="0.01"
              type="number"
              value={providerValue.precio}
            />
          </div>
          <div className="form-group">
            <label>Observaciones proveedor</label>
            <input
              disabled={submitting}
              onChange={(event) => onProviderChange({ ...providerValue, observaciones: event.target.value || null })}
              value={providerValue.observaciones ?? ''}
            />
          </div>
        </div>
      )}
      <div className="plant-editor-section-title compact-title">
        <span>Imagenes</span>
        <h3>Vistas de la planta</h3>
      </div>
      <div className="plant-image-uploader-grid">
        <PlantImageInput
          code="cenital"
          currentImage={getImageByCode(currentImages, 'cenital')}
          file={imageFiles.cenital}
          label="Vista en planta"
          previewUrl={imagePreviewUrls.cenital}
          submitting={submitting}
          onChange={(file) => onImageChange({ ...imageFiles, cenital: file })}
        />
        <PlantImageInput
          code="corte"
          currentImage={getImageByCode(currentImages, 'corte')}
          file={imageFiles.corte}
          label="Vista en corte"
          previewUrl={imagePreviewUrls.corte}
          submitting={submitting}
          onChange={(file) => onImageChange({ ...imageFiles, corte: file })}
        />
      </div>
    </>
  )
}

function PlantImageInput({
  code,
  currentImage,
  file,
  label,
  previewUrl,
  submitting,
  onChange,
}: {
  code: PlantImageCode
  currentImage: PlantaImagen | undefined
  file: File | null
  label: string
  previewUrl: string | null
  submitting: boolean
  onChange: (file: File | null) => void
}) {
  const imageUrl = previewUrl || currentImage?.url || null

  return (
    <div className="plant-image-uploader">
      <div>
        <strong>{label}</strong>
        <small>{code === 'corte' ? 'Imagen principal en vistas' : 'Imagen complementaria'}</small>
      </div>
      {imageUrl ? (
        <img src={imageUrl} alt={label} />
      ) : (
        <span className="plant-image-placeholder">Sin imagen</span>
      )}
      <label className="secondary-button plant-file-button">
        Seleccionar
        <input
          accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
          disabled={submitting}
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>
      <small>{file?.name || currentImage?.nombre_original || 'PNG, JPG o WEBP hasta 5 MB'}</small>
    </div>
  )
}

function CharacteristicSection({
  group,
  values,
  submitting,
  onChange,
}: {
  group: CaracteristicaGroup
  values: Record<number, FieldValue>
  submitting: boolean
  onChange: (values: Record<number, FieldValue>) => void
}) {
  return (
    <>
      <div className="plant-editor-section-title">
        <span>{group.tipoNombre}</span>
        <h3>Características de la ficha técnica</h3>
      </div>
      <div className="plant-characteristic-list">
        {group.caracteristicas.map((caracteristica) => (
          <div className="plant-characteristic-row" key={caracteristica.id}>
            <div>
              <strong>{caracteristica.nombre}</strong>
              <small>{caracteristica.tipo_campo.nombre}</small>
            </div>
            <CharacteristicControl
              caracteristica={caracteristica}
              value={values[caracteristica.id]}
              submitting={submitting}
              onChange={(value) => onChange({ ...values, [caracteristica.id]: value })}
            />
          </div>
        ))}
      </div>
    </>
  )
}

function CharacteristicControl({
  caracteristica,
  value,
  submitting,
  onChange,
}: {
  caracteristica: Caracteristica
  value: FieldValue | undefined
  submitting: boolean
  onChange: (value: FieldValue) => void
}) {
  const fieldKind = getCaracteristicaFieldKind(caracteristica)

  if (fieldKind === 'checkbox') {
    const selectedValues = Array.isArray(value) ? value : []

    return (
      <div className="option-grid">
        {caracteristica.opciones?.map((opcion) => (
          <label className="option-pill" key={opcion.id}>
            <input
              checked={selectedValues.includes(String(opcion.id))}
              disabled={submitting}
              onChange={(event) => {
                const optionValue = String(opcion.id)
                onChange(
                  event.target.checked
                    ? [...selectedValues, optionValue]
                    : selectedValues.filter((currentValue) => currentValue !== optionValue),
                )
              }}
              type="checkbox"
            />
            {opcion.nombre}
          </label>
        ))}
      </div>
    )
  }

  if (fieldKind === 'radio') {
    return (
      <div className="option-grid">
        {caracteristica.opciones?.map((opcion) => (
          <label className="option-pill" key={opcion.id}>
            <input
              checked={value === String(opcion.id)}
              disabled={submitting}
              name={`caracteristica_${caracteristica.id}`}
              onChange={() => onChange(String(opcion.id))}
              type="radio"
            />
            {opcion.nombre}
          </label>
        ))}
      </div>
    )
  }

  if (fieldKind === 'select') {
    return (
      <select value={typeof value === 'string' ? value : ''} onChange={(event) => onChange(event.target.value)} disabled={submitting}>
        <option value="">Seleccionar</option>
        {caracteristica.opciones?.map((opcion) => (
          <option key={opcion.id} value={opcion.id}>
            {opcion.nombre}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={submitting}
      step={fieldKind === 'number' && caracteristica.tipo_dato.codigo === 'decimal' ? '0.01' : undefined}
      type={fieldKind === 'number' ? 'number' : 'text'}
    />
  )
}

function hasGroupValues(group: CaracteristicaGroup, values: Record<number, FieldValue>): boolean {
  return group.caracteristicas.some((caracteristica) => {
    const value = values[caracteristica.id]
    return Array.isArray(value) ? value.length > 0 : Boolean(value)
  })
}

function normalizePlantaPayload(values: PlantaPayload): PlantaPayload {
  return {
    nombre_comun: values.nombre_comun.trim(),
    nombre_cientifico: values.nombre_cientifico?.trim() || null,
    descripcion: values.descripcion?.trim() || null,
    observaciones: values.observaciones?.trim() || null,
  }
}

function buildPlantaFormData(
  payload: PlantaPayload & {
    caracteristicas: Array<Omit<PlantaCaracteristicaPayload, 'planta_id'>>
    proveedores: Array<Omit<PlantaProveedorPayload, 'planta_id'>>
  },
  imageFiles: PlantImageFiles,
): FormData {
  const formData = new FormData()

  formData.append('nombre_comun', payload.nombre_comun)
  formData.append('nombre_cientifico', payload.nombre_cientifico ?? '')
  formData.append('descripcion', payload.descripcion ?? '')
  formData.append('observaciones', payload.observaciones ?? '')

  payload.caracteristicas.forEach((caracteristica, index) => {
    formData.append(`caracteristicas[${index}][caracteristica_id]`, String(caracteristica.caracteristica_id))

    if (caracteristica.caracteristica_opcion_id) {
      formData.append(`caracteristicas[${index}][caracteristica_opcion_id]`, String(caracteristica.caracteristica_opcion_id))
    }

    if (caracteristica.valor) {
      formData.append(`caracteristicas[${index}][valor]`, caracteristica.valor)
    }
  })

  formData.append('proveedores_present', '1')
  payload.proveedores.forEach((proveedor, index) => {
    formData.append(`proveedores[${index}][tercero_id]`, String(proveedor.tercero_id))
    formData.append(`proveedores[${index}][precio]`, String(proveedor.precio))

    if (proveedor.observaciones) {
      formData.append(`proveedores[${index}][observaciones]`, proveedor.observaciones)
    }
  })

  if (imageFiles.cenital) {
    formData.append('imagen_cenital', imageFiles.cenital)
  }

  if (imageFiles.corte) {
    formData.append('imagen_corte', imageFiles.corte)
  }

  return formData
}

function normalizeProviderValue(value: PlantProviderValue): Omit<PlantaProveedorPayload, 'planta_id'> {
  return {
    tercero_id: value.tercero_id,
    precio: value.precio,
    observaciones: value.observaciones?.trim() || null,
  }
}

function toProviderValue(provider: PlantaProveedor | null): PlantProviderValue | null {
  if (!provider) {
    return null
  }

  return {
    tercero_id: provider.tercero_id,
    tercero: provider.tercero,
    precio: provider.precio,
    observaciones: provider.observaciones,
  }
}

function getImageByCode(images: PlantaImagen[], code: PlantImageCode): PlantaImagen | undefined {
  return images.find((image) => image.tipo_imagen?.codigo === code)
}

function collectCaracteristicaValues(
  caracteristicas: Caracteristica[],
  values: Record<number, FieldValue>,
): Array<Omit<PlantaCaracteristicaPayload, 'planta_id'>> {
  const payload: Array<Omit<PlantaCaracteristicaPayload, 'planta_id'>> = []

  caracteristicas.forEach((caracteristica) => {
    const fieldKind = getCaracteristicaFieldKind(caracteristica)
    const value = values[caracteristica.id]

    if (!value || (Array.isArray(value) && value.length === 0)) return

    if (fieldKind === 'checkbox') {
      ;(value as string[]).forEach((optionId) => {
        payload.push({
          caracteristica_id: caracteristica.id,
          caracteristica_opcion_id: Number(optionId),
          valor: null,
        })
      })
      return
    }

    if (fieldKind === 'radio' || fieldKind === 'select') {
      payload.push({
        caracteristica_id: caracteristica.id,
        caracteristica_opcion_id: Number(value),
        valor: null,
      })
      return
    }

    payload.push({
      caracteristica_id: caracteristica.id,
      caracteristica_opcion_id: null,
      valor: String(value),
    })
  })

  return payload
}

function toFieldValues(
  plantaCaracteristicas: PlantaCaracteristicaPayload[],
  caracteristicas: Caracteristica[],
): Record<number, FieldValue> {
  const caracteristicasById = new Map(caracteristicas.map((caracteristica) => [caracteristica.id, caracteristica]))

  return plantaCaracteristicas.reduce<Record<number, FieldValue>>((values, caracteristica) => {
    if (caracteristica.caracteristica_opcion_id) {
      const fieldKind = getCaracteristicaFieldKind(caracteristicasById.get(caracteristica.caracteristica_id)!)
      const currentValue = values[caracteristica.caracteristica_id]
      const optionValue = String(caracteristica.caracteristica_opcion_id)

      values[caracteristica.caracteristica_id] =
        fieldKind === 'checkbox'
          ? Array.isArray(currentValue)
            ? [...currentValue, optionValue]
            : [optionValue]
          : optionValue

      return values
    }

    if (caracteristica.valor) {
      values[caracteristica.caracteristica_id] = caracteristica.valor
    }

    return values
  }, {})
}
