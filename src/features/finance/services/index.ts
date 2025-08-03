// AI-powered services for Finance module
export { AIDevisService } from './ai-devis.service'
export { ContractRiskService } from './contract-risk.service'
export { PricingService } from './pricing.service'
export { ContractGeneratorService } from './contract-generator.service'
export { MarketIntelligenceService } from './market-intelligence.service'
export { LegalComplianceService } from './legal-compliance.service'
export { ClientCommunicationService } from './client-comm.service'
export { BusinessAnalyticsService } from './business-analytics.service'

// Export types
export type { AnalysisType, RiskLevel } from './contract-risk.service'
export type { MarketPeriod, TrendDirection } from './market-intelligence.service'
export type { ComplianceCheckType, ComplianceLevel } from './legal-compliance.service'
export type { MessageTemplate, CommunicationChannel, MessageLanguage } from './client-comm.service'
export type { AnalyticsMetric, ExportFormat, DateRangePeriod } from './business-analytics.service'