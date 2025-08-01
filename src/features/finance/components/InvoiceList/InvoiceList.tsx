'use client'

import React from 'react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { 
  EyeIcon,
  EditIcon,
  SendIcon,
  CheckIcon,
  TrashIcon,
  FileTextIcon,
  MoreVerticalIcon 
} from 'lucide-react'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import type { Invoice } from '../../types/finance.types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, calculateDaysOverdue } from '../../utils/finance.utils'

interface InvoiceListProps {
  invoices: Invoice[]
  onView: (invoice: Invoice) => void
  onEdit: (invoice: Invoice) => void
  onSend: (invoice: Invoice) => void
  onMarkAsPaid: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  onGeneratePDF: (invoice: Invoice) => void
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onView,
  onEdit,
  onSend,
  onMarkAsPaid,
  onDelete,
  onGeneratePDF
}) => {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune facture</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par créer votre première facture.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Échéance</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const daysOverdue = calculateDaysOverdue(invoice.dueDate)
            
            return (
              <TableRow key={invoice.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {invoice.number}
                </TableCell>
                
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar 
                      name={invoice.contact?.name || 'Unknown'} 
                      size="sm" 
                    />
                    <div>
                      <div className="text-sm font-medium">
                        {invoice.contact?.name || 'Contact supprimé'}
                      </div>
                      {invoice.contact?.email && (
                        <div className="text-xs text-gray-500">
                          {invoice.contact.email}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  {formatDate(invoice.date)}
                </TableCell>
                
                <TableCell>
                  <div className="text-sm">
                    {formatDate(invoice.dueDate)}
                    {daysOverdue > 0 && (
                      <div className="text-xs text-red-600">
                        {daysOverdue} jour{daysOverdue > 1 ? 's' : ''} de retard
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell className="font-medium">
                  {formatCurrency(invoice.totalAmount.amount)}
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant="secondary"
                    className={getStatusColor(invoice.status)}
                  >
                    {getStatusLabel(invoice.status)}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(invoice)}>
                        <EyeIcon className="mr-2 h-4 w-4" />
                        Voir
                      </DropdownMenuItem>
                      
                      {invoice.status === 'draft' && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(invoice)}>
                            <EditIcon className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSend(invoice)}>
                            <SendIcon className="mr-2 h-4 w-4" />
                            Envoyer
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      {['sent', 'viewed', 'partial', 'overdue'].includes(invoice.status) && (
                        <DropdownMenuItem onClick={() => onMarkAsPaid(invoice)}>
                          <CheckIcon className="mr-2 h-4 w-4" />
                          Marquer comme payée
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem onClick={() => onGeneratePDF(invoice)}>
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        Télécharger PDF
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem 
                        onClick={() => onDelete(invoice)}
                        className="text-red-600"
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}