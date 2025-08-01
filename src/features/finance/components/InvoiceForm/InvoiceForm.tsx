'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Invoice, Contact, Product, TaxRate } from '../../types/finance.types'

interface InvoiceFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  invoice?: Invoice
  contacts?: Contact[]
  products?: Product[]
  taxRates?: TaxRate[]
  isLoading?: boolean
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  invoice,
  contacts = [],
  products = [],
  taxRates = [],
  isLoading = false
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implémenter la logique du formulaire
    const formData = {
      contactId: 'contact-1',
      items: [],
      subtotalAmount: { amount: 0, currency: 'EUR' },
      taxAmount: { amount: 0, currency: 'EUR' },
      totalAmount: { amount: 0, currency: 'EUR' }
    }
    onSubmit(formData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Modifier la facture' : 'Nouvelle facture'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact">Client</Label>
              <Select defaultValue={invoice?.contactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                type="date"
                id="dueDate"
                defaultValue={invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label>Articles</Label>
            <div className="border rounded-md p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Formulaire complet à implémenter...
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}