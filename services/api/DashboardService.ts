import { BaseApiService } from './BaseApiService';

export interface DashboardResumen {
  counts: {
    plantas: number;
    plantas_con_imagenes: number;
    clientes: number;
    proveedores: number;
  };
}

export class DashboardService extends BaseApiService {
  async getResumen(): Promise<DashboardResumen> {
    return this.get<DashboardResumen>('/dashboard/resumen');
  }
}
