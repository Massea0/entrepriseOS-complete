'use client'

import React from 'react'
import { FinanceAnalyticsDashboard } from '@/features/finance/components'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function AnalyticsPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Finance', href: '/finance' },
    { label: 'Tableau de Bord Analytique' }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        heading="Tableau de Bord Analytique"
        text="Analytics financières et prédictions IA"
      />
      <div className="grid gap-4">
        <FinanceAnalyticsDashboard />
      </div>
    </div>
  )
}