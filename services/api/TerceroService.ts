import { BaseApiService } from './BaseApiService';

export interface TipoTercero {
  id: number;
  grupo: string;
  codigo: string;
  nombre: string;
}

export interface Tercero {
  id: number;
  tipo_tercero_id: number | null;
  tipo_tercero?: TipoTercero | null;
  codigo: string;
  nombre: string;
  identificacion: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export type TerceroPayload = Omit<Tercero, 'id' | 'codigo' | 'tipo_tercero' | 'created_at' | 'updated_at' | 'deleted_at'> & {
  codigo?: string;
};

export class TerceroService extends BaseApiService {
  private endpoint = '/terceros';

  async getAll(tipo?: string): Promise<Tercero[]> {
    const query = tipo ? `?tipo=${encodeURIComponent(tipo)}` : '';
    return this.get<Tercero[]>(`${this.endpoint}${query}`);
  }

  async getClientes(): Promise<Tercero[]> {
    return this.getAll('cliente');
  }

  async getProveedores(): Promise<Tercero[]> {
    return this.getAll('proveedor');
  }

  async getById(id: number): Promise<Tercero> {
    return this.get<Tercero>(`${this.endpoint}/${id}`);
  }

  async create(tercero: TerceroPayload): Promise<Tercero> {
    return this.post<Tercero>(this.endpoint, tercero);
  }

  async update(id: number, tercero: Partial<TerceroPayload>): Promise<Tercero> {
    return this.put<Tercero>(`${this.endpoint}/${id}`, tercero);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
