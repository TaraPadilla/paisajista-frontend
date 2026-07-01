import { BaseApiService } from './BaseApiService';

export interface PlantaProveedorPlanta {
  id: number;
  nombre_comun: string;
  nombre_cientifico: string | null;
}

export interface PlantaProveedorTercero {
  id: number;
  codigo: string;
  nombre: string;
}

export interface PlantaProveedor {
  id: number;
  planta_id: number;
  planta?: PlantaProveedorPlanta | null;
  tercero_id: number;
  tercero?: PlantaProveedorTercero | null;
  precio: number;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export type PlantaProveedorPayload = Omit<
  PlantaProveedor,
  'id' | 'planta' | 'tercero' | 'created_at' | 'updated_at' | 'deleted_at'
>;

export class PlantaProveedorService extends BaseApiService {
  private endpoint = '/planta-proveedores';

  async getAll(): Promise<PlantaProveedor[]> {
    return this.get<PlantaProveedor[]>(this.endpoint);
  }

  async getById(id: number): Promise<PlantaProveedor> {
    return this.get<PlantaProveedor>(`${this.endpoint}/${id}`);
  }

  async create(plantaProveedor: PlantaProveedorPayload): Promise<PlantaProveedor> {
    return this.post<PlantaProveedor>(this.endpoint, plantaProveedor);
  }

  async update(id: number, plantaProveedor: Partial<PlantaProveedorPayload>): Promise<PlantaProveedor> {
    return this.put<PlantaProveedor>(`${this.endpoint}/${id}`, plantaProveedor);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
