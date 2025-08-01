import { Deal, DealStage, DealPriority } from '../types/crm.types'

/**
 * CRM Utility Functions
 * Centralizes all CRM-related formatting and calculation utilities
 */

export const CRMUtils = {
  // Stage utilities
  getStageColor: (stage: string) => {
    const colors: Record<string, string> = {
      lead: 'bg-gray-100 text-gray-800',
      qualified: 'bg-blue-100 text-blue-800',
      proposal: 'bg-purple-100 text-purple-800',
      negotiation: 'bg-yellow-100 text-yellow-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800'
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  },

  getStageColorHex: (stage: string) => {
    const colors: Record<string, string> = {
      lead: '#E5E7EB',      // gray-200
      qualified: '#DBEAFE', // blue-100
      proposal: '#E9D5FF',  // purple-100
      negotiation: '#FEF3C7', // yellow-100
      won: '#D1FAE5',       // green-100
      lost: '#FEE2E2'       // red-100
    }
    return colors[stage] || '#E5E7EB'
  },

  // Priority utilities
  getPriorityColor: (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  },

  getDealPriorityColor: (priority: string) => {
    return CRMUtils.getPriorityColor(priority)
  },

  // Deal calculations
  calculateDealScore: (deal: Deal) => {
    const valueScore = Math.min(deal.value.amount / 100000, 1) * 50
    const probabilityScore = (deal.probability / 100) * 50
    return Math.round(valueScore + probabilityScore)
  },

  calculateDealAge: (deal: Deal) => {
    const created = new Date(deal.createdAt)
    const now = new Date()
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    return days
  },

  // Date utilities
  getDaysUntilClose: (closeDate: string | Date) => {
    const close = new Date(closeDate)
    const now = new Date()
    const days = Math.floor((close.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days
  },

  daysUntilClose: (closeDate: string | Date) => {
    return CRMUtils.getDaysUntilClose(closeDate)
  },

  isOverdue: (closeDate: string | Date) => {
    return new Date(closeDate) < new Date()
  },

  isDealOverdue: (deal: Deal) => {
    return deal.expectedCloseDate && new Date(deal.expectedCloseDate) < new Date()
  },

  // Pipeline calculations
  calculateWeightedValue: (deals: Deal[]) => {
    return deals.reduce((total, deal) => {
      const probability = deal.probability || 0
      return total + (deal.value.amount * (probability / 100))
    }, 0)
  },

  calculateWinRate: (deals: Deal[]) => {
    const closedDeals = deals.filter(deal => deal.stage === 'won' || deal.stage === 'lost')
    if (closedDeals.length === 0) return 0
    const wonDeals = closedDeals.filter(deal => deal.stage === 'won')
    return (wonDeals.length / closedDeals.length) * 100
  },

  calculateAverageSalesCycle: (deals: Deal[]) => {
    const closedDeals = deals.filter(deal => 
      (deal.stage === 'won' || deal.stage === 'lost') && deal.actualCloseDate
    )
    if (closedDeals.length === 0) return 0
    
    const totalDays = closedDeals.reduce((sum, deal) => {
      const created = new Date(deal.createdAt)
      const closed = new Date(deal.actualCloseDate!)
      const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)
    
    return Math.round(totalDays / closedDeals.length)
  },

  // Formatting utilities
  formatCurrency: (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  formatContactName: (contact: any) => {
    if (!contact) return 'Aucun contact'
    if (typeof contact === 'string') return `Contact ${contact}`
    if (contact.firstName || contact.lastName) {
      return `${contact.firstName || ''} ${contact.lastName || ''}`.trim()
    }
    return contact.name || 'Contact sans nom'
  }
}

export const FinanceUtils = {
  formatCurrency: CRMUtils.formatCurrency,
  formatMoney: (money: { amount: number; currency: string }) => {
    return CRMUtils.formatCurrency(money.amount, money.currency)
  }
}