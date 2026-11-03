import axios from 'axios'

const api = axios.create({ baseURL: '/api', headers: { Accept: 'application/json' } })
let csrfToken = ''

export const getCsrfToken = () => csrfToken

export async function refreshCsrfToken() {
  const { data } = await api.get<{ token: string }>('/csrf-token')
  csrfToken = data.token
}

export async function getSessionUser() {
  const { data } = await api.get<{ name: string }>('/user')
  return data
}

export async function signIn(email: string, password: string) {
  await refreshCsrfToken()
  const { data } = await api.post<{ token: string }>('/login', { email, password }, {
    headers: { 'X-CSRF-TOKEN': csrfToken },
  })
  csrfToken = data.token
  return getSessionUser()
}

export async function signOut() {
  const endSession = () => api.post<{ token: string }>('/logout', {}, {
    headers: { 'X-CSRF-TOKEN': csrfToken },
    timeout: 10000,
  })

  const response = await endSession().catch(async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 419) throw error
    await refreshCsrfToken()
    return endSession()
  })

  if (typeof response.data?.token !== 'string') {
    throw new Error('La API no confirmó el cierre de sesión.')
  }
  csrfToken = ''
}
