export const apiConfig = {
  baseURL: import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '') || '/api',
  withCredentials: true,
  withXSRFToken: false,
  headers: { Accept: 'application/json' },
}
