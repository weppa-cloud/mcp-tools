import { BetaAnalyticsDataClient } from '@google-analytics/data';

// 🚀 MVP: 3 herramientas core para empezar rápido

export async function growthPulse(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  timeframe: 'today' | 'yesterday' | 'last7days' = 'today'
) {
  // Determinar rango de fechas
  const dateRanges = getDateRanges(timeframe);
  
  // Query paralela para velocidad
  const [trafficResponse, conversionResponse, revenueResponse] = await Promise.all([
    // Tráfico
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
      dimensions: [{ name: 'date' }]
    }),
    
    // Conversiones
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      metrics: [
        { name: 'conversions' },
        { name: 'sessions' }
      ],
      dimensions: [{ name: 'date' }]
    }),
    
    // Revenue
    analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges,
      metrics: [
        { name: 'purchaseRevenue' },
        { name: 'transactions' }
      ],
      dimensions: [{ name: 'date' }]
    })
  ]);

  // Procesar métricas
  const traffic = processTraffic(trafficResponse);
  const conversions = processConversions(conversionResponse);
  const revenue = processRevenue(revenueResponse);

  // Detectar issues y oportunidades
  const topIssue = detectTopIssue(traffic, conversions, revenue);
  const topOpportunity = detectTopOpportunity(traffic, conversions, revenue);

  return {
    traffic: {
      total: traffic.current,
      change: traffic.changePercent,
      alert: getAlert(traffic.changePercent)
    },
    conversions: {
      rate: `${conversions.rate}%`,
      total: conversions.total,
      change: conversions.changePercent,
      alert: getAlert(conversions.changePercent, -5)
    },
    revenue: {
      total: formatCurrency(revenue.total),
      change: revenue.changePercent,
      averageOrderValue: formatCurrency(revenue.aov),
      alert: getAlert(revenue.changePercent)
    },
    topIssue,
    topOpportunity
  };
}

export async function analyzeFunnel(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  steps: Array<{ name: string; eventName?: string; pagePath?: string }>
) {
  // Obtener datos de cada paso
  const funnelData = await Promise.all(
    steps.map(async (step, index) => {
      const filter = step.eventName 
        ? { 
            filter: {
              fieldName: 'eventName',
              stringFilter: { value: step.eventName }
            }
          }
        : {
            filter: {
              fieldName: 'pagePath',
              stringFilter: { value: step.pagePath }
            }
          };

      const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'sessions' }],
        dimensionFilter: filter
      });

      return {
        name: step.name,
        sessions: parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0')
      };
    })
  );

  // Calcular conversiones y pérdidas
  const analysis = funnelData.map((step, index) => {
    if (index === 0) return { ...step, rate: '100%', dropOff: '0%', lostRevenue: '$0' };
    
    const prevSessions = funnelData[index - 1].sessions;
    const rate = prevSessions > 0 ? (step.sessions / prevSessions) * 100 : 0;
    const dropOff = 100 - rate;
    const lostSessions = prevSessions - step.sessions;
    const avgOrderValue = 50; // TODO: Get from real data
    const lostRevenue = lostSessions * avgOrderValue * 0.1; // Assume 10% would convert

    return {
      name: step.name,
      conversionRate: `${rate.toFixed(1)}%`,
      dropOffRate: `${dropOff.toFixed(1)}%`,
      lostRevenue: formatCurrency(lostRevenue),
      improvement: getImprovement(dropOff)
    };
  });

  // Encontrar mayor problema
  const biggestLeak = analysis
    .slice(1)
    .sort((a, b) => parseFloat(b.dropOffRate || '0') - parseFloat(a.dropOffRate || '0'))[0];

  return {
    totalLostRevenue: formatCurrency(
      analysis.reduce((sum, step) => sum + parseCurrency(step.lostRevenue), 0)
    ),
    steps: analysis,
    biggestLeak: biggestLeak ? `${biggestLeak.name} (${biggestLeak.dropOffRate} drop-off)` : 'No leaks found',
    recommendedFix: getRecommendedFix(biggestLeak)
  };
}

export async function getTopChannels(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  metric: 'revenue' | 'conversions' | 'users' = 'revenue'
) {
  const metricName = {
    revenue: 'purchaseRevenue',
    conversions: 'conversions',
    users: 'totalUsers'
  }[metric];

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [
      { name: metricName },
      { name: 'sessions' }
    ],
    orderBys: [{ metric: { metricName }, desc: true }],
    limit: 10
  });

  const channels = response.rows?.map((row: any) => {
    const channel = row.dimensionValues?.[0]?.value || 'Unknown';
    const value = parseFloat(row.metricValues?.[0]?.value || '0');
    const sessions = parseInt(row.metricValues?.[1]?.value || '0');
    
    // Calcular eficiencia
    const efficiency = sessions > 0 ? value / sessions : 0;
    
    return {
      channel,
      [metric]: metric === 'revenue' ? formatCurrency(value) : value,
      sessions,
      efficiency: efficiency.toFixed(2),
      recommendation: getChannelRecommendation(channel, efficiency, metric)
    };
  }) || [];

  // Quick wins
  const quickWins = channels
    .filter((c: any) => c.efficiency > (channels[0] as any).efficiency * 0.8)
    .slice(0, 3)
    .map((c: any) => `${c.channel}: ${c.recommendation}`);

  return {
    topChannels: channels.slice(0, 5),
    quickWins,
    bestChannel: channels[0],
    worstPerformer: channels[channels.length - 1]
  };
}

// Funciones helper
function getDateRanges(timeframe: 'today' | 'yesterday' | 'last7days') {
  const ranges = {
    today: [
      { startDate: 'today', endDate: 'today' },
      { startDate: 'yesterday', endDate: 'yesterday' }
    ],
    yesterday: [
      { startDate: 'yesterday', endDate: 'yesterday' },
      { startDate: '2daysAgo', endDate: '2daysAgo' }
    ],
    last7days: [
      { startDate: '7daysAgo', endDate: 'today' },
      { startDate: '14daysAgo', endDate: '8daysAgo' }
    ]
  };
  return ranges[timeframe];
}

function processTraffic(data: any) {
  const current = parseInt(data.rows?.[0]?.metricValues?.[0]?.value || '0');
  const previous = parseInt(data.rows?.[1]?.metricValues?.[0]?.value || '0');
  const changePercent = previous > 0 ? ((current - previous) / previous * 100).toFixed(1) : '0';
  
  return {
    current,
    previous,
    changePercent: `${Number(changePercent) > 0 ? '+' : ''}${changePercent}%`
  };
}

function processConversions(data: any) {
  const conversions = parseInt(data.rows?.[0]?.metricValues?.[0]?.value || '0');
  const sessions = parseInt(data.rows?.[0]?.metricValues?.[1]?.value || '1');
  const rate = ((conversions / sessions) * 100).toFixed(1);
  
  const prevConversions = parseInt(data.rows?.[1]?.metricValues?.[0]?.value || '0');
  const prevSessions = parseInt(data.rows?.[1]?.metricValues?.[1]?.value || '1');
  const prevRate = ((prevConversions / prevSessions) * 100).toFixed(1);
  
  const changePercent = ((parseFloat(rate) - parseFloat(prevRate)) / parseFloat(prevRate) * 100).toFixed(1);
  
  return {
    total: conversions,
    rate,
    changePercent: `${Number(changePercent) > 0 ? '+' : ''}${changePercent}%`
  };
}

function processRevenue(data: any) {
  const revenue = parseFloat(data.rows?.[0]?.metricValues?.[0]?.value || '0');
  const transactions = parseInt(data.rows?.[0]?.metricValues?.[1]?.value || '1');
  const aov = revenue / transactions;
  
  const prevRevenue = parseFloat(data.rows?.[1]?.metricValues?.[0]?.value || '0');
  const changePercent = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100).toFixed(1) : '0';
  
  return {
    total: revenue,
    aov,
    changePercent: `${Number(changePercent) > 0 ? '+' : ''}${changePercent}%`
  };
}

function getAlert(changePercent: string, threshold: number = 0): '🟢' | '🟡' | '🔴' {
  const value = parseFloat(changePercent);
  if (value >= threshold) return '🟢';
  if (value >= threshold - 10) return '🟡';
  return '🔴';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[$,]/g, ''));
}

function detectTopIssue(traffic: any, conversions: any, revenue: any): string | undefined {
  const issues = [];
  
  if (parseFloat(conversions.changePercent) < -10) {
    issues.push(`Conversion rate dropped ${conversions.changePercent} - check checkout flow`);
  }
  
  if (parseFloat(traffic.changePercent) < -20) {
    issues.push(`Traffic down ${traffic.changePercent} - check marketing campaigns`);
  }
  
  if (parseFloat(revenue.changePercent) < -15) {
    issues.push(`Revenue dropped ${revenue.changePercent} - urgent attention needed`);
  }
  
  return issues[0];
}

function detectTopOpportunity(traffic: any, conversions: any, revenue: any): string | undefined {
  const opportunities = [];
  
  if (parseFloat(traffic.changePercent) > 20) {
    opportunities.push(`Traffic up ${traffic.changePercent} - capitalize with offers`);
  }
  
  if (parseFloat(conversions.changePercent) > 10) {
    opportunities.push(`Conversion rate improved ${conversions.changePercent} - scale winning elements`);
  }
  
  return opportunities[0];
}

function getImprovement(dropOff: number): string {
  if (dropOff > 70) return 'Critical - needs immediate fix';
  if (dropOff > 50) return 'High priority optimization';
  if (dropOff > 30) return 'Normal - room for improvement';
  return 'Good performance';
}

function getRecommendedFix(step: any): string {
  if (!step) return 'Analyze funnel to identify issues';
  const dropOff = parseFloat(step.dropOffRate || '0');
  
  if (step.name.includes('Cart')) {
    return 'Add trust badges, simplify checkout, show shipping costs early';
  }
  if (step.name.includes('Product')) {
    return 'Improve product images, add reviews, clarify value proposition';
  }
  if (dropOff > 60) {
    return 'A/B test this step urgently - major revenue opportunity';
  }
  
  return 'Run user testing to identify friction points';
}

function getChannelRecommendation(channel: string, efficiency: number, metric: string): string {
  const isHighPerformer = efficiency > 2;
  
  const recommendations = {
    'Organic Search': isHighPerformer ? 'Double down on SEO' : 'Audit and improve content',
    'Paid Search': isHighPerformer ? 'Increase budget 20%' : 'Optimize keywords & landing pages',
    'Social': isHighPerformer ? 'Scale winning campaigns' : 'Test new creatives',
    'Email': isHighPerformer ? 'Increase frequency' : 'Improve segmentation',
    'Direct': 'Focus on retention & loyalty',
    'Referral': isHighPerformer ? 'Launch referral program' : 'Partner with more sites'
  };
  
  return (recommendations as any)[channel] || 'Test and optimize';
}