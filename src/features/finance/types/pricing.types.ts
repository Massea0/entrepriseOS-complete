// Types pour la gestion de l'optimisation des prix

export interface PricingRecommendation {
  productId: string
  productName: string
  currentPrice: number
  recommendedPrice: number
  impact: {
    revenue: number
    volume: number
    margin: number
  }
  confidence: number
  reasoning: string
}

export interface PricingOptimizationRequest {
  category?: string
  targetMargin?: number
  constraints?: {
    maxPriceIncrease?: number
    minMargin?: number
  }
}

export interface PricingSimulation {
  priceChanges: Array<{
    productId: string
    newPrice: number
  }>
  duration: number
}

export interface ElasticityAnalysis {
  productId: string
  elasticity: number
  category: 'elastic' | 'inelastic' | 'unit'
}

export interface BundleRecommendation {
  bundleId: string
  products: string[]
  originalPrice: number
  bundlePrice: number
  discount: number
  attractiveness: number
  projectedSales: number
}

export interface CompetitorPricing {
  competitor: string
  priceIndex: number
  marketShare: number
}

export interface PricingAnalytics {
  currentRevenue: number
  projectedRevenue: number
  revenueIncrease: number
  avgMargin: number
  marginIncrease: number
  optimizedProducts: number
  totalProducts: number
}