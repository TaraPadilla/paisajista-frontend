export interface Plant {
  id: number
  scientificName: string
  commonName: string
  sunlight: string
  water: string
  soil: string
  coldResistance: string
  plantType: string
  foliageType: string
  maxHeight: string
  canopyDiameter: string
  landscapeStyle: string
  predominantColor: string
  floweringSeason: string
  imageUrl: string | null
  cenitalImageUrl: string | null
  corteImageUrl: string | null
  style: string
  type: string
  bloom: string
  height: string
  canopy: string
  providers: Array<{
    id: number
    name: string
    code: string | null
    price: number
    observations: string | null
  }>
  color: 'violet' | 'wine' | 'gold' | 'blue' | 'green'
}
