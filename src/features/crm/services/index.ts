// Export all CRM AI services
export { leadScoringService } from './lead-scoring.service'
export { churnPredictionService } from './churn-prediction.service'
export { productRecommendationService } from './product-recommendation.service'
export { customerSentimentService } from './customer-sentiment.service'
export { supportChatbotService } from './support-chatbot.service'
export { salesPredictionService } from './sales-prediction.service'
export { customerSegmentationService } from './customer-segmentation.service'

// Export types
export type {
  LeadScore,
  LeadTrend,
  LeadSegment
} from './lead-scoring.service'

export type {
  ChurnPrediction
} from './churn-prediction.service'

export type {
  ProductRecommendation
} from './product-recommendation.service'

export type {
  SentimentAnalysis
} from './customer-sentiment.service'

export type {
  ChatbotResponse
} from './support-chatbot.service'

export type {
  SalesForecast
} from './sales-prediction.service'

export type {
  CustomerSegment
} from './customer-segmentation.service'