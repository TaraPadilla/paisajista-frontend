export interface Plant {
  id: number
  scientificName: string
  commonName: string
  sunlight: string
  water: string
  soil: string
  coldResistance: string
  style: string
  type: string
  bloom: string
  height: string
  canopy: string
  providers: string[]
  basePrice: string
  color: 'violet' | 'wine' | 'gold' | 'blue' | 'green'
}
