import { BaseApiService } from './BaseApiService';

export interface PlantaCaracteristica {
  id: number;
  planta_id: number;
  caracteristica_id: number;
  caracteristica_opcion_id: number | null;
  valor: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export type PlantaCaracteristicaPayload = Omit<PlantaCaracteristica, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export class PlantaCaracteristicaService extends BaseApiService {
  private endpoint = '/planta-caracteristicas';

  async getAll(): Promise<PlantaCaracteristica[]> {
    return this.get<PlantaCaracteristica[]>(this.endpoint);
  }

  async create(plantaCaracteristica: PlantaCaracteristicaPayload): Promise<PlantaCaracteristica> {
    return this.post<PlantaCaracteristica>(this.endpoint, plantaCaracteristica);
  }

  async update(id: number, plantaCaracteristica: Partial<PlantaCaracteristicaPayload>): Promise<PlantaCaracteristica> {
    return this.put<PlantaCaracteristica>(`${this.endpoint}/${id}`, plantaCaracteristica);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
