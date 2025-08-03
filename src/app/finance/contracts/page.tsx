'use client'

import React from 'react'
import { ContractWizard } from '@/features/finance/components'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function ContractsPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Finance', href: '/finance' },
    { label: 'Gestion des Contrats' }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        heading="Gestion des Contrats"
        text="Créez et gérez vos contrats avec l'assistant IA"
      />
      <div className="grid gap-4">
        <ContractWizard />
      </div>
    </div>
  )
}