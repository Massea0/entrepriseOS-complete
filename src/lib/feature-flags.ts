import { supabase } from './supabase';

export interface FeatureFlags {
  AI_VOICE: boolean;
  AI_PREDICTIONS: boolean;
  AI_AUTO_ASSIGN: boolean;
  AI_ANALYTICS: boolean;
  AI_EMAIL_GENERATOR: boolean;
  INVENTORY_MODULE: boolean;
  MOBILE_PWA: boolean;
  REAL_TIME: boolean;
  ADVANCED_REPORTING: boolean;
  MULTI_LANGUAGE: boolean;
  TWO_FACTOR_AUTH: boolean;
  CUSTOM_WORKFLOWS: boolean;
}

// Default feature flags
const DEFAULT_FEATURES: FeatureFlags = {
  AI_VOICE: false,          // Désactivé temporairement
  AI_PREDICTIONS: true,     // Actif
  AI_AUTO_ASSIGN: true,     // Actif
  AI_ANALYTICS: true,       // Actif
  AI_EMAIL_GENERATOR: true, // Actif
  INVENTORY_MODULE: true,   // Nouveau module
  MOBILE_PWA: true,         // Progressive Web App
  REAL_TIME: true,          // WebSocket real-time
  ADVANCED_REPORTING: true, // Rapports avancés
  MULTI_LANGUAGE: false,    // En développement
  TWO_FACTOR_AUTH: true,    // Sécurité renforcée
  CUSTOM_WORKFLOWS: true,   // Workflows personnalisables
};

class FeatureFlagsManager {
  private static instance: FeatureFlagsManager;
  private flags: FeatureFlags = DEFAULT_FEATURES;
  private organizationId: string | null = null;

  private constructor() {}

  static getInstance(): FeatureFlagsManager {
    if (!FeatureFlagsManager.instance) {
      FeatureFlagsManager.instance = new FeatureFlagsManager();
    }
    return FeatureFlagsManager.instance;
  }

  async initialize(organizationId: string) {
    this.organizationId = organizationId;
    await this.loadFlags();
  }

  private async loadFlags() {
    if (!this.organizationId) return;

    try {
      // Load organization-specific feature flags
      const { data, error } = await supabase
        .from('organization_features')
        .select('feature_flags')
        .eq('organization_id', this.organizationId)
        .single();

      if (error) {
        console.error('Error loading feature flags:', error);
        return;
      }

      if (data?.feature_flags) {
        this.flags = { ...DEFAULT_FEATURES, ...data.feature_flags };
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  }

  isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature] ?? DEFAULT_FEATURES[feature];
  }

  getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  async updateFlag(feature: keyof FeatureFlags, enabled: boolean) {
    if (!this.organizationId) return;

    this.flags[feature] = enabled;

    try {
      const { error } = await supabase
        .from('organization_features')
        .update({ 
          feature_flags: this.flags,
          updated_at: new Date().toISOString()
        })
        .eq('organization_id', this.organizationId);

      if (error) {
        console.error('Error updating feature flag:', error);
        // Revert on error
        await this.loadFlags();
      }
    } catch (error) {
      console.error('Failed to update feature flag:', error);
      // Revert on error
      await this.loadFlags();
    }
  }

  // Helper methods for specific features
  hasAIFeatures(): boolean {
    return (
      this.flags.AI_PREDICTIONS ||
      this.flags.AI_AUTO_ASSIGN ||
      this.flags.AI_ANALYTICS ||
      this.flags.AI_EMAIL_GENERATOR
    );
  }

  hasInventoryModule(): boolean {
    return this.flags.INVENTORY_MODULE;
  }

  hasMobileFeatures(): boolean {
    return this.flags.MOBILE_PWA;
  }

  hasRealTimeFeatures(): boolean {
    return this.flags.REAL_TIME;
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagsManager.getInstance();

// React hook for feature flags
import { useEffect, useState } from 'react';

export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(featureFlags.isEnabled(feature));
  }, [feature]);

  return isEnabled;
}

export function useFeatureFlags(): FeatureFlags {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURES);

  useEffect(() => {
    setFlags(featureFlags.getFlags());
  }, []);

  return flags;
}