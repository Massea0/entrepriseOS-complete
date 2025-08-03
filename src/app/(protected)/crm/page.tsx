import { LeadScoringDashboard } from '@/features/crm/components/LeadScoringDashboard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'

export default function CRMPage() {
  const breadcrumbItems = [
    { label: 'CRM', href: '/crm' }
  ]

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />
      <PageHeader
        title="CRM Intelligent"
        description="Gestion de la relation client augmentée par l'IA"
      />
      <LeadScoringDashboard />
    </div>
  )
}