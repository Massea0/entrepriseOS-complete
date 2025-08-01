// QuoteStatusBadge.tsx
// Badge d'affichage du statut des devis

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { QuoteStatus } from '../../types'
import { cn } from '@/lib/utils'

interface QuoteStatusBadgeProps {
  status: QuoteStatus
  className?: string
}

const statusConfig: Record<QuoteStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  className: string
}> = {
  [QuoteStatus.DRAFT]: {
    label: 'Brouillon',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  },
  [QuoteStatus.SENT]: {
    label: 'Envoyé',
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  },
  [QuoteStatus.VIEWED]: {
    label: 'Consulté',
    variant: 'outline',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300'
  },
  [QuoteStatus.ACCEPTED]: {
    label: 'Accepté',
    variant: 'success',
    className: 'bg-green-100 text-green-800 hover:bg-green-200'
  },
  [QuoteStatus.REJECTED]: {
    label: 'Refusé',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 hover:bg-red-200'
  },
  [QuoteStatus.EXPIRED]: {
    label: 'Expiré',
    variant: 'warning',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200'
  }
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
  const config = statusConfig[status]
  
  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}