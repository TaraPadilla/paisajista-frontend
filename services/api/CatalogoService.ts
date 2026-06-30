import { BaseApiService } from './BaseApiService';

export interface Catalogo {
  id: number;
  grupo: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  orden: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export type CatalogoPayload = Omit<Catalogo, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>;

export class CatalogoService extends BaseApiService {
  private endpoint = '/catalogos';

  async getAll(): Promise<Catalogo[]> {
    return this.get<Catalogo[]>(this.endpoint);
  }

  async getByGroup(grupo: string): Promise<Catalogo[]> {
    return this.get<Catalogo[]>(`${this.endpoint}/grupo/${grupo}`);
  }

  async getById(id: number): Promise<Catalogo> {
    return this.get<Catalogo>(`${this.endpoint}/${id}`);
  }

  async create(catalogo: CatalogoPayload): Promise<Catalogo> {
    return this.post<Catalogo>(this.endpoint, catalogo);
  }

  async update(id: number, catalogo: Partial<CatalogoPayload>): Promise<Catalogo> {
    return this.put<Catalogo>(`${this.endpoint}/${id}`, catalogo);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
