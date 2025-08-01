// QuoteList.tsx
// Liste des devis avec DataTable

import React from 'react'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  ArrowUpDown,
  MoreHorizontal,
  Calendar,
  Euro,
  User,
  Building,
  Sparkles
} from 'lucide-react'
import { Quote, QuoteStatus } from '../../types'
import { QuoteStatusBadge } from './QuoteStatusBadge'
import { QuoteActions } from './QuoteActions'

interface QuoteListProps {
  quotes: Quote[]
  isLoading?: boolean
  onQuoteClick?: (quote: Quote) => void
  onSend?: (quoteId: string) => void
  onEdit?: (quoteId: string) => void
  onDuplicate?: (quoteId: string) => void
  onConvertToInvoice?: (quoteId: string) => void
  onDownloadPDF?: (quoteId: string) => void
  onUpdateStatus?: (quoteId: string, status: QuoteStatus) => void
  onDelete?: (quoteId: string) => void
  onEnhanceWithAI?: (quoteId: string) => void
}

export function QuoteList({
  quotes,
  isLoading,
  onQuoteClick,
  onSend,
  onEdit,
  onDuplicate,
  onConvertToInvoice,
  onDownloadPDF,
  onUpdateStatus,
  onDelete,
  onEnhanceWithAI
}: QuoteListProps) {
  const columns: ColumnDef<Quote>[] = React.useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Sélectionner tout"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Sélectionner la ligne"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'quoteNumber',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Numéro
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const quote = row.original
          return (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'font-medium cursor-pointer hover:underline',
                  quote.aiGenerated && 'text-purple-600'
                )}
                onClick={() => onQuoteClick?.(quote)}
              >
                {quote.quoteNumber}
              </div>
              {quote.aiGenerated && (
                <Sparkles className="h-3 w-3 text-purple-600" />
              )}
            </div>
          )
        }
      },
      {
        accessorKey: 'clientName',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Client
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const quote = row.original
          return (
            <div className="flex items-center gap-2">
              {quote.client ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={quote.client.logo} />
                  <AvatarFallback>
                    <Building className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <div className="font-medium">{quote.clientName}</div>
                {quote.clientEmail && (
                  <div className="text-xs text-muted-foreground">
                    {quote.clientEmail}
                  </div>
                )}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => <QuoteStatusBadge status={row.getValue('status')} />
      },
      {
        accessorKey: 'totalAmount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Montant
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('totalAmount'))
          const currency = row.original.currency
          const formatted = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
          }).format(amount)
          
          return (
            <div className="flex items-center gap-1 font-medium">
              <Euro className="h-4 w-4 text-muted-foreground" />
              {formatted}
            </div>
          )
        }
      },
      {
        accessorKey: 'validUntil',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Validité
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue('validUntil') as Date
          const isExpired = date < new Date()
          const daysLeft = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
          
          return (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className={cn(
                  'text-sm',
                  isExpired && 'text-red-600',
                  !isExpired && daysLeft <= 7 && 'text-orange-600'
                )}>
                  {format(date, 'dd MMM yyyy', { locale: fr })}
                </div>
                {!isExpired && daysLeft <= 7 && (
                  <div className="text-xs text-orange-600">
                    {daysLeft} jours restants
                  </div>
                )}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Créé le
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as Date
          return (
            <div className="text-sm text-muted-foreground">
              {format(date, 'dd MMM yyyy', { locale: fr })}
            </div>
          )
        }
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const quote = row.original
          
          return (
            <QuoteActions
              quote={quote}
              onSend={onSend}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onConvertToInvoice={onConvertToInvoice}
              onDownloadPDF={onDownloadPDF}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
              onEnhanceWithAI={onEnhanceWithAI}
            />
          )
        }
      }
    ],
    [
      onQuoteClick,
      onSend,
      onEdit,
      onDuplicate,
      onConvertToInvoice,
      onDownloadPDF,
      onUpdateStatus,
      onDelete,
      onEnhanceWithAI
    ]
  )

  return (
    <DataTable
      columns={columns}
      data={quotes}
      isLoading={isLoading}
      searchKey="clientName"
      searchPlaceholder="Rechercher par client..."
    />
  )
}