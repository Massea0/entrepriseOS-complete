'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  EditIcon, 
  SendIcon, 
  CheckIcon, 
  FileTextIcon,
  PrinterIcon 
} from 'lucide-react'
import type { Invoice } from '../../types/finance.types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../utils/finance.utils'

interface InvoiceViewProps {
  isOpen: boolean
  onClose: () => void
  invoice: Invoice
  onEdit: () => void
  onSend: () => void
  onMarkAsPaid: () => void
  onGeneratePDF: () => void
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  isOpen,
  onClose,
  invoice,
  onEdit,
  onSend,
  onMarkAsPaid,
  onGeneratePDF
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl">
                Facture {invoice.number}
              </DialogTitle>
              <Badge className={`mt-2 ${getStatusColor(invoice.status)}`}>
                {getStatusLabel(invoice.status)}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={onGeneratePDF}>
                <PrinterIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations client */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Client</h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{invoice.contact?.name}</p>
                {invoice.contact?.email && <p>{invoice.contact.email}</p>}
                {invoice.contact?.phone && <p>{invoice.contact.phone}</p>}
                {invoice.contact?.address && (
                  <>
                    <p>{invoice.contact.address}</p>
                    <p>{invoice.contact.postalCode} {invoice.contact.city}</p>
                    <p>{invoice.contact.country}</p>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <h4 className="font-semibold mb-2">Détails</h4>
              <div className="text-sm space-y-1">
                <p>Date: {formatDate(invoice.date)}</p>
                <p>Échéance: {formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Articles */}
          <div>
            <h4 className="font-semibold mb-2">Articles</h4>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Qté</th>
                  <th className="text-right py-2">Prix unit.</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{item.description}</td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-2">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="text-right py-2">Sous-total:</td>
                  <td className="text-right py-2 font-medium">
                    {formatCurrency(invoice.subtotalAmount.amount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="text-right py-2">TVA:</td>
                  <td className="text-right py-2 font-medium">
                    {formatCurrency(invoice.taxAmount.amount)}
                  </td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={3} className="text-right py-2">Total:</td>
                  <td className="text-right py-2">
                    {formatCurrency(invoice.totalAmount.amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h4 className="font-semibold mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{invoice.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
          
          {invoice.status === 'draft' && (
            <>
              <Button variant="outline" onClick={onEdit}>
                <EditIcon className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button onClick={onSend}>
                <SendIcon className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </>
          )}
          
          {['sent', 'viewed', 'partial', 'overdue'].includes(invoice.status) && (
            <Button onClick={onMarkAsPaid}>
              <CheckIcon className="h-4 w-4 mr-2" />
              Marquer comme payée
            </Button>
          )}
          
          <Button onClick={onGeneratePDF}>
            <FileTextIcon className="h-4 w-4 mr-2" />
            Télécharger PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}