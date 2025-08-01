'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusIcon, RefreshCwIcon } from 'lucide-react'
import { InvoiceList } from './InvoiceList/InvoiceList'
import { FinanceMetrics } from './FinanceMetrics/FinanceMetrics'
import { InvoiceForm } from './InvoiceForm/InvoiceForm'
import { InvoiceView } from './InvoiceView/InvoiceView'
import { useInvoices } from '../hooks/useInvoices'
import type { Invoice, Contact, Product, TaxRate } from '../types/finance.types'
import { cn } from '@/utils/cn'

interface InvoiceManagementProps {
  contacts?: Contact[]
  products?: Product[]
  taxRates?: TaxRate[]
  className?: string
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({
  contacts = [],
  products = [],
  taxRates = [],
  className
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  
  const {
    invoices,
    isLoading,
    stats,
    activeTab,
    setActiveTab,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
    markAsPaid,
    generatePDF,
    refetch,
    isCreating,
    isUpdating
  } = useInvoices()

  const handleCreateInvoice = async (data: any) => {
    if (selectedInvoice) {
      await updateInvoice(selectedInvoice.id, data)
    } else {
      await createInvoice(data)
    }
    setIsFormOpen(false)
    setSelectedInvoice(null)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Factures</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button
            onClick={() => {
              setSelectedInvoice(null)
              setIsFormOpen(true)
            }}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <FinanceMetrics
        totalAmount={stats.totalAmount}
        paidAmount={stats.paidAmount}
        overdueAmount={stats.overdueAmount}
        invoiceCount={stats.invoiceCount}
      />

      {/* Tabs and List */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="all" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Toutes ({stats.invoiceCount.total})
                </TabsTrigger>
                <TabsTrigger 
                  value="draft"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Brouillons ({stats.invoiceCount.draft})
                </TabsTrigger>
                <TabsTrigger 
                  value="sent"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Envoyées ({stats.invoiceCount.sent})
                </TabsTrigger>
                <TabsTrigger 
                  value="unpaid"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Impayées
                </TabsTrigger>
                <TabsTrigger 
                  value="overdue"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  En retard ({stats.invoiceCount.overdue})
                </TabsTrigger>
                <TabsTrigger 
                  value="paid"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  Payées ({stats.invoiceCount.paid})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              <InvoiceList
                invoices={invoices}
                onView={handleViewInvoice}
                onEdit={handleEditInvoice}
                onSend={(invoice) => sendInvoice(invoice.id)}
                onMarkAsPaid={(invoice) => markAsPaid(invoice.id)}
                onDelete={(invoice) => deleteInvoice(invoice.id)}
                onGeneratePDF={(invoice) => generatePDF(invoice.id)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <InvoiceForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedInvoice(null)
          }}
          onSubmit={handleCreateInvoice}
          invoice={selectedInvoice || undefined}
          contacts={contacts}
          products={products}
          taxRates={taxRates}
          isLoading={isCreating || isUpdating}
        />
      )}

      {/* View Modal */}
      {isViewModalOpen && selectedInvoice && (
        <InvoiceView
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setSelectedInvoice(null)
          }}
          invoice={selectedInvoice}
          onEdit={() => {
            setIsViewModalOpen(false)
            handleEditInvoice(selectedInvoice)
          }}
          onSend={() => sendInvoice(selectedInvoice.id)}
          onMarkAsPaid={() => markAsPaid(selectedInvoice.id)}
          onGeneratePDF={() => generatePDF(selectedInvoice.id)}
        />
      )}
    </div>
  )
}