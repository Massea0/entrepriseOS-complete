import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
export const signUpSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  company: z.string().optional(),
  role: z.enum(['admin', 'manager', 'employee']).default('employee')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

export const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis')
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide')
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
})

// Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  company?: string
  role: 'admin' | 'manager' | 'employee'
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  firstName: string
  lastName: string
  company?: string
  role?: 'admin' | 'manager' | 'employee'
}

export interface SignInData {
  email: string
  password: string
}

class AuthService {
  // Sign up new user
  async signUp(data: SignUpData) {
    try {
      // Validate input
      const validatedData = signUpSchema.parse({
        ...data,
        confirmPassword: data.password
      })

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            company: validatedData.company,
            role: validatedData.role
          }
        }
      })

      if (authError) throw authError

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            company: validatedData.company,
            role: validatedData.role || 'employee'
          })

        if (profileError) throw profileError
      }

      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  // Sign in existing user
  async signIn(data: SignInData) {
    try {
      // Validate input
      const validatedData = signInSchema.parse(data)

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password
      })

      if (error) throw error

      return { user: authData.user, session: authData.session }
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return {
        id: user.id,
        email: user.email!,
        firstName: profile.first_name,
        lastName: profile.last_name,
        company: profile.company,
        role: profile.role,
        avatar: profile.avatar,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at
      } as User
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Get current session
  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      const validatedData = resetPasswordSchema.parse({ email })

      const { error } = await supabase.auth.resetPasswordForEmail(
        validatedData.email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      )

      if (error) throw error
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  }

  // Update password
  async updatePassword(newPassword: string) {
    try {
      const validatedData = updatePasswordSchema.parse({
        password: newPassword,
        confirmPassword: newPassword
      })

      const { error } = await supabase.auth.updateUser({
        password: validatedData.password
      })

      if (error) throw error
    } catch (error) {
      console.error('Error updating password:', error)
      throw error
    }
  }

  // Update profile
  async updateProfile(userId: string, data: Partial<User>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          company: data.company,
          role: data.role,
          avatar: data.avatar,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      return await this.getCurrentUser()
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile
      await this.updateProfile(userId, { avatar: data.publicUrl })

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  // Sign in with GitHub
  async signInWithGitHub() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in with GitHub:', error)
      throw error
    }
  }

  // Check if user has role
  hasRole(user: User | null, roles: string[]): boolean {
    if (!user) return false
    return roles.includes(user.role)
  }

  // Check if user has permission
  hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false

    // Define permissions by role
    const permissions: Record<string, string[]> = {
      admin: ['*'], // Admin has all permissions
      manager: [
        'view:dashboard',
        'view:finance',
        'edit:finance',
        'view:hr',
        'edit:hr',
        'view:crm',
        'edit:crm',
        'view:inventory',
        'edit:inventory',
        'view:projects',
        'edit:projects'
      ],
      employee: [
        'view:dashboard',
        'view:finance:own',
        'view:hr:own',
        'view:projects:assigned'
      ]
    }

    // Check if user has permission
    const userPermissions = permissions[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()