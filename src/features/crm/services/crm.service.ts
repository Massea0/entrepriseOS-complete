import { ky } from '@/services/api'
import type {
  Contact,
  Company,
  Deal,
  Activity,
  Task,
  Pipeline,
  EmailTemplate,
  EmailCampaign,
  ContactList,
  SalesForecast,
  CRMAnalytics,
  LeadScoringConfig,
  CreateContactRequest,
  CreateCompanyRequest,
  CreateDealRequest,
  CreateActivityRequest,
  CreateTaskRequest,
  CreateEmailCampaignRequest,
  ContactSearchFilters,
  DealSearchFilters,
  ContactType,
  ContactSource,
  DealStage,
  DealPriority,
  ActivityType,
  ForecastPeriod,
  Industry,
  CompanySize
} from '../types/crm.types'

/**
 * CRM Service
 * Handles all CRM-related API calls
 */
export class CRMService {
  private static readonly ENDPOINTS = {
    // Contacts
    CONTACTS: '/contacts',
    CONTACT_BY_ID: (id: string) => `/contacts/${id}`,
    SEARCH_CONTACTS: '/contacts/search',
    IMPORT_CONTACTS: '/contacts/import',
    EXPORT_CONTACTS: '/contacts/export',
    MERGE_CONTACTS: '/contacts/merge',
    
    // Companies
    COMPANIES: '/companies',
    COMPANY_BY_ID: (id: string) => `/companies/${id}`,
    COMPANY_CONTACTS: (id: string) => `/companies/${id}/contacts`,
    
    // Deals
    DEALS: '/deals',
    DEAL_BY_ID: (id: string) => `/deals/${id}`,
    SEARCH_DEALS: '/deals/search',
    MOVE_DEAL: (id: string) => `/deals/${id}/move`,
    DEAL_HISTORY: (id: string) => `/deals/${id}/history`,
    DEAL_ACTIVITIES: (id: string) => `/deals/${id}/activities`,
    
    // Pipeline
    PIPELINES: '/pipelines',
    PIPELINE_BY_ID: (id: string) => `/pipelines/${id}`,
    PIPELINE_DEALS: (id: string) => `/pipelines/${id}/deals`,
    
    // Activities
    ACTIVITIES: '/activities',
    ACTIVITY_BY_ID: (id: string) => `/activities/${id}`,
    COMPLETE_ACTIVITY: (id: string) => `/activities/${id}/complete`,
    UPCOMING_ACTIVITIES: '/activities/upcoming',
    OVERDUE_ACTIVITIES: '/activities/overdue',
    
    // Tasks
    TASKS: '/tasks',
    TASK_BY_ID: (id: string) => `/tasks/${id}`,
    COMPLETE_TASK: (id: string) => `/tasks/${id}/complete`,
    MY_TASKS: '/tasks/mine',
    
    // Email Templates
    EMAIL_TEMPLATES: '/email-templates',
    EMAIL_TEMPLATE_BY_ID: (id: string) => `/email-templates/${id}`,
    
    // Email Campaigns
    EMAIL_CAMPAIGNS: '/email-campaigns',
    EMAIL_CAMPAIGN_BY_ID: (id: string) => `/email-campaigns/${id}`,
    SEND_CAMPAIGN: (id: string) => `/email-campaigns/${id}/send`,
    PAUSE_CAMPAIGN: (id: string) => `/email-campaigns/${id}/pause`,
    CAMPAIGN_STATS: (id: string) => `/email-campaigns/${id}/stats`,
    
    // Contact Lists
    CONTACT_LISTS: '/contact-lists',
    CONTACT_LIST_BY_ID: (id: string) => `/contact-lists/${id}`,
    ADD_TO_LIST: (listId: string) => `/contact-lists/${listId}/contacts`,
    REMOVE_FROM_LIST: (listId: string, contactId: string) => `/contact-lists/${listId}/contacts/${contactId}`,
    
    // Sales Forecasting
    SALES_FORECASTS: '/sales-forecasts',
    GENERATE_FORECAST: '/sales-forecasts/generate',
    FORECAST_BY_ID: (id: string) => `/sales-forecasts/${id}`,
    
    // Analytics
    CRM_ANALYTICS: '/analytics/crm',
    SALES_ANALYTICS: '/analytics/sales',
    ACTIVITY_ANALYTICS: '/analytics/activities',
    CONVERSION_FUNNEL: '/analytics/conversion-funnel',
    
    // Lead Scoring
    LEAD_SCORING: '/lead-scoring',
    LEAD_SCORING_BY_ID: (id: string) => `/lead-scoring/${id}`,
    CALCULATE_LEAD_SCORE: (contactId: string) => `/contacts/${contactId}/score`,
    
    // Reporting
    REPORTS: '/reports/crm',
    EXPORT_REPORT: (type: string) => `/reports/crm/${type}/export`,
    
    // File uploads
    UPLOAD_ATTACHMENT: '/uploads/crm-attachment'
  } as const

  // Contact Management

  /**
   * Get all contacts
   */
  static async getContacts(params?: {
    type?: ContactType[]
    source?: ContactSource[]
    assignedTo?: string[]
    tags?: string[]
    isQualified?: boolean
    page?: number
    limit?: number
  }): Promise<{ contacts: Contact[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.CONTACTS}?${searchParams.toString()}`).json<{
      contacts: Contact[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Get contact by ID
   */
  static async getContact(id: string): Promise<Contact> {
    const response = await ky.get(this.ENDPOINTS.CONTACT_BY_ID(id)).json<Contact>()
    return response
  }

  /**
   * Create new contact
   */
  static async createContact(data: CreateContactRequest): Promise<Contact> {
    const response = await ky.post(this.ENDPOINTS.CONTACTS, {
      json: data
    }).json<Contact>()
    return response
  }

  /**
   * Update contact
   */
  static async updateContact(id: string, data: Partial<Contact>): Promise<Contact> {
    const response = await ky.patch(this.ENDPOINTS.CONTACT_BY_ID(id), {
      json: data
    }).json<Contact>()
    return response
  }

  /**
   * Delete contact
   */
  static async deleteContact(id: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.CONTACT_BY_ID(id))
  }

  /**
   * Search contacts
   */
  static async searchContacts(filters: ContactSearchFilters): Promise<Contact[]> {
    const response = await ky.post(this.ENDPOINTS.SEARCH_CONTACTS, {
      json: filters
    }).json<Contact[]>()
    return response
  }

  /**
   * Import contacts from CSV
   */
  static async importContacts(file: File, mapping: Record<string, string>): Promise<{
    imported: number
    failed: number
    errors: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('mapping', JSON.stringify(mapping))

    const response = await ky.post(this.ENDPOINTS.IMPORT_CONTACTS, {
      body: formData
    }).json<{
      imported: number
      failed: number
      errors: string[]
    }>()
    
    return response
  }

  /**
   * Merge duplicate contacts
   */
  static async mergeContacts(primaryId: string, duplicateIds: string[]): Promise<Contact> {
    const response = await ky.post(this.ENDPOINTS.MERGE_CONTACTS, {
      json: { primaryId, duplicateIds }
    }).json<Contact>()
    return response
  }

  // Company Management

  /**
   * Get all companies
   */
  static async getCompanies(params?: {
    industry?: Industry[]
    size?: CompanySize[]
    assignedTo?: string[]
    tags?: string[]
    page?: number
    limit?: number
  }): Promise<{ companies: Company[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.COMPANIES}?${searchParams.toString()}`).json<{
      companies: Company[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new company
   */
  static async createCompany(data: CreateCompanyRequest): Promise<Company> {
    const response = await ky.post(this.ENDPOINTS.COMPANIES, {
      json: data
    }).json<Company>()
    return response
  }

  /**
   * Update company
   */
  static async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const response = await ky.patch(this.ENDPOINTS.COMPANY_BY_ID(id), {
      json: data
    }).json<Company>()
    return response
  }

  /**
   * Get company contacts
   */
  static async getCompanyContacts(companyId: string): Promise<Contact[]> {
    const response = await ky.get(this.ENDPOINTS.COMPANY_CONTACTS(companyId)).json<Contact[]>()
    return response
  }

  // Deal Management

  /**
   * Get all deals
   */
  static async getDeals(params?: {
    stage?: DealStage[]
    priority?: DealPriority[]
    assignedTo?: string[]
    pipelineId?: string
    tags?: string[]
    page?: number
    limit?: number
  }): Promise<{ deals: Deal[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.DEALS}?${searchParams.toString()}`).json<{
      deals: Deal[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Get deal by ID
   */
  static async getDeal(id: string): Promise<Deal> {
    const response = await ky.get(this.ENDPOINTS.DEAL_BY_ID(id)).json<Deal>()
    return response
  }

  /**
   * Create new deal
   */
  static async createDeal(data: CreateDealRequest): Promise<Deal> {
    const response = await ky.post(this.ENDPOINTS.DEALS, {
      json: data
    }).json<Deal>()
    return response
  }

  /**
   * Update deal
   */
  static async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    const response = await ky.patch(this.ENDPOINTS.DEAL_BY_ID(id), {
      json: data
    }).json<Deal>()
    return response
  }

  /**
   * Move deal to different stage
   */
  static async moveDeal(id: string, stage: DealStage, notes?: string): Promise<Deal> {
    const response = await ky.post(this.ENDPOINTS.MOVE_DEAL(id), {
      json: { stage, notes }
    }).json<Deal>()
    return response
  }

  /**
   * Get deal stage history
   */
  static async getDealHistory(id: string): Promise<any[]> {
    const response = await ky.get(this.ENDPOINTS.DEAL_HISTORY(id)).json<any[]>()
    return response
  }

  /**
   * Get deal activities
   */
  static async getDealActivities(id: string): Promise<Activity[]> {
    const response = await ky.get(this.ENDPOINTS.DEAL_ACTIVITIES(id)).json<Activity[]>()
    return response
  }

  /**
   * Search deals
   */
  static async searchDeals(filters: DealSearchFilters): Promise<Deal[]> {
    const response = await ky.post(this.ENDPOINTS.SEARCH_DEALS, {
      json: filters
    }).json<Deal[]>()
    return response
  }

  // Pipeline Management

  /**
   * Get all pipelines
   */
  static async getPipelines(): Promise<Pipeline[]> {
    const response = await ky.get(this.ENDPOINTS.PIPELINES).json<Pipeline[]>()
    return response
  }

  /**
   * Get pipeline by ID
   */
  static async getPipeline(id: string): Promise<Pipeline> {
    const response = await ky.get(this.ENDPOINTS.PIPELINE_BY_ID(id)).json<Pipeline>()
    return response
  }

  /**
   * Create new pipeline
   */
  static async createPipeline(data: Partial<Pipeline>): Promise<Pipeline> {
    const response = await ky.post(this.ENDPOINTS.PIPELINES, {
      json: data
    }).json<Pipeline>()
    return response
  }

  /**
   * Update pipeline
   */
  static async updatePipeline(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    const response = await ky.patch(this.ENDPOINTS.PIPELINE_BY_ID(id), {
      json: data
    }).json<Pipeline>()
    return response
  }

  /**
   * Get pipeline deals
   */
  static async getPipelineDeals(pipelineId: string): Promise<Deal[]> {
    const response = await ky.get(this.ENDPOINTS.PIPELINE_DEALS(pipelineId)).json<Deal[]>()
    return response
  }

  // Activity Management

  /**
   * Get all activities
   */
  static async getActivities(params?: {
    type?: ActivityType[]
    contactId?: string
    companyId?: string
    dealId?: string
    assignedTo?: string[]
    completed?: boolean
    page?: number
    limit?: number
  }): Promise<{ activities: Activity[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.ACTIVITIES}?${searchParams.toString()}`).json<{
      activities: Activity[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new activity
   */
  static async createActivity(data: CreateActivityRequest): Promise<Activity> {
    const response = await ky.post(this.ENDPOINTS.ACTIVITIES, {
      json: data
    }).json<Activity>()
    return response
  }

  /**
   * Update activity
   */
  static async updateActivity(id: string, data: Partial<Activity>): Promise<Activity> {
    const response = await ky.patch(this.ENDPOINTS.ACTIVITY_BY_ID(id), {
      json: data
    }).json<Activity>()
    return response
  }

  /**
   * Complete activity
   */
  static async completeActivity(id: string, outcome?: string, notes?: string): Promise<Activity> {
    const response = await ky.post(this.ENDPOINTS.COMPLETE_ACTIVITY(id), {
      json: { outcome, notes }
    }).json<Activity>()
    return response
  }

  /**
   * Get upcoming activities
   */
  static async getUpcomingActivities(days: number = 7): Promise<Activity[]> {
    const response = await ky.get(`${this.ENDPOINTS.UPCOMING_ACTIVITIES}?days=${days}`).json<Activity[]>()
    return response
  }

  /**
   * Get overdue activities
   */
  static async getOverdueActivities(): Promise<Activity[]> {
    const response = await ky.get(this.ENDPOINTS.OVERDUE_ACTIVITIES).json<Activity[]>()
    return response
  }

  // Task Management

  /**
   * Get all tasks
   */
  static async getTasks(params?: {
    assignedTo?: string[]
    completed?: boolean
    priority?: DealPriority[]
    dueBefore?: Date
    dueAfter?: Date
    page?: number
    limit?: number
  }): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v))
        } else if (value instanceof Date) {
          searchParams.append(key, value.toISOString())
        } else if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(`${this.ENDPOINTS.TASKS}?${searchParams.toString()}`).json<{
      tasks: Task[]
      total: number
      page: number
      limit: number
    }>()
    
    return response
  }

  /**
   * Create new task
   */
  static async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await ky.post(this.ENDPOINTS.TASKS, {
      json: data
    }).json<Task>()
    return response
  }

  /**
   * Update task
   */
  static async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    const response = await ky.patch(this.ENDPOINTS.TASK_BY_ID(id), {
      json: data
    }).json<Task>()
    return response
  }

  /**
   * Complete task
   */
  static async completeTask(id: string): Promise<Task> {
    const response = await ky.post(this.ENDPOINTS.COMPLETE_TASK(id)).json<Task>()
    return response
  }

  /**
   * Get my tasks
   */
  static async getMyTasks(): Promise<Task[]> {
    const response = await ky.get(this.ENDPOINTS.MY_TASKS).json<Task[]>()
    return response
  }

  // Email Templates

  /**
   * Get all email templates
   */
  static async getEmailTemplates(category?: string): Promise<EmailTemplate[]> {
    const url = category 
      ? `${this.ENDPOINTS.EMAIL_TEMPLATES}?category=${category}`
      : this.ENDPOINTS.EMAIL_TEMPLATES
    
    const response = await ky.get(url).json<EmailTemplate[]>()
    return response
  }

  /**
   * Create email template
   */
  static async createEmailTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await ky.post(this.ENDPOINTS.EMAIL_TEMPLATES, {
      json: data
    }).json<EmailTemplate>()
    return response
  }

  /**
   * Update email template
   */
  static async updateEmailTemplate(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await ky.patch(this.ENDPOINTS.EMAIL_TEMPLATE_BY_ID(id), {
      json: data
    }).json<EmailTemplate>()
    return response
  }

  // Email Campaigns

  /**
   * Get all email campaigns
   */
  static async getEmailCampaigns(status?: string): Promise<EmailCampaign[]> {
    const url = status 
      ? `${this.ENDPOINTS.EMAIL_CAMPAIGNS}?status=${status}`
      : this.ENDPOINTS.EMAIL_CAMPAIGNS
    
    const response = await ky.get(url).json<EmailCampaign[]>()
    return response
  }

  /**
   * Create email campaign
   */
  static async createEmailCampaign(data: CreateEmailCampaignRequest): Promise<EmailCampaign> {
    const response = await ky.post(this.ENDPOINTS.EMAIL_CAMPAIGNS, {
      json: data
    }).json<EmailCampaign>()
    return response
  }

  /**
   * Send email campaign
   */
  static async sendEmailCampaign(id: string): Promise<void> {
    await ky.post(this.ENDPOINTS.SEND_CAMPAIGN(id))
  }

  /**
   * Pause email campaign
   */
  static async pauseEmailCampaign(id: string): Promise<void> {
    await ky.post(this.ENDPOINTS.PAUSE_CAMPAIGN(id))
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStats(id: string): Promise<any> {
    const response = await ky.get(this.ENDPOINTS.CAMPAIGN_STATS(id)).json<any>()
    return response
  }

  // Contact Lists

  /**
   * Get all contact lists
   */
  static async getContactLists(): Promise<ContactList[]> {
    const response = await ky.get(this.ENDPOINTS.CONTACT_LISTS).json<ContactList[]>()
    return response
  }

  /**
   * Create contact list
   */
  static async createContactList(data: Partial<ContactList>): Promise<ContactList> {
    const response = await ky.post(this.ENDPOINTS.CONTACT_LISTS, {
      json: data
    }).json<ContactList>()
    return response
  }

  /**
   * Add contacts to list
   */
  static async addContactsToList(listId: string, contactIds: string[]): Promise<void> {
    await ky.post(this.ENDPOINTS.ADD_TO_LIST(listId), {
      json: { contactIds }
    })
  }

  /**
   * Remove contact from list
   */
  static async removeContactFromList(listId: string, contactId: string): Promise<void> {
    await ky.delete(this.ENDPOINTS.REMOVE_FROM_LIST(listId, contactId))
  }

  // Sales Forecasting

  /**
   * Generate sales forecast
   */
  static async generateSalesForecast(
    period: ForecastPeriod,
    config?: Partial<SalesForecast>
  ): Promise<SalesForecast> {
    const response = await ky.post(this.ENDPOINTS.GENERATE_FORECAST, {
      json: { period, ...config }
    }).json<SalesForecast>()
    return response
  }

  /**
   * Get sales forecasts
   */
  static async getSalesForecasts(): Promise<SalesForecast[]> {
    const response = await ky.get(this.ENDPOINTS.SALES_FORECASTS).json<SalesForecast[]>()
    return response
  }

  /**
   * Update sales forecast
   */
  static async updateSalesForecast(id: string, data: Partial<SalesForecast>): Promise<SalesForecast> {
    const response = await ky.patch(this.ENDPOINTS.FORECAST_BY_ID(id), {
      json: data
    }).json<SalesForecast>()
    return response
  }

  // Analytics

  /**
   * Get CRM analytics
   */
  static async getCRMAnalytics(
    startDate: Date,
    endDate: Date,
    filters?: any
  ): Promise<CRMAnalytics> {
    const searchParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const response = await ky.get(
      `${this.ENDPOINTS.CRM_ANALYTICS}?${searchParams.toString()}`
    ).json<CRMAnalytics>()
    
    return response
  }

  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(period: ForecastPeriod): Promise<any> {
    const response = await ky.post(this.ENDPOINTS.SALES_ANALYTICS, {
      json: { period }
    }).json<any>()
    return response
  }

  /**
   * Get activity analytics
   */
  static async getActivityAnalytics(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<any> {
    const searchParams = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })

    if (userId) {
      searchParams.append('userId', userId)
    }

    const response = await ky.get(
      `${this.ENDPOINTS.ACTIVITY_ANALYTICS}?${searchParams.toString()}`
    ).json<any>()
    
    return response
  }

  /**
   * Get conversion funnel data
   */
  static async getConversionFunnel(period: ForecastPeriod): Promise<any> {
    const response = await ky.post(this.ENDPOINTS.CONVERSION_FUNNEL, {
      json: { period }
    }).json<any>()
    return response
  }

  // Lead Scoring

  /**
   * Get lead scoring configurations
   */
  static async getLeadScoringConfigs(): Promise<LeadScoringConfig[]> {
    const response = await ky.get(this.ENDPOINTS.LEAD_SCORING).json<LeadScoringConfig[]>()
    return response
  }

  /**
   * Create lead scoring configuration
   */
  static async createLeadScoringConfig(data: Partial<LeadScoringConfig>): Promise<LeadScoringConfig> {
    const response = await ky.post(this.ENDPOINTS.LEAD_SCORING, {
      json: data
    }).json<LeadScoringConfig>()
    return response
  }

  /**
   * Calculate lead score for contact
   */
  static async calculateLeadScore(contactId: string): Promise<{ score: number; breakdown: any[] }> {
    const response = await ky.post(this.ENDPOINTS.CALCULATE_LEAD_SCORE(contactId)).json<{
      score: number
      breakdown: any[]
    }>()
    return response
  }

  // File Upload

  /**
   * Upload attachment
   */
  static async uploadAttachment(file: File, entityType: 'contact' | 'company' | 'deal' | 'activity'): Promise<{
    url: string
    id: string
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entityType', entityType)

    const response = await ky.post(this.ENDPOINTS.UPLOAD_ATTACHMENT, {
      body: formData
    }).json<{ url: string; id: string }>()
    
    return response
  }

  // Reporting

  /**
   * Export CRM report
   */
  static async exportReport(
    type: 'contacts' | 'deals' | 'activities' | 'companies',
    format: 'csv' | 'excel' | 'pdf',
    filters?: any
  ): Promise<{ downloadUrl: string }> {
    const response = await ky.post(this.ENDPOINTS.EXPORT_REPORT(type), {
      json: { format, filters }
    }).json<{ downloadUrl: string }>()
    return response
  }
}

/**
 * CRM Utilities
 * Helper functions for CRM calculations and formatting
 */
export class CRMUtils {
  /**
   * Format contact name
   */
  static formatContactName(contact: Contact): string {
    return `${contact.firstName} ${contact.lastName}`.trim()
  }

  /**
   * Format contact display name with title and company
   */
  static formatContactDisplayName(contact: Contact): string {
    const name = this.formatContactName(contact)
    const parts = [name]
    
    if (contact.title) {
      parts.push(contact.title)
    }
    
    if (contact.company?.name) {
      parts.push(`@ ${contact.company.name}`)
    }
    
    return parts.join(' - ')
  }

  /**
   * Get contact type color
   */
  static getContactTypeColor(type: ContactType): string {
    const colors = {
      lead: 'text-blue-600 bg-blue-100',
      prospect: 'text-orange-600 bg-orange-100',
      customer: 'text-green-600 bg-green-100',
      partner: 'text-purple-600 bg-purple-100',
      vendor: 'text-gray-600 bg-gray-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Get deal stage color
   */
  static getDealStageColor(stage: DealStage): string {
    const colors = {
      lead: 'text-gray-600 bg-gray-100',
      qualified: 'text-blue-600 bg-blue-100',
      proposal: 'text-orange-600 bg-orange-100',
      negotiation: 'text-purple-600 bg-purple-100',
      closed_won: 'text-green-600 bg-green-100',
      closed_lost: 'text-red-600 bg-red-100',
      on_hold: 'text-yellow-600 bg-yellow-100'
    }
    return colors[stage] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Get deal priority color
   */
  static getDealPriorityColor(priority: DealPriority): string {
    const colors = {
      low: 'text-blue-600 bg-blue-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    }
    return colors[priority] || 'text-gray-600 bg-gray-100'
  }

  /**
   * Format contact type label
   */
  static formatContactType(type: ContactType): string {
    const labels = {
      lead: 'Lead',
      prospect: 'Prospect',
      customer: 'Client',
      partner: 'Partenaire',
      vendor: 'Fournisseur'
    }
    return labels[type] || type
  }

  /**
   * Format deal stage label
   */
  static formatDealStage(stage: DealStage): string {
    const labels = {
      lead: 'Lead',
      qualified: 'Qualifié',
      proposal: 'Proposition',
      negotiation: 'Négociation',
      closed_won: 'Gagné',
      closed_lost: 'Perdu',
      on_hold: 'En attente'
    }
    return labels[stage] || stage
  }

  /**
   * Format activity type label
   */
  static formatActivityType(type: ActivityType): string {
    const labels = {
      call: 'Appel',
      email: 'Email',
      meeting: 'Réunion',
      task: 'Tâche',
      note: 'Note',
      sms: 'SMS',
      demo: 'Démo',
      proposal_sent: 'Proposition envoyée',
      contract_sent: 'Contrat envoyé',
      payment_received: 'Paiement reçu'
    }
    return labels[type] || type
  }

  /**
   * Calculate lead score category
   */
  static getLeadScoreCategory(score: number): {
    category: 'cold' | 'warm' | 'hot' | 'qualified'
    color: string
    label: string
  } {
    if (score >= 80) {
      return {
        category: 'qualified',
        color: 'text-green-600 bg-green-100',
        label: 'Qualifié'
      }
    } else if (score >= 60) {
      return {
        category: 'hot',
        color: 'text-red-600 bg-red-100',
        label: 'Chaud'
      }
    } else if (score >= 40) {
      return {
        category: 'warm',
        color: 'text-orange-600 bg-orange-100',
        label: 'Tiède'
      }
    } else {
      return {
        category: 'cold',
        color: 'text-blue-600 bg-blue-100',
        label: 'Froid'
      }
    }
  }

  /**
   * Calculate days since last contact
   */
  static daysSinceLastContact(lastContactedAt?: Date): number | null {
    if (!lastContactedAt) return null
    
    const now = new Date()
    const lastContact = new Date(lastContactedAt)
    const diffTime = now.getTime() - lastContact.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  /**
   * Check if contact needs follow-up
   */
  static needsFollowUp(contact: Contact): boolean {
    if (contact.nextFollowUpAt) {
      return new Date() >= new Date(contact.nextFollowUpAt)
    }
    
    const daysSince = this.daysSinceLastContact(contact.lastContactedAt)
    if (daysSince === null) return true
    
    // Different follow-up intervals based on contact type
    const followUpDays = {
      lead: 3,
      prospect: 7,
      customer: 30,
      partner: 90,
      vendor: 90
    }
    
    return daysSince >= followUpDays[contact.type]
  }

  /**
   * Calculate deal age in days
   */
  static calculateDealAge(deal: Deal): number {
    const now = new Date()
    const created = new Date(deal.createdAt)
    const diffTime = now.getTime() - created.getTime()
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Calculate days until deal close
   */
  static daysUntilClose(expectedCloseDate: Date): number {
    const now = new Date()
    const closeDate = new Date(expectedCloseDate)
    const diffTime = closeDate.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Check if deal is overdue
   */
  static isDealOverdue(deal: Deal): boolean {
    if (deal.stage === 'closed_won' || deal.stage === 'closed_lost') {
      return false
    }
    return new Date() > new Date(deal.expectedCloseDate)
  }

  /**
   * Calculate weighted pipeline value
   */
  static calculateWeightedValue(deals: Deal[]): number {
    return deals.reduce((total, deal) => {
      if (deal.stage === 'closed_won' || deal.stage === 'closed_lost') {
        return total
      }
      return total + (deal.value.amount * deal.probability / 100)
    }, 0)
  }

  /**
   * Calculate win rate
   */
  static calculateWinRate(deals: Deal[]): number {
    const closedDeals = deals.filter(d => 
      d.stage === 'closed_won' || d.stage === 'closed_lost'
    )
    
    if (closedDeals.length === 0) return 0
    
    const wonDeals = closedDeals.filter(d => d.stage === 'closed_won')
    return (wonDeals.length / closedDeals.length) * 100
  }

  /**
   * Calculate average sales cycle
   */
  static calculateAverageSalesCycle(deals: Deal[]): number {
    const closedDeals = deals.filter(d => 
      (d.stage === 'closed_won' || d.stage === 'closed_lost') && d.actualCloseDate
    )
    
    if (closedDeals.length === 0) return 0
    
    const totalDays = closedDeals.reduce((sum, deal) => {
      const created = new Date(deal.createdAt)
      const closed = new Date(deal.actualCloseDate!)
      const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)
    
    return Math.round(totalDays / closedDeals.length)
  }

  /**
   * Group deals by stage
   */
  static groupDealsByStage(deals: Deal[]): Record<DealStage, Deal[]> {
    return deals.reduce((groups, deal) => {
      const stage = deal.stage
      if (!groups[stage]) {
        groups[stage] = []
      }
      groups[stage].push(deal)
      return groups
    }, {} as Record<DealStage, Deal[]>)
  }

  /**
   * Format company size
   */
  static formatCompanySize(size: CompanySize): string {
    const labels = {
      startup: 'Startup',
      small: 'Petite (1-50)',
      medium: 'Moyenne (51-200)',
      large: 'Grande (201-1000)',
      enterprise: 'Enterprise (1000+)'
    }
    return labels[size] || size
  }

  /**
   * Format industry
   */
  static formatIndustry(industry: Industry): string {
    const labels = {
      technology: 'Technologie',
      finance: 'Finance',
      healthcare: 'Santé',
      education: 'Éducation',
      manufacturing: 'Industrie',
      retail: 'Commerce',
      real_estate: 'Immobilier',
      consulting: 'Conseil',
      marketing: 'Marketing',
      legal: 'Juridique',
      construction: 'Construction',
      transportation: 'Transport',
      hospitality: 'Hôtellerie',
      energy: 'Énergie',
      other: 'Autre'
    }
    return labels[industry] || industry
  }

  /**
   * Generate activity summary
   */
  static generateActivitySummary(activities: Activity[]): {
    total: number
    byType: Record<ActivityType, number>
    completed: number
    upcoming: number
    overdue: number
  } {
    const now = new Date()
    
    const summary = {
      total: activities.length,
      byType: {} as Record<ActivityType, number>,
      completed: 0,
      upcoming: 0,
      overdue: 0
    }

    activities.forEach(activity => {
      // Count by type
      if (!summary.byType[activity.type]) {
        summary.byType[activity.type] = 0
      }
      summary.byType[activity.type]++

      // Count by status
      if (activity.isCompleted) {
        summary.completed++
      } else if (activity.scheduledAt) {
        const scheduled = new Date(activity.scheduledAt)
        if (scheduled < now) {
          summary.overdue++
        } else {
          summary.upcoming++
        }
      }
    })

    return summary
  }
}