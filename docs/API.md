# 🔌 Guide d'Intégration API - Enterprise OS

## 📋 Vue d'Ensemble

Ce guide décrit comment intégrer le frontend moderne avec le backend Enterprise OS existant. L'architecture suit les meilleures pratiques REST et prépare pour GraphQL.

## 🏗️ Architecture API

### Base URL
```
Development: http://localhost:5000/api
Staging: https://staging-api.enterprise-os.com/api
Production: https://api.enterprise-os.com/api
```

### Versioning
```
/api/v1/... (current)
/api/v2/... (future)
```

## 🔐 Authentication

### Login Flow
```typescript
// services/auth/auth.service.ts
interface LoginRequest {
  email: string
  password: string
  remember?: boolean
}

interface LoginResponse {
  user: User
  access_token: string
  refresh_token: string
  expires_in: number
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post('auth/login', {
      json: credentials
    }).json<LoginResponse>()
    
    // Store tokens securely
    tokenService.setTokens(response)
    
    return response
  }
}
```

### Token Management
```typescript
// services/auth/token.service.ts
export const tokenService = {
  getAccessToken(): string | null {
    return localStorage.getItem('access_token')
  },
  
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  },
  
  setTokens(tokens: { access_token: string; refresh_token: string }) {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
  },
  
  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}
```

### Refresh Token Flow
```typescript
// services/api/interceptors.ts
export const setupInterceptors = (client: KyInstance) => {
  client.extend({
    hooks: {
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            const refreshed = await authService.refreshToken()
            if (refreshed) {
              return client(request)
            }
            // Redirect to login
            window.location.href = '/auth/login'
          }
        }
      ]
    }
  })
}
```

## 📡 API Client Configuration

### Base Client Setup
```typescript
// services/api/client.ts
import ky from 'ky'

export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  timeout: 30000,
  retry: {
    limit: 3,
    methods: ['get', 'put', 'delete'],
    statusCodes: [408, 413, 429, 500, 502, 503, 504]
  },
  hooks: {
    beforeRequest: [
      request => {
        const token = tokenService.getAccessToken()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
        request.headers.set('Content-Type', 'application/json')
        request.headers.set('Accept', 'application/json')
      }
    ],
    beforeRetry: [
      ({ error, retryCount }) => {
        console.log(`Retry attempt ${retryCount} after error:`, error)
      }
    ]
  }
})
```

### Error Handling
```typescript
// services/api/error-handler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleApiError = async (error: unknown): Promise<never> => {
  if (error instanceof HTTPError) {
    const response = error.response
    const data = await response.json().catch(() => ({}))
    
    throw new ApiError(
      response.status,
      data.code || 'UNKNOWN_ERROR',
      data.message || error.message,
      data.details
    )
  }
  
  throw error
}
```

## 📚 API Resources

### Users
```typescript
// services/api/users.service.ts
export const usersService = {
  async getAll(params?: UsersParams) {
    return apiClient.get('users', { searchParams: params })
      .json<PaginatedResponse<User>>()
  },
  
  async getById(id: string) {
    return apiClient.get(`users/${id}`).json<User>()
  },
  
  async create(data: CreateUserDto) {
    return apiClient.post('users', { json: data }).json<User>()
  },
  
  async update(id: string, data: UpdateUserDto) {
    return apiClient.put(`users/${id}`, { json: data }).json<User>()
  },
  
  async delete(id: string) {
    return apiClient.delete(`users/${id}`).json<{ success: boolean }>()
  }
}
```

### Projects
```typescript
// services/api/projects.service.ts
export const projectsService = {
  async getAll(filters?: ProjectFilters) {
    return apiClient.get('projects', { searchParams: filters })
      .json<PaginatedResponse<Project>>()
  },
  
  async getById(id: string) {
    return apiClient.get(`projects/${id}`).json<Project>()
  },
  
  async create(data: CreateProjectDto) {
    return apiClient.post('projects', { json: data }).json<Project>()
  },
  
  async update(id: string, data: UpdateProjectDto) {
    return apiClient.patch(`projects/${id}`, { json: data }).json<Project>()
  },
  
  async delete(id: string) {
    return apiClient.delete(`projects/${id}`).json<{ success: boolean }>()
  },
  
  // Nested resources
  async getTasks(projectId: string) {
    return apiClient.get(`projects/${projectId}/tasks`)
      .json<Task[]>()
  },
  
  async addMember(projectId: string, userId: string, role: string) {
    return apiClient.post(`projects/${projectId}/members`, {
      json: { userId, role }
    }).json<ProjectMember>()
  }
}
```

## 🔄 Real-time Updates

### WebSocket Connection
```typescript
// services/realtime/websocket.service.ts
import { io, Socket } from 'socket.io-client'

class WebSocketService {
  private socket: Socket | null = null
  
  connect(token: string) {
    this.socket = io(import.meta.env.VITE_WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
    
    this.setupEventHandlers()
  }
  
  private setupEventHandlers() {
    if (!this.socket) return
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })
    
    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
    })
    
    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })
  }
  
  subscribe(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback)
  }
  
  unsubscribe(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback)
  }
  
  emit(event: string, data: any) {
    this.socket?.emit(event, data)
  }
  
  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }
}

export const wsService = new WebSocketService()
```

### Real-time Hooks
```typescript
// hooks/useRealtimeUpdates.ts
export function useRealtimeUpdates<T>(
  resource: string,
  id: string,
  onUpdate: (data: T) => void
) {
  useEffect(() => {
    const event = `${resource}:${id}:update`
    
    wsService.subscribe(event, onUpdate)
    
    return () => {
      wsService.unsubscribe(event, onUpdate)
    }
  }, [resource, id, onUpdate])
}
```

## 📤 File Uploads

### Upload Service
```typescript
// services/api/upload.service.ts
export const uploadService = {
  async uploadFile(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    return apiClient.post('upload', {
      body: formData,
      onUploadProgress: (progress) => {
        if (onProgress && progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100
          onProgress(Math.round(percentComplete))
        }
      }
    }).json<UploadResponse>()
  },
  
  async uploadMultiple(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse[]> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    
    return apiClient.post('upload/multiple', {
      body: formData,
      onUploadProgress: (progress) => {
        if (onProgress && progress.lengthComputable) {
          const percentComplete = (progress.loaded / progress.total) * 100
          onProgress(Math.round(percentComplete))
        }
      }
    }).json<UploadResponse[]>()
  }
}
```

## 🔍 Search & Filtering

### Search Service
```typescript
// services/api/search.service.ts
interface SearchParams {
  q: string
  type?: 'all' | 'users' | 'projects' | 'tasks'
  limit?: number
  offset?: number
  filters?: Record<string, any>
}

export const searchService = {
  async search(params: SearchParams) {
    return apiClient.get('search', {
      searchParams: params
    }).json<SearchResults>()
  },
  
  async suggestions(query: string) {
    return apiClient.get('search/suggestions', {
      searchParams: { q: query, limit: 10 }
    }).json<string[]>()
  }
}
```

## 📊 Pagination

### Paginated Response Type
```typescript
// types/api.types.ts
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}
```

### Pagination Hook
```typescript
// hooks/usePagination.ts
export function usePagination<T>(
  fetchFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  initialParams?: PaginationParams
) {
  const [page, setPage] = useState(initialParams?.page || 1)
  const [pageSize, setPageSize] = useState(initialParams?.pageSize || 20)
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['paginated', fetchFn.name, page, pageSize],
    queryFn: () => fetchFn({ page, pageSize })
  })
  
  return {
    data: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    goToPage: setPage,
    changePageSize: setPageSize,
    goToFirst: () => setPage(1),
    goToLast: () => setPage(data?.pagination.totalPages || 1),
    goToPrev: () => setPage(p => Math.max(1, p - 1)),
    goToNext: () => setPage(p => Math.min(data?.pagination.totalPages || p, p + 1))
  }
}
```

## 🧪 Testing API Calls

### Mock Service Worker Setup
```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw'

export const handlers = [
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: { id: '1', email: 'test@example.com' },
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600
      })
    )
  }),
  
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: [
          { id: '1', name: 'John Doe', email: 'john@example.com' }
        ],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1
        }
      })
    )
  })
]
```

## 📝 Types Generation

### OpenAPI to TypeScript
```json
// package.json scripts
{
  "scripts": {
    "generate:types": "openapi-typescript http://localhost:5000/api/docs/openapi.json --output src/types/api.generated.ts"
  }
}
```

## 🔧 Environment Configuration

### Environment Variables
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
VITE_ENABLE_WEBSOCKET=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_ANALYTICS=false
```

## 📊 Monitoring & Analytics

### API Performance Tracking
```typescript
// services/api/monitoring.ts
export const apiMonitoring = {
  trackRequest(endpoint: string, method: string, duration: number) {
    if (import.meta.env.VITE_ENABLE_ANALYTICS) {
      analytics.track('api_request', {
        endpoint,
        method,
        duration,
        timestamp: new Date().toISOString()
      })
    }
  },
  
  trackError(endpoint: string, method: string, error: ApiError) {
    console.error(`API Error [${method} ${endpoint}]:`, error)
    
    if (import.meta.env.VITE_ENABLE_ANALYTICS) {
      analytics.track('api_error', {
        endpoint,
        method,
        status: error.status,
        code: error.code,
        message: error.message
      })
    }
  }
}
```

---

*Ce guide sera mis à jour au fur et à mesure de l'évolution de l'API backend.*