import axios, { type AxiosInstance } from 'axios';
import { toast } from '@/hooks/use-toast';

export class BaseApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_BACKEND_URL;
    // console.log(this.baseURL);
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );  
  }

  protected async get<T>(endpoint: string): Promise<T> {
    const { data } = await this.api.get(endpoint);
    return data as T;
  }

  protected async post<T>(endpoint: string, body: any): Promise<T> {
    const { data } = await this.api.post(endpoint, body);
    return data as T;
  }

  protected async put<T>(endpoint: string, body: any): Promise<T> {
    const { data } = await this.api.put(endpoint, body);
    return data as T;
  }

  protected async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const { data } = await this.api.post(endpoint, formData, {
      headers: {
        'Content-Type': undefined
      }
    });
    return data as T;
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    const { data } = await this.api.delete(endpoint);
    return data as T;
  }

  private handleError(error: any): void {
    // Manejar errores de red donde no hay response
    if (!error.response) {
      console.error('Network Error:', error.message);
      
      // Mostrar toast para errores de red
      toast({
        variant: 'destructive',
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      });
      
      return;
    }

    const errorData = error.response?.data ?? {
      message: error.message || 'Error de comunicación con el servidor'
    };

    console.error('API Error:', errorData);

    // Extraer mensaje de error del response
    let errorMessage = errorData.message || error.message || 'Error de comunicación con el servidor';
    
    // Si el backend retorna un campo 'mensaje' específico, usarlo
    if (errorData.mensaje) {
      errorMessage = errorData.mensaje;
    }

    // Extraer errores de validación (422) y adjuntarlos al error
    if (error.response?.status === 422 && errorData.errors) {
      error.validationErrors = errorData.errors;
      error.message = errorData.message || 'Error de validación';
    }

    // Mostrar toast con el error (excepto 401 que maneja redirección)
    if (error.response?.status !== 401) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }

    if (error.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
}
