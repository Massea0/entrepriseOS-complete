'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { DatePicker } from '@/components/ui/date-picker'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/utils/cn'
import { 
  PlusIcon,
  EditIcon,
  TrashIcon,
  SendIcon,
  FileTextIcon,
  DownloadIcon,
  EyeIcon,
  DollarSignIcon,
  CalendarIcon,
  MoreVerticalIcon,
  CheckIcon,
  XIcon,
  CopyIcon,
  PrinterIcon
} from 'lucide-react'
import type { 
  Invoice,
  Quote,
  Contact,
  Product,
  LineItem,
  Money,
  Currency,
  InvoiceStatus,
  CreateInvoiceRequest,
  TaxRate
} from '../types/finance.types'
// import { FinanceUtils } from '../services/finance.service'

// Temporary utility functions
const FinanceUtils = {
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },
  getInvoiceStatusColor: (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-purple-100 text-purple-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },
  calculateTaxAmount: (subtotal: number, taxRate: number) => {
    return subtotal * (taxRate / 100);
  },
  calculateTotal: (subtotal: number, taxAmount: number) => {
    return subtotal + taxAmount;
  },
  isOverdue: (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false;
    return new Date(dueDate) < new Date();
  },
  getDaysOverdue: (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const days = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  },
  generateInvoiceNumber: () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${year}${month}-${random}`;
  }
};

interface InvoiceManagementProps {
  invoices: Invoice[]
  contacts: Contact[]
  products: Product[]
  taxRates: TaxRate[]
  isLoading?: boolean
  onCreateInvoice?: (data: CreateInvoiceRequest) => Promise<void>
  onUpdateInvoice?: (id: string, data: Partial<Invoice>) => Promise<void>
  onDeleteInvoice?: (id: string) => Promise<void>
  onSendInvoice?: (id: string) => Promise<void>
  onMarkAsPaid?: (id: string) => Promise<void>
  onGeneratePDF?: (id: string) => Promise<void>
  className?: string
}

interface InvoiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateInvoiceRequest) => Promise<void>
  invoice?: Invoice
  contacts: Contact[]
  products: Product[]
  taxRates: TaxRate[]
}

interface LineItemRowProps {
  item: LineItem
  index: number
  products: Product[]
  taxRates: TaxRate[]
  currency: Currency
  onUpdate: (index: number, item: Partial<LineItem>) => void
  onRemove: (index: number) => void
}

// Line item row component for invoice form
const LineItemRow: React.FC<LineItemRowProps> = ({
  item,
  index,
  products,
  taxRates,
  currency,
  onUpdate,
  onRemove
}) => {
  const handleProductChange = useCallback((productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      onUpdate(index, {
        product,
        description: product.name,
        unitPrice: product.unitPrice,
        taxLines: product.defaultTaxRate ? [{
          taxRate: product.defaultTaxRate,
          taxableAmount: FinanceUtils.multiplyMoney(product.unitPrice, item.quantity),
          taxAmount: FinanceUtils.calculateTax(
            FinanceUtils.multiplyMoney(product.unitPrice, item.quantity),
            product.defaultTaxRate.rate
          )
        }] : []
      })
    }
  }, [index, products, onUpdate, item.quantity])

  const calculateLineTotal = useCallback(() => {
    const { total } = FinanceUtils.calculateLineItemTotal(
      item.quantity,
      item.unitPrice,
      item.discountPercent,
      item.taxLines.map(tl => tl.taxRate.rate)
    )
    return total
  }, [item])

  const lineTotal = calculateLineTotal()

  return (
    <TableRow>
      <TableCell className="w-64">
        <Select
          value={item.product?.id || ''}
          onValueChange={handleProductChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un produit" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - {FinanceUtils.formatMoney(product.unitPrice)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      
      <TableCell>
        <Textarea
          value={item.description}
          onChange={(e) => onUpdate(index, { description: e.target.value })}
          placeholder="Description"
          className="min-h-[60px] resize-none"
        />
      </TableCell>
      
      <TableCell className="w-24">
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate(index, { quantity: Number(e.target.value) || 1 })}
          min="1"
          step="1"
        />
      </TableCell>
      
      <TableCell className="w-32">
        <Input
          type="number"
          value={item.unitPrice.amount}
          onChange={(e) => onUpdate(index, { 
            unitPrice: { amount: Number(e.target.value) || 0, currency } 
          })}
          min="0"
          step="0.01"
        />
      </TableCell>
      
      <TableCell className="w-24">
        <Input
          type="number"
          value={item.discountPercent || 0}
          onChange={(e) => onUpdate(index, { discountPercent: Number(e.target.value) || 0 })}
          min="0"
          max="100"
          step="0.1"
        />
      </TableCell>
      
      <TableCell className="w-32">
        <Select
          value={item.taxLines[0]?.taxRate.id || ''}
          onValueChange={(taxRateId) => {
            const taxRate = taxRates.find(tr => tr.id === taxRateId)
            if (taxRate) {
              const taxableAmount = FinanceUtils.subtractMoney(
                FinanceUtils.multiplyMoney(item.unitPrice, item.quantity),
                item.discountAmount || { amount: 0, currency }
              )
              onUpdate(index, {
                taxLines: [{
                  taxRate,
                  taxableAmount,
                  taxAmount: FinanceUtils.calculateTax(taxableAmount, taxRate.rate)
                }]
              })
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="TVA" />
          </SelectTrigger>
          <SelectContent>
            {taxRates.map((rate) => (
              <SelectItem key={rate.id} value={rate.id}>
                {rate.name} ({rate.rate}%)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      
      <TableCell className="w-32 text-right font-medium">
        {FinanceUtils.formatMoney(lineTotal)}
      </TableCell>
      
      <TableCell className="w-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
        >
          <TrashIcon className="h-3 w-3" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

// Invoice form modal
const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  invoice,
  contacts,
  products,
  taxRates
}) => {
  const [formData, setFormData] = useState<{
    contactId: string
    lineItems: LineItem[]
    currency: Currency
    dueDate: Date
    paymentTerms: number
    notes: string
    projectId?: string
  }>({
    contactId: invoice?.contact.id || '',
    lineItems: invoice?.lineItems || [],
    currency: invoice?.currency || 'EUR',
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    paymentTerms: invoice?.paymentTerms || 30,
    notes: invoice?.notes || '',
    projectId: invoice?.projectId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addLineItem = useCallback(() => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: { amount: 0, currency: formData.currency },
      taxLines: [],
      totalAmount: { amount: 0, currency: formData.currency }
    }
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }))
  }, [formData.currency])

  const updateLineItem = useCallback((index: number, updates: Partial<LineItem>) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              ...updates,
              totalAmount: updates.unitPrice || updates.quantity 
                ? FinanceUtils.calculateLineItemTotal(
                    updates.quantity ?? item.quantity,
                    updates.unitPrice ?? item.unitPrice,
                    updates.discountPercent ?? item.discountPercent,
                    (updates.taxLines ?? item.taxLines).map(tl => tl.taxRate.rate)
                  ).total
                : item.totalAmount
            }
          : item
      )
    }))
  }, [])

  const removeLineItem = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }))
  }, [])

  const calculateTotals = useMemo(() => {
    const subtotal = formData.lineItems.reduce((sum, item) => {
      const lineSubtotal = FinanceUtils.multiplyMoney(item.unitPrice, item.quantity)
      return FinanceUtils.addMoney(sum, lineSubtotal)
    }, { amount: 0, currency: formData.currency })

    const totalDiscount = formData.lineItems.reduce((sum, item) => {
      const discount = item.discountAmount || { amount: 0, currency: formData.currency }
      return FinanceUtils.addMoney(sum, discount)
    }, { amount: 0, currency: formData.currency })

    const totalTax = formData.lineItems.reduce((sum, item) => {
      const itemTax = item.taxLines.reduce((taxSum, taxLine) => {
        return FinanceUtils.addMoney(taxSum, taxLine.taxAmount)
      }, { amount: 0, currency: formData.currency })
      return FinanceUtils.addMoney(sum, itemTax)
    }, { amount: 0, currency: formData.currency })

    const total = FinanceUtils.addMoney(
      FinanceUtils.subtractMoney(subtotal, totalDiscount),
      totalTax
    )

    return { subtotal, totalDiscount, totalTax, total }
  }, [formData.lineItems, formData.currency])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || formData.lineItems.length === 0) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        contactId: formData.contactId,
        lineItems: formData.lineItems.map(({ id, ...item }) => item),
        currency: formData.currency,
        dueDate: formData.dueDate,
        paymentTerms: formData.paymentTerms,
        notes: formData.notes,
        projectId: formData.projectId
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit invoice:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <ModalHeader>
          <ModalTitle>
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Client</label>
                <Select
                  value={formData.contactId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contactId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.filter(c => c.type === 'customer' || c.type === 'both').map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name} ({contact.companyName || contact.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Devise</label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as Currency }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="USD">USD - Dollar US</SelectItem>
                    <SelectItem value="GBP">GBP - Livre Sterling</SelectItem>
                    <SelectItem value="CHF">CHF - Franc Suisse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date d'échéance</label>
                <DatePicker
                  value={formData.dueDate}
                  onSelect={(date) => setFormData(prev => ({ 
                    ...prev, 
                    dueDate: date || new Date() 
                  }))}
                />
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Lignes de facturation</h3>
                <Button type="button" onClick={addLineItem} size="sm">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter une ligne
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Remise %</TableHead>
                      <TableHead>TVA</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formData.lineItems.map((item, index) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        index={index}
                        products={products}
                        taxRates={taxRates}
                        currency={formData.currency}
                        onUpdate={updateLineItem}
                        onRemove={removeLineItem}
                      />
                    ))}
                    {formData.lineItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          Aucune ligne de facturation. Cliquez sur "Ajouter une ligne" pour commencer.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Totals */}
            {formData.lineItems.length > 0 && (
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span className="font-medium">{FinanceUtils.formatMoney(calculateTotals.subtotal)}</span>
                  </div>
                  {calculateTotals.totalDiscount.amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Remise:</span>
                      <span>-{FinanceUtils.formatMoney(calculateTotals.totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span className="font-medium">{FinanceUtils.formatMoney(calculateTotals.totalTax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{FinanceUtils.formatMoney(calculateTotals.total)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Conditions de paiement (jours)</label>
                <Input
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    paymentTerms: Number(e.target.value) || 30 
                  }))}
                  min="0"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Projet (optionnel)</label>
                <Input
                  value={formData.projectId || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    projectId: e.target.value || undefined 
                  }))}
                  placeholder="ID du projet"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes additionnelles..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t p-6 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || formData.lineItems.length === 0 || !formData.contactId}
            >
              {isSubmitting ? 'Enregistrement...' : (invoice ? 'Mettre à jour' : 'Créer la facture')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  )
}

// Invoice list table
const InvoiceTable: React.FC<{
  invoices: Invoice[]
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onSend: (invoice: Invoice) => void
  onMarkAsPaid: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  onGeneratePDF: (invoice: Invoice) => void
}> = ({ invoices, onView, onEdit, onSend, onMarkAsPaid, onDelete, onGeneratePDF }) => {
  if (!invoices || invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune facture</h3>
          <p className="text-sm text-muted-foreground">
            Créez votre première facture pour commencer
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Factures</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <div className="font-medium">{invoice.number}</div>
                  {invoice.projectId && (
                    <div className="text-xs text-muted-foreground">
                      Projet: {invoice.projectId}
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="font-medium">{invoice.contact.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {invoice.contact.companyName || invoice.contact.email}
                  </div>
                </TableCell>
                
                <TableCell>
                  {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
                </TableCell>
                
                <TableCell>
                  <div className={cn(
                    'text-sm',
                    FinanceUtils.isOverdue(invoice.dueDate) && invoice.status !== 'paid' && 'text-red-600 font-medium'
                  )}>
                    {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                  </div>
                  {FinanceUtils.isOverdue(invoice.dueDate) && invoice.status !== 'paid' && (
                    <div className="text-xs text-red-600">
                      {FinanceUtils.calculateDaysOverdue(invoice.dueDate)}j de retard
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  <div className="font-medium">
                    {FinanceUtils.formatMoney(invoice.totalAmount)}
                  </div>
                  {invoice.remainingAmount.amount !== invoice.totalAmount.amount && (
                    <div className="text-xs text-orange-600">
                      Reste: {FinanceUtils.formatMoney(invoice.remainingAmount)}
                    </div>
                  )}
                </TableCell>
                
                <TableCell>
                  <Badge className={FinanceUtils.getInvoiceStatusColor(invoice.status)}>
                    {FinanceUtils.formatInvoiceStatus(invoice.status)}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(invoice)}
                      className="h-6 w-6 p-0"
                    >
                      <EyeIcon className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(invoice)}
                      className="h-6 w-6 p-0"
                    >
                      <EditIcon className="h-3 w-3" />
                    </Button>
                    
                    {(invoice.status === 'draft' || invoice.status === 'viewed') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSend(invoice)}
                        className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                      >
                        <SendIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'partial') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsPaid(invoice)}
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                      >
                        <CheckIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onGeneratePDF(invoice)}
                      className="h-6 w-6 p-0"
                    >
                      <DownloadIcon className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// Main Invoice Management component
export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({
  invoices,
  contacts,
  products,
  taxRates,
  isLoading = false,
  onCreateInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onSendInvoice,
  onMarkAsPaid,
  onGeneratePDF,
  className
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Filter invoices by tab
  const filteredInvoices = useMemo(() => {
    switch (activeTab) {
      case 'draft':
        return (invoices || []).filter(inv => inv.status === 'draft')
      case 'sent':
        return (invoices || []).filter(inv => ['sent', 'viewed'].includes(inv.status))
      case 'unpaid':
        return (invoices || []).filter(inv => ['sent', 'viewed', 'partial', 'overdue'].includes(inv.status))
      case 'paid':
        return (invoices || []).filter(inv => inv.status === 'paid')
      case 'overdue':
        return (invoices || []).filter(inv => inv.status === 'overdue')
      default:
        return invoices || []
    }
  }, [invoices, activeTab])

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalAmount = (invoices || []).reduce((sum, inv) => 
      FinanceUtils.addMoney(sum, inv.totalAmount), 
      { amount: 0, currency: 'EUR' }
    )
    
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => FinanceUtils.addMoney(sum, inv.totalAmount), { amount: 0, currency: 'EUR' })
    
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => FinanceUtils.addMoney(sum, inv.remainingAmount), { amount: 0, currency: 'EUR' })

    return { totalAmount, paidAmount, overdueAmount }
  }, [invoices])

  const handleCreateInvoice = async (data: CreateInvoiceRequest) => {
    await onCreateInvoice?.(data)
    setIsFormOpen(false)
    setSelectedInvoice(null)
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des factures</h2>
          <p className="text-sm text-muted-foreground">
            Créez et gérez vos factures
          </p>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle facture
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSignIcon className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {FinanceUtils.formatMoney(summaryStats.totalAmount)}
                </div>
                <div className="text-xs text-muted-foreground">Chiffre d'affaires total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {FinanceUtils.formatMoney(summaryStats.paidAmount)}
                </div>
                <div className="text-xs text-muted-foreground">Montant encaissé</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-8 w-8 text-red-600" />
              <div>
                <div className="text-2xl font-bold">
                  {FinanceUtils.formatMoney(summaryStats.overdueAmount)}
                </div>
                <div className="text-xs text-muted-foreground">En retard</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
                      <TabsTrigger value="all">Toutes ({(invoices || []).length})</TabsTrigger>
          <TabsTrigger value="draft">Brouillons</TabsTrigger>
          <TabsTrigger value="sent">Envoyées</TabsTrigger>
          <TabsTrigger value="unpaid">Impayées</TabsTrigger>
          <TabsTrigger value="overdue">En retard</TabsTrigger>
          <TabsTrigger value="paid">Payées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <InvoiceTable
            invoices={filteredInvoices}
            onView={(invoice) => {
              setSelectedInvoice(invoice)
              setIsViewModalOpen(true)
            }}
            onEdit={(invoice) => {
              setSelectedInvoice(invoice)
              setIsFormOpen(true)
            }}
            onSend={(invoice) => onSendInvoice?.(invoice.id)}
            onMarkAsPaid={(invoice) => onMarkAsPaid?.(invoice.id)}
            onDelete={(invoice) => onDeleteInvoice?.(invoice.id)}
            onGeneratePDF={(invoice) => onGeneratePDF?.(invoice.id)}
          />
        </TabsContent>
      </Tabs>

      {/* Invoice Form Modal */}
      {onCreateInvoice && (
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
        />
      )}

      {/* Invoice View Modal */}
      <Modal open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <ModalContent className="max-w-4xl">
          <ModalHeader>
            <ModalTitle>
              Facture {selectedInvoice?.number}
            </ModalTitle>
          </ModalHeader>
          {selectedInvoice && (
            <div className="p-6 space-y-4">
              {/* Invoice preview content */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Client</h3>
                  <div className="text-sm">
                    <div className="font-medium">{selectedInvoice.contact.name}</div>
                    {selectedInvoice.contact.companyName && (
                      <div>{selectedInvoice.contact.companyName}</div>
                    )}
                    <div>{selectedInvoice.contact.email}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Détails</h3>
                  <div className="text-sm space-y-1">
                    <div>Date: {new Date(selectedInvoice.issueDate).toLocaleDateString('fr-FR')}</div>
                    <div>Échéance: {new Date(selectedInvoice.dueDate).toLocaleDateString('fr-FR')}</div>
                    <div>Statut: <Badge className={FinanceUtils.getInvoiceStatusColor(selectedInvoice.status)}>
                      {FinanceUtils.formatInvoiceStatus(selectedInvoice.status)}
                    </Badge></div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Lignes de facturation</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead>Prix unitaire</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{FinanceUtils.formatMoney(item.unitPrice)}</TableCell>
                        <TableCell>{FinanceUtils.formatMoney(item.totalAmount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{FinanceUtils.formatMoney(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TVA:</span>
                    <span>{FinanceUtils.formatMoney(selectedInvoice.totalTax)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total:</span>
                    <span>{FinanceUtils.formatMoney(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => onGeneratePDF?.(selectedInvoice.id)}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

InvoiceManagement.displayName = 'InvoiceManagement'