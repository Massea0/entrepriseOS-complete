import { supabase } from '@/lib/supabase'

class PayrollOptimizerService {
  private readonly FUNCTION_URL = '/payroll-optimizer'

  async optimizePayroll(params: {
    budget: number
    constraints?: any
    goals?: string[]
  }) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'optimize', ...params }
    })
    if (error) throw error
    return data
  }

  async calculateBonuses(performanceData: any) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'calculate-bonuses', performanceData }
    })
    if (error) throw error
    return data
  }

  async analyzeSalaryEquity() {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'equity-analysis' }
    })
    if (error) throw error
    return data
  }

  async forecastPayrollCosts(months: number) {
    const { data, error } = await supabase.functions.invoke(this.FUNCTION_URL, {
      body: { action: 'forecast', months }
    })
    if (error) throw error
    return data
  }
}

export const payrollOptimizerService = new PayrollOptimizerService()