'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { toast } from '@/components/ui/toast'
import { Eye as EyeIcon, EyeOff as EyeOffIcon, Mail as MailIcon, Lock as LockIcon, Shield as ShieldIcon } from 'lucide-react'

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Mot de passe requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 6, 'Le code 2FA doit contenir 6 chiffres')
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
  onForgotPassword?: () => void
  onRegister?: () => void
  className?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onForgotPassword,
  onRegister,
  className
}) => {
  const { login, verifyTwoFactor, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      twoFactorCode: ''
    }
  })

  const handleLogin = async (data: LoginFormData) => {
    try {
      clearErrors()

      if (requiresTwoFactor && data.twoFactorCode) {
        // Verify 2FA code
        await verifyTwoFactor({
          code: data.twoFactorCode,
          type: 'authenticator'
        })
        
        toast.success('Connexion réussie !')
        onSuccess?.()
      } else {
        // Initial login
        await login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe
        })
        
        if (error === 'two_factor_required') {
          setRequiresTwoFactor(true)
          toast.info('Veuillez saisir votre code de vérification à deux facteurs')
        } else {
          toast.success('Connexion réussie !')
          onSuccess?.()
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur de connexion'
      
      if (errorMessage.includes('email')) {
        setError('email', { message: errorMessage })
      } else if (errorMessage.includes('password')) {
        setError('password', { message: errorMessage })
      } else if (errorMessage.includes('2fa') || errorMessage.includes('two factor')) {
        setError('twoFactorCode', { message: 'Code de vérification invalide' })
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleBackToLogin = () => {
    setRequiresTwoFactor(false)
    clearErrors()
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {requiresTwoFactor ? 'Vérification en deux étapes' : 'Connexion'}
        </CardTitle>
        {requiresTwoFactor ? (
          <p className="text-sm text-muted-foreground text-center">
            Saisissez le code de vérification généré par votre application d'authentification
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center">
            Connectez-vous à votre compte pour accéder au dashboard
          </p>
        )}
      </CardHeader>

      <form onSubmit={handleSubmit(handleLogin)}>
        <CardContent className="space-y-4">
          {error && !requiresTwoFactor && (
            <Alert variant="destructive">
              {error === 'two_factor_required' 
                ? 'Authentification à deux facteurs requise'
                : error
              }
            </Alert>
          )}

          {!requiresTwoFactor ? (
            <>
              {/* Email */}
              <div className="space-y-2">
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="Email"
                  leftElement={<MailIcon className="h-4 w-4" />}
                  error={!!errors.email}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mot de passe"
                  leftElement={<LockIcon className="h-4 w-4" />}
                  rightElement={
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="h-8 w-8 p-0"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  }
                  error={!!errors.password}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Remember me */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  {...register('rememberMe')}
                  disabled={isLoading}
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Se souvenir de moi
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Two Factor Code */}
              <div className="space-y-2">
                <Input
                  {...register('twoFactorCode')}
                  type="text"
                  placeholder="Code de vérification (6 chiffres)"
                  leftElement={<ShieldIcon className="h-4 w-4" />}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  error={!!errors.twoFactorCode}
                  disabled={isLoading}
                  autoFocus
                />
                {errors.twoFactorCode && (
                  <p className="text-sm text-destructive">{errors.twoFactorCode.message}</p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleBackToLogin}
                className="w-full"
                disabled={isLoading}
              >
                Retour à la connexion
              </Button>
            </>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {requiresTwoFactor ? 'Vérifier le code' : 'Se connecter'}
          </Button>

          {!requiresTwoFactor && (
            <>
              <div className="flex items-center justify-between w-full text-sm">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onForgotPassword}
                  className="p-0 h-auto font-normal text-muted-foreground hover:text-primary"
                >
                  Mot de passe oublié ?
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={onRegister}
                  className="p-0 h-auto font-normal text-muted-foreground hover:text-primary"
                >
                  Créer un compte
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}