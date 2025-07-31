import { supabase } from '@/lib/supabase';
import { featureFlags } from '@/lib/feature-flags';

interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed?: number;
  executionTime?: number;
}

export class AIEdgeFunctionsService {
  private static instance: AIEdgeFunctionsService;

  private constructor() {}

  static getInstance(): AIEdgeFunctionsService {
    if (!AIEdgeFunctionsService.instance) {
      AIEdgeFunctionsService.instance = new AIEdgeFunctionsService();
    }
    return AIEdgeFunctionsService.instance;
  }

  // 1. Auto-assign Tasks
  async autoAssignTask(taskData: {
    title: string;
    description: string;
    projectId: string;
    priority: string;
    skills?: string[];
  }): Promise<AIResponse<{ assigneeId: string; confidence: number; reasoning: string }>> {
    if (!featureFlags.isEnabled('AI_AUTO_ASSIGN')) {
      return { success: false, error: 'Auto-assignment feature is disabled' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('auto-assign-tasks', {
        body: taskData,
      });

      if (error) throw error;

      return {
        success: true,
        data: data,
        tokensUsed: data.tokensUsed,
        executionTime: data.executionTime,
      };
    } catch (error) {
      console.error('Auto-assign error:', error);
      return { success: false, error: String(error) };
    }
  }

  // 2. Smart Notifications
  async generateSmartNotification(params: {
    type: 'task_due' | 'project_update' | 'leave_request' | 'invoice_overdue';
    recipientId: string;
    context: any;
  }): Promise<AIResponse<{ message: string; priority: number; channels: string[] }>> {
    try {
      const { data, error } = await supabase.functions.invoke('smart-notifications', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 3. Workflow Orchestrator
  async orchestrateWorkflow(params: {
    workflowType: string;
    triggerEvent: any;
    context: any;
  }): Promise<AIResponse<{ actions: any[]; nextSteps: string[] }>> {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-orchestrator', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 4. Business Analyzer
  async analyzeBusinessMetrics(params: {
    companyId: string;
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    metrics: string[];
  }): Promise<AIResponse<{ insights: any[]; predictions: any[]; recommendations: any[] }>> {
    if (!featureFlags.isEnabled('AI_ANALYTICS')) {
      return { success: false, error: 'Analytics feature is disabled' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-business-analyzer', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 5. Performance Optimizer
  async optimizePerformance(params: {
    resourceType: 'team' | 'project' | 'budget';
    resourceId: string;
    optimizationGoals: string[];
  }): Promise<AIResponse<{ suggestions: any[]; expectedImpact: any }>> {
    try {
      const { data, error } = await supabase.functions.invoke('performance-optimizer', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 6. Project Planner AI
  async planProject(params: {
    projectName: string;
    objectives: string[];
    constraints: {
      budget?: number;
      deadline?: string;
      teamSize?: number;
    };
  }): Promise<AIResponse<{ plan: any; milestones: any[]; risks: any[] }>> {
    try {
      const { data, error } = await supabase.functions.invoke('project-planner-ai', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 7. Task Mermaid Generator
  async generateTaskDiagram(params: {
    projectId: string;
    viewType: 'gantt' | 'flowchart' | 'mindmap';
    includeSubtasks?: boolean;
  }): Promise<AIResponse<{ mermaidCode: string; preview: string }>> {
    try {
      const { data, error } = await supabase.functions.invoke('task-mermaid-generator', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 8. Email Generator
  async generateEmail(params: {
    type: 'invoice' | 'reminder' | 'proposal' | 'follow_up' | 'welcome';
    recipient: { name: string; email: string };
    context: any;
    tone?: 'formal' | 'friendly' | 'casual';
  }): Promise<AIResponse<{ subject: string; body: string; attachments?: any[] }>> {
    if (!featureFlags.isEnabled('AI_EMAIL_GENERATOR')) {
      return { success: false, error: 'Email generator feature is disabled' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('email-generator', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 9. Financial Predictions
  async predictFinancials(params: {
    companyId: string;
    forecastPeriod: number; // months
    includeScenarios?: boolean;
  }): Promise<AIResponse<{ predictions: any; scenarios?: any[] }>> {
    if (!featureFlags.isEnabled('AI_PREDICTIONS')) {
      return { success: false, error: 'Predictions feature is disabled' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('financial-predictions', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 10. Invoice Auto-Generator
  async generateInvoice(params: {
    projectId: string;
    clientId: string;
    period: { start: string; end: string };
    includeExpenses?: boolean;
  }): Promise<AIResponse<{ invoice: any; lineItems: any[] }>> {
    try {
      const { data, error } = await supabase.functions.invoke('invoice-auto-generator', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // 11. Recruitment AI Scorer
  async scoreCandidate(params: {
    candidateCV: string;
    positionId: string;
    scoringCriteria?: string[];
  }): Promise<AIResponse<{ score: number; strengths: string[]; gaps: string[]; recommendation: string }>> {
    try {
      const { data, error } = await supabase.functions.invoke('recruitment-ai-scorer', {
        body: params,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Test all AI functions
  async testAllFunctions(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    // Test each function with minimal params
    const tests = [
      { name: 'auto-assign', fn: () => this.autoAssignTask({ title: 'Test', description: 'Test', projectId: 'test', priority: 'medium' }) },
      { name: 'smart-notifications', fn: () => this.generateSmartNotification({ type: 'task_due', recipientId: 'test', context: {} }) },
      { name: 'workflow-orchestrator', fn: () => this.orchestrateWorkflow({ workflowType: 'test', triggerEvent: {}, context: {} }) },
      { name: 'business-analyzer', fn: () => this.analyzeBusinessMetrics({ companyId: 'test', period: 'monthly', metrics: [] }) },
      { name: 'performance-optimizer', fn: () => this.optimizePerformance({ resourceType: 'team', resourceId: 'test', optimizationGoals: [] }) },
      { name: 'project-planner', fn: () => this.planProject({ projectName: 'Test', objectives: [], constraints: {} }) },
      { name: 'mermaid-generator', fn: () => this.generateTaskDiagram({ projectId: 'test', viewType: 'gantt' }) },
      { name: 'email-generator', fn: () => this.generateEmail({ type: 'welcome', recipient: { name: 'Test', email: 'test@test.com' }, context: {} }) },
      { name: 'financial-predictions', fn: () => this.predictFinancials({ companyId: 'test', forecastPeriod: 3 }) },
      { name: 'invoice-generator', fn: () => this.generateInvoice({ projectId: 'test', clientId: 'test', period: { start: '2024-01-01', end: '2024-01-31' } }) },
      { name: 'recruitment-scorer', fn: () => this.scoreCandidate({ candidateCV: 'Test CV', positionId: 'test' }) },
    ];

    for (const test of tests) {
      try {
        const result = await test.fn();
        results[test.name] = result.success;
      } catch (error) {
        results[test.name] = false;
      }
    }

    return results;
  }
}

// Export singleton instance
export const aiService = AIEdgeFunctionsService.getInstance();