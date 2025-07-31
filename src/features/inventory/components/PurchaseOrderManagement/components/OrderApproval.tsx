import React, { useState } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

import { OrderApprovalProps } from '../PurchaseOrderManagement.types'

const REJECTION_REASONS = [
  'Prix trop élevé',
  'Fournisseur non approuvé',
  'Budget dépassé',
  'Produit non conforme',
  'Conditions de paiement inacceptables',
  'Délai de livraison trop long',
  'Autre (préciser)'
]

export const OrderApproval: React.FC<OrderApprovalProps> = ({
  order,
  approvalLevels,
  currentUser,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve')
  const [rejectionReason, setRejectionReason] = useState('')
  const [comment, setComment] = useState('')

  const nextLevel = (order.currentApprovalLevel || 0) + 1
  const currentApprovalLevel = approvalLevels.find(l => l.level === nextLevel)
  const isAuthorized = currentApprovalLevel?.approvers.some(a => a.id === currentUser.id)

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(nextLevel)
    } else {
      const reason = rejectionReason === 'Autre (préciser)' ? comment : rejectionReason
      onReject(reason || 'Rejeté')
    }
  }

  if (!isAuthorized) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Vous n'êtes pas autorisé à approuver cette commande au niveau {nextLevel}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card className="p-4 bg-muted/50">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Commande</span>
            <span className="font-mono">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Fournisseur</span>
            <span>{order.supplier?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Montant total</span>
            <span className="font-semibold">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: order.totalAmount?.currency || 'EUR'
              }).format(order.totalAmount?.amount || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Niveau d'approbation</span>
            <span className="font-medium">{currentApprovalLevel?.name}</span>
          </div>
        </div>
      </Card>

      {/* Action Selection */}
      <div className="space-y-4">
        <Label>Action</Label>
        <RadioGroup value={action} onValueChange={(v) => setAction(v as any)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approve" id="approve" />
            <Label
              htmlFor="approve"
              className="flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              Approuver la commande
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reject" id="reject" />
            <Label
              htmlFor="reject"
              className="flex items-center gap-2 cursor-pointer"
            >
              <XCircle className="h-4 w-4 text-red-600" />
              Rejeter la commande
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Rejection Reason */}
      {action === 'reject' && (
        <div className="space-y-4">
          <Label>Raison du rejet</Label>
          <RadioGroup value={rejectionReason} onValueChange={setRejectionReason}>
            {REJECTION_REASONS.map(reason => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason} className="cursor-pointer">
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">
          {action === 'reject' && rejectionReason === 'Autre (préciser)' 
            ? 'Précisez la raison *' 
            : 'Commentaire (optionnel)'}
        </Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            action === 'approve' 
              ? 'Ajoutez un commentaire...'
              : 'Expliquez la raison du rejet...'
          }
          rows={3}
        />
      </div>

      {/* Warning for rejection */}
      {action === 'reject' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le rejet de cette commande nécessitera de reprendre le processus d'approbation depuis le début.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => window.history.back()}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            isLoading || 
            (action === 'reject' && !rejectionReason) ||
            (action === 'reject' && rejectionReason === 'Autre (préciser)' && !comment)
          }
          variant={action === 'reject' ? 'destructive' : 'default'}
        >
          {isLoading ? (
            <>
              <Spinner size="sm" className="mr-2" />
              {action === 'approve' ? 'Approbation...' : 'Rejet...'}
            </>
          ) : (
            <>
              {action === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeter
                </>
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}