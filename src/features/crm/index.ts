// Services
export { CRMService } from './services/crm.service'

// Components
export { SalesPipeline } from './components/SalesPipeline'
export { DealCard } from './components/DealCard'
export { DealForm } from './components/DealForm'
export { PipelineStage } from './components/PipelineStage'
export { PipelineMetrics } from './components/PipelineMetrics'

// Hooks
export { usePipeline } from './hooks/usePipeline'

// Utils
export { CRMUtils, FinanceUtils } from './utils/crm.utils'

// Types
export type {
  // Contact and Company types
  ContactType,
  ContactSource,
  CompanySize,
  Industry,
  Contact,
  Company,
  
  // Deal and Pipeline types
  DealStage,
  DealPriority,
  Deal,
  DealLineItem,
  DealStageHistory,
  Pipeline,
  PipelineStage,
  
  // Activity and Task types
  ActivityType,
  Activity,
  Task,
  
  // Email and Communication types
  EmailTemplate,
  EmailVariable,
  EmailCampaign,
  EmailCampaignFilters,
  EmailCampaignStats,
  ContactList,
  
  // Sales Forecasting types
  SalesForecast,
  ForecastPeriod,
  ForecastByStage,
  ForecastByUser,
  ForecastByProduct,
  
  // Analytics and Reporting types
  CRMAnalytics,
  
  // Search and Filter types
  ContactSearchFilters,
  DealSearchFilters,
  
  // File attachment types
  Attachment,
  
  // API request types
  CreateContactRequest,
  CreateCompanyRequest,
  CreateDealRequest,
  CreateActivityRequest,
  CreateTaskRequest,
  CreateEmailCampaignRequest,
  
  // Hook return types
  UseContactsReturn,
  UseCompaniesReturn,
  UseDealsReturn,
  UseActivitiesReturn,
  UseTasksReturn,
  UsePipelineReturn,
  UseEmailCampaignsReturn,
  UseSalesForecastReturn,
  UseCRMAnalyticsReturn,
  
  // Lead scoring types
  LeadScoringRule,
  LeadScoringConfig
} from './types/crm.types'