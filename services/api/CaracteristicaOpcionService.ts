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
  createdAt: string | null;
  updatedAt: string | null;
  deletedAt: string | null;
}

export class CaracteristicaOpcionService extends BaseApiService {
  private endpoint = '/caracteristica-opciones';

  async getAll(): Promise<CaracteristicaOpcion[]> {
    return this.get<CaracteristicaOpcion[]>(this.endpoint);
  }

  async getById(id: number): Promise<CaracteristicaOpcion> {
    return this.get<CaracteristicaOpcion>(`${this.endpoint}/${id}`);
  }

  async create(caracteristicaOpcion: Omit<CaracteristicaOpcion, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'caracteristica'>): Promise<CaracteristicaOpcion> {
    return this.post<CaracteristicaOpcion>(this.endpoint, caracteristicaOpcion);
  }

  async update(id: number, caracteristicaOpcion: Partial<Omit<CaracteristicaOpcion, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'caracteristica'>>): Promise<CaracteristicaOpcion> {
    return this.put<CaracteristicaOpcion>(`${this.endpoint}/${id}`, caracteristicaOpcion);
  }

  async remove(id: number): Promise<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }
}
