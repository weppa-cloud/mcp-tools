import { z } from 'zod';

// 🚀 GROWTH HACKING SCHEMAS - Speed & Action Focused

export const GrowthPulseSchema = z.object({
  timeframe: z.enum(['today', 'yesterday', 'last7days', 'last30days']).default('today')
});

export const FindGrowthLeversSchema = z.object({
  focus: z.enum(['acquisition', 'activation', 'retention', 'revenue', 'referral']).default('revenue'),
  limit: z.number().default(5)
});

export const TrackExperimentSchema = z.object({
  experimentId: z.string(),
  action: z.enum(['start', 'check', 'end']),
  variants: z.array(z.string()).optional(),
  successMetric: z.string().optional()
});

export const FunnelLeaksSchema = z.object({
  steps: z.array(z.object({
    name: z.string(),
    identifier: z.object({
      eventName: z.string().optional(),
      pagePath: z.string().optional()
    })
  })),
  revenueEvent: z.string().default('purchase')
});

export const ViralCoefficientSchema = z.object({
  inviteEvent: z.string().default('invite_sent'),
  acceptEvent: z.string().default('invite_accepted'),
  timeframe: z.string().default('30daysAgo')
});

export const PredictChurnSchema = z.object({
  segment: z.enum(['all', 'paying', 'trial', 'free']).default('paying'),
  riskThreshold: z.number().min(0).max(1).default(0.7)
});

export const RevenueForcastSchema = z.object({
  days: z.number().min(1).max(90).default(30),
  includeSeasonality: z.boolean().default(true)
});

export const QuickInsightSchema = z.object({
  question: z.string(),
  context: z.enum(['revenue', 'traffic', 'conversion', 'retention']).optional()
});

export const GrowthAlertSchema = z.object({
  action: z.enum(['subscribe', 'unsubscribe', 'list']),
  alerts: z.array(z.enum([
    'traffic_spike',
    'conversion_drop',
    'revenue_anomaly',
    'new_segment',
    'experiment_significant',
    'churn_risk',
    'viral_moment'
  ])).optional()
});

export const ExecuteRecipeSchema = z.object({
  recipe: z.enum([
    'black_friday_prep',
    'new_product_launch',
    'retention_campaign',
    'viral_loop_setup',
    'pricing_test',
    'onboarding_optimization',
    'win_back_campaign'
  ]),
  parameters: z.record(z.any()).optional()
});

// 🎯 Response Types for Type Safety

export interface GrowthPulseResponse {
  traffic: {
    total: number;
    change: string;
    alert: '🟢' | '🟡' | '🔴';
  };
  conversions: {
    rate: string;
    total: number;
    change: string;
    alert: '🟢' | '🟡' | '🔴';
  };
  revenue: {
    total: string;
    change: string;
    averageOrderValue: string;
    alert: '🟢' | '🟡' | '🔴';
  };
  topIssue?: string;
  topOpportunity?: string;
}

export interface GrowthLeverResponse {
  quickWins: string[];
  experiments: string[];
  focusAreas: {
    area: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    recommendation: string;
  }[];
}

export interface ExperimentStatus {
  status: 'running' | 'significant' | 'not_significant' | 'ended';
  winner?: string;
  uplift?: string;
  confidence?: string;
  recommendation?: string;
  daysRunning?: number;
  sampleSize?: number;
}

export interface FunnelLeakResponse {
  totalLostRevenue: string;
  steps: {
    name: string;
    conversionRate: string;
    dropOffRate: string;
    lostRevenue: string;
    improvement: string;
  }[];
  biggestLeak: string;
  recommendedFix: string;
}

export interface ViralCoefficientResponse {
  coefficient: number;
  status: 'viral' | 'near-viral' | 'not-viral';
  invitesPerUser: number;
  conversionRate: string;
  needed: string;
  topReferrers: string[];
}

export interface ChurnPrediction {
  atRiskUsers: number;
  churnProbability: string;
  expectedLoss: string;
  recommendedAction: string;
  riskFactors: string[];
}

export interface RevenueForecast {
  forecast: string;
  confidence: string;
  growthRate: string;
  trend: 'up' | 'down' | 'stable';
  risks: string[];
  opportunities: string[];
}