// QuoteActions.tsx
// Actions rapides pour les devis

import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  MoreHorizontal,
  Send,
  Eye,
  Edit,
  Copy,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Trash2,
  Sparkles
} from 'lucide-react'
import { Quote, QuoteStatus } from '../../types'
import { toast } from '@/hooks/use-toast'

interface QuoteActionsProps {
  quote: Quote
  onSend?: (quoteId: string) => void
  onEdit?: (quoteId: string) => void
  onDuplicate?: (quoteId: string) => void
  onConvertToInvoice?: (quoteId: string) => void
  onDownloadPDF?: (quoteId: string) => void
  onUpdateStatus?: (quoteId: string, status: QuoteStatus) => void
  onDelete?: (quoteId: string) => void
  onEnhanceWithAI?: (quoteId: string) => void
}

export function QuoteActions({
  quote,
  onSend,
  onEdit,
  onDuplicate,
  onConvertToInvoice,
  onDownloadPDF,
  onUpdateStatus,
  onDelete,
  onEnhanceWithAI
}: QuoteActionsProps) {
  const isDraft = quote.status === QuoteStatus.DRAFT
  const isSent = quote.status === QuoteStatus.SENT
  const isAccepted = quote.status === QuoteStatus.ACCEPTED
  const canDelete = isDraft
  const canEdit = isDraft
  const canSend = isDraft || quote.status === QuoteStatus.VIEWED
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        
        {/* Actions principales */}
        {canSend && onSend && (
          <DropdownMenuItem onClick={() => onSend(quote.id)}>
            <Send className="mr-2 h-4 w-4" />
            Envoyer
          </DropdownMenuItem>
        )}
        
        {canEdit && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(quote.id)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
        )}
        
        {onDuplicate && (
          <DropdownMenuItem onClick={() => onDuplicate(quote.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Dupliquer
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Actions IA */}
        {!isAccepted && onEnhanceWithAI && (
          <DropdownMenuItem onClick={() => onEnhanceWithAI(quote.id)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Améliorer avec l'IA
          </DropdownMenuItem>
        )}
        
        {/* Conversion */}
        {isAccepted && onConvertToInvoice && (
          <DropdownMenuItem onClick={() => onConvertToInvoice(quote.id)}>
            <FileText className="mr-2 h-4 w-4" />
            Convertir en facture
          </DropdownMenuItem>
        )}
        
        {/* Export */}
        {onDownloadPDF && (
          <DropdownMenuItem onClick={() => onDownloadPDF(quote.id)}>
            <Download className="mr-2 h-4 w-4" />
            Télécharger PDF
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Changement de statut */}
        {isSent && onUpdateStatus && (
          <>
            <DropdownMenuItem
              onClick={() => onUpdateStatus(quote.id, QuoteStatus.ACCEPTED)}
              className="text-green-600"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Marquer comme accepté
            </DropdownMenuItem>
            
            <DropdownMenuItem
              onClick={() => onUpdateStatus(quote.id, QuoteStatus.REJECTED)}
              className="text-red-600"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Marquer comme refusé
            </DropdownMenuItem>
          </>
        )}
        
        {/* Suppression */}
        {canDelete && onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
                  onDelete(quote.id)
                }
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}