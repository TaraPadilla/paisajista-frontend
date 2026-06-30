import type { Caracteristica } from '../../../services/api/CaracteristicaService'

export type CaracteristicaFieldKind = 'checkbox' | 'radio' | 'select' | 'number' | 'text'

export interface CaracteristicaGroup {
  tipoCodigo: string
  tipoNombre: string
  caracteristicas: Caracteristica[]
}

export function getCaracteristicaFieldKind(caracteristica: Caracteristica): CaracteristicaFieldKind {
  const tipoCampo = caracteristica.tipo_campo.codigo

  if (tipoCampo === 'checkbox' || tipoCampo === 'radio' || tipoCampo === 'select' || tipoCampo === 'number') {
    return tipoCampo
  }

  if (tipoCampo === 'text' || tipoCampo === 'textarea') {
    return 'text'
  }

  throw new Error(`Tipo de campo no soportado: ${tipoCampo}`)
}

export function validateCaracteristicaContract(caracteristica: Caracteristica): void {
  if (!caracteristica.tipo_caracteristica) {
    throw new Error(`La característica ${caracteristica.codigo} no tiene tipo_caracteristica.`)
  }

  if (!caracteristica.tipo_dato) {
    throw new Error(`La característica ${caracteristica.codigo} no tiene tipo_dato.`)
  }

  if (!caracteristica.tipo_campo) {
    throw new Error(`La característica ${caracteristica.codigo} no tiene tipo_campo.`)
  }

  const fieldKind = getCaracteristicaFieldKind(caracteristica)
  const requiresOptions = fieldKind === 'checkbox' || fieldKind === 'radio' || fieldKind === 'select'

  if (requiresOptions && (!caracteristica.opciones || caracteristica.opciones.length === 0)) {
    throw new Error(`La característica ${caracteristica.codigo} requiere opciones.`)
  }
}

export function groupCaracteristicasByTipo(caracteristicas: Caracteristica[]): CaracteristicaGroup[] {
  const groups = new Map<string, CaracteristicaGroup>()

  caracteristicas.forEach((caracteristica) => {
    validateCaracteristicaContract(caracteristica)

    const tipoCodigo = caracteristica.tipo_caracteristica.codigo
    const currentGroup = groups.get(tipoCodigo)

    if (currentGroup) {
      currentGroup.caracteristicas.push(caracteristica)
      return
    }

    groups.set(tipoCodigo, {
      tipoCodigo,
      tipoNombre: caracteristica.tipo_caracteristica.nombre,
      caracteristicas: [caracteristica],
    })
  })

  return Array.from(groups.values()).map((group) => ({
    ...group,
    caracteristicas: group.caracteristicas.toSorted((a, b) => a.orden - b.orden),
  }))
}
