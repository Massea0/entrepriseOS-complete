import { ReactNode } from 'react'
import { User } from '@/features/auth/types/auth.types'
import { Money, Currency } from '@/features/finance/types/finance.types'

// Contact and Company types
export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner' | 'vendor'
export type ContactSource = 
  | 'website' | 'referral' | 'cold_call' | 'email' | 'social_media' 
  | 'event' | 'advertisement' | 'partner' | 'other'

export type CompanySize = 
  | 'startup' | 'small' | 'medium' | 'large' | 'enterprise'

export type Industry = 
  | 'technology' | 'finance' | 'healthcare' | 'education' | 'manufacturing'
  | 'retail' | 'real_estate' | 'consulting' | 'marketing' | 'legal'
  | 'construction' | 'transportation' | 'hospitality' | 'energy' | 'other'

export interface Contact {
  id: string
  type: ContactType
  
  // Personal info
  firstName: string
  lastName: string
  email: string
  phone?: string
  mobile?: string
  title?: string
  
  // Company association
  company?: Company
  department?: string
  
  // Communication preferences
  preferredContact: 'email' | 'phone' | 'sms'
  timezone: string
  language: string
  
  // Social and web presence
  linkedinUrl?: string
  twitterHandle?: string
  website?: string
  
  // CRM tracking
  source: ContactSource
  tags: string[]
  leadScore: number
  
  // Status and lifecycle
  isActive: boolean
  isQualified: boolean
  lastContactedAt?: Date
  nextFollowUpAt?: Date
  
  // Relationships
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // Custom fields
  customFields: Record<string, any>
  
  // System
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface Company {
  id: string
  name: string
  
  // Basic info
  website?: string
  industry: Industry
  size: CompanySize
  employeeCount?: number
  foundedYear?: number
  
  // Contact details
  primaryEmail?: string
  primaryPhone?: string
  
  // Address
  address: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country: string
  }
  
  // Financial info
  annualRevenue?: Money
  
  // Social presence
  linkedinUrl?: string
  twitterHandle?: string
  
  // CRM tracking
  source: ContactSource
  tags: string[]
  
  // Status
  isActive: boolean
  
  // Relationships
  contacts: Contact[]
  assignedTo?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // Custom fields
  customFields: Record<string, any>
  
  // System
  createdAt: Date
  updatedAt: Date
  notes?: string
}

// Deal and Pipeline types
export type DealStage = 
  | 'lead' | 'qualified' | 'proposal' | 'negotiation' 
  | 'closed_won' | 'closed_lost' | 'on_hold'

export type DealPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Deal {
  id: string
  name: string
  stage: DealStage
  priority: DealPriority
  
  // Financial details
  value: Money
  probability: number // 0-100
  expectedCloseDate: Date
  actualCloseDate?: Date
  
  // Associations
  contact: Contact
  company?: Company
  
  // Tracking
  source: ContactSource
  tags: string[]
  
  // Ownership
  assignedTo: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  team?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>[]
  
  // Pipeline tracking
  pipeline: Pipeline
  stageHistory: DealStageHistory[]
  
  // Activities
  lastActivityAt?: Date
  nextActivityAt?: Date
  
  // Products/Services
  lineItems?: DealLineItem[]
  
  // Documents and attachments
  attachments: Attachment[]
  
  // Status
  isActive: boolean
  lostReason?: string
  
  // Custom fields
  customFields: Record<string, any>
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
  notes?: string
}

export interface DealLineItem {
  id: string
  productId?: string
  name: string
  description?: string
  quantity: number
  unitPrice: Money
  discount?: number
  totalAmount: Money
}

export interface DealStageHistory {
  id: string
  dealId: string
  fromStage?: DealStage
  toStage: DealStage
  changedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  changedAt: Date
  notes?: string
  durationInStage?: number // days
}

export interface Pipeline {
  id: string
  name: string
  description?: string
  
  // Configuration
  stages: PipelineStage[]
  isDefault: boolean
  isActive: boolean
  
  // Ownership
  ownerId: string
  teamAccess: string[] // User IDs
  
  // System
  createdAt: Date
  updatedAt: Date
}

export interface PipelineStage {
  id: string
  name: string
  description?: string
  stage: DealStage
  position: number
  probability: number
  color: string
  
  // Stage behavior
  requiresNote: boolean
  autoMove?: {
    condition: string
    targetStage: DealStage
    delay?: number // days
  }
  
  // System
  isActive: boolean
}

// Activity and Task types
export type ActivityType = 
  | 'call' | 'email' | 'meeting' | 'task' | 'note' | 'sms'
  | 'demo' | 'proposal_sent' | 'contract_sent' | 'payment_received'

export interface Activity {
  id: string
  type: ActivityType
  subject: string
  description?: string
  
  // Timing
  scheduledAt?: Date
  completedAt?: Date
  duration?: number // minutes
  
  // Associations
  contactId?: string
  companyId?: string
  dealId?: string
  
  // Ownership
  assignedTo: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // Status
  isCompleted: boolean
  priority: DealPriority
  
  // Communication details
  communicationMethod?: 'phone' | 'email' | 'video' | 'in_person'
  outcome?: 'positive' | 'neutral' | 'negative'
  followUpRequired?: boolean
  nextFollowUpAt?: Date
  
  // Attachments
  attachments: Attachment[]
  
  // System
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  title: string
  description?: string
  
  // Timing
  dueDate?: Date
  completedAt?: Date
  
  // Associations
  contactId?: string
  companyId?: string
  dealId?: string
  
  // Ownership
  assignedTo: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  
  // Status
  isCompleted: boolean
  priority: DealPriority
  
  // System
  createdAt: Date
  updatedAt: Date
}

// Email and Communication types
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  htmlContent: string
  textContent: string
  
  // Template metadata
  category: 'prospecting' | 'follow_up' | 'proposal' | 'welcome' | 'nurture' | 'other'
  tags: string[]
  
  // Usage tracking
  usageCount: number
  lastUsedAt?: Date
  
  // Personalization
  variables: EmailVariable[]
  
  // Status
  isActive: boolean
  
  // Ownership
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

export interface EmailVariable {
  name: string
  description: string
  defaultValue?: string
  isRequired: boolean
  type: 'text' | 'number' | 'date' | 'boolean'
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  
  // Campaign settings
  template?: EmailTemplate
  sendAt?: Date
  timezone: string
  
  // Targeting
  recipientLists: ContactList[]
  filters: EmailCampaignFilters
  
  // Tracking
  stats: EmailCampaignStats
  
  // Status
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

export interface EmailCampaignFilters {
  contactTypes?: ContactType[]
  sources?: ContactSource[]
  tags?: string[]
  companies?: string[]
  industries?: Industry[]
  leadScore?: {
    min: number
    max: number
  }
  lastContactedBefore?: Date
  lastContactedAfter?: Date
}

export interface EmailCampaignStats {
  totalRecipients: number
  delivered: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  unsubscribed: number
  
  // Rates
  deliveryRate: number
  openRate: number
  clickRate: number
  replyRate: number
  bounceRate: number
  unsubscribeRate: number
}

export interface ContactList {
  id: string
  name: string
  description?: string
  
  // List contents
  contactIds: string[]
  contactCount: number
  
  // Settings
  isActive: boolean
  isStatic: boolean // true for manual lists, false for dynamic
  filters?: EmailCampaignFilters
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

// Sales Forecasting types
export interface SalesForecast {
  id: string
  name: string
  period: ForecastPeriod
  
  // Forecast data
  targetRevenue: Money
  predictedRevenue: Money
  confidence: number // 0-100
  
  // Breakdown
  byStage: ForecastByStage[]
  byUser: ForecastByUser[]
  byProduct: ForecastByProduct[]
  
  // Analysis
  variance: Money
  variancePercentage: number
  lastUpdated: Date
  
  // Configuration
  includeStages: DealStage[]
  minimumProbability: number
  
  // System
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}

export interface ForecastPeriod {
  type: 'month' | 'quarter' | 'year'
  startDate: Date
  endDate: Date
}

export interface ForecastByStage {
  stage: DealStage
  dealCount: number
  totalValue: Money
  weightedValue: Money
  averageProbability: number
}

export interface ForecastByUser {
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
  dealCount: number
  totalValue: Money
  weightedValue: Money
  quota?: Money
  achievement: number // percentage of quota
}

export interface ForecastByProduct {
  productId: string
  productName: string
  dealCount: number
  totalValue: Money
  weightedValue: Money
}

// Analytics and Reporting types
export interface CRMAnalytics {
  period: {
    start: Date
    end: Date
  }
  
  // Contact metrics
  totalContacts: number
  newContacts: number
  qualifiedLeads: number
  conversionRate: number
  
  // Deal metrics
  totalDeals: number
  wonDeals: number
  lostDeals: number
  winRate: number
  averageDealSize: Money
  averageSalesCycle: number // days
  
  // Pipeline metrics
  pipelineValue: Money
  weightedPipelineValue: Money
  averageDealAge: number // days
  
  // Activity metrics
  totalActivities: number
  callsMade: number
  emailsSent: number
  meetingsHeld: number
  
  // Performance metrics
  topPerformers: Array<{
    user: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>
    dealsWon: number
    revenue: Money
    activities: number
  }>
  
  // Trend data
  revenueTrend: Array<{
    date: Date
    amount: Money
  }>
  
  dealsByStage: Record<DealStage, number>
  contactsBySource: Record<ContactSource, number>
}

// Search and Filter types
export interface ContactSearchFilters {
  query?: string
  type?: ContactType[]
  source?: ContactSource[]
  tags?: string[]
  assignedTo?: string[]
  company?: string[]
  leadScore?: {
    min: number
    max: number
  }
  lastContactedBefore?: Date
  lastContactedAfter?: Date
  isQualified?: boolean
  isActive?: boolean
}

export interface DealSearchFilters {
  query?: string
  stage?: DealStage[]
  priority?: DealPriority[]
  assignedTo?: string[]
  source?: ContactSource[]
  tags?: string[]
  value?: {
    min: number
    max: number
    currency: Currency
  }
  probability?: {
    min: number
    max: number
  }
  expectedCloseBefore?: Date
  expectedCloseAfter?: Date
  isActive?: boolean
}

// File attachment type
export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  uploadedAt: Date
}

// API request types
export interface CreateContactRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  title?: string
  companyId?: string
  type: ContactType
  source: ContactSource
  tags?: string[]
  notes?: string
}

export interface CreateCompanyRequest {
  name: string
  website?: string
  industry: Industry
  size: CompanySize
  source: ContactSource
  tags?: string[]
  notes?: string
}

export interface CreateDealRequest {
  name: string
  contactId: string
  companyId?: string
  value: Money
  probability: number
  expectedCloseDate: Date
  stage: DealStage
  priority?: DealPriority
  source: ContactSource
  pipelineId?: string
  tags?: string[]
  notes?: string
}

export interface CreateActivityRequest {
  type: ActivityType
  subject: string
  description?: string
  scheduledAt?: Date
  duration?: number
  contactId?: string
  companyId?: string
  dealId?: string
  priority?: DealPriority
}

export interface CreateTaskRequest {
  title: string
  description?: string
  dueDate?: Date
  contactId?: string
  companyId?: string
  dealId?: string
  assignedToId?: string
  priority?: DealPriority
}

export interface CreateEmailCampaignRequest {
  name: string
  subject: string
  content: string
  templateId?: string
  recipientListIds: string[]
  sendAt?: Date
  filters?: EmailCampaignFilters
}

// Hook return types
export interface UseContactsReturn {
  contacts: Contact[]
  isLoading: boolean
  error: string | null
  createContact: (data: CreateContactRequest) => Promise<Contact>
  updateContact: (id: string, data: Partial<Contact>) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  searchContacts: (filters: ContactSearchFilters) => Promise<Contact[]>
  refresh: () => Promise<void>
}

export interface UseCompaniesReturn {
  companies: Company[]
  isLoading: boolean
  error: string | null
  createCompany: (data: CreateCompanyRequest) => Promise<Company>
  updateCompany: (id: string, data: Partial<Company>) => Promise<Company>
  deleteCompany: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseDealsReturn {
  deals: Deal[]
  isLoading: boolean
  error: string | null
  createDeal: (data: CreateDealRequest) => Promise<Deal>
  updateDeal: (id: string, data: Partial<Deal>) => Promise<Deal>
  deleteDeal: (id: string) => Promise<void>
  moveDeal: (id: string, stage: DealStage, notes?: string) => Promise<Deal>
  searchDeals: (filters: DealSearchFilters) => Promise<Deal[]>
  refresh: () => Promise<void>
}

export interface UseActivitiesReturn {
  activities: Activity[]
  isLoading: boolean
  error: string | null
  createActivity: (data: CreateActivityRequest) => Promise<Activity>
  updateActivity: (id: string, data: Partial<Activity>) => Promise<Activity>
  deleteActivity: (id: string) => Promise<void>
  completeActivity: (id: string, outcome?: string) => Promise<Activity>
  refresh: () => Promise<void>
}

export interface UseTasksReturn {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  createTask: (data: CreateTaskRequest) => Promise<Task>
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<Task>
  refresh: () => Promise<void>
}

export interface UsePipelineReturn {
  pipelines: Pipeline[]
  activePipeline: Pipeline | null
  isLoading: boolean
  error: string | null
  setActivePipeline: (id: string) => void
  createPipeline: (data: Partial<Pipeline>) => Promise<Pipeline>
  updatePipeline: (id: string, data: Partial<Pipeline>) => Promise<Pipeline>
  deletePipeline: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseEmailCampaignsReturn {
  campaigns: EmailCampaign[]
  templates: EmailTemplate[]
  isLoading: boolean
  error: string | null
  createCampaign: (data: CreateEmailCampaignRequest) => Promise<EmailCampaign>
  updateCampaign: (id: string, data: Partial<EmailCampaign>) => Promise<EmailCampaign>
  deleteCampaign: (id: string) => Promise<void>
  sendCampaign: (id: string) => Promise<void>
  pauseCampaign: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export interface UseSalesForecastReturn {
  forecast: SalesForecast | null
  isLoading: boolean
  error: string | null
  generateForecast: (period: ForecastPeriod, config?: Partial<SalesForecast>) => Promise<SalesForecast>
  updateForecast: (id: string, data: Partial<SalesForecast>) => Promise<SalesForecast>
  refresh: () => Promise<void>
}

export interface UseCRMAnalyticsReturn {
  analytics: CRMAnalytics | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  updatePeriod: (start: Date, end: Date) => void
}

// Lead scoring configuration
export interface LeadScoringRule {
  id: string
  name: string
  description: string
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  score: number
  isActive: boolean
}

export interface LeadScoringConfig {
  id: string
  name: string
  rules: LeadScoringRule[]
  maxScore: number
  qualificationThreshold: number
  isActive: boolean
  createdBy: Pick<User, 'id' | 'firstName' | 'lastName'>
  createdAt: Date
  updatedAt: Date
}