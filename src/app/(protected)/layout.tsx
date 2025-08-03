import { AuthLayout } from '@/components/layout/AuthLayout'
import { AppLayout } from '@/components/layout/AppLayout'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLayout>
      <AppLayout>
        {children}
      </AppLayout>
    </AuthLayout>
  )
}