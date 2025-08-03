import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Download, Mail, Printer, X } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { QuoteItem } from '../../types/quote.types'

interface DevisPreviewProps {
  devis: {
    clientName: string
    clientEmail: string
    items: QuoteItem[]
    totalAmount: number
    validityDays: number
  }
  onClose: () => void
}

export function DevisPreview({ devis, onClose }: DevisPreviewProps) {
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + devis.validityDays)

  const subtotal = devis.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const totalDiscount = devis.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice
    return sum + (item.discount?.type === 'percentage' 
      ? itemTotal * (item.discount.value / 100)
      : (item.discount?.value || 0))
  }, 0)
  const taxAmount = devis.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice
    const afterDiscount = itemTotal - (item.discount?.type === 'percentage' 
      ? itemTotal * (item.discount.value / 100)
      : (item.discount?.value || 0))
    return sum + (afterDiscount * (item.taxRate / 100))
  }, 0)

  const handleExportPDF = () => {
    // TODO: Implémenter l'export PDF
    console.log('Export PDF')
  }

  const handleSendEmail = () => {
    // TODO: Implémenter l'envoi par email
    console.log('Send email')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Aperçu du Devis
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Vérifiez le devis avant de l'envoyer au client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* En-tête du devis */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">DEVIS</h2>
              <p className="text-sm text-muted-foreground">
                N° DEV-{format(new Date(), 'yyyyMMdd')}-001
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {format(new Date(), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                Valide jusqu'au {format(validUntil, 'dd/MM/yyyy')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Informations client */}
          <div>
            <h3 className="font-semibold mb-2">Client</h3>
            <p className="font-medium">{devis.clientName}</p>
            <p className="text-sm text-muted-foreground">{devis.clientEmail}</p>
          </div>

          {/* Détail des articles */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Description</th>
                    <th className="text-right p-4">Qté</th>
                    <th className="text-right p-4">P.U. HT</th>
                    <th className="text-right p-4">Remise</th>
                    <th className="text-right p-4">TVA</th>
                    <th className="text-right p-4">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {devis.items.map((item, index) => {
                    const itemTotal = item.quantity * item.unitPrice
                    const discount = item.discount?.type === 'percentage'
                      ? itemTotal * (item.discount.value / 100)
                      : (item.discount?.value || 0)
                    const afterDiscount = itemTotal - discount
                    
                    return (
                      <tr key={index} className="border-b">
                        <td className="p-4">
                          <p className="font-medium">{item.description}</p>
                        </td>
                        <td className="text-right p-4">{item.quantity}</td>
                        <td className="text-right p-4">{item.unitPrice.toFixed(2)} €</td>
                        <td className="text-right p-4">
                          {item.discount && (
                            <>
                              {item.discount.type === 'percentage' 
                                ? `${item.discount.value}%`
                                : `${item.discount.value.toFixed(2)} €`
                              }
                            </>
                          )}
                        </td>
                        <td className="text-right p-4">{item.taxRate}%</td>
                        <td className="text-right p-4 font-medium">
                          {afterDiscount.toFixed(2)} €
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Sous-total HT</span>
                <span className="font-medium">{subtotal.toFixed(2)} €</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Remise totale</span>
                  <span className="text-red-600">-{totalDiscount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>TVA</span>
                <span className="font-medium">{taxAmount.toFixed(2)} €</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC</span>
                <span>{devis.totalAmount.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Conditions de paiement</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Paiement à 30 jours après réception de facture</li>
                <li>• Acompte de 30% à la commande</li>
                <li>• Pénalités de retard: 10% par mois</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimer
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
            <Button onClick={handleSendEmail} className="ml-auto">
              <Mail className="mr-2 h-4 w-4" />
              Envoyer par email
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}