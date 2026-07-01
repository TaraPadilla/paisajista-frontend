import { BaseApiService } from './BaseApiService';
import type { PlantaCaracteristica, PlantaCaracteristicaPayload } from './PlantaCaracteristicaService';
import type { PlantaProveedor } from './PlantaProveedorService';

export interface PlantaImagenCatalogo {
  id: number;
  codigo: string;
  nombre: string;
}

export interface PlantaImagen {
  id: number;
  planta_id: number;
  tipo_planta_id: number | null;
  tipo_imagen?: PlantaImagenCatalogo | null;
  ruta: string;
  url: string | null;
  nombre_original: string | null;
  observaciones: string | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Planta {
  id: number;
  nombre_comun: string;
  nombre_cientifico: string | null;
  descripcion: string | null;
  observaciones: string | null;
  caracteristicas?: PlantaCaracteristica[];
  imagenes?: PlantaImagen[];
  imagen_principal?: PlantaImagen | null;
  proveedores?: PlantaProveedor[];
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export type PlantaPayload = Omit<Planta, 'id' | 'caracteristicas' | 'imagenes' | 'imagen_principal' | 'proveedores' | 'created_at' | 'updated_at' | 'deleted_at'>;
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

  async create(planta: PlantaCreatePayload | FormData): Promise<Planta> {
    if (planta instanceof FormData) {
      return this.postFormData<Planta>(this.endpoint, planta);
    }

    return this.post<Planta>(this.endpoint, planta);
  }

  async update(id: number, planta: Partial<PlantaCreatePayload> | FormData): Promise<Planta> {
    if (planta instanceof FormData) {
      planta.append('_method', 'PUT');
      return this.postFormData<Planta>(`${this.endpoint}/${id}`, planta);
    }

    return this.put<Planta>(`${this.endpoint}/${id}`, planta);
  }

  async remove(id: number): Promise<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
