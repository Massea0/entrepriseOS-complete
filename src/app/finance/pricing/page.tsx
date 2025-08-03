'use client'

import React from 'react'
import { PricingOptimizer } from '@/features/finance/components'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function PricingPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Finance', href: '/finance' },
    { label: 'Optimisation des Prix' }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        heading="Optimisation des Prix"
        text="Optimisez vos prix avec l'intelligence artificielle"
      />
      <div className="grid gap-4">
        <PricingOptimizer />
      </div>
    </div>
  )
}