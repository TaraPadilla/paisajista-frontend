import { BaseApiService } from './BaseApiService';

export interface Caracteristica {
  id: number;
  nombre: string;
  codigo: string;
}

export interface CaracteristicaOpcion {
  id: number;
  caracteristica_id: number;
  caracteristica?: Caracteristica;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export class CaracteristicaOpcionService extends BaseApiService {
  private endpoint = '/caracteristica-opciones';

  async getAll(): Promise<CaracteristicaOpcion[]> {
    return this.get<CaracteristicaOpcion[]>(this.endpoint);
  }

  async getById(id: number): Promise<CaracteristicaOpcion> {
    return this.get<CaracteristicaOpcion>(`${this.endpoint}/${id}`);
  }

  async create(caracteristicaOpcion: Omit<CaracteristicaOpcion, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'caracteristica'>): Promise<CaracteristicaOpcion> {
    return this.post<CaracteristicaOpcion>(this.endpoint, caracteristicaOpcion);
  }

  async update(id: number, caracteristicaOpcion: Partial<Omit<CaracteristicaOpcion, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'caracteristica'>>): Promise<CaracteristicaOpcion> {
    return this.put<CaracteristicaOpcion>(`${this.endpoint}/${id}`, caracteristicaOpcion);
  }

  async remove(id: number): Promise<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }
}
