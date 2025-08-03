import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { 
  Quote, 
  Contract, 
  QuoteItem,
  ContractRisk,
  PricingRecommendation
} from '../types'

interface FinanceState {
  // Quotes
  quotes: Quote[]
  selectedQuote: Quote | null
  isLoadingQuotes: boolean
  
  // Contracts
  contracts: Contract[]
  selectedContract: Contract | null
  contractRisks: Record<string, ContractRisk>
  isLoadingContracts: boolean
  
  // Pricing
  pricingRecommendations: PricingRecommendation[]
  isOptimizingPrices: boolean
  
  // Analytics
  analyticsData: any
  isLoadingAnalytics: boolean
  
  // Actions - Quotes
  setQuotes: (quotes: Quote[]) => void
  addQuote: (quote: Quote) => void
  updateQuote: (id: string, quote: Partial<Quote>) => void
  deleteQuote: (id: string) => void
  selectQuote: (quote: Quote | null) => void
  setLoadingQuotes: (loading: boolean) => void
  
  // Actions - Contracts
  setContracts: (contracts: Contract[]) => void
  addContract: (contract: Contract) => void
  updateContract: (id: string, contract: Partial<Contract>) => void
  deleteContract: (id: string) => void
  selectContract: (contract: Contract | null) => void
  setContractRisk: (contractId: string, risk: ContractRisk) => void
  setLoadingContracts: (loading: boolean) => void
  
  // Actions - Pricing
  setPricingRecommendations: (recommendations: PricingRecommendation[]) => void
  setOptimizingPrices: (optimizing: boolean) => void
  
  // Actions - Analytics
  setAnalyticsData: (data: any) => void
  setLoadingAnalytics: (loading: boolean) => void
  
  // Reset
  reset: () => void
}

const initialState = {
  quotes: [],
  selectedQuote: null,
  isLoadingQuotes: false,
  contracts: [],
  selectedContract: null,
  contractRisks: {},
  isLoadingContracts: false,
  pricingRecommendations: [],
  isOptimizingPrices: false,
  analyticsData: null,
  isLoadingAnalytics: false,
}

export const useFinanceStore = create<FinanceState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // Quotes actions
        setQuotes: (quotes) => set({ quotes }),
        addQuote: (quote) => set((state) => ({ 
          quotes: [...state.quotes, quote] 
        })),
        updateQuote: (id, quote) => set((state) => ({
          quotes: state.quotes.map((q) => q.id === id ? { ...q, ...quote } : q)
        })),
        deleteQuote: (id) => set((state) => ({
          quotes: state.quotes.filter((q) => q.id !== id)
        })),
        selectQuote: (quote) => set({ selectedQuote: quote }),
        setLoadingQuotes: (loading) => set({ isLoadingQuotes: loading }),
        
        // Contracts actions
        setContracts: (contracts) => set({ contracts }),
        addContract: (contract) => set((state) => ({ 
          contracts: [...state.contracts, contract] 
        })),
        updateContract: (id, contract) => set((state) => ({
          contracts: state.contracts.map((c) => c.id === id ? { ...c, ...contract } : c)
        })),
        deleteContract: (id) => set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id)
        })),
        selectContract: (contract) => set({ selectedContract: contract }),
        setContractRisk: (contractId, risk) => set((state) => ({
          contractRisks: { ...state.contractRisks, [contractId]: risk }
        })),
        setLoadingContracts: (loading) => set({ isLoadingContracts: loading }),
        
        // Pricing actions
        setPricingRecommendations: (recommendations) => set({ pricingRecommendations: recommendations }),
        setOptimizingPrices: (optimizing) => set({ isOptimizingPrices: optimizing }),
        
        // Analytics actions
        setAnalyticsData: (data) => set({ analyticsData: data }),
        setLoadingAnalytics: (loading) => set({ isLoadingAnalytics: loading }),
        
        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'finance-store',
        partialize: (state) => ({
          quotes: state.quotes,
          contracts: state.contracts,
          contractRisks: state.contractRisks,
          pricingRecommendations: state.pricingRecommendations,
        }),
      }
    )
  )
)

// Selectors
export const selectQuotes = (state: FinanceState) => state.quotes
export const selectSelectedQuote = (state: FinanceState) => state.selectedQuote
export const selectContracts = (state: FinanceState) => state.contracts
export const selectSelectedContract = (state: FinanceState) => state.selectedContract
export const selectContractRisk = (contractId: string) => (state: FinanceState) => 
  state.contractRisks[contractId]
export const selectPricingRecommendations = (state: FinanceState) => state.pricingRecommendations
export const selectAnalyticsData = (state: FinanceState) => state.analyticsData