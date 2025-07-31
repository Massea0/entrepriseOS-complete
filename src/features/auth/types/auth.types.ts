export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  permissions: Permission[]
  emailVerified: boolean
  twoFactorEnabled: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  
  // Profile fields
  phone?: string
  timezone: string
  language: string
  department?: string
  position?: string
  manager?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>
}

export type UserRole = 
  | 'super_admin'
  | 'admin' 
  | 'manager'
  | 'employee'
  | 'client'
  | 'guest'

export type Permission = 
  // User management
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.invite'
  
  // Company management  
  | 'company.view'
  | 'company.edit'
  | 'company.settings'
  
  // Projects
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.manage'
  
  // HR
  | 'hr.view'
  | 'hr.manage'
  | 'hr.reports'
  
  // Finance
  | 'finance.view'
  | 'finance.edit'
  | 'finance.approve'
  | 'finance.reports'
  
  // CRM
  | 'crm.view'
  | 'crm.edit'
  | 'crm.manage'
  | 'crm.reports'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
  twoFactorCode?: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  passwordConfirm: string
  company?: string
  position?: string
  phone?: string
  acceptTerms: boolean
  acceptMarketing?: boolean
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  passwordConfirm: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  newPasswordConfirm: string
}

export interface TwoFactorSetupData {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorVerificationData {
  code: string
  type: 'authenticator' | 'backup'
}

export interface AuthState {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}

export interface InviteData {
  email: string
  role: UserRole
  permissions?: Permission[]
  department?: string
  message?: string
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
}

export interface OnboardingData {
  currentStep: number
  totalSteps: number
  steps: OnboardingStep[]
  profile: Partial<User>
  company: {
    name: string
    size: string
    industry: string
    country: string
  }
  preferences: {
    timezone: string
    language: string
    notifications: {
      email: boolean
      push: boolean
      slack: boolean
    }
  }
}

// API Response types
export interface AuthResponse {
  user: User
  tokens: AuthTokens
  requiresTwoFactor?: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

// Hook return types
export interface UseAuthReturn {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshTokens: () => Promise<void>
  
  // Two Factor
  setupTwoFactor: () => Promise<TwoFactorSetupData>
  enableTwoFactor: (code: string) => Promise<void>
  disableTwoFactor: (password: string) => Promise<void>
  verifyTwoFactor: (data: TwoFactorVerificationData) => Promise<void>
  
  // Utils
  hasPermission: (permission: Permission) => boolean
  hasRole: (role: UserRole) => boolean
  canAccess: (permissions: Permission[]) => boolean
}