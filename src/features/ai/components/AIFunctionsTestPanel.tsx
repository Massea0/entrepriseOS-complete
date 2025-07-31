'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Sparkles, Bot, Brain, Mail, TrendingUp, FileText, Users } from 'lucide-react';
import { 
  useAIFunctionsTest, 
  useAutoAssignTask, 
  useEmailGenerator,
  useProjectPlanner,
  useBusinessAnalytics,
  useAIFeatureStatus
} from '../hooks/use-ai-features';

export function AIFunctionsTestPanel() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const aiStatus = useAIFeatureStatus();
  
  const { mutate: runAllTests, isPending: isTestingAll } = useAIFunctionsTest();
  const { mutate: autoAssign, isPending: isAutoAssigning } = useAutoAssignTask();
  const { mutate: generateEmail, isPending: isGeneratingEmail } = useEmailGenerator();
  const { mutate: planProject, isPending: isPlanningProject } = useProjectPlanner();
  const { mutate: analyzeMetrics, isPending: isAnalyzing } = useBusinessAnalytics();

  const handleTestAll = () => {
    runAllTests(undefined, {
      onSuccess: (results) => {
        setTestResults(results);
      },
    });
  };

  const handleTestAutoAssign = () => {
    autoAssign({
      title: 'Test Task for Auto Assignment',
      description: 'This is a test task to validate the auto-assignment AI feature',
      projectId: 'test-project-id',
      priority: 'high',
      skills: ['React', 'TypeScript', 'AI'],
    });
  };

  const handleTestEmailGenerator = () => {
    generateEmail({
      type: 'welcome',
      recipient: { name: 'Test User', email: 'test@example.com' },
      context: {
        companyName: 'EntrepriseOS',
        role: 'Developer',
      },
      tone: 'friendly',
    });
  };

  const aiFeatures = [
    {
      name: 'Auto-assign Tasks',
      icon: <Bot className="h-5 w-5" />,
      status: aiStatus.autoAssign,
      description: 'Automatically assign tasks to the best team member',
      test: handleTestAutoAssign,
      loading: isAutoAssigning,
    },
    {
      name: 'Smart Notifications',
      icon: <AlertCircle className="h-5 w-5" />,
      status: true,
      description: 'Intelligent notification prioritization and delivery',
    },
    {
      name: 'Email Generator',
      icon: <Mail className="h-5 w-5" />,
      status: aiStatus.emailGenerator,
      description: 'Generate professional emails with AI',
      test: handleTestEmailGenerator,
      loading: isGeneratingEmail,
    },
    {
      name: 'Business Analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      status: aiStatus.analytics,
      description: 'AI-powered business insights and predictions',
    },
    {
      name: 'Financial Predictions',
      icon: <Brain className="h-5 w-5" />,
      status: aiStatus.predictions,
      description: 'Forecast revenue and expenses with AI',
    },
    {
      name: 'Project Planner',
      icon: <FileText className="h-5 w-5" />,
      status: true,
      description: 'AI-assisted project planning and scheduling',
    },
    {
      name: 'Voice Assistant',
      icon: <Sparkles className="h-5 w-5" />,
      status: aiStatus.voice,
      description: 'Voice-controlled assistant (Coming soon)',
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Functions Test Panel
            </CardTitle>
            <CardDescription>
              Test and validate all AI-powered features
            </CardDescription>
          </div>
          <Button onClick={handleTestAll} disabled={isTestingAll}>
            {isTestingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test All Functions'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {aiStatus.anyEnabled ? (
                  <span className="text-green-600">
                    AI features are enabled. Some features require API keys to be configured.
                  </span>
                ) : (
                  <span className="text-amber-600">
                    No AI features are currently enabled. Configure API keys to activate.
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {aiFeatures.map((feature) => (
                <Card key={feature.name} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {feature.icon}
                        <h3 className="font-semibold">{feature.name}</h3>
                      </div>
                      <Badge variant={feature.status ? 'default' : 'secondary'}>
                        {feature.status ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {feature.description}
                    </p>
                    {feature.test && feature.status && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={feature.test}
                        disabled={feature.loading}
                        className="w-full"
                      >
                        {feature.loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test Feature'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Edge Functions Status</CardTitle>
                  <CardDescription>
                    12 AI-powered edge functions deployed on Supabase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {Object.entries({
                      'auto-assign-tasks': 'Task auto-assignment with skill matching',
                      'smart-notifications': 'Intelligent notification system',
                      'workflow-orchestrator': 'Automated workflow management',
                      'ai-business-analyzer': 'Business metrics analysis',
                      'performance-optimizer': 'Performance optimization suggestions',
                      'project-planner-ai': 'AI-powered project planning',
                      'task-mermaid-generator': 'Diagram generation from tasks',
                      'email-generator': 'Professional email composition',
                      'financial-predictions': 'Revenue and expense forecasting',
                      'invoice-auto-generator': 'Automatic invoice generation',
                      'recruitment-ai-scorer': 'Candidate scoring and ranking',
                      'gemini-live-voice': 'Voice assistant (disabled)',
                    }).map(([func, desc]) => (
                      <div key={func} className="flex items-center justify-between p-2 rounded-lg border">
                        <div>
                          <code className="text-sm font-mono">{func}</code>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        {testResults[func.replace(/-/g, '-')] !== undefined && (
                          testResults[func.replace(/-/g, '-')] ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {Object.keys(testResults).length === 0 ? (
              <Alert>
                <AlertDescription>
                  No test results yet. Click "Test All Functions" to run tests.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {Object.entries(testResults).map(([func, passed]) => (
                  <div
                    key={func}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <span className="font-medium">{func}</span>
                    {passed ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Passed
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="mr-1 h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}