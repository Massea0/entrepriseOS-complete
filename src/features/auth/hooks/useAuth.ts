'use client'

import React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthService, TokenManager } from '../services/auth.service'
import type {
  User,
  AuthTokens,
  AuthState,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  TwoFactorSetupData,
  TwoFactorVerificationData,
  UseAuthReturn,
  Permission,
  UserRole
} from '../types/auth.types'

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  forgotPassword: (data: ForgotPasswordData) => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  refreshTokens: () => Promise<void>
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
  setTokens: (tokens: AuthTokens | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await AuthService.login(credentials)
          
          if (response.requiresTwoFactor) {
            // Two-factor authentication required
            set({ 
              isLoading: false,
              error: 'two_factor_required'
            })
            return
          }
          
          // Store tokens
          TokenManager.setTokens(response.tokens)
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Login failed' 
          })
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ isLoading: true, error: null })
          
          const response = await AuthService.register(data)
          
          // Store tokens
          TokenManager.setTokens(response.tokens)
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Registration failed' 
          })
          throw error
        }
      },

      logout: async () => {
        try {
          const { tokens } = get()
          
          if (tokens?.refreshToken) {
            await AuthService.logout(tokens.refreshToken)
          }
        } catch (error) {
          // Ignore logout errors, still clear local state
          console.warn('Logout error:', error)
        } finally {
          // Clear tokens and state
          TokenManager.clearTokens()
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null
          })
        }
      },

      forgotPassword: async (data: ForgotPasswordData) => {
        try {
          set({ isLoading: true, error: null })
          await AuthService.forgotPassword(data)
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to send reset email' 
          })
          throw error
        }
      },

      resetPassword: async (data: ResetPasswordData) => {
        try {
          set({ isLoading: true, error: null })
          await AuthService.resetPassword(data)
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to reset password' 
          })
          throw error
        }
      },

      changePassword: async (data: ChangePasswordData) => {
        try {
          set({ isLoading: true, error: null })
          await AuthService.changePassword(data)
          set({ isLoading: false })
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to change password' 
          })
          throw error
        }
      },

      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null })
          const updatedUser = await AuthService.updateProfile(data)
          set({ 
            user: updatedUser,
            isLoading: false 
          })
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to update profile' 
          })
          throw error
        }
      },

      refreshTokens: async () => {
        try {
          const { tokens } = get()
          
          if (!tokens?.refreshToken) {
            throw new Error('No refresh token available')
          }
          
          const newTokens = await AuthService.refreshTokens(tokens.refreshToken)
          TokenManager.setTokens(newTokens)
          
          set({ tokens: newTokens })
        } catch (error: any) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      initialize: async () => {
        try {
          set({ isLoading: true })
          
          // Check for stored tokens
          const tokens = TokenManager.getTokens()
          
          if (!tokens || TokenManager.isTokenExpired()) {
            // No valid tokens, user not authenticated
            set({ 
              isLoading: false, 
              isInitialized: true,
              isAuthenticated: false 
            })
            return
          }
          
          // Try to refresh if tokens will expire soon
          if (TokenManager.willTokenExpireSoon()) {
            await get().refreshTokens()
          }
          
          // Get user profile
          const user = await AuthService.getProfile()
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true
          })
        } catch (error) {
          // If initialization fails, clear tokens and state
          TokenManager.clearTokens()
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
            error: 'Session expired'
          })
        }
      },

      // Two Factor Authentication
      setupTwoFactor: async () => {
        try {
          set({ isLoading: true, error: null })
          const setupData = await AuthService.setupTwoFactor()
          set({ isLoading: false })
          return setupData
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to setup 2FA' 
          })
          throw error
        }
      },

      enableTwoFactor: async (code: string) => {
        try {
          set({ isLoading: true, error: null })
          await AuthService.enableTwoFactor(code)
          
          // Update user to reflect 2FA enabled
          const { user } = get()
          if (user) {
            set({ 
              user: { ...user, twoFactorEnabled: true },
              isLoading: false 
            })
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to enable 2FA' 
          })
          throw error
        }
      },

      disableTwoFactor: async (password: string) => {
        try {
          set({ isLoading: true, error: null })
          await AuthService.disableTwoFactor(password)
          
          // Update user to reflect 2FA disabled
          const { user } = get()
          if (user) {
            set({ 
              user: { ...user, twoFactorEnabled: false },
              isLoading: false 
            })
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'Failed to disable 2FA' 
          })
          throw error
        }
      },

      verifyTwoFactor: async (data: TwoFactorVerificationData) => {
        try {
          set({ isLoading: true, error: null })
          const response = await AuthService.verifyTwoFactor(data)
          
          // Store tokens and complete login
          TokenManager.setTokens(response.tokens)
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || '2FA verification failed' 
          })
          throw error
        }
      },

      // Utility methods
      hasPermission: (permission: Permission) => {
        const { user } = get()
        return user?.permissions.includes(permission) ?? false
      },

      hasRole: (role: UserRole) => {
        const { user } = get()
        return user?.role === role
      },

      canAccess: (permissions: Permission[]) => {
        const { user } = get()
        if (!user) return false
        
        return permissions.some(permission => 
          user.permissions.includes(permission)
        )
      },

      // Setters
      setUser: (user: User | null) => set({ user }),
      setTokens: (tokens: AuthTokens | null) => set({ tokens }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

/**
 * Main useAuth hook
 * Provides authentication state and actions
 */
export const useAuth = (): UseAuthReturn => {
  const store = useAuthStore()
  
  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    
    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    changePassword: store.changePassword,
    updateProfile: store.updateProfile,
    refreshTokens: store.refreshTokens,
    
    // Two Factor
    setupTwoFactor: store.setupTwoFactor,
    enableTwoFactor: store.enableTwoFactor,
    disableTwoFactor: store.disableTwoFactor,
    verifyTwoFactor: store.verifyTwoFactor,
    
    // Utils
    hasPermission: store.hasPermission,
    hasRole: store.hasRole,
    canAccess: store.canAccess
  }
}

/**
 * Hook to initialize auth on app startup
 */
export const useAuthInit = () => {
  const initialize = useAuthStore(state => state.initialize)
  const isInitialized = useAuthStore(state => state.isInitialized)
  
  React.useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])
  
  return { isInitialized }
}