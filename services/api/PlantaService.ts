import { BaseApiService } from './BaseApiService';
import type { PlantaCaracteristicaPayload } from './PlantaCaracteristicaService';

export interface Planta {
  id: number;
  nombre_comun: string;
  nombre_cientifico: string | null;
  descripcion: string | null;
  observaciones: string | null;
  caracteristicas?: PlantaCaracteristicaPayload[];
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export type PlantaPayload = Omit<Planta, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;
export type PlantaCreatePayload = PlantaPayload & {
  caracteristicas?: Array<Omit<PlantaCaracteristicaPayload, 'planta_id'>>;
};

export class PlantaService extends BaseApiService {
  private endpoint = '/plantas';

  async getAll(): Promise<Planta[]> {
    return this.get<Planta[]>(this.endpoint);
  }

  async getById(id: number): Promise<Planta> {
    return this.get<Planta>(`${this.endpoint}/${id}`);
  }

  async create(planta: PlantaCreatePayload): Promise<Planta> {
    return this.post<Planta>(this.endpoint, planta);
  }

  async update(id: number, planta: Partial<PlantaCreatePayload>): Promise<Planta> {
    return this.put<Planta>(`${this.endpoint}/${id}`, planta);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
