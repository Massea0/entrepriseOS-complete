import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { authService, type User, type SignUpData, type SignInData } from '../services/auth.service'

interface AuthStore {
  // State
  user: User | null
  session: any | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  signUp: (data: SignUpData) => Promise<void>
  signIn: (data: SignInData) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGitHub: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  hasRole: (roles: string[]) => boolean
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Sign up
      signUp: async (data: SignUpData) => {
        set({ isLoading: true, error: null })
        try {
          const { user, session } = await authService.signUp(data)
          const profile = await authService.getCurrentUser()
          set({
            user: profile,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors de l\'inscription',
            isLoading: false
          })
          throw error
        }
      },

      // Sign in
      signIn: async (data: SignInData) => {
        set({ isLoading: true, error: null })
        try {
          const { user, session } = await authService.signIn(data)
          const profile = await authService.getCurrentUser()
          set({
            user: profile,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Email ou mot de passe incorrect',
            isLoading: false
          })
          throw error
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true })
        try {
          await authService.signOut()
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors de la déconnexion',
            isLoading: false
          })
        }
      },

      // Sign in with Google
      signInWithGoogle: async () => {
        set({ isLoading: true, error: null })
        try {
          await authService.signInWithGoogle()
          // The redirect will handle the rest
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors de la connexion avec Google',
            isLoading: false
          })
          throw error
        }
      },

      // Sign in with GitHub
      signInWithGitHub: async () => {
        set({ isLoading: true, error: null })
        try {
          await authService.signInWithGitHub()
          // The redirect will handle the rest
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors de la connexion avec GitHub',
            isLoading: false
          })
          throw error
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          await authService.resetPassword(email)
          set({ isLoading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors de la réinitialisation du mot de passe',
            isLoading: false
          })
          throw error
        }
      },

      // Update password
      updatePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null })
        try {
          await authService.updatePassword(newPassword)
          set({ isLoading: false })
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors de la mise à jour du mot de passe',
            isLoading: false
          })
          throw error
        }
      },

      // Update profile
      updateProfile: async (data: Partial<User>) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })
        try {
          const updatedUser = await authService.updateProfile(user.id, data)
          set({
            user: updatedUser,
            isLoading: false
          })
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors de la mise à jour du profil',
            isLoading: false
          })
          throw error
        }
      },

      // Upload avatar
      uploadAvatar: async (file: File) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })
        try {
          const avatarUrl = await authService.uploadAvatar(user.id, file)
          const updatedUser = { ...user, avatar: avatarUrl }
          set({
            user: updatedUser,
            isLoading: false
          })
        } catch (error: any) {
          set({
            error: error.message || 'Erreur lors du téléchargement de l\'avatar',
            isLoading: false
          })
          throw error
        }
      },

      // Check auth status
      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const session = await authService.getSession()
          if (session) {
            const user = await authService.getCurrentUser()
            set({
              user,
              session,
              isAuthenticated: true,
              isLoading: false
            })
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false
            })
          }
        } catch (error) {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check role
      hasRole: (roles: string[]) => {
        const { user } = get()
        return authService.hasRole(user, roles)
      },

      // Check permission
      hasPermission: (permission: string) => {
        const { user } = get()
        return authService.hasPermission(user, permission)
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Subscribe to auth state changes
authService.onAuthStateChange((user) => {
  useAuthStore.setState({
    user,
    isAuthenticated: !!user
  })
})