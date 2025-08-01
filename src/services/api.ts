import ky from 'ky'

// Obtenir l'URL de base depuis les variables d'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Créer une instance ky configurée
export const kyInstance = ky.create({
  prefixUrl: API_BASE_URL,
  timeout: 30000,
  retry: {
    limit: 2,
    methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504],
  },
  hooks: {
    beforeRequest: [
      async request => {
        // Ajouter le token d'authentification si disponible
        const token = localStorage.getItem('access_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      }
    ],
    afterResponse: [
      async (_request, _options, response) => {
        // Logger les erreurs pour le débogage
        if (!response.ok) {
          console.error(`API Error: ${response.status} ${response.statusText}`)
        }
        return response
      }
    ],
    beforeError: [
      error => {
        const {response} = error
        if (response && response.body) {
          error.message = `${response.status}: ${response.statusText}`
        }
        return error
      }
    ]
  }
})

// Exporter ky pour compatibilité avec le code existant
export { kyInstance as ky }

// Types pour les réponses API communes
export interface ApiResponse<T = any> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Helpers pour les requêtes communes
export const api = {
  get: <T = any>(url: string, options?: any) => 
    kyInstance.get(url, options).json<T>(),
    
  post: <T = any>(url: string, data?: any, options?: any) => 
    kyInstance.post(url, { json: data, ...options }).json<T>(),
    
  put: <T = any>(url: string, data?: any, options?: any) => 
    kyInstance.put(url, { json: data, ...options }).json<T>(),
    
  patch: <T = any>(url: string, data?: any, options?: any) => 
    kyInstance.patch(url, { json: data, ...options }).json<T>(),
    
  delete: <T = any>(url: string, options?: any) => 
    kyInstance.delete(url, options).json<T>(),
}

export default api