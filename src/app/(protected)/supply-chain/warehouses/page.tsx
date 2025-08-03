'use client'

import React from 'react'
import { WarehouseManager } from '@/features/supply-chain'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function WarehousesPage() {
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Supply Chain', href: '/supply-chain' },
    { label: 'Entrepôts' }
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        heading="Gestion des Entrepôts"
        text="Gérez vos entrepôts et optimisez votre stockage"
      />
      <div className="grid gap-4">
        <WarehouseManager />
      </div>
    </div>
  )
}