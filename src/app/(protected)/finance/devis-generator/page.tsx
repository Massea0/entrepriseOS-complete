'use client'

import React from 'react'
import { DevisGeneratorAI } from '@/features/finance/components'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function DevisGeneratorPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Finance', href: '/finance' },
    { label: 'Générateur de Devis IA' }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        heading="Générateur de Devis IA"
        text="Créez des devis intelligents avec l'aide de l'IA"
      />
      <div className="grid gap-4">
        <DevisGeneratorAI />
      </div>
    </div>
  )
}