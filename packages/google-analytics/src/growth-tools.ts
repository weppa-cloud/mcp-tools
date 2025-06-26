import { z } from 'zod';

export const GetFunnelAnalysisSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  steps: z.array(z.object({
    name: z.string().describe('Step name (e.g., "Visit Homepage", "View Product", "Add to Cart")'),
    eventName: z.string().optional().describe('GA4 event name for this step'),
    pagePath: z.string().optional().describe('Page path for this step'),
  })).describe('Funnel steps in order'),
  segmentBy: z.array(z.string()).optional().describe('Dimensions to segment by (e.g., source, device)'),
});

export const GetCohortAnalysisSchema = z.object({
  startDate: z.string().describe('Start date for cohort in YYYY-MM-DD format'),
  endDate: z.string().describe('End date for cohort in YYYY-MM-DD format'),
  cohortType: z.enum(['daily', 'weekly', 'monthly']).describe('Cohort granularity'),
  metric: z.string().describe('Retention metric (e.g., activeUsers, sessions, revenue)'),
  periodsToAnalyze: z.number().optional().default(12).describe('Number of periods to analyze'),
});

export const GetUserSegmentsSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  segmentType: z.enum(['behavior', 'technology', 'acquisition', 'demographic']).describe('Type of segmentation'),
  metrics: z.array(z.string()).describe('Metrics to analyze per segment'),
  minThreshold: z.number().optional().describe('Minimum users per segment to include'),
});

export const GetConversionPathsSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  conversionEvent: z.string().describe('Conversion event to analyze (e.g., purchase, signup)'),
  touchpointDimension: z.string().optional().default('sessionSource').describe('Dimension for touchpoints'),
  pathLength: z.number().optional().default(5).describe('Maximum path length to analyze'),
});

export const GetGrowthMetricsSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  compareWith: z.enum(['previous_period', 'previous_year', 'custom']).optional(),
  customCompareStartDate: z.string().optional().describe('Custom comparison start date'),
  customCompareEndDate: z.string().optional().describe('Custom comparison end date'),
  metrics: z.array(z.enum([
    'user_growth_rate',
    'revenue_growth_rate',
    'retention_rate',
    'churn_rate',
    'ltv',
    'cac',
    'viral_coefficient',
    'activation_rate'
  ])).optional().default(['user_growth_rate', 'retention_rate']),
});

export const GetABTestAnalysisSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  experimentDimension: z.string().describe('Dimension containing experiment variants'),
  successMetrics: z.array(z.string()).describe('Success metrics to compare'),
  guardrailMetrics: z.array(z.string()).optional().describe('Guardrail metrics to monitor'),
  segmentBy: z.array(z.string()).optional().describe('Additional dimensions to segment results'),
});

export const GetUserJourneySchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  userId: z.string().optional().describe('Specific user ID to analyze'),
  userSegment: z.object({
    dimension: z.string(),
    value: z.string(),
  }).optional().describe('User segment to analyze'),
  eventTypes: z.array(z.string()).optional().describe('Event types to include in journey'),
  maxEvents: z.number().optional().default(50).describe('Maximum events per journey'),
});

export const GetPowerUsersSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  threshold: z.object({
    metric: z.string().describe('Metric to identify power users (e.g., sessions, events, revenue)'),
    value: z.number().describe('Minimum value to qualify as power user'),
  }),
  analyzeMetrics: z.array(z.string()).describe('Additional metrics to analyze for power users'),
  compareWithAverage: z.boolean().optional().default(true).describe('Compare with average users'),
});