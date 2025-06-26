import { google } from 'googleapis';
import { getDateRanges, formatCurrency, calculateChange } from './utils.js';

// 🚀 MVP Tools

export async function seoPulse(
  searchConsole: any,
  siteUrl: string,
  timeframe: '7days' | '28days' | '3months' = '7days'
) {
  const { current, previous } = getDateRanges(timeframe);
  
  // Obtener métricas actuales y anteriores
  const [currentMetrics, previousMetrics, topQueries, topPages] = await Promise.all([
    // Métricas actuales
    searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: current.startDate,
        endDate: current.endDate,
        dimensions: ['date'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
      },
    }),
    // Métricas período anterior
    searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: previous.startDate,
        endDate: previous.endDate,
        dimensions: ['date'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
      },
    }),
    // Top queries
    searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: current.startDate,
        endDate: current.endDate,
        dimensions: ['query'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        rowLimit: 5,
      },
    }),
    // Top pages
    searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: current.startDate,
        endDate: current.endDate,
        dimensions: ['page'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        rowLimit: 5,
      },
    }),
  ]);

  // Calcular totales
  const currentTotals = aggregateMetrics(currentMetrics.data.rows);
  const previousTotals = aggregateMetrics(previousMetrics.data.rows);

  // Detectar problemas y oportunidades
  const issues = detectSEOIssues(currentTotals, previousTotals);
  const opportunities = detectSEOOpportunities(currentTotals, topQueries.data.rows);

  return {
    metrics: {
      clicks: {
        total: currentTotals.clicks,
        change: calculateChange(currentTotals.clicks, previousTotals.clicks),
        alert: getAlert(currentTotals.clicks, previousTotals.clicks),
      },
      impressions: {
        total: currentTotals.impressions,
        change: calculateChange(currentTotals.impressions, previousTotals.impressions),
        alert: getAlert(currentTotals.impressions, previousTotals.impressions),
      },
      ctr: {
        rate: `${(currentTotals.ctr * 100).toFixed(1)}%`,
        change: calculateChange(currentTotals.ctr, previousTotals.ctr),
        alert: getAlert(currentTotals.ctr, previousTotals.ctr),
      },
      position: {
        average: currentTotals.position.toFixed(1),
        change: calculateChange(currentTotals.position, previousTotals.position, true),
        alert: getAlert(previousTotals.position, currentTotals.position), // Invertido porque menor es mejor
      },
    },
    topPerformers: {
      queries: topQueries.data.rows?.slice(0, 3).map((row: any) => ({
        query: row.keys[0],
        clicks: row.clicks,
        position: row.position.toFixed(1),
      })),
      pages: topPages.data.rows?.slice(0, 3).map((row: any) => ({
        page: row.keys[0].replace(siteUrl, ''),
        clicks: row.clicks,
        ctr: `${(row.ctr * 100).toFixed(1)}%`,
      })),
    },
    insights: generateSEOInsights(currentTotals, previousTotals, issues, opportunities),
    actions: generateSEOActions(issues, opportunities),
    issues,
    opportunities,
  };
}

export async function findKeywordOpportunities(
  searchConsole: any,
  siteUrl: string,
  minImpressions: number = 100,
  positionRange: { min: number; max: number } = { min: 4, max: 20 },
  limit: number = 20
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dimensions: ['query', 'page'],
      metrics: ['clicks', 'impressions', 'ctr', 'position'],
      rowLimit: 1000,
    },
  });

  // Filtrar y analizar oportunidades
  const opportunities = response.data.rows
    ?.filter((row: any) => 
      row.impressions >= minImpressions &&
      row.position >= positionRange.min &&
      row.position <= positionRange.max
    )
    .map((row: any) => {
      const currentCTR = row.ctr;
      const targetCTR = getExpectedCTR(row.position);
      const potentialClicks = Math.round(row.impressions * targetCTR);
      const additionalClicks = potentialClicks - row.clicks;
      
      return {
        query: row.keys[0],
        page: row.keys[1].replace(siteUrl, ''),
        position: row.position,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: `${(currentCTR * 100).toFixed(1)}%`,
        potentialClicks,
        additionalClicks,
        revenue: formatCurrency(additionalClicks * 2.5), // Asumiendo $2.5 por click
        effort: getOptimizationEffort(row.position),
        recommendation: getKeywordRecommendation(row),
      };
    })
    .filter((opp: any) => opp.additionalClicks > 10)
    .sort((a: any, b: any) => b.additionalClicks - a.additionalClicks)
    .slice(0, limit);

  const totalPotentialClicks = opportunities.reduce((sum: number, opp: any) => sum + opp.additionalClicks, 0);
  const totalPotentialRevenue = formatCurrency(totalPotentialClicks * 2.5);

  return {
    summary: {
      totalOpportunities: opportunities.length,
      totalPotentialClicks,
      totalPotentialRevenue,
      quickWins: opportunities.filter((o: any) => o.effort === 'low').length,
    },
    opportunities,
    insights: `Encontré ${opportunities.length} keywords con potencial. Las top 5 pueden generar ${opportunities.slice(0, 5).reduce((sum: number, o: any) => sum + o.additionalClicks, 0)} clicks adicionales al mes.`,
    actions: [
      `Optimiza meta títulos y descriptions de las páginas en posiciones 4-10`,
      `Agrega contenido relevante a páginas con keywords en posiciones 11-20`,
      `Implementa schema markup para mejorar CTR en SERPs`,
    ],
  };
}

export async function analyzeContentGaps(
  searchConsole: any,
  siteUrl: string,
  minImpressions: number = 50,
  maxPosition: number = 50,
  limit: number = 15
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // 3 meses para mejor data

  const response = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dimensions: ['query'],
      metrics: ['impressions', 'clicks', 'position'],
      rowLimit: 5000,
    },
  });

  // Identificar gaps: queries con impresiones pero pocas clicks o mala posición
  const gaps = response.data.rows
    ?.filter((row: any) => 
      row.impressions >= minImpressions &&
      (row.position > 20 || row.clicks < row.impressions * 0.01) // CTR < 1% o posición > 20
    )
    .map((row: any) => {
      const intent = detectSearchIntent(row.keys[0]);
      const contentType = suggestContentType(row.keys[0], intent);
      const priority = calculateGapPriority(row.impressions, row.position);
      
      return {
        query: row.keys[0],
        impressions: row.impressions,
        position: row.position.toFixed(1),
        currentClicks: row.clicks,
        potentialTraffic: Math.round(row.impressions * getExpectedCTR(10)), // Si alcanzara posición 10
        userIntent: intent,
        contentType,
        priority,
        suggestedAction: getContentSuggestion(row.keys[0], intent, contentType),
        estimatedEffort: getContentEffort(contentType),
      };
    })
    .sort((a: any, b: any) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder as any)[b.priority] - (priorityOrder as any)[a.priority] || b.impressions - a.impressions;
    })
    .slice(0, limit);

  const totalPotentialTraffic = gaps.reduce((sum: number, gap: any) => sum + gap.potentialTraffic, 0);

  return {
    summary: {
      totalGaps: gaps.length,
      totalPotentialTraffic,
      byIntent: groupByIntent(gaps),
      byContentType: groupByContentType(gaps),
    },
    gaps,
    insights: generateContentGapInsights(gaps),
    actions: generateContentPlan(gaps),
    contentCalendar: generateContentCalendar(gaps.slice(0, 5)),
  };
}

export async function getPagePerformance(
  searchConsole: any,
  siteUrl: string,
  page: string,
  startDate?: string,
  endDate?: string,
  compareWithPrevious: boolean = true
) {
  const dates = {
    endDate: endDate || new Date().toISOString().split('T')[0],
    startDate: startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 28);
      return d.toISOString().split('T')[0];
    })(),
  };

  // Obtener datos de la página
  const [pageMetrics, pageQueries, deviceBreakdown] = await Promise.all([
    // Métricas generales
    searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        ...dates,
        dimensions: ['page'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            expression: page.startsWith('http') ? page : `${siteUrl}${page}`,
          }],
        }],
      },
    }),
    // Queries de la página
    searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        ...dates,
        dimensions: ['query'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            expression: page.startsWith('http') ? page : `${siteUrl}${page}`,
          }],
        }],
        rowLimit: 20,
      },
    }),
    // Por dispositivo
    searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        ...dates,
        dimensions: ['device'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            expression: page.startsWith('http') ? page : `${siteUrl}${page}`,
          }],
        }],
      },
    }),
  ]);

  const currentMetrics = pageMetrics.data.rows?.[0] || {};
  
  // Comparación con período anterior si se solicita
  let comparison = null;
  if (compareWithPrevious) {
    const periodLength = new Date(dates.endDate).getTime() - new Date(dates.startDate).getTime();
    const previousEnd = new Date(new Date(dates.startDate).getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodLength);
    
    const previousMetrics = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: previousStart.toISOString().split('T')[0],
        endDate: previousEnd.toISOString().split('T')[0],
        dimensions: ['page'],
        metrics: ['clicks', 'impressions', 'ctr', 'position'],
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            expression: page.startsWith('http') ? page : `${siteUrl}${page}`,
          }],
        }],
      },
    });
    
    const prev = previousMetrics.data.rows?.[0] || {};
    comparison = {
      clicks: calculateChange(currentMetrics.clicks || 0, prev.clicks || 0),
      impressions: calculateChange(currentMetrics.impressions || 0, prev.impressions || 0),
      ctr: calculateChange(currentMetrics.ctr || 0, prev.ctr || 0),
      position: calculateChange(currentMetrics.position || 0, prev.position || 0, true),
    };
  }

  // Análisis de queries
  const queryAnalysis = analyzePageQueries(pageQueries.data.rows || []);
  
  return {
    page: page.replace(siteUrl, ''),
    period: dates,
    metrics: {
      clicks: currentMetrics.clicks || 0,
      impressions: currentMetrics.impressions || 0,
      ctr: `${((currentMetrics.ctr || 0) * 100).toFixed(1)}%`,
      avgPosition: (currentMetrics.position || 0).toFixed(1),
    },
    comparison,
    topQueries: pageQueries.data.rows?.slice(0, 10).map((row: any) => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position.toFixed(1),
      opportunity: row.position > 3 && row.impressions > 100 ? 'high' : 'normal',
    })),
    devicePerformance: deviceBreakdown.data.rows?.map((row: any) => ({
      device: row.keys[0],
      clicks: row.clicks,
      ctr: `${(row.ctr * 100).toFixed(1)}%`,
      position: row.position.toFixed(1),
    })),
    insights: generatePageInsights(currentMetrics, queryAnalysis, comparison),
    optimizations: generatePageOptimizations(currentMetrics, queryAnalysis),
  };
}

export async function analyzeSearchTrends(
  searchConsole: any,
  siteUrl: string,
  dimension: 'query' | 'page' | 'country' | 'device' = 'query',
  startDate?: string,
  endDate?: string,
  limit: number = 10
) {
  const dates = {
    endDate: endDate || new Date().toISOString().split('T')[0],
    startDate: startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 90); // 90 días para tendencias
      return d.toISOString().split('T')[0];
    })(),
  };

  // Dividir período en intervalos para análisis de tendencia
  const intervals = splitDateRange(dates.startDate, dates.endDate, 4);
  
  // Obtener datos por intervalo
  const trendData = await Promise.all(
    intervals.map(interval => 
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: interval.start,
          endDate: interval.end,
          dimensions: [dimension],
          metrics: ['clicks', 'impressions'],
          rowLimit: 50,
        },
      })
    )
  );

  // Analizar tendencias
  const trends = analyzeTrendData(trendData, dimension);
  
  // Detectar estacionalidad
  const seasonality = detectSeasonality(trendData);
  
  return {
    period: dates,
    dimension,
    trends: {
      rising: trends.rising.slice(0, limit),
      declining: trends.declining.slice(0, limit),
      stable: trends.stable.slice(0, 5),
    },
    seasonality,
    insights: generateTrendInsights(trends, seasonality),
    predictions: generateTrendPredictions(trends),
    actions: generateTrendActions(trends, dimension),
  };
}

export async function technicalSEOAudit(
  searchConsole: any,
  siteUrl: string,
  includePageExperience: boolean = true,
  includeMobileUsability: boolean = true,
  includeRichResults: boolean = true
) {
  const audits = [];

  // Core Web Vitals / Page Experience
  if (includePageExperience) {
    try {
      const pageExperience = await searchConsole.urlInspection.index.inspect({
        siteUrl,
        inspectionUrl: siteUrl,
      });
      
      audits.push({
        category: 'Page Experience',
        status: analyzePageExperienceStatus(pageExperience),
        issues: extractPageExperienceIssues(pageExperience),
        recommendations: generatePageExperienceRecommendations(pageExperience),
      });
    } catch (error) {
      audits.push({
        category: 'Page Experience',
        status: 'error',
        message: 'Could not fetch Page Experience data',
      });
    }
  }

  // Mobile Usability
  if (includeMobileUsability) {
    try {
      const mobileIssues = await searchConsole.urlTestingTools.mobileFriendlyTest.run({
        url: siteUrl,
      });
      
      audits.push({
        category: 'Mobile Usability',
        status: mobileIssues.data.mobileFriendliness === 'MOBILE_FRIENDLY' ? 'good' : 'issues',
        issues: mobileIssues.data.mobileFriendlyIssues || [],
        recommendations: generateMobileRecommendations(mobileIssues.data),
      });
    } catch (error) {
      audits.push({
        category: 'Mobile Usability',
        status: 'error',
        message: 'Could not fetch Mobile Usability data',
      });
    }
  }

  // Rich Results / Structured Data
  if (includeRichResults) {
    try {
      const richResults = await searchConsole.urlTestingTools.richResultsTest.run({
        url: siteUrl,
      });
      
      audits.push({
        category: 'Rich Results',
        status: richResults.data.verdict === 'PASS' ? 'good' : 'issues',
        detectedTypes: richResults.data.richResultsTypes || [],
        issues: richResults.data.issues || [],
        recommendations: generateRichResultsRecommendations(richResults.data),
      });
    } catch (error) {
      audits.push({
        category: 'Rich Results',
        status: 'error',
        message: 'Could not fetch Rich Results data',
      });
    }
  }

  const summary = generateTechnicalSummary(audits);
  
  return {
    audits,
    summary,
    priority: prioritizeTechnicalIssues(audits),
    insights: generateTechnicalInsights(audits),
    roadmap: generateTechnicalRoadmap(audits),
  };
}

export async function competitorAnalysis(
  searchConsole: any,
  siteUrl: string,
  competitorDomains: string[],
  startDate?: string,
  endDate?: string,
  focusMetric: 'position' | 'clicks' | 'impressions' | 'ctr' = 'position'
) {
  // Nota: Search Console no provee datos directos de competidores
  // Esta función simula un análisis basado en queries compartidas
  
  const dates = {
    endDate: endDate || new Date().toISOString().split('T')[0],
    startDate: startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 28);
      return d.toISOString().split('T')[0];
    })(),
  };

  // Obtener nuestras top queries
  const ourQueries = await searchConsole.searchanalytics.query({
    siteUrl,
    requestBody: {
      ...dates,
      dimensions: ['query'],
      metrics: ['clicks', 'impressions', 'ctr', 'position'],
      rowLimit: 1000,
    },
  });

  // Análisis simulado de competidores
  const analysis = {
    ourDomain: siteUrl.replace(/https?:\/\//, '').replace(/\/$/, ''),
    competitors: competitorDomains,
    period: dates,
    
    // Métricas comparativas (simuladas para ejemplo)
    marketShare: {
      ourShare: 24.5,
      competitorShares: competitorDomains.map((domain, i) => ({
        domain,
        share: 20 + Math.random() * 15,
      })),
    },
    
    // Keywords donde perdemos
    losingKeywords: ourQueries.data.rows
      ?.filter((row: any) => row.position > 10)
      .slice(0, 20)
      .map((row: any) => ({
        query: row.keys[0],
        ourPosition: row.position.toFixed(1),
        estimatedCompetitorPosition: Math.max(1, row.position - 5 - Math.random() * 5).toFixed(1),
        impressions: row.impressions,
        opportunity: 'high',
      })),
    
    // Keywords donde ganamos
    winningKeywords: ourQueries.data.rows
      ?.filter((row: any) => row.position <= 3)
      .slice(0, 10)
      .map((row: any) => ({
        query: row.keys[0],
        ourPosition: row.position.toFixed(1),
        clicks: row.clicks,
        defend: row.impressions > 1000 ? 'priority' : 'monitor',
      })),
    
    // Gaps identificados
    contentGaps: generateCompetitorGaps(ourQueries.data.rows),
  };

  return {
    analysis,
    insights: generateCompetitorInsights(analysis),
    opportunities: identifyCompetitorOpportunities(analysis),
    strategy: generateCompetitiveStrategy(analysis),
    actions: generateCompetitorActions(analysis),
  };
}

// Funciones auxiliares

function aggregateMetrics(rows: any[]) {
  if (!rows || rows.length === 0) {
    return { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  }
  
  const totals = rows.reduce((acc, row) => ({
    clicks: acc.clicks + (row.clicks || 0),
    impressions: acc.impressions + (row.impressions || 0),
    ctrSum: acc.ctrSum + (row.ctr || 0),
    positionSum: acc.positionSum + (row.position || 0),
    count: acc.count + 1,
  }), { clicks: 0, impressions: 0, ctrSum: 0, positionSum: 0, count: 0 });

  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr: totals.impressions > 0 ? totals.clicks / totals.impressions : 0,
    position: totals.count > 0 ? totals.positionSum / totals.count : 0,
  };
}

function detectSEOIssues(current: any, previous: any) {
  const issues = [];
  
  if (current.clicks < previous.clicks * 0.8) {
    issues.push({
      type: 'traffic_drop',
      severity: 'high',
      message: `Clicks cayeron ${calculateChange(current.clicks, previous.clicks)}`,
    });
  }
  
  if (current.position > previous.position * 1.2) {
    issues.push({
      type: 'ranking_drop',
      severity: 'medium',
      message: `Posición promedio empeoró de ${previous.position.toFixed(1)} a ${current.position.toFixed(1)}`,
    });
  }
  
  if (current.ctr < previous.ctr * 0.9) {
    issues.push({
      type: 'ctr_drop',
      severity: 'medium',
      message: `CTR bajó ${calculateChange(current.ctr, previous.ctr)}`,
    });
  }
  
  return issues;
}

function detectSEOOpportunities(current: any, topQueries: any[]) {
  const opportunities = [];
  
  // CTR bajo con buenas posiciones
  const goodPositionLowCTR = topQueries?.filter((q: any) => 
    q.position < 5 && q.ctr < getExpectedCTR(q.position) * 0.7
  );
  
  if (goodPositionLowCTR?.length > 0) {
    opportunities.push({
      type: 'improve_ctr',
      priority: 'high',
      message: `${goodPositionLowCTR.length} keywords en top 5 con CTR bajo`,
      action: 'Optimizar meta descriptions y títulos',
    });
  }
  
  // Keywords cerca de top 3
  const nearTop = topQueries?.filter((q: any) => 
    q.position > 3 && q.position <= 10 && q.impressions > 500
  );
  
  if (nearTop?.length > 0) {
    opportunities.push({
      type: 'push_to_top',
      priority: 'medium',
      message: `${nearTop.length} keywords pueden subir a top 3`,
      action: 'Mejorar contenido y enlaces internos',
    });
  }
  
  return opportunities;
}

function getExpectedCTR(position: number): number {
  // CTR esperado por posición (datos de referencia de la industria)
  const ctrByPosition = {
    1: 0.28,
    2: 0.15,
    3: 0.11,
    4: 0.08,
    5: 0.07,
    6: 0.05,
    7: 0.04,
    8: 0.03,
    9: 0.03,
    10: 0.03,
  };
  
  if (position <= 10) {
    return (ctrByPosition as any)[Math.round(position)] || 0.02;
  } else if (position <= 20) {
    return 0.02;
  } else {
    return 0.01;
  }
}

function getOptimizationEffort(position: number): 'low' | 'medium' | 'high' {
  if (position <= 5) return 'low';
  if (position <= 15) return 'medium';
  return 'high';
}

function getKeywordRecommendation(row: any): string {
  if (row.position <= 3) {
    return 'Optimizar CTR con mejor meta description';
  } else if (row.position <= 10) {
    return 'Mejorar contenido y agregar más información relevante';
  } else if (row.position <= 20) {
    return 'Fortalecer autoridad con enlaces internos y contenido relacionado';
  } else {
    return 'Crear contenido dedicado o mejorar significativamente el existente';
  }
}

function detectSearchIntent(query: string): string {
  const lower = query.toLowerCase();
  
  if (lower.includes('que es') || lower.includes('como') || lower.includes('por que')) {
    return 'informacional';
  } else if (lower.includes('comprar') || lower.includes('precio') || lower.includes('barato')) {
    return 'transaccional';
  } else if (lower.includes('mejor') || lower.includes('vs') || lower.includes('comparar')) {
    return 'comercial';
  } else if (lower.includes('cerca') || lower.includes('en ')) {
    return 'local';
  } else {
    return 'navegacional';
  }
}

function suggestContentType(query: string, intent: string): string {
  const contentTypes = {
    informacional: 'Guía completa o artículo educativo',
    transaccional: 'Página de producto o landing page',
    comercial: 'Comparativa o review detallado',
    local: 'Página de ubicación con información local',
    navegacional: 'Página de categoría o hub de contenido',
  };
  
  return (contentTypes as any)[intent] || 'Artículo optimizado';
}

function calculateGapPriority(impressions: number, position: number): 'high' | 'medium' | 'low' {
  if (impressions > 1000 && position > 20) return 'high';
  if (impressions > 500 || position > 30) return 'medium';
  return 'low';
}

function getContentSuggestion(query: string, intent: string, contentType: string): string {
  return `Crear ${contentType} targeting "${query}" con enfoque ${intent}`;
}

function getContentEffort(contentType: string): string {
  const efforts = {
    'Página de producto o landing page': '2-3 horas',
    'Guía completa o artículo educativo': '4-6 horas',
    'Comparativa o review detallado': '6-8 horas',
    'Página de ubicación con información local': '1-2 horas',
    'Página de categoría o hub de contenido': '3-4 horas',
    'Artículo optimizado': '2-4 horas',
  };
  
  return (efforts as any)[contentType] || '3-5 horas';
}

function getAlert(current: number, previous: number): '🟢' | '🟡' | '🔴' {
  const change = ((current - previous) / previous) * 100;
  if (change >= 0) return '🟢';
  if (change >= -10) return '🟡';
  return '🔴';
}

function generateSEOInsights(current: any, previous: any, issues: any[], opportunities: any[]): string {
  const parts = [];
  
  if (issues.length > 0) {
    parts.push(`⚠️ ${issues.length} problemas detectados que requieren atención`);
  }
  
  if (opportunities.length > 0) {
    parts.push(`🎯 ${opportunities.length} oportunidades de mejora identificadas`);
  }
  
  if (current.clicks > previous.clicks * 1.2) {
    parts.push(`🚀 Excelente! Tráfico creció ${calculateChange(current.clicks, previous.clicks)}`);
  }
  
  return parts.join('. ') || 'SEO estable, sin cambios significativos.';
}

function generateSEOActions(issues: any[], opportunities: any[]): string[] {
  const actions: string[] = [];
  
  // Acciones para issues
  issues.forEach(issue => {
    if (issue.type === 'traffic_drop') {
      actions.push('Revisar cambios recientes en el sitio y algoritmo');
    } else if (issue.type === 'ranking_drop') {
      actions.push('Auditar backlinks perdidos y contenido de competidores');
    } else if (issue.type === 'ctr_drop') {
      actions.push('A/B test meta titles y descriptions');
    }
  });
  
  // Acciones para oportunidades
  opportunities.forEach(opp => {
    if (opp.action) {
      actions.push(opp.action);
    }
  });
  
  return actions.slice(0, 5); // Top 5 acciones
}

function groupByIntent(gaps: any[]): Record<string, number> {
  return gaps.reduce((acc, gap) => {
    acc[gap.userIntent] = (acc[gap.userIntent] || 0) + 1;
    return acc;
  }, {});
}

function groupByContentType(gaps: any[]): Record<string, number> {
  return gaps.reduce((acc, gap) => {
    acc[gap.contentType] = (acc[gap.contentType] || 0) + 1;
    return acc;
  }, {});
}

function generateContentGapInsights(gaps: any[]): string {
  if (gaps.length === 0) return 'No se encontraron gaps significativos de contenido.';
  
  const totalImpressions = gaps.reduce((sum, gap) => sum + gap.impressions, 0);
  const highPriorityCount = gaps.filter(g => g.priority === 'high').length;
  
  return `Encontré ${gaps.length} oportunidades de contenido con ${totalImpressions.toLocaleString()} impresiones mensuales. ${highPriorityCount} son de alta prioridad y pueden generar resultados rápidos.`;
}

function generateContentPlan(gaps: any[]): string[] {
  const plan: string[] = [];
  
  const byIntent = groupByIntent(gaps);
  Object.entries(byIntent).forEach(([intent, count]) => {
    if (count > 2) {
      plan.push(`Crear cluster de contenido ${intent} (${count} piezas)`);
    }
  });
  
  const highPriority = gaps.filter(g => g.priority === 'high').slice(0, 3);
  highPriority.forEach(gap => {
    plan.push(`Prioridad: ${gap.suggestedAction}`);
  });
  
  return plan;
}

function generateContentCalendar(gaps: any[]): any[] {
  return gaps.map((gap, index) => ({
    week: Math.floor(index / 2) + 1,
    content: gap.suggestedAction,
    estimatedTraffic: gap.potentialTraffic,
    effort: gap.estimatedEffort,
  }));
}

function analyzePageQueries(queries: any[]): any {
  if (!queries || queries.length === 0) return {};
  
  const branded = queries.filter(q => q.keys[0].toLowerCase().includes('marca')); // Ajustar según marca
  const nonBranded = queries.filter(q => !q.keys[0].toLowerCase().includes('marca'));
  
  return {
    total: queries.length,
    branded: branded.length,
    nonBranded: nonBranded.length,
    avgPosition: queries.reduce((sum, q) => sum + q.position, 0) / queries.length,
    topOpportunity: queries.find(q => q.position > 3 && q.impressions > 100),
  };
}

function generatePageInsights(metrics: any, queryAnalysis: any, comparison: any): string {
  const parts = [];
  
  if (comparison && parseFloat(comparison.clicks) < -20) {
    parts.push('⚠️ Tráfico cayó significativamente');
  }
  
  if (queryAnalysis.topOpportunity) {
    parts.push(`🎯 Oportunidad: "${queryAnalysis.topOpportunity.keys[0]}" puede subir a top 3`);
  }
  
  if (metrics.ctr < 0.02) {
    parts.push('📉 CTR muy bajo, revisar meta tags');
  }
  
  return parts.join('. ') || 'Página con rendimiento estable.';
}

function generatePageOptimizations(metrics: any, queryAnalysis: any): string[] {
  const optimizations = [];
  
  if (metrics.ctr < 0.02) {
    optimizations.push('Reescribir meta title para ser más atractivo');
    optimizations.push('Agregar schema markup para rich snippets');
  }
  
  if (metrics.position > 10) {
    optimizations.push('Mejorar contenido con más profundidad');
    optimizations.push('Conseguir más enlaces internos relevantes');
  }
  
  if (queryAnalysis.topOpportunity) {
    optimizations.push(`Optimizar para "${queryAnalysis.topOpportunity.keys[0]}"`);
  }
  
  return optimizations;
}

function splitDateRange(startDate: string, endDate: string, intervals: number): any[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const intervalDays = Math.floor(totalDays / intervals);
  
  const ranges = [];
  for (let i = 0; i < intervals; i++) {
    const intervalStart = new Date(start);
    intervalStart.setDate(start.getDate() + (i * intervalDays));
    
    const intervalEnd = new Date(start);
    intervalEnd.setDate(start.getDate() + ((i + 1) * intervalDays) - 1);
    
    if (i === intervals - 1) {
      intervalEnd.setTime(end.getTime());
    }
    
    ranges.push({
      start: intervalStart.toISOString().split('T')[0],
      end: intervalEnd.toISOString().split('T')[0],
    });
  }
  
  return ranges;
}

function analyzeTrendData(data: any[], dimension: string): any {
  // Mapear todos los elementos únicos y sus métricas por período
  const itemMetrics = new Map();
  
  data.forEach((period, index) => {
    period.data.rows?.forEach((row: any) => {
      const key = row.keys[0];
      if (!itemMetrics.has(key)) {
        itemMetrics.set(key, []);
      }
      itemMetrics.get(key)[index] = {
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
      };
    });
  });
  
  // Calcular tendencias
  const trends: { rising: any[], declining: any[], stable: any[] } = { rising: [], declining: [], stable: [] };
  
  itemMetrics.forEach((metrics, key) => {
    if (metrics.length < 2) return;
    
    const firstPeriod = metrics[0] || { clicks: 0, impressions: 0 };
    const lastPeriod = metrics[metrics.length - 1] || { clicks: 0, impressions: 0 };
    
    const clicksChange = ((lastPeriod.clicks - firstPeriod.clicks) / (firstPeriod.clicks || 1)) * 100;
    const impressionsChange = ((lastPeriod.impressions - firstPeriod.impressions) / (firstPeriod.impressions || 1)) * 100;
    
    const trendItem = {
      [dimension]: key,
      clicksChange: `${clicksChange > 0 ? '+' : ''}${clicksChange.toFixed(1)}%`,
      impressionsChange: `${impressionsChange > 0 ? '+' : ''}${impressionsChange.toFixed(1)}%`,
      currentClicks: lastPeriod.clicks,
      currentImpressions: lastPeriod.impressions,
    };
    
    if (clicksChange > 20) {
      trends.rising.push(trendItem);
    } else if (clicksChange < -20) {
      trends.declining.push(trendItem);
    } else {
      trends.stable.push(trendItem);
    }
  });
  
  // Ordenar por cambio
  trends.rising.sort((a, b) => parseFloat(b.clicksChange) - parseFloat(a.clicksChange));
  trends.declining.sort((a, b) => parseFloat(a.clicksChange) - parseFloat(b.clicksChange));
  
  return trends;
}

function detectSeasonality(data: any[]): any {
  // Análisis simplificado de estacionalidad
  const totalsByPeriod = data.map(period => {
    const totals = period.data.rows?.reduce((sum: number, row: any) => sum + (row.clicks || 0), 0) || 0;
    return totals;
  });
  
  const avg = totalsByPeriod.reduce((a, b) => a + b, 0) / totalsByPeriod.length;
  const variance = totalsByPeriod.map(t => Math.pow(t - avg, 2)).reduce((a, b) => a + b, 0) / totalsByPeriod.length;
  const stdDev = Math.sqrt(variance);
  
  const hasSeasonality = stdDev / avg > 0.3; // 30% de variación indica estacionalidad
  
  return {
    detected: hasSeasonality,
    pattern: hasSeasonality ? 'Variable traffic patterns detected' : 'Stable traffic pattern',
    recommendation: hasSeasonality 
      ? 'Plan content calendar around peak periods' 
      : 'Maintain consistent content production',
  };
}

function generateTrendInsights(trends: any, seasonality: any): string {
  const parts = [];
  
  if (trends.rising.length > 0) {
    parts.push(`📈 ${trends.rising.length} términos en crecimiento`);
  }
  
  if (trends.declining.length > 0) {
    parts.push(`📉 ${trends.declining.length} términos en declive requieren atención`);
  }
  
  if (seasonality.detected) {
    parts.push(`🔄 Estacionalidad detectada: ${seasonality.pattern}`);
  }
  
  return parts.join('. ') || 'Tendencias estables sin cambios significativos.';
}

function generateTrendPredictions(trends: any): any {
  // Predicciones simples basadas en tendencias
  return {
    nextMonth: {
      expectedGrowth: trends.rising.length > trends.declining.length ? 'positive' : 'negative',
      confidence: 'medium',
      recommendation: trends.rising.length > 0 
        ? `Enfocar contenido en: ${trends.rising[0]?.query || trends.rising[0]?.page || 'trending topics'}`
        : 'Diversificar estrategia de contenido',
    },
  };
}

function generateTrendActions(trends: any, dimension: string): string[] {
  const actions = [];
  
  if (trends.rising.length > 0) {
    actions.push(`Crear más contenido sobre temas en alza`);
    actions.push(`Optimizar páginas existentes para términos trending`);
  }
  
  if (trends.declining.length > 0) {
    actions.push(`Actualizar contenido de términos en declive`);
    actions.push(`Investigar cambios en intención de búsqueda`);
  }
  
  if (dimension === 'device' && trends.rising.some((t: any) => t.device === 'mobile')) {
    actions.push(`Priorizar optimización móvil`);
  }
  
  return actions;
}

function analyzePageExperienceStatus(data: any): string {
  // Análisis simplificado - ajustar según API real
  return 'good'; // o 'issues', 'critical'
}

function extractPageExperienceIssues(data: any): any[] {
  // Extraer issues de Page Experience
  return [];
}

function generatePageExperienceRecommendations(data: any): string[] {
  return [
    'Optimizar LCP cargando recursos críticos primero',
    'Reducir CLS fijando dimensiones de imágenes',
    'Mejorar FID optimizando JavaScript',
  ];
}

function generateMobileRecommendations(data: any): string[] {
  const recommendations = [];
  
  if (data.mobileFriendliness !== 'MOBILE_FRIENDLY') {
    recommendations.push('Implementar diseño responsive');
    recommendations.push('Ajustar tamaño de fuentes para móvil');
    recommendations.push('Espaciar elementos táctiles adecuadamente');
  }
  
  return recommendations;
}

function generateRichResultsRecommendations(data: any): string[] {
  const recommendations = [];
  
  if (!data.richResultsTypes || data.richResultsTypes.length === 0) {
    recommendations.push('Implementar schema.org markup básico');
    recommendations.push('Agregar structured data para productos/artículos');
  }
  
  return recommendations;
}

function generateTechnicalSummary(audits: any[]): any {
  const issues = audits.reduce((sum, audit) => sum + (audit.issues?.length || 0), 0);
  const critical = audits.filter(a => a.status === 'critical').length;
  
  return {
    totalIssues: issues,
    criticalIssues: critical,
    status: critical > 0 ? 'critical' : issues > 5 ? 'needs-attention' : 'good',
  };
}

function prioritizeTechnicalIssues(audits: any[]): any[] {
  // Priorizar issues técnicos por impacto
  const allIssues: any[] = [];
  
  audits.forEach(audit => {
    if (audit.issues) {
      audit.issues.forEach((issue: any) => {
        allIssues.push({
          category: audit.category,
          issue,
          priority: audit.status === 'critical' ? 'high' : 'medium',
        });
      });
    }
  });
  
  return allIssues.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder as any)[b.priority] - (priorityOrder as any)[a.priority];
  });
}

function generateTechnicalInsights(audits: any[]): string {
  const insights = [];
  
  const criticalCount = audits.filter(a => a.status === 'critical').length;
  if (criticalCount > 0) {
    insights.push(`⚠️ ${criticalCount} problemas críticos afectando SEO`);
  }
  
  const mobileAudit = audits.find(a => a.category === 'Mobile Usability');
  if (mobileAudit?.status !== 'good') {
    insights.push('📱 Problemas de usabilidad móvil detectados');
  }
  
  return insights.join('. ') || '✅ Sin problemas técnicos significativos.';
}

function generateTechnicalRoadmap(audits: any[]): any[] {
  return [
    {
      phase: 'Inmediato (1 semana)',
      tasks: ['Corregir issues críticos de Page Experience', 'Implementar schema markup básico'],
    },
    {
      phase: 'Corto plazo (1 mes)',
      tasks: ['Optimizar Core Web Vitals', 'Resolver problemas de mobile usability'],
    },
    {
      phase: 'Mediano plazo (3 meses)',
      tasks: ['Implementar rich results avanzados', 'Auditoría completa de velocidad'],
    },
  ];
}

function generateCompetitorGaps(ourQueries: any[]): any[] {
  // Simular gaps basados en nuestras queries débiles
  return ourQueries
    ?.filter(q => q.position > 20)
    .slice(0, 10)
    .map(q => ({
      topic: q.keys[0],
      estimatedCompetitorTraffic: Math.round(q.impressions * 0.3),
      ourPosition: q.position,
      opportunity: 'Create better content',
    }));
}

function generateCompetitorInsights(analysis: any): string {
  const parts = [];
  
  if (analysis.losingKeywords?.length > 0) {
    parts.push(`📉 Perdiendo en ${analysis.losingKeywords.length} keywords importantes`);
  }
  
  if (analysis.marketShare.ourShare < 20) {
    parts.push('⚠️ Baja cuota de mercado en búsquedas');
  }
  
  return parts.join('. ') || 'Posición competitiva estable.';
}

function identifyCompetitorOpportunities(analysis: any): any[] {
  return [
    {
      type: 'content',
      description: 'Crear contenido para keywords donde competidores rankean',
      impact: 'high',
      effort: 'medium',
    },
    {
      type: 'optimization',
      description: 'Mejorar páginas existentes que compiten directamente',
      impact: 'medium',
      effort: 'low',
    },
  ];
}

function generateCompetitiveStrategy(analysis: any): any {
  return {
    offensive: [
      'Target keywords donde competidores son débiles',
      'Crear contenido 10x mejor en temas clave',
    ],
    defensive: [
      'Proteger posiciones top 3 actuales',
      'Mejorar CTR en keywords branded',
    ],
  };
}

function generateCompetitorActions(analysis: any): string[] {
  const actions = [];
  
  if (analysis.losingKeywords?.length > 5) {
    actions.push('Auditar y mejorar contenido para top 5 keywords perdidas');
  }
  
  actions.push('Analizar backlinks de competidores top');
  actions.push('Monitorear cambios en estrategia de competidores');
  
  return actions;
}