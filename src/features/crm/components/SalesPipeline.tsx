'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'
import { 
  PlusIcon,
  MoreVerticalIcon,
  CalendarIcon,
  UserIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertCircleIcon,
  PhoneIcon,
  MailIcon,
  FileTextIcon,
  ClockIcon
} from 'lucide-react'
import type { 
  Deal,
  Pipeline,
  DealStage,
  DealPriority,
  Contact,
  CreateDealRequest
} from '../types/crm.types'
// import { CRMUtils } from '../services/crm.service'
// import { FinanceUtils } from '@/features/finance/services/finance.service'

// Temporary utility functions
const CRMUtils = {
  getStageColor: (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  },
  getStageColorHex: (stage: string) => {
    const colors: Record<string, string> = {
      lead: '#E5E7EB',      // gray-200
      qualified: '#DBEAFE', // blue-100
      proposal: '#E9D5FF',  // purple-100
      negotiation: '#FEF3C7', // yellow-100
      won: '#D1FAE5',       // green-100
      lost: '#FEE2E2'       // red-100
    };
    return colors[stage] || '#E5E7EB';
  },
  getPriorityColor: (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  },
  calculateDealScore: (deal: any) => {
    // Simple scoring based on value and probability
    const valueScore = Math.min(deal.value / 100000, 1) * 50;
    const probabilityScore = (deal.probability / 100) * 50;
    return Math.round(valueScore + probabilityScore);
  },
  formatCurrency: (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  },
  getDaysUntilClose: (closeDate: string | Date) => {
    const close = new Date(closeDate);
    const now = new Date();
    const days = Math.floor((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  },
  daysUntilClose: (closeDate: string | Date) => {
    return CRMUtils.getDaysUntilClose(closeDate);
  },
  isOverdue: (closeDate: string | Date) => {
    return new Date(closeDate) < new Date();
  },
  isDealOverdue: (deal: any) => {
    // Check if the expected close date has passed
    return deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date();
  },
  calculateDealAge: (deal: any) => {
    // Calculate days since deal creation
    const created = new Date(deal.createdAt);
    const now = new Date();
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  },
  calculateWeightedValue: (deals: Deal[]) => {
    // Calculate weighted pipeline value based on deal stage probability
    return deals.reduce((total, deal) => {
      const probability = deal.probability || 0;
      return total + (deal.value.amount * (probability / 100));
    }, 0);
  },
  calculateWinRate: (deals: Deal[]) => {
    // Calculate win rate percentage
    const closedDeals = deals.filter(deal => deal.stage === 'won' || deal.stage === 'lost');
    if (closedDeals.length === 0) return 0;
    const wonDeals = closedDeals.filter(deal => deal.stage === 'won');
    return (wonDeals.length / closedDeals.length) * 100;
  },
  calculateAverageSalesCycle: (deals: Deal[]) => {
    // Calculate average days from creation to closing
    const closedDeals = deals.filter(deal => 
      (deal.stage === 'won' || deal.stage === 'lost') && deal.actualCloseDate
    );
    if (closedDeals.length === 0) return 0;
    
    const totalDays = closedDeals.reduce((sum, deal) => {
      const created = new Date(deal.createdAt);
      const closed = new Date(deal.actualCloseDate!);
      const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);
    
    return Math.round(totalDays / closedDeals.length);
  },
  formatContactName: (contact: any) => {
    // Handle both contact object and contactId
    if (!contact) return 'Aucun contact';
    if (typeof contact === 'string') return `Contact ${contact}`;
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
    }
    return contact.name || 'Contact sans nom';
  }
};

const FinanceUtils = {
  formatCurrency: CRMUtils.formatCurrency
};

interface SalesPipelineProps {
  pipeline?: Pipeline
  deals?: Deal[]
  contacts?: Contact[]
  isLoading?: boolean
  onCreateDeal?: (data: CreateDealRequest) => Promise<void>
  onUpdateDeal?: (id: string, data: Partial<Deal>) => Promise<void>
  onMoveDeal?: (id: string, stage: DealStage, notes?: string) => Promise<void>
  onDeleteDeal?: (id: string) => Promise<void>
  className?: string
}

interface DealCardProps {
  deal: any  // Simplified for mock data
  contacts: Contact[]
  onEdit?: (deal: any) => void
  onView?: (deal: any) => void
  onMove?: (dealId: string, stage: DealStage) => void
  className?: string
}

interface PipelineStageProps {
  stage: {
    id: string
    name: string
    stage: DealStage
    color: string
    probability: number
  }
  deals: any[]  // Simplified for mock data
  contacts: Contact[]
  onDrop?: (dealId: string, stage: DealStage) => void
  onAddDeal?: (stage: DealStage) => void
  onDealEdit?: (deal: any) => void
  onDealView?: (deal: any) => void
}

interface DealFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateDealRequest) => Promise<void>
  deal?: Deal
  contacts: Contact[]
  initialStage?: DealStage
}

// Deal card component
const DealCard: React.FC<DealCardProps> = ({ deal, contacts, onEdit, onView, onMove, className }) => {
  const [isDragging, setIsDragging] = useState(false)
  
  const daysUntilClose = CRMUtils.daysUntilClose(deal.expectedCloseDate)
  const isOverdue = CRMUtils.isDealOverdue(deal)
  const dealAge = CRMUtils.calculateDealAge(deal)

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('text/plain', deal.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <Card 
      className={cn(
        'group cursor-pointer transition-all duration-200 hover:shadow-md border-l-4',
        isDragging && 'opacity-50 rotate-1 shadow-lg',
        isOverdue && 'border-l-red-500 bg-red-50',
        !isOverdue && deal.priority === 'urgent' && 'border-l-red-400 bg-red-50',
        !isOverdue && deal.priority === 'high' && 'border-l-orange-400',
        !isOverdue && deal.priority === 'medium' && 'border-l-yellow-400',
        !isOverdue && deal.priority === 'low' && 'border-l-blue-400',
        className
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onView?.(deal)}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary">
              {deal.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
                              {CRMUtils.formatContactName(
                  contacts.find(c => c.id === deal.contactId) || deal.contact || deal.contactId
                )}
            </p>
            {deal.company && (
              <p className="text-xs text-muted-foreground">
                {deal.company.name}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <Badge className={CRMUtils.getDealPriorityColor(deal.priority)}>
              {deal.priority}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.(deal)
              }}
            >
              <MoreVerticalIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Value and Probability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-lg font-bold">
            <DollarSignIcon className="h-4 w-4 text-green-600" />
            <span>{FinanceUtils.formatMoney(deal.value)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {deal.probability}% prob.
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <Progress value={deal.probability} className="h-2" />
        </div>

        {/* Timeline info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3" />
            <span>
              {isOverdue ? (
                <span className="text-red-600 font-medium">
                  {Math.abs(daysUntilClose)}j retard
                </span>
              ) : daysUntilClose > 0 ? (
                `${daysUntilClose}j restant`
              ) : (
                'Aujourd\'hui'
              )}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <ClockIcon className="h-3 w-3" />
            <span>{dealAge}j en cours</span>
          </div>
        </div>

        {/* Assignee and last activity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar
              name={`${deal.assignedTo.firstName} ${deal.assignedTo.lastName}`}
              src={deal.assignedTo.avatar}
              size="xs"
            />
            <span className="text-xs text-muted-foreground">
              {deal.assignedTo.firstName}
            </span>
          </div>
          
          {deal.lastActivityAt && (
            <div className="text-xs text-muted-foreground">
              Activité: {new Date(deal.lastActivityAt).toLocaleDateString('fr-FR', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation()
              // Handle call
            }}
          >
            <PhoneIcon className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation()
              // Handle email
            }}
          >
            <MailIcon className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
            onClick={(e) => {
              e.stopPropagation()
              // Handle note
            }}
          >
            <FileTextIcon className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Pipeline stage component
const PipelineStage: React.FC<PipelineStageProps> = ({
  stage,
  deals,
  contacts,
  onDrop,
  onAddDeal,
  onDealEdit,
  onDealView
}) => {
  const [isDragOver, setIsDragOver] = useState(false)

  const stageValue = useMemo(() => {
    return deals.reduce((sum, deal) => sum + deal.value.amount, 0)
  }, [deals])

  const weightedValue = useMemo(() => {
    return deals.reduce((sum, deal) => sum + (deal.value.amount * deal.probability / 100), 0)
  }, [deals])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const dealId = e.dataTransfer.getData('text/plain')
    if (dealId) {
      onDrop?.(dealId, stage.stage)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <div className="flex-1 min-w-[320px] max-w-[380px]">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: stage.color }}
                />
                <span>{stage.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {deals.length}
                </Badge>
              </CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Probabilité: {stage.probability}%
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddDeal?.(stage.stage)}
              className="h-6 w-6 p-0"
            >
              <PlusIcon className="h-3 w-3" />
            </Button>
          </div>

          {/* Stage metrics */}
          <div className="space-y-1 mt-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Valeur totale:</span>
              <span className="font-medium">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  notation: 'compact'
                }).format(stageValue)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Valeur pondérée:</span>
              <span className="font-medium text-green-600">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  notation: 'compact'
                }).format(weightedValue)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent 
          className={cn(
            'pt-0 min-h-[500px] space-y-3',
            isDragOver && 'bg-primary/5 border-2 border-dashed border-primary rounded-lg'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              contacts={contacts}
              onEdit={onDealEdit}
              onView={onDealView}
            />
          ))}

          {deals.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm">Aucun deal</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddDeal?.(stage.stage)}
                className="mt-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter un deal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Deal form modal
const DealForm: React.FC<DealFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  deal,
  contacts,
  initialStage = 'lead'
}) => {
  const [formData, setFormData] = useState<{
    name: string
    contactId: string
    companyId?: string
    value: { amount: number; currency: string }
    probability: number
    expectedCloseDate: Date
    stage: DealStage
    priority: DealPriority
    source: string
    tags: string[]
    notes: string
  }>({
    name: deal?.name || '',
    contactId: deal?.contact.id || '',
    companyId: deal?.company?.id,
    value: deal?.value || { amount: 0, currency: 'EUR' },
    probability: deal?.probability || 50,
    expectedCloseDate: deal?.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    stage: deal?.stage || initialStage,
    priority: deal?.priority || 'medium',
    source: deal?.source || 'website',
    tags: deal?.tags || [],
    notes: deal?.notes || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedContact = useMemo(() => {
    return contacts.find(c => c.id === formData.contactId)
  }, [contacts, formData.contactId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)
      await onSubmit({
        name: formData.name,
        contactId: formData.contactId,
        companyId: formData.companyId,
        value: formData.value as any,
        probability: formData.probability,
        expectedCloseDate: formData.expectedCloseDate,
        stage: formData.stage,
        priority: formData.priority,
        source: formData.source as any,
        tags: formData.tags,
        notes: formData.notes
      })
      onClose()
    } catch (error) {
      console.error('Failed to submit deal:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>
            {deal ? 'Modifier le deal' : 'Nouveau deal'}
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Deal name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nom du deal</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nom descriptif du deal"
              required
            />
          </div>

          {/* Contact selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Contact</label>
            <Select
              value={formData.contactId}
              onValueChange={(value) => {
                const contact = contacts.find(c => c.id === value)
                setFormData(prev => ({ 
                  ...prev, 
                  contactId: value,
                  companyId: contact?.company?.id
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div>
                      <div className="font-medium">
                        {CRMUtils.formatContactName(contact)}
                      </div>
                      {contact.company && (
                        <div className="text-xs text-muted-foreground">
                          {contact.company.name}
                        </div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedContact && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <div className="font-medium">{CRMUtils.formatContactName(selectedContact)}</div>
                <div>{selectedContact.email}</div>
                {selectedContact.company && (
                  <div>{selectedContact.company.name}</div>
                )}
              </div>
            )}
          </div>

          {/* Value and probability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Valeur (€)</label>
              <Input
                type="number"
                value={formData.value.amount}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  value: { ...prev.value, amount: Number(e.target.value) || 0 }
                }))}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Probabilité (%)</label>
              <Input
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  probability: Number(e.target.value) || 0 
                }))}
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Stage and priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Étape</label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  stage: value as DealStage 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualifié</SelectItem>
                  <SelectItem value="proposal">Proposition</SelectItem>
                  <SelectItem value="negotiation">Négociation</SelectItem>
                  <SelectItem value="closed_won">Gagné</SelectItem>
                  <SelectItem value="closed_lost">Perdu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priorité</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  priority: value as DealPriority 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expected close date */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date de clôture prévue</label>
            <Input
              type="date"
              value={formData.expectedCloseDate.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                expectedCloseDate: new Date(e.target.value) 
              }))}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Notes</label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md text-sm resize-none"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes additionnelles..."
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.contactId}
            >
              {isSubmitting ? 'Enregistrement...' : (deal ? 'Mettre à jour' : 'Créer le deal')}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  )
}

// Default mock data
const DEFAULT_PIPELINE: Pipeline = {
  id: 'default-pipeline',
  name: 'Pipeline Commercial',
  stages: [
    { id: 'lead', name: 'Prospect', order: 1, probability: 10 },
    { id: 'qualified', name: 'Qualifié', order: 2, probability: 25 },
    { id: 'proposal', name: 'Proposition', order: 3, probability: 50 },
    { id: 'negotiation', name: 'Négociation', order: 4, probability: 75 },
    { id: 'won', name: 'Gagné', order: 5, probability: 100 },
    { id: 'lost', name: 'Perdu', order: 6, probability: 0 }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Mock deals for demonstration - simplified version
const MOCK_DEALS: any[] = [
  {
    id: '1',
    name: 'Contrat Entreprise ABC',
    stage: 'lead',
    value: { amount: 50000, currency: 'EUR' },
    probability: 10,
    priority: 'high',
    contactId: '1',
    companyId: '1',
    ownerId: 'mock-user-admin',
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Nouveau contrat pour services IT',
    tags: ['IT', 'Services'],
    activities: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Projet Migration Cloud XYZ',
    stage: 'qualified',
    value: { amount: 120000, currency: 'EUR' },
    probability: 25,
    priority: 'medium',
    contactId: '2',
    companyId: '2',
    ownerId: 'mock-user-admin',
    expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Migration infrastructure cloud',
    tags: ['Cloud', 'Infrastructure'],
    activities: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Renouvellement Licence Software Corp',
    stage: 'proposal',
    value: { amount: 75000, currency: 'EUR' },
    probability: 50,
    priority: 'high',
    contactId: '3',
    companyId: '3',
    ownerId: 'mock-user-admin',
    expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Renouvellement annuel des licences',
    tags: ['Renouvellement', 'Licences'],
    activities: [],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Consulting Transformation Digitale',
    stage: 'negotiation',
    value: { amount: 200000, currency: 'EUR' },
    probability: 75,
    priority: 'critical',
    contactId: '4',
    companyId: '4',
    ownerId: 'mock-user-admin',
    expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Accompagnement transformation digitale sur 12 mois',
    tags: ['Consulting', 'Digital'],
    activities: [],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Mock contacts
const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dupont',
    email: 'marie.dupont@abc.com',
    phone: '+33 1 23 45 67 89',
    companyId: '1',
    position: 'Directrice IT',
    isPrimary: true,
    tags: ['Decision Maker'],
    lastContactDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@xyz.com',
    phone: '+33 1 98 76 54 32',
    companyId: '2',
    position: 'CTO',
    isPrimary: true,
    tags: ['Technical', 'Decision Maker'],
    lastContactDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@software.com',
    phone: '+33 1 11 22 33 44',
    companyId: '3',
    position: 'Responsable Achats',
    isPrimary: true,
    tags: ['Procurement'],
    lastContactDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    firstName: 'Pierre',
    lastName: 'Dubois',
    email: 'pierre.dubois@enterprise.com',
    phone: '+33 1 55 66 77 88',
    companyId: '4',
    position: 'PDG',
    isPrimary: true,
    tags: ['Executive', 'Decision Maker'],
    lastContactDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Main Sales Pipeline component
export const SalesPipeline: React.FC<SalesPipelineProps> = ({
  pipeline = DEFAULT_PIPELINE,
  deals = MOCK_DEALS,
  contacts = MOCK_CONTACTS,
  isLoading = false,
  onCreateDeal,
  onUpdateDeal,
  onMoveDeal,
  onDeleteDeal,
  className
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [selectedStage, setSelectedStage] = useState<DealStage>('lead')
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  // Group deals by stage
  const dealsByStage = useMemo(() => {
    const grouped: Record<DealStage, Deal[]> = {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: []
    }
    
    if (deals && Array.isArray(deals)) {
      deals.forEach(deal => {
        if (grouped[deal.stage]) {
          grouped[deal.stage].push(deal)
        }
      })
    }
    
    return grouped
  }, [deals])

  // Calculate pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const safeDeals = deals || []
    const totalValue = safeDeals.reduce((sum, deal) => sum + deal.value.amount, 0)
    const weightedValue = CRMUtils.calculateWeightedValue(safeDeals)
    const winRate = CRMUtils.calculateWinRate(safeDeals)
    const averageDealSize = safeDeals.length > 0 ? totalValue / safeDeals.length : 0
    const averageSalesCycle = CRMUtils.calculateAverageSalesCycle(safeDeals)

    return {
      totalValue,
      weightedValue,
      winRate,
      averageDealSize,
      averageSalesCycle,
      totalDeals: safeDeals.length
    }
  }, [deals])

  const handleDealDrop = useCallback(async (dealId: string, newStage: DealStage) => {
    try {
      await onMoveDeal?.(dealId, newStage)
    } catch (error) {
      console.error('Failed to move deal:', error)
    }
  }, [onMoveDeal])

  const handleCreateDeal = async (data: CreateDealRequest) => {
    await onCreateDeal?.(data)
    setIsFormOpen(false)
    setSelectedDeal(null)
  }

  const handleAddDeal = (stage: DealStage) => {
    setSelectedStage(stage)
    setSelectedDeal(null)
    setIsFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="flex space-x-4 overflow-x-auto">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 min-w-[320px] h-96" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de ventes</h2>
          <p className="text-sm text-muted-foreground">
            {pipeline.name} • {pipelineMetrics.totalDeals} deal{pipelineMetrics.totalDeals !== 1 ? 's' : ''}
          </p>
        </div>

        <Button onClick={() => handleAddDeal('lead')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau deal
        </Button>
      </div>

      {/* Pipeline metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSignIcon className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    notation: 'compact'
                  }).format(pipelineMetrics.totalValue)}
                </div>
                <div className="text-xs text-muted-foreground">Valeur totale</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    notation: 'compact'
                  }).format(pipelineMetrics.weightedValue)}
                </div>
                <div className="text-xs text-muted-foreground">Valeur pondérée</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUpIcon className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.round(pipelineMetrics.winRate)}%
                </div>
                <div className="text-xs text-muted-foreground">Taux de gain</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSignIcon className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    notation: 'compact'
                  }).format(pipelineMetrics.averageDealSize)}
                </div>
                <div className="text-xs text-muted-foreground">Deal moyen</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {pipelineMetrics.averageSalesCycle}j
                </div>
                <div className="text-xs text-muted-foreground">Cycle de vente</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline stages */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {pipeline.stages.map((stage) => (
          <PipelineStage
            key={stage.id}
            stage={{
              id: stage.id,
              name: stage.name,
              stage: stage.id as DealStage,
              color: CRMUtils.getStageColorHex(stage.id),
              probability: stage.probability
            }}
            deals={dealsByStage[stage.id as DealStage] || []}
            contacts={contacts}
            onDrop={handleDealDrop}
            onAddDeal={handleAddDeal}
            onDealEdit={(deal) => {
              setSelectedDeal(deal)
              setIsFormOpen(true)
            }}
            onDealView={(deal) => {
              setSelectedDeal(deal)
              setIsViewModalOpen(true)
            }}
          />
        ))}
      </div>

      {/* Deal Form Modal */}
      {onCreateDeal && (
        <DealForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false)
            setSelectedDeal(null)
          }}
          onSubmit={handleCreateDeal}
          deal={selectedDeal || undefined}
          contacts={contacts}
          initialStage={selectedStage}
        />
      )}

      {/* Deal View Modal */}
      <Modal open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <ModalContent className="max-w-4xl">
          <ModalHeader>
            <ModalTitle>
              Deal: {selectedDeal?.name}
            </ModalTitle>
          </ModalHeader>
          {selectedDeal && (
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Contact</h3>
                  <div className="text-sm">
                    <div className="font-medium">
                      {CRMUtils.formatContactName(
                        contacts.find(c => c.id === selectedDeal.contactId) || 
                        selectedDeal.contact || 
                        selectedDeal.contactId
                      )}
                    </div>
                    <div>
                      {(contacts.find(c => c.id === selectedDeal.contactId) || selectedDeal.contact)?.email || 
                       'Email non disponible'}
                    </div>
                    {selectedDeal.company && (
                      <div className="text-muted-foreground">{selectedDeal.company.name}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Détails</h3>
                  <div className="text-sm space-y-1">
                    <div>Valeur: {FinanceUtils.formatMoney(selectedDeal.value)}</div>
                    <div>Probabilité: {selectedDeal.probability}%</div>
                    <div>Étape: <Badge className={CRMUtils.getDealStageColor(selectedDeal.stage)}>
                      {CRMUtils.formatDealStage(selectedDeal.stage)}
                    </Badge></div>
                    <div>Priorité: <Badge className={CRMUtils.getDealPriorityColor(selectedDeal.priority)}>
                      {selectedDeal.priority}
                    </Badge></div>
                    <div>Clôture prévue: {new Date(selectedDeal.expectedCloseDate).toLocaleDateString('fr-FR')}</div>
                  </div>
                </div>
              </div>

              {selectedDeal.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedDeal.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={() => {
                  setIsViewModalOpen(false)
                  setIsFormOpen(true)
                }}>
                  Modifier
                </Button>
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

SalesPipeline.displayName = 'SalesPipeline'