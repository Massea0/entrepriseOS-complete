import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import { Deal, DealStage, DealPriority, Contact } from '../types/crm.types'

interface DealFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (deal: Partial<Deal>) => void
  initialDeal?: Deal | null
  initialStage?: DealStage
  contacts: Contact[]
}

export const DealForm: React.FC<DealFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialDeal,
  initialStage,
  contacts
}) => {
  const [formData, setFormData] = useState<Partial<Deal>>({
    name: initialDeal?.name || '',
    stage: initialDeal?.stage || initialStage || 'lead',
    value: initialDeal?.value || { amount: 0, currency: 'EUR' },
    probability: initialDeal?.probability || 10,
    priority: initialDeal?.priority || 'medium',
    contactId: initialDeal?.contactId || '',
    expectedCloseDate: initialDeal?.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: initialDeal?.description || '',
    tags: initialDeal?.tags || []
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const handleChange = (field: keyof Deal, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const priorityOptions: { value: DealPriority; label: string }[] = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
    { value: 'critical', label: 'Critique' }
  ]

  const stageOptions: { value: DealStage; label: string }[] = [
    { value: 'lead', label: 'Prospect' },
    { value: 'qualified', label: 'Qualifié' },
    { value: 'proposal', label: 'Proposition' },
    { value: 'negotiation', label: 'Négociation' },
    { value: 'won', label: 'Gagné' },
    { value: 'lost', label: 'Perdu' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialDeal ? 'Modifier le deal' : 'Nouveau deal'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Deal Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Nom du deal</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Contrat entreprise ABC"
                required
              />
            </div>

            {/* Contact */}
            <div>
              <Label htmlFor="contact">Contact</Label>
              <Select
                value={formData.contactId}
                onValueChange={(value) => handleChange('contactId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map(contact => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} - {contact.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Stage */}
            <div>
              <Label htmlFor="stage">Étape</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => handleChange('stage', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Value */}
            <div>
              <Label htmlFor="value">Valeur (€)</Label>
              <Input
                id="value"
                type="number"
                value={formData.value?.amount || 0}
                onChange={(e) => handleChange('value', { 
                  amount: parseFloat(e.target.value) || 0, 
                  currency: 'EUR' 
                })}
                min="0"
                step="100"
                required
              />
            </div>

            {/* Probability */}
            <div>
              <Label htmlFor="probability">Probabilité (%)</Label>
              <Input
                id="probability"
                type="number"
                value={formData.probability}
                onChange={(e) => handleChange('probability', parseInt(e.target.value) || 0)}
                min="0"
                max="100"
                required
              />
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Expected Close Date */}
            <div>
              <Label htmlFor="expectedCloseDate">Date de clôture prévue</Label>
              <DatePicker
                value={formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined}
                onChange={(date) => handleChange('expectedCloseDate', date?.toISOString())}
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Détails du deal..."
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="col-span-2">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => handleChange('tags', 
                  e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                )}
                placeholder="Ex: IT, Services, Urgent"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {initialDeal ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}