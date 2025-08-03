import { supabase } from '@/lib/supabase'

export interface TrainingRecommendation {
  employeeId: string
  recommendations: Array<{
    trainingId: string
    title: string
    type: 'technical' | 'soft-skills' | 'leadership' | 'compliance'
    relevanceScore: number
    duration: number
    cost: number
    provider: string
    expectedROI: number
  }>
  skillGaps: Array<{
    skill: string
    currentLevel: number
    requiredLevel: number
    priority: 'high' | 'medium' | 'low'
  }>
  careerPath: {
    currentRole: string
    nextRole: string
    requiredSkills: string[]
    timeline: number
  }
}

class TrainingRecommendationService {
  private readonly FUNCTION_URL = '/training-recommendation'

  async recommendTraining(employeeId: string, goals?: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'recommend', employeeId, goals }
    })
    if (error) throw error
    return data as TrainingRecommendation
  }

  async analyzeSkillGaps(teamId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'analyze-gaps', teamId }
    })
    if (error) throw error
    return data
  }

  async createLearningPath(employeeId: string, targetRole: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'learning-path', employeeId, targetRole }
    })
    if (error) throw error
    return data
  }
}

export const trainingRecommendationService = new TrainingRecommendationService()