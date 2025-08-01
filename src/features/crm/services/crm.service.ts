import { supabase } from '@/lib/supabase'
import type { Deal, Contact, Pipeline, DealStage } from '../types/crm.types'
import { MOCK_DEALS, MOCK_CONTACTS, DEFAULT_PIPELINE } from '../mocks/crm.mocks'

// Flag pour basculer entre mock et Supabase
const USE_MOCK = true // TODO: Passer à false quand Supabase est configuré

export class CRMService {
  /**
   * Récupérer tous les deals
   */
  static async getDeals(): Promise<Deal[]> {
    if (USE_MOCK) {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500))
      return MOCK_DEALS
    }

    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        contact:contacts(*),
        assignedTo:profiles!assigned_to(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching deals:', error)
      throw error
    }

    return data || []
  }

  /**
   * Créer un nouveau deal
   */
  static async createDeal(deal: Partial<Deal>): Promise<Deal> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newDeal: Deal = {
        id: `deal-${Date.now()}`,
        name: deal.name || '',
        value: deal.value || { amount: 0, currency: 'EUR' },
        stage: deal.stage || 'qualification',
        probability: deal.probability || 20,
        expectedCloseDate: deal.expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        contactId: deal.contactId || '',
        assignedToId: deal.assignedToId || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: deal.tags || [],
        priority: deal.priority || 'medium',
        description: deal.description || ''
      } as Deal
      
      MOCK_DEALS.push(newDeal)
      return newDeal
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({
        ...deal,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select(`
        *,
        contact:contacts(*),
        assignedTo:profiles!assigned_to(*)
      `)
      .single()

    if (error) {
      console.error('Error creating deal:', error)
      throw error
    }

    return data
  }

  /**
   * Mettre à jour un deal
   */
  static async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DEALS.findIndex(d => d.id === id)
      if (index !== -1) {
        MOCK_DEALS[index] = { ...MOCK_DEALS[index], ...updates, updatedAt: new Date() }
        return MOCK_DEALS[index]
      }
      throw new Error('Deal not found')
    }

    const { data, error } = await supabase
      .from('deals')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', id)
      .select(`
        *,
        contact:contacts(*),
        assignedTo:profiles!assigned_to(*)
      `)
      .single()

    if (error) {
      console.error('Error updating deal:', error)
      throw error
    }

    return data
  }

  /**
   * Supprimer un deal
   */
  static async deleteDeal(id: string): Promise<void> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = MOCK_DEALS.findIndex(d => d.id === id)
      if (index !== -1) {
        MOCK_DEALS.splice(index, 1)
      }
      return
    }

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting deal:', error)
      throw error
    }
  }

  /**
   * Déplacer un deal vers une autre étape
   */
  static async moveDealToStage(dealId: string, stage: DealStage): Promise<Deal> {
    const stageConfig = {
      'qualification': { probability: 20 },
      'qualified': { probability: 40 },
      'proposal': { probability: 60 },
      'negotiation': { probability: 80 },
      'closed-won': { probability: 100, actualCloseDate: new Date() },
      'closed-lost': { probability: 0, actualCloseDate: new Date() }
    }

    const updates: Partial<Deal> = {
      stage,
      probability: stageConfig[stage].probability,
      ...(stageConfig[stage].actualCloseDate && { actualCloseDate: stageConfig[stage].actualCloseDate })
    }

    return this.updateDeal(dealId, updates)
  }

  /**
   * Récupérer tous les contacts
   */
  static async getContacts(): Promise<Contact[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return MOCK_CONTACTS
    }

    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching contacts:', error)
      throw error
    }

    return data || []
  }

  /**
   * Récupérer le pipeline par défaut
   */
  static async getDefaultPipeline(): Promise<Pipeline> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return DEFAULT_PIPELINE
    }

    // TODO: Implémenter la récupération du pipeline depuis Supabase
    return DEFAULT_PIPELINE
  }
}