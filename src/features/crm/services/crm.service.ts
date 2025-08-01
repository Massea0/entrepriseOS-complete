import { supabase } from '@/lib/supabase'
import type { Deal, Contact, Pipeline, DealStage } from '../types/crm.types'
import { MOCK_DEALS, MOCK_CONTACTS, DEFAULT_PIPELINE } from '../mocks/crm.mocks'

// Flag pour basculer entre mock et Supabase
const USE_MOCK = false // Utiliser Supabase

export class CRMService {
  /**
   * Récupérer tous les deals (projets dans Supabase)
   */
  static async getDeals(): Promise<Deal[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return MOCK_DEALS
    }

    // Adapter les projets Supabase au format Deal
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:profiles!owner_id(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      // Fallback aux mocks en cas d'erreur
      return MOCK_DEALS
    }

    // Transformer les projets en deals
    return (data || []).map(project => ({
      id: project.id,
      name: project.name,
      value: { amount: project.budget || 0, currency: 'EUR' },
      stage: this.mapProjectStatusToStage(project.status),
      probability: this.calculateProbability(project.status),
      expectedCloseDate: new Date(project.end_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
      contactId: project.client_id || '',
      assignedToId: project.owner_id || '',
      assignedTo: project.owner || null,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
      tags: project.tags || [],
      priority: project.priority || 'medium',
      description: project.description || '',
      actualCloseDate: project.status === 'completed' ? new Date(project.updated_at) : undefined,
      companyId: project.client_company_id
    }))
  }

  /**
   * Créer un nouveau deal (projet)
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

    // Créer un projet dans Supabase
    const { data: userData } = await supabase.auth.getUser()
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userData?.user?.id)
      .single()

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: deal.name || 'Nouveau projet',
        description: deal.description,
        status: this.mapStageToProjectStatus(deal.stage || 'qualification'),
        priority: deal.priority || 'medium',
        budget: deal.value?.amount || 0,
        end_date: deal.expectedCloseDate?.toISOString(),
        owner_id: userData?.user?.id,
        client_company_id: profile?.company_id,
        client_id: deal.contactId,
        tags: deal.tags || [],
        progress: deal.probability || 0
      })
      .select(`
        *,
        owner:profiles!owner_id(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw error
    }

    // Transformer en Deal
    return {
      id: data.id,
      name: data.name,
      value: { amount: data.budget || 0, currency: 'EUR' },
      stage: this.mapProjectStatusToStage(data.status),
      probability: data.progress || 0,
      expectedCloseDate: new Date(data.end_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
      contactId: data.client_id || '',
      assignedToId: data.manager_id || '',
      assignedTo: data.manager || null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      tags: data.tags || [],
      priority: data.priority || 'medium',
      description: data.description || '',
      companyId: data.company_id
    }
  }

  /**
   * Mettre à jour un deal (projet)
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

    const projectUpdates: any = {}
    
    if (updates.name) projectUpdates.name = updates.name
    if (updates.description) projectUpdates.description = updates.description
    if (updates.value?.amount) projectUpdates.budget = updates.value.amount
    if (updates.stage) projectUpdates.status = this.mapStageToProjectStatus(updates.stage)
    if (updates.probability) projectUpdates.progress = updates.probability
    if (updates.expectedCloseDate) projectUpdates.end_date = updates.expectedCloseDate.toISOString()
    if (updates.priority) projectUpdates.priority = updates.priority
    if (updates.tags) projectUpdates.tags = updates.tags
    if (updates.assignedToId) projectUpdates.manager_id = updates.assignedToId

    const { data, error } = await supabase
      .from('projects')
      .update(projectUpdates)
      .eq('id', id)
      .select(`
        *,
        manager:profiles!manager_id(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw error
    }

    // Transformer en Deal
    return {
      id: data.id,
      name: data.name,
      value: { amount: data.budget || 0, currency: 'EUR' },
      stage: this.mapProjectStatusToStage(data.status),
      probability: data.progress || 0,
      expectedCloseDate: new Date(data.end_date || Date.now() + 30 * 24 * 60 * 60 * 1000),
      contactId: data.client_id || '',
      assignedToId: data.manager_id || '',
      assignedTo: data.manager || null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      tags: data.tags || [],
      priority: data.priority || 'medium',
      description: data.description || '',
      companyId: data.company_id
    }
  }

  /**
   * Supprimer un deal (projet)
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
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  /**
   * Déplacer un deal vers une autre étape
   */
  static async moveDealToStage(dealId: string, stage: DealStage): Promise<Deal> {
    const stageConfig = {
      'qualification': { probability: 20, status: 'planning' },
      'qualified': { probability: 40, status: 'planning' },
      'proposal': { probability: 60, status: 'active' },
      'negotiation': { probability: 80, status: 'active' },
      'closed-won': { probability: 100, status: 'completed' },
      'closed-lost': { probability: 0, status: 'cancelled' }
    }

    const config = stageConfig[stage]
    const updates: Partial<Deal> = {
      stage,
      probability: config.probability
    }

    if (stage === 'closed-won' || stage === 'closed-lost') {
      updates.actualCloseDate = new Date()
    }

    return this.updateDeal(dealId, updates)
  }

  /**
   * Récupérer tous les contacts (clients/profiles)
   */
  static async getContacts(): Promise<Contact[]> {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return MOCK_CONTACTS
    }

    // Dans Supabase, les contacts sont des profiles avec role 'client' ou des companies
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching client profiles:', profilesError)
      return MOCK_CONTACTS
    }

    // Transformer les profiles en contacts
    return (profiles || []).map(profile => ({
      id: profile.id,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      email: profile.email,
      phone: profile.phone || '',
      type: 'person' as const,
      company: profile.company_id ? { id: profile.company_id, name: '' } : undefined,
      createdAt: new Date(profile.created_at),
      updatedAt: new Date(profile.updated_at)
    }))
  }

  /**
   * Récupérer le pipeline par défaut
   */
  static async getDefaultPipeline(): Promise<Pipeline> {
    // Pour l'instant, on utilise le pipeline par défaut
    // Plus tard, on pourra le stocker dans Supabase
    return DEFAULT_PIPELINE
  }

  // Méthodes utilitaires pour mapper entre les formats
  private static mapProjectStatusToStage(status: string): DealStage {
    const mapping: Record<string, DealStage> = {
      'planning': 'qualification',
      'active': 'proposal',
      'on_hold': 'negotiation',
      'completed': 'closed-won',
      'cancelled': 'closed-lost'
    }
    return mapping[status] || 'qualification'
  }

  private static mapStageToProjectStatus(stage: DealStage): string {
    const mapping: Record<DealStage, string> = {
      'qualification': 'planning',
      'qualified': 'planning',
      'proposal': 'active',
      'negotiation': 'active',
      'closed-won': 'completed',
      'closed-lost': 'cancelled'
    }
    return mapping[stage] || 'planning'
  }

  private static calculateProbability(status: string): number {
    const probabilities: Record<string, number> = {
      'planning': 20,
      'active': 60,
      'on_hold': 40,
      'completed': 100,
      'cancelled': 0
    }
    return probabilities[status] || 20
  }
}