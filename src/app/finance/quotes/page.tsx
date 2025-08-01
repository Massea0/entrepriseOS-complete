// page.tsx
// Page de gestion des devis

'use client'

import React from 'react'
import { QuoteManagement } from '@/features/finance/components/quotes'
import { PageHeader } from '@/components/layout/page-header'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { FileText } from 'lucide-react'

export default function QuotesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Finance', href: '/finance' },
          { label: 'Devis', href: '/finance/quotes' }
        ]}
      />
      
      <PageHeader
        title="Gestion des devis"
        description="Créez, gérez et suivez vos devis commerciaux"
        icon={<FileText className="h-8 w-8" />}
      />
      
      <QuoteManagement />
    </div>
  )
}