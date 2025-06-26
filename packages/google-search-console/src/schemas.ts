import { z } from 'zod';

// MVP Schemas
export const SeoPulseSchema = z.object({
  timeframe: z.enum(['7days', '28days', '3months']).optional().default('7days')
    .describe('Período de análisis para el health check'),
});

export const KeywordOpportunitiesSchema = z.object({
  minImpressions: z.number().optional().default(100)
    .describe('Mínimo de impresiones para considerar una keyword'),
  positionRange: z.object({
    min: z.number().default(4),
    max: z.number().default(20),
  }).optional().describe('Rango de posiciones para buscar oportunidades (default: 4-20)'),
  limit: z.number().optional().default(20)
    .describe('Número máximo de oportunidades a retornar'),
});

export const ContentGapsSchema = z.object({
  minImpressions: z.number().optional().default(50)
    .describe('Mínimo de impresiones para considerar un gap'),
  maxPosition: z.number().optional().default(50)
    .describe('Posición máxima para incluir en el análisis'),
  limit: z.number().optional().default(15)
    .describe('Número máximo de gaps a retornar'),
});

// Analysis Schemas
export const PagePerformanceSchema = z.object({
  page: z.string().describe('URL de la página a analizar'),
  startDate: z.string().optional().describe('Fecha inicio YYYY-MM-DD (default: 28 días atrás)'),
  endDate: z.string().optional().describe('Fecha fin YYYY-MM-DD (default: ayer)'),
  compareWithPrevious: z.boolean().optional().default(true)
    .describe('Comparar con período anterior'),
});

export const SearchTrendsSchema = z.object({
  dimension: z.enum(['query', 'page', 'country', 'device'])
    .describe('Dimensión para analizar tendencias'),
  startDate: z.string().optional().describe('Fecha inicio YYYY-MM-DD (default: 90 días atrás)'),
  endDate: z.string().optional().describe('Fecha fin YYYY-MM-DD (default: ayer)'),
  limit: z.number().optional().default(10)
    .describe('Número de elementos trending a mostrar'),
});

export const TechnicalAuditSchema = z.object({
  includePageExperience: z.boolean().optional().default(true)
    .describe('Incluir Core Web Vitals y métricas de experiencia'),
  includeMobileUsability: z.boolean().optional().default(true)
    .describe('Incluir análisis de usabilidad móvil'),
  includeRichResults: z.boolean().optional().default(true)
    .describe('Incluir estado de rich snippets y datos estructurados'),
});

export const CompetitorAnalysisSchema = z.object({
  competitorDomains: z.array(z.string())
    .describe('Lista de dominios competidores para comparar'),
  startDate: z.string().optional().describe('Fecha inicio YYYY-MM-DD'),
  endDate: z.string().optional().describe('Fecha fin YYYY-MM-DD'),
  focusMetric: z.enum(['position', 'clicks', 'impressions', 'ctr'])
    .optional().default('position')
    .describe('Métrica principal para la comparación'),
});

// Response Types
export interface SeoHealthMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  change: {
    clicks: string;
    impressions: string;
    ctr: string;
    position: string;
  };
}

export interface KeywordOpportunity {
  query: string;
  position: number;
  impressions: number;
  clicks: number;
  ctr: number;
  potentialClicks: number;
  effort: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface ContentGap {
  query: string;
  impressions: number;
  position: number;
  userIntent: string;
  contentType: string;
  priority: 'high' | 'medium' | 'low';
  suggestedAction: string;
}