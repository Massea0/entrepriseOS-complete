import { DeliveryTracker } from '@/features/supply-chain/components/DeliveryTracker'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function DeliveriesPage() {
  const breadcrumbItems = [
    { label: 'Supply Chain', href: '/supply-chain' },
    { label: 'Livraisons', href: '/supply-chain/deliveries' }
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="Suivi des Livraisons"
        description="Suivez vos livraisons en temps réel avec prédictions IA"
      />
      <DeliveryTracker />
    </div>
  )
}