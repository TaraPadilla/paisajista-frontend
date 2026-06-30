import { BaseApiService } from './BaseApiService';

export interface Catalogo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface CaracteristicaOpcion {
  id: number;
  caracteristica_id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Caracteristica {
  id: number;
  nombre: string;
  codigo: string | null;
  tipo_caracteristica_id: number;
  tipo_caracteristica: Catalogo;
  tipo_dato_id: number | null;
  tipo_dato: Catalogo;
  tipo_campo_id: number | null;
  tipo_campo: Catalogo;
  permite_multiples: boolean;
  orden: number;
  opciones?: CaracteristicaOpcion[];
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export class CaracteristicaService extends BaseApiService {
  private endpoint = '/caracteristicas';

  async getAll(): Promise<Caracteristica[]> {
    return this.get<Caracteristica[]>(this.endpoint);
  }

  async getById(id: number): Promise<Caracteristica> {
    return this.get<Caracteristica>(`${this.endpoint}/${id}`);
  }

  async create(caracteristica: Omit<Caracteristica, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'tipo_caracteristica' | 'tipo_dato' | 'tipo_campo'>): Promise<Caracteristica> {
    return this.post<Caracteristica>(this.endpoint, caracteristica);
  }

  async update(id: number, caracteristica: Partial<Omit<Caracteristica, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'tipo_caracteristica' | 'tipo_dato' | 'tipo_campo'>>): Promise<Caracteristica> {
    return this.put<Caracteristica>(`${this.endpoint}/${id}`, caracteristica);
  }

  async remove(id: number): Promise<void> {
    return this.delete(`${this.endpoint}/${id}`);
  }
}
