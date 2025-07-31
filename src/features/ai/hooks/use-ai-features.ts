import { useMutation, useQuery } from '@tanstack/react-query';
import { aiService } from '../services/ai-edge-functions.service';
import { toast } from 'sonner';
import { useFeatureFlag } from '@/lib/feature-flags';

// Hook pour l'auto-assignment de tâches
export function useAutoAssignTask() {
  const isEnabled = useFeatureFlag('AI_AUTO_ASSIGN');

  return useMutation({
    mutationFn: async (taskData: Parameters<typeof aiService.autoAssignTask>[0]) => {
      if (!isEnabled) {
        throw new Error('Auto-assignment feature is disabled');
      }
      return aiService.autoAssignTask(taskData);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Task assigned with ${Math.round(result.data!.confidence * 100)}% confidence`);
      } else {
        toast.error(result.error || 'Failed to auto-assign task');
      }
    },
    onError: (error) => {
      toast.error('Auto-assignment failed: ' + error.message);
    },
  });
}

// Hook pour les notifications intelligentes
export function useSmartNotifications() {
  return useMutation({
    mutationFn: aiService.generateSmartNotification.bind(aiService),
    onSuccess: (result) => {
      if (!result.success) {
        console.error('Smart notification error:', result.error);
      }
    },
  });
}

// Hook pour l'analyse business
export function useBusinessAnalytics() {
  const isEnabled = useFeatureFlag('AI_ANALYTICS');

  return useMutation({
    mutationFn: async (params: Parameters<typeof aiService.analyzeBusinessMetrics>[0]) => {
      if (!isEnabled) {
        throw new Error('Analytics feature is disabled');
      }
      return aiService.analyzeBusinessMetrics(params);
    },
    onError: (error) => {
      toast.error('Analytics failed: ' + error.message);
    },
  });
}

// Hook pour les prédictions financières
export function useFinancialPredictions(companyId: string, forecastPeriod: number) {
  const isEnabled = useFeatureFlag('AI_PREDICTIONS');

  return useQuery({
    queryKey: ['financial-predictions', companyId, forecastPeriod],
    queryFn: () => aiService.predictFinancials({ companyId, forecastPeriod, includeScenarios: true }),
    enabled: isEnabled && !!companyId,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}

// Hook pour la génération d'emails
export function useEmailGenerator() {
  const isEnabled = useFeatureFlag('AI_EMAIL_GENERATOR');

  return useMutation({
    mutationFn: async (params: Parameters<typeof aiService.generateEmail>[0]) => {
      if (!isEnabled) {
        throw new Error('Email generator feature is disabled');
      }
      return aiService.generateEmail(params);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Email generated successfully');
      } else {
        toast.error(result.error || 'Failed to generate email');
      }
    },
  });
}

// Hook pour le planning de projet IA
export function useProjectPlanner() {
  return useMutation({
    mutationFn: aiService.planProject.bind(aiService),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Project plan generated');
      } else {
        toast.error(result.error || 'Failed to generate project plan');
      }
    },
  });
}

// Hook pour la génération de diagrammes Mermaid
export function useMermaidGenerator() {
  return useMutation({
    mutationFn: aiService.generateTaskDiagram.bind(aiService),
    onError: (error) => {
      toast.error('Failed to generate diagram');
    },
  });
}

// Hook pour l'optimisation de performance
export function usePerformanceOptimizer() {
  return useMutation({
    mutationFn: aiService.optimizePerformance.bind(aiService),
    onSuccess: (result) => {
      if (result.success && result.data?.suggestions?.length > 0) {
        toast.success(`${result.data.suggestions.length} optimization suggestions generated`);
      }
    },
  });
}

// Hook pour le scoring de candidats
export function useCandidateScorer() {
  return useMutation({
    mutationFn: aiService.scoreCandidate.bind(aiService),
    onSuccess: (result) => {
      if (result.success) {
        const score = Math.round(result.data!.score * 100);
        toast.success(`Candidate scored: ${score}%`);
      }
    },
  });
}

// Hook pour tester toutes les fonctions IA
export function useAIFunctionsTest() {
  return useMutation({
    mutationFn: () => aiService.testAllFunctions(),
    onSuccess: (results) => {
      const passed = Object.values(results).filter(r => r).length;
      const total = Object.keys(results).length;
      
      if (passed === total) {
        toast.success(`All ${total} AI functions are operational!`);
      } else {
        toast.warning(`${passed}/${total} AI functions operational`);
      }
      
      console.log('AI Functions Test Results:', results);
    },
    onError: (error) => {
      toast.error('AI functions test failed');
      console.error('Test error:', error);
    },
  });
}

// Hook pour obtenir le statut des features IA
export function useAIFeatureStatus() {
  const voiceEnabled = useFeatureFlag('AI_VOICE');
  const predictionsEnabled = useFeatureFlag('AI_PREDICTIONS');
  const autoAssignEnabled = useFeatureFlag('AI_AUTO_ASSIGN');
  const analyticsEnabled = useFeatureFlag('AI_ANALYTICS');
  const emailGeneratorEnabled = useFeatureFlag('AI_EMAIL_GENERATOR');

  return {
    voice: voiceEnabled,
    predictions: predictionsEnabled,
    autoAssign: autoAssignEnabled,
    analytics: analyticsEnabled,
    emailGenerator: emailGeneratorEnabled,
    anyEnabled: predictionsEnabled || autoAssignEnabled || analyticsEnabled || emailGeneratorEnabled,
  };
}