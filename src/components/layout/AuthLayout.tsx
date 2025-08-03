'use client'

import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute'

interface AuthLayoutProps {
  children: React.ReactNode
  requiredRoles?: string[]
  requiredPermission?: string
}

export function AuthLayout({ children, requiredRoles, requiredPermission }: AuthLayoutProps) {
  return (
    <ProtectedRoute
      requiredRoles={requiredRoles}
      requiredPermission={requiredPermission}
    >
      {children}
    </ProtectedRoute>
  )
}