'use client'

import React from 'react'
import { RiskAnalysisDashboard } from '@/features/finance/components'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function RiskAnalysisPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Finance', href: '/finance' },
    { label: 'Analyse des Risques' }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        heading="Analyse des Risques"
        text="Dashboard consolidé de gestion des risques contractuels"
      />
      <div className="grid gap-4">
        <RiskAnalysisDashboard />
      </div>
    </div>
  )
}