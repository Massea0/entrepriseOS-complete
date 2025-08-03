import { supabase } from '@/lib/supabase'

export interface CVMatch {
  candidateId: string
  matchScore: number // 0-100
  strengths: string[]
  gaps: string[]
  recommendations: string[]
  culturalFit: number
  technicalFit: number
  experienceFit: number
  compensationFit: {
    withinRange: boolean
    expectedSalary: number
    proposedSalary: number
  }
}

class CVMatchingService {
  private readonly FUNCTION_URL = '/cv-matching'

  async matchCVToJob(cvData: any, jobId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'match-single', cvData, jobId }
    })
    if (error) throw error
    return data as CVMatch
  }

  async rankCandidates(jobId: string, candidateIds: string[]) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'rank-candidates', jobId, candidateIds }
    })
    if (error) throw error
    return data
  }

  async extractSkillsFromCV(cvText: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'extract-skills', cvText }
    })
    if (error) throw error
    return data
  }

  async suggestInterviewQuestions(candidateId: string, jobId: string) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'interview-questions', candidateId, jobId }
    })
    if (error) throw error
    return data
  }
}

export const cvMatchingService = new CVMatchingService()