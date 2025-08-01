import { DealStage, DealPriority } from '../types/crm.types'

/**
 * CRM Constants
 * Centralized configuration for the CRM module
 */

// Stage configuration
export const DEAL_STAGES: Record<DealStage, { label: string; color: string; hexColor: string }> = {
  lead: {
    label: 'Prospect',
    color: 'bg-gray-100 text-gray-800',
    hexColor: '#E5E7EB'
  },
  qualified: {
    label: 'Qualifié',
    color: 'bg-blue-100 text-blue-800',
    hexColor: '#DBEAFE'
  },
  proposal: {
    label: 'Proposition',
    color: 'bg-purple-100 text-purple-800',
    hexColor: '#E9D5FF'
  },
  negotiation: {
    label: 'Négociation',
    color: 'bg-yellow-100 text-yellow-800',
    hexColor: '#FEF3C7'
  },
  won: {
    label: 'Gagné',
    color: 'bg-green-100 text-green-800',
    hexColor: '#D1FAE5'
  },
  lost: {
    label: 'Perdu',
    color: 'bg-red-100 text-red-800',
    hexColor: '#FEE2E2'
  }
}

// Priority configuration
export const DEAL_PRIORITIES: Record<DealPriority, { label: string; color: string }> = {
  low: {
    label: 'Faible',
    color: 'bg-gray-100 text-gray-800'
  },
  medium: {
    label: 'Moyenne',
    color: 'bg-blue-100 text-blue-800'
  },
  high: {
    label: 'Haute',
    color: 'bg-orange-100 text-orange-800'
  },
  critical: {
    label: 'Critique',
    color: 'bg-red-100 text-red-800'
  }
}

// Currency configuration
export const DEFAULT_CURRENCY = 'EUR'
export const CURRENCY_LOCALE = 'fr-FR'

// Deal configuration
export const DEFAULT_DEAL_PROBABILITY = 10
export const DEFAULT_DEAL_DAYS_UNTIL_CLOSE = 30
export const MAX_DEAL_PROBABILITY = 100
export const MIN_DEAL_PROBABILITY = 0

// Pipeline configuration
export const DEFAULT_PIPELINE_NAME = 'Pipeline Commercial'

// Filter configuration
export const FILTER_OPTIONS = {
  priority: [
    { value: 'all', label: 'Toutes' },
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
    { value: 'critical', label: 'Critique' }
  ],
  owner: [
    { value: 'all', label: 'Tous' },
    { value: 'mock-user-admin', label: 'Admin' },
    { value: 'mock-user-manager', label: 'Manager' }
  ]
}

// Metric thresholds
export const METRIC_THRESHOLDS = {
  goodWinRate: 50,      // Win rate >= 50% is considered good
  warningDaysUntilClose: 7,  // Deals closing in < 7 days need attention
  overdueColor: 'text-red-600',
  normalColor: 'text-gray-600'
}

// Grid configuration
export const GRID_CONFIG = {
  mobile: 'grid-cols-1',
  tablet: 'md:grid-cols-3',
  desktop: 'lg:grid-cols-6'
}

// Animation configuration
export const ANIMATION_CONFIG = {
  dragOverScale: 'scale-[1.02]',
  dragOpacity: 'opacity-50',
  hoverShadow: 'hover:shadow-md',
  transitionDuration: 'duration-200'
}