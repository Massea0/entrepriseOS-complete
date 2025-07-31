import { ky } from '@/services/api'
import type {
  User,
  AuthTokens,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  TwoFactorSetupData,
  TwoFactorVerificationData,
  InviteData,
  OnboardingData
} from '../types/auth.types'

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export class AuthService {
  private static readonly ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    
    // Profile
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    
    // Two Factor
    SETUP_2FA: '/auth/2fa/setup',
    ENABLE_2FA: '/auth/2fa/enable',
    DISABLE_2FA: '/auth/2fa/disable',
    VERIFY_2FA: '/auth/2fa/verify',
    GENERATE_BACKUP_CODES: '/auth/2fa/backup-codes',
    
    // Admin
    INVITE_USER: '/auth/invite',
    
    // Onboarding
    ONBOARDING: '/auth/onboarding',
    COMPLETE_ONBOARDING: '/auth/onboarding/complete'
  } as const

  /**
   * Login user with credentials
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await ky.post(this.ENDPOINTS.LOGIN, {
      json: credentials
    }).json<AuthResponse>()
    
    return response
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await ky.post(this.ENDPOINTS.REGISTER, {
      json: data
    }).json<AuthResponse>()
    
    return response
  }

  /**
   * Logout current user
   */
  static async logout(refreshToken?: string): Promise<void> {
    await ky.post(this.ENDPOINTS.LOGOUT, {
      json: { refreshToken }
    })
  }

  /**
   * Refresh access token
   */
  static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await ky.post(this.ENDPOINTS.REFRESH, {
      json: { refreshToken }
    }).json<AuthTokens>()
    
    return response
  }

  /**
   * Send forgot password email
   */
  static async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await ky.post(this.ENDPOINTS.FORGOT_PASSWORD, {
      json: data
    })
  }

  /**
   * Reset password with token
   */
  static async resetPassword(data: ResetPasswordData): Promise<void> {
    await ky.post(this.ENDPOINTS.RESET_PASSWORD, {
      json: data
    })
  }

  /**
   * Change current user password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    await ky.post(this.ENDPOINTS.CHANGE_PASSWORD, {
      json: data
    })
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<User> {
    const response = await ky.get(this.ENDPOINTS.PROFILE).json<User>()
    return response
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await ky.patch(this.ENDPOINTS.UPDATE_PROFILE, {
      json: data
    }).json<User>()
    
    return response
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<void> {
    await ky.post(this.ENDPOINTS.VERIFY_EMAIL, {
      json: { token }
    })
  }

  /**
   * Resend email verification
   */
  static async resendEmailVerification(): Promise<void> {
    await ky.post(this.ENDPOINTS.RESEND_VERIFICATION)
  }

  // Two Factor Authentication

  /**
   * Setup 2FA for user
   */
  static async setupTwoFactor(): Promise<TwoFactorSetupData> {
    const response = await ky.post(this.ENDPOINTS.SETUP_2FA).json<TwoFactorSetupData>()
    return response
  }

  /**
   * Enable 2FA with verification code
   */
  static async enableTwoFactor(code: string): Promise<{ backupCodes: string[] }> {
    const response = await ky.post(this.ENDPOINTS.ENABLE_2FA, {
      json: { code }
    }).json<{ backupCodes: string[] }>()
    
    return response
  }

  /**
   * Disable 2FA
   */
  static async disableTwoFactor(password: string): Promise<void> {
    await ky.post(this.ENDPOINTS.DISABLE_2FA, {
      json: { password }
    })
  }

  /**
   * Verify 2FA code during login
   */
  static async verifyTwoFactor(data: TwoFactorVerificationData): Promise<AuthResponse> {
    const response = await ky.post(this.ENDPOINTS.VERIFY_2FA, {
      json: data
    }).json<AuthResponse>()
    
    return response
  }

  /**
   * Generate new backup codes
   */
  static async generateBackupCodes(): Promise<{ backupCodes: string[] }> {
    const response = await ky.post(this.ENDPOINTS.GENERATE_BACKUP_CODES).json<{ backupCodes: string[] }>()
    return response
  }

  // Admin functions

  /**
   * Invite user to organization
   */
  static async inviteUser(data: InviteData): Promise<void> {
    await ky.post(this.ENDPOINTS.INVITE_USER, {
      json: data
    })
  }

  // Onboarding

  /**
   * Get onboarding data
   */
  static async getOnboarding(): Promise<OnboardingData> {
    const response = await ky.get(this.ENDPOINTS.ONBOARDING).json<OnboardingData>()
    return response
  }

  /**
   * Update onboarding step
   */
  static async updateOnboarding(data: Partial<OnboardingData>): Promise<OnboardingData> {
    const response = await ky.patch(this.ENDPOINTS.ONBOARDING, {
      json: data
    }).json<OnboardingData>()
    
    return response
  }

  /**
   * Complete onboarding
   */
  static async completeOnboarding(): Promise<void> {
    await ky.post(this.ENDPOINTS.COMPLETE_ONBOARDING)
  }
}

// Token management utilities
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token'
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token'
  private static readonly TOKEN_EXPIRES_KEY = 'token_expires_at'

  /**
   * Store tokens in localStorage
   */
  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken)
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken)
    localStorage.setItem(this.TOKEN_EXPIRES_KEY, tokens.expiresAt.toISOString())
  }

  /**
   * Get tokens from localStorage
   */
  static getTokens(): AuthTokens | null {
    const accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY)
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY)
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY)

    if (!accessToken || !refreshToken || !expiresAt) {
      return null
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(expiresAt)
    }
  }

  /**
   * Remove tokens from localStorage
   */
  static clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY)
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY)
  }

  /**
   * Check if tokens are expired
   */
  static isTokenExpired(): boolean {
    const tokens = this.getTokens()
    if (!tokens) return true

    return new Date() >= tokens.expiresAt
  }

  /**
   * Check if tokens will expire soon (within 5 minutes)
   */
  static willTokenExpireSoon(): boolean {
    const tokens = this.getTokens()
    if (!tokens) return true

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    return fiveMinutesFromNow >= tokens.expiresAt
  }
}