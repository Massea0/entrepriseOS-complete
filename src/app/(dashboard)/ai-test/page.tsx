'use client';

import { AIFunctionsTestPanel } from '@/features/ai/components/AIFunctionsTestPanel';

export default function AITestPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Features Testing</h1>
        <p className="text-muted-foreground">
          Test and validate all AI-powered features integrated with Supabase Edge Functions
        </p>
      </div>
      
      <AIFunctionsTestPanel />
    </div>
  );
}