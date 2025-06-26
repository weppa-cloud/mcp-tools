import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createAnalyticsClient, GoogleAnalyticsConfig } from './auth.js';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import {
  GetFunnelAnalysisSchema,
  GetCohortAnalysisSchema,
  GetUserSegmentsSchema,
  GetConversionPathsSchema,
  GetGrowthMetricsSchema,
  GetABTestAnalysisSchema,
  GetUserJourneySchema,
  GetPowerUsersSchema,
} from './growth-tools.js';
import { growthPulse, analyzeFunnel as analyzeFunnelMVP, getTopChannels } from './mvp-tools.js';

const GetRealtimeDataSchema = z.object({
  metrics: z.array(z.string()).describe('Metrics to retrieve (e.g., activeUsers, screenPageViews)'),
  dimensions: z.array(z.string()).optional().describe('Dimensions to group by (e.g., country, deviceCategory)'),
});

const GetReportDataSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  metrics: z.array(z.string()).describe('Metrics to retrieve (e.g., sessions, pageviews, users)'),
  dimensions: z.array(z.string()).optional().describe('Dimensions to group by (e.g., date, country, source)'),
  limit: z.number().optional().default(10).describe('Maximum number of rows to return'),
});

const GetAudienceDataSchema = z.object({
  startDate: z.string().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().describe('End date in YYYY-MM-DD format'),
  dimensions: z.array(z.string()).describe('Audience dimensions (e.g., userAgeBracket, userGender, country)'),
  metrics: z.array(z.string()).optional().default(['activeUsers']).describe('Metrics to retrieve'),
  limit: z.number().optional().default(10).describe('Maximum number of rows to return'),
});

// MVP Schemas
const GrowthPulseSchema = z.object({
  timeframe: z.enum(['today', 'yesterday', 'last7days']).optional().default('today').describe('Time period for analysis'),
});

const SimpleFunnelSchema = z.object({
  steps: z.array(z.object({
    name: z.string().describe('Step name (e.g., Homepage, Product Page, Cart)'),
    eventName: z.string().optional().describe('Event name to track (e.g., view_item, add_to_cart)'),
    pagePath: z.string().optional().describe('Page path to track (e.g., /products, /cart)'),
  })).describe('Funnel steps to analyze'),
});

const TopChannelsSchema = z.object({
  metric: z.enum(['revenue', 'conversions', 'users']).optional().default('revenue').describe('Metric to rank channels by'),
});

class GoogleAnalyticsMCPServer {
  private server: Server;
  private client: BetaAnalyticsDataClient | null = null;
  private propertyId: string;

  constructor() {
    this.server = new Server(
      {
        name: 'google-analytics-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.propertyId = process.env.GA_PROPERTY_ID || '';
    
    this.setupHandlers();
  }

  private async initializeClient() {
    if (!this.client) {
      const config: GoogleAnalyticsConfig = {
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        propertyId: this.propertyId,
      };
      this.client = await createAnalyticsClient(config);
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // MVP Tools - High Priority
        {
          name: 'growth_pulse',
          description: '🚀 Get instant growth health check with traffic, conversions, and revenue alerts',
          inputSchema: GrowthPulseSchema,
        },
        {
          name: 'funnel_analysis',
          description: '💰 Analyze conversion funnel to find where you\'re losing money',
          inputSchema: SimpleFunnelSchema,
        },
        {
          name: 'top_channels',
          description: '📊 Find your best performing channels for quick wins',
          inputSchema: TopChannelsSchema,
        },
        // Original Tools
        {
          name: 'get_realtime_data',
          description: 'Get real-time Google Analytics data',
          inputSchema: GetRealtimeDataSchema,
        },
        {
          name: 'get_report_data',
          description: 'Get Google Analytics report data for a date range',
          inputSchema: GetReportDataSchema,
        },
        {
          name: 'get_audience_data',
          description: 'Get Google Analytics audience demographics and interests',
          inputSchema: GetAudienceDataSchema,
        },
        {
          name: 'analyze_funnel',
          description: 'Analyze conversion funnel with drop-off rates between steps',
          inputSchema: GetFunnelAnalysisSchema,
        },
        {
          name: 'analyze_cohorts',
          description: 'Perform cohort analysis for retention and behavior patterns',
          inputSchema: GetCohortAnalysisSchema,
        },
        {
          name: 'get_user_segments',
          description: 'Get detailed user segments based on behavior, technology, acquisition, or demographics',
          inputSchema: GetUserSegmentsSchema,
        },
        {
          name: 'analyze_conversion_paths',
          description: 'Analyze user paths leading to conversions',
          inputSchema: GetConversionPathsSchema,
        },
        {
          name: 'get_growth_metrics',
          description: 'Calculate key growth metrics like growth rate, retention, LTV, CAC',
          inputSchema: GetGrowthMetricsSchema,
        },
        {
          name: 'analyze_ab_test',
          description: 'Analyze A/B test results with statistical significance',
          inputSchema: GetABTestAnalysisSchema,
        },
        {
          name: 'get_user_journey',
          description: 'Get detailed user journey and behavior flow',
          inputSchema: GetUserJourneySchema,
        },
        {
          name: 'identify_power_users',
          description: 'Identify and analyze power users based on engagement metrics',
          inputSchema: GetPowerUsersSchema,
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.initializeClient();
      
      if (!this.client) {
        throw new Error('Google Analytics client not initialized');
      }

      switch (request.params.name) {
        // MVP Tools
        case 'growth_pulse':
          return await this.getGrowthPulse(request.params.arguments);
        
        case 'funnel_analysis':
          return await this.getFunnelAnalysis(request.params.arguments);
        
        case 'top_channels':
          return await this.getTopChannelsAnalysis(request.params.arguments);
        
        // Original Tools
        case 'get_realtime_data':
          return await this.getRealtimeData(request.params.arguments);
        
        case 'get_report_data':
          return await this.getReportData(request.params.arguments);
        
        case 'get_audience_data':
          return await this.getAudienceData(request.params.arguments);
        
        case 'analyze_funnel':
          return await this.analyzeFunnel(request.params.arguments);
        
        case 'analyze_cohorts':
          return await this.analyzeCohorts(request.params.arguments);
        
        case 'get_user_segments':
          return await this.getUserSegments(request.params.arguments);
        
        case 'analyze_conversion_paths':
          return await this.analyzeConversionPaths(request.params.arguments);
        
        case 'get_growth_metrics':
          return await this.getGrowthMetrics(request.params.arguments);
        
        case 'analyze_ab_test':
          return await this.analyzeABTest(request.params.arguments);
        
        case 'get_user_journey':
          return await this.getUserJourney(request.params.arguments);
        
        case 'identify_power_users':
          return await this.identifyPowerUsers(request.params.arguments);
        
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async getRealtimeData(args: unknown) {
    const params = GetRealtimeDataSchema.parse(args);
    
    const [response] = await this.client!.runRealtimeReport({
      property: `properties/${this.propertyId}`,
      metrics: params.metrics.map(metric => ({ name: metric })),
      dimensions: params.dimensions?.map(dimension => ({ name: dimension })),
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            rowCount: response.rowCount,
            rows: response.rows?.map(row => ({
              dimensions: row.dimensionValues?.map(d => d.value),
              metrics: row.metricValues?.map(m => m.value),
            })),
            metricHeaders: response.metricHeaders,
            dimensionHeaders: response.dimensionHeaders,
          }, null, 2),
        },
      ],
    };
  }

  private async getReportData(args: unknown) {
    const params = GetReportDataSchema.parse(args);
    
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      ],
      metrics: params.metrics.map(metric => ({ name: metric })),
      dimensions: params.dimensions?.map(dimension => ({ name: dimension })),
      limit: params.limit,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            rowCount: response.rowCount,
            rows: response.rows?.map(row => ({
              dimensions: row.dimensionValues?.map(d => d.value),
              metrics: row.metricValues?.map(m => m.value),
            })),
            metricHeaders: response.metricHeaders,
            dimensionHeaders: response.dimensionHeaders,
          }, null, 2),
        },
      ],
    };
  }

  private async getAudienceData(args: unknown) {
    const params = GetAudienceDataSchema.parse(args);
    
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [
        {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      ],
      metrics: params.metrics.map(metric => ({ name: metric })),
      dimensions: params.dimensions.map(dimension => ({ name: dimension })),
      limit: params.limit,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            audienceData: response.rows?.map(row => {
              const dimensionData: Record<string, string> = {};
              row.dimensionValues?.forEach((value, index) => {
                const dimensionName = response.dimensionHeaders?.[index]?.name || `dimension${index}`;
                dimensionData[dimensionName] = value.value || '';
              });
              
              const metricData: Record<string, string> = {};
              row.metricValues?.forEach((value, index) => {
                const metricName = response.metricHeaders?.[index]?.name || `metric${index}`;
                metricData[metricName] = value.value || '';
              });
              
              return { ...dimensionData, ...metricData };
            }),
            totalRows: response.rowCount,
          }, null, 2),
        },
      ],
    };
  }

  private async analyzeFunnel(args: unknown) {
    const params = GetFunnelAnalysisSchema.parse(args);
    
    const funnelData: any[] = [];
    let previousStepUsers = 0;
    
    for (let i = 0; i < params.steps.length; i++) {
      const step = params.steps[i];
      const filters = [];
      
      if (step.eventName) {
        filters.push({
          filter: {
            fieldName: 'eventName',
            stringFilter: { value: step.eventName },
          },
        });
      }
      
      if (step.pagePath) {
        filters.push({
          filter: {
            fieldName: 'pagePath',
            stringFilter: { value: step.pagePath },
          },
        });
      }
      
      const [response] = await this.client!.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
        metrics: [{ name: 'activeUsers' }],
        dimensions: params.segmentBy?.map(d => ({ name: d })) || [],
        dimensionFilter: filters.length > 0 ? { andGroup: { expressions: filters } } : undefined,
      });
      
      const stepUsers = parseInt(response.rows?.[0]?.metricValues?.[0]?.value || '0');
      const dropoffRate = i > 0 ? ((previousStepUsers - stepUsers) / previousStepUsers * 100).toFixed(2) : '0';
      
      funnelData.push({
        step: step.name,
        users: stepUsers,
        dropoffRate: `${dropoffRate}%`,
        conversionRate: i > 0 ? `${(stepUsers / funnelData[0].users * 100).toFixed(2)}%` : '100%',
      });
      
      previousStepUsers = stepUsers;
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ funnel: funnelData }, null, 2),
      }],
    };
  }

  private async analyzeCohorts(args: unknown) {
    const params = GetCohortAnalysisSchema.parse(args);
    
    const cohortData = [];
    const dateRanges = [];
    
    // Generate date ranges for cohorts
    const startDate = new Date(params.startDate);
    const endDate = new Date(params.endDate);
    
    while (startDate <= endDate) {
      const cohortStart = new Date(startDate);
      const cohortEnd = new Date(startDate);
      
      if (params.cohortType === 'daily') {
        cohortEnd.setDate(cohortEnd.getDate() + 1);
      } else if (params.cohortType === 'weekly') {
        cohortEnd.setDate(cohortEnd.getDate() + 7);
      } else {
        cohortEnd.setMonth(cohortEnd.getMonth() + 1);
      }
      
      dateRanges.push({
        start: cohortStart.toISOString().split('T')[0],
        end: cohortEnd.toISOString().split('T')[0],
      });
      
      startDate.setDate(cohortEnd.getDate());
    }
    
    // Analyze each cohort
    for (const range of dateRanges.slice(0, 10)) { // Limit to 10 cohorts for performance
      const cohortMetrics = [];
      
      for (let period = 0; period < params.periodsToAnalyze; period++) {
        const periodStart = new Date(range.start);
        const periodEnd = new Date(range.start);
        
        if (params.cohortType === 'daily') {
          periodStart.setDate(periodStart.getDate() + period);
          periodEnd.setDate(periodEnd.getDate() + period + 1);
        } else if (params.cohortType === 'weekly') {
          periodStart.setDate(periodStart.getDate() + period * 7);
          periodEnd.setDate(periodEnd.getDate() + (period + 1) * 7);
        } else {
          periodStart.setMonth(periodStart.getMonth() + period);
          periodEnd.setMonth(periodEnd.getMonth() + period + 1);
        }
        
        const response = await this.client!.runReport({
          property: `properties/${this.propertyId}`,
          dateRanges: [{ 
            startDate: periodStart.toISOString().split('T')[0],
            endDate: periodEnd.toISOString().split('T')[0],
          }],
          metrics: [{ name: params.metric }],
          dimensionFilter: {
            filter: {
              fieldName: 'firstSessionDate',
              stringFilter: {
                matchType: 'EXACT',
                value: range.start,
              },
            },
          },
        });
        
        cohortMetrics.push(response[0].rows?.[0]?.metricValues?.[0]?.value || '0');
      }
      
      cohortData.push({
        cohort: range.start,
        metrics: cohortMetrics,
      });
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ cohorts: cohortData }, null, 2),
      }],
    };
  }

  private async getUserSegments(args: unknown) {
    const params = GetUserSegmentsSchema.parse(args);
    
    let dimensions = [];
    
    switch (params.segmentType) {
      case 'behavior':
        dimensions = ['sessionEngagementDuration', 'sessionsPerUser', 'engagementRate'];
        break;
      case 'technology':
        dimensions = ['deviceCategory', 'operatingSystem', 'browser'];
        break;
      case 'acquisition':
        dimensions = ['sessionSource', 'sessionMedium', 'sessionCampaignName'];
        break;
      case 'demographic':
        dimensions = ['country', 'city', 'userAgeBracket', 'userGender'];
        break;
    }
    
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
      metrics: params.metrics.map(m => ({ name: m })),
      dimensions: dimensions.slice(0, 2).map(d => ({ name: d })), // GA4 limit
      limit: 50,
    });
    
    const segments = response.rows?.map(row => {
      const segment: any = {};
      row.dimensionValues?.forEach((val, idx) => {
        segment[dimensions[idx]] = val.value;
      });
      row.metricValues?.forEach((val, idx) => {
        segment[params.metrics[idx]] = val.value;
      });
      return segment;
    }).filter(s => {
      if (params.minThreshold) {
        const firstMetricValue = parseFloat(s[params.metrics[0]] || '0');
        return firstMetricValue >= params.minThreshold;
      }
      return true;
    });
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ segments }, null, 2),
      }],
    };
  }

  private async analyzeConversionPaths(args: unknown) {
    const params = GetConversionPathsSchema.parse(args);
    
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
      metrics: [{ name: 'conversions' }, { name: 'activeUsers' }],
      dimensions: [
        { name: params.touchpointDimension },
        { name: 'eventName' },
      ],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          stringFilter: { value: params.conversionEvent },
        },
      },
      limit: 100,
    });
    
    const paths = response.rows?.map(row => ({
      touchpoint: row.dimensionValues?.[0]?.value,
      conversions: row.metricValues?.[0]?.value,
      users: row.metricValues?.[1]?.value,
      conversionRate: `${(parseFloat(row.metricValues?.[0]?.value || '0') / parseFloat(row.metricValues?.[1]?.value || '1') * 100).toFixed(2)}%`,
    }));
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ conversionPaths: paths }, null, 2),
      }],
    };
  }

  private async getGrowthMetrics(args: unknown) {
    const params = GetGrowthMetricsSchema.parse(args);
    
    const metrics: any = {};
    
    // Current period data
    const [currentData] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'totalRevenue' },
        { name: 'sessions' },
      ],
    });
    
    const currentUsers = parseFloat(currentData.rows?.[0]?.metricValues?.[0]?.value || '0');
    const currentNewUsers = parseFloat(currentData.rows?.[0]?.metricValues?.[1]?.value || '0');
    const currentRevenue = parseFloat(currentData.rows?.[0]?.metricValues?.[2]?.value || '0');
    const currentSessions = parseFloat(currentData.rows?.[0]?.metricValues?.[3]?.value || '0');
    
    // Comparison period data
    let compareStartDate = '';
    let compareEndDate = '';
    
    if (params.compareWith === 'previous_period') {
      const periodLength = new Date(params.endDate).getTime() - new Date(params.startDate).getTime();
      compareEndDate = new Date(new Date(params.startDate).getTime() - 1).toISOString().split('T')[0];
      compareStartDate = new Date(new Date(params.startDate).getTime() - periodLength - 1).toISOString().split('T')[0];
    } else if (params.compareWith === 'previous_year') {
      compareStartDate = new Date(new Date(params.startDate).setFullYear(new Date(params.startDate).getFullYear() - 1)).toISOString().split('T')[0];
      compareEndDate = new Date(new Date(params.endDate).setFullYear(new Date(params.endDate).getFullYear() - 1)).toISOString().split('T')[0];
    } else if (params.compareWith === 'custom') {
      compareStartDate = params.customCompareStartDate!;
      compareEndDate = params.customCompareEndDate!;
    }
    
    if (compareStartDate && compareEndDate) {
      const [compareData] = await this.client!.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: compareStartDate, endDate: compareEndDate }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'newUsers' },
          { name: 'totalRevenue' },
          { name: 'sessions' },
        ],
      });
      
      const compareUsers = parseFloat(compareData.rows?.[0]?.metricValues?.[0]?.value || '0');
      const compareRevenue = parseFloat(compareData.rows?.[0]?.metricValues?.[2]?.value || '0');
      
      if (params.metrics.includes('user_growth_rate')) {
        metrics.user_growth_rate = `${((currentUsers - compareUsers) / compareUsers * 100).toFixed(2)}%`;
      }
      
      if (params.metrics.includes('revenue_growth_rate')) {
        metrics.revenue_growth_rate = `${((currentRevenue - compareRevenue) / compareRevenue * 100).toFixed(2)}%`;
      }
    }
    
    if (params.metrics.includes('retention_rate')) {
      metrics.retention_rate = `${((currentUsers - currentNewUsers) / currentUsers * 100).toFixed(2)}%`;
    }
    
    if (params.metrics.includes('churn_rate')) {
      metrics.churn_rate = `${(100 - ((currentUsers - currentNewUsers) / currentUsers * 100)).toFixed(2)}%`;
    }
    
    if (params.metrics.includes('ltv')) {
      metrics.ltv = `$${(currentRevenue / currentUsers).toFixed(2)}`;
    }
    
    if (params.metrics.includes('cac')) {
      // This would need marketing spend data
      metrics.cac = 'Requires marketing spend data';
    }
    
    if (params.metrics.includes('activation_rate')) {
      metrics.activation_rate = `${(currentNewUsers / currentUsers * 100).toFixed(2)}%`;
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          metrics,
          period: { start: params.startDate, end: params.endDate },
          comparisonPeriod: compareStartDate ? { start: compareStartDate, end: compareEndDate } : null,
        }, null, 2),
      }],
    };
  }

  private async analyzeABTest(args: unknown) {
    const params = GetABTestAnalysisSchema.parse(args);
    
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
      metrics: [
        ...params.successMetrics.map(m => ({ name: m })),
        ...(params.guardrailMetrics?.map(m => ({ name: m })) || []),
        { name: 'activeUsers' },
      ],
      dimensions: [
        { name: params.experimentDimension },
        ...(params.segmentBy?.map(d => ({ name: d })) || []),
      ],
      limit: 100,
    });
    
    const variants: any = {};
    
    response.rows?.forEach(row => {
      const variant = row.dimensionValues?.[0]?.value || 'unknown';
      if (!variants[variant]) {
        variants[variant] = {
          users: 0,
          metrics: {},
        };
      }
      
      const userCount = parseFloat(row.metricValues?.[row.metricValues.length - 1]?.value || '0');
      variants[variant].users += userCount;
      
      params.successMetrics.forEach((metric, idx) => {
        if (!variants[variant].metrics[metric]) {
          variants[variant].metrics[metric] = 0;
        }
        variants[variant].metrics[metric] += parseFloat(row.metricValues?.[idx]?.value || '0');
      });
    });
    
    // Calculate statistics
    const results = Object.entries(variants).map(([variant, data]: [string, any]) => ({
      variant,
      users: data.users,
      metrics: Object.entries(data.metrics).reduce((acc: any, [metric, value]: [string, any]) => {
        acc[metric] = {
          total: value,
          perUser: (value / data.users).toFixed(4),
        };
        return acc;
      }, {}),
    }));
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ abTestResults: results }, null, 2),
      }],
    };
  }

  private async getUserJourney(args: unknown) {
    const params = GetUserJourneySchema.parse(args);
    
    const filters = [];
    
    if (params.userId) {
      filters.push({
        filter: {
          fieldName: 'userId',
          stringFilter: { value: params.userId },
        },
      });
    }
    
    if (params.userSegment) {
      filters.push({
        filter: {
          fieldName: params.userSegment.dimension,
          stringFilter: { value: params.userSegment.value },
        },
      });
    }
    
    const [response] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
      metrics: [{ name: 'eventCount' }],
      dimensions: [
        { name: 'dateHour' },
        { name: 'eventName' },
        { name: 'pagePath' },
      ],
      dimensionFilter: filters.length > 0 ? { andGroup: { expressions: filters } } : undefined,
      limit: params.maxEvents,
      orderBys: [{ dimension: { dimensionName: 'dateHour' } }],
    });
    
    const journey = response.rows?.map(row => ({
      timestamp: row.dimensionValues?.[0]?.value,
      event: row.dimensionValues?.[1]?.value,
      page: row.dimensionValues?.[2]?.value,
      count: row.metricValues?.[0]?.value,
    }));
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ userJourney: journey }, null, 2),
      }],
    };
  }

  private async identifyPowerUsers(args: unknown) {
    const params = GetPowerUsersSchema.parse(args);
    
    // Get power users
    const [powerUsersResponse] = await this.client!.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
      metrics: [
        { name: params.threshold.metric },
        ...params.analyzeMetrics.map(m => ({ name: m })),
      ],
      dimensions: [{ name: 'userId' }],
      metricFilter: {
        filter: {
          fieldName: params.threshold.metric,
          numericFilter: {
            operation: 'GREATER_THAN',
            value: { doubleValue: params.threshold.value },
          },
        },
      },
      limit: 100,
    });
    
    const powerUsers = powerUsersResponse.rows?.map(row => {
      const user: any = { userId: row.dimensionValues?.[0]?.value };
      user[params.threshold.metric] = row.metricValues?.[0]?.value;
      params.analyzeMetrics.forEach((metric, idx) => {
        user[metric] = row.metricValues?.[idx + 1]?.value;
      });
      return user;
    }) || [];
    
    let averageUserData: any = null;
    
    if (params.compareWithAverage) {
      // Get average user metrics
      const [avgResponse] = await this.client!.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: params.startDate, endDate: params.endDate }],
        metrics: [
          { name: params.threshold.metric },
          ...params.analyzeMetrics.map(m => ({ name: m })),
          { name: 'activeUsers' },
        ],
      });
      
      const totalUsers = parseFloat(avgResponse.rows?.[0]?.metricValues?.[avgResponse.rows[0].metricValues.length - 1]?.value || '1');
      
      averageUserData = {
        [params.threshold.metric]: (parseFloat(avgResponse.rows?.[0]?.metricValues?.[0]?.value || '0') / totalUsers).toFixed(2),
      };
      
      params.analyzeMetrics.forEach((metric, idx) => {
        averageUserData[metric] = (parseFloat(avgResponse.rows?.[0]?.metricValues?.[idx + 1]?.value || '0') / totalUsers).toFixed(2);
      });
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          powerUsers: powerUsers.slice(0, 20), // Top 20
          totalPowerUsers: powerUsers.length,
          averageUser: averageUserData,
        }, null, 2),
      }],
    };
  }

  // MVP Tool Methods
  private async getGrowthPulse(args: unknown) {
    const params = GrowthPulseSchema.parse(args);
    const result = await growthPulse(this.client!, this.propertyId, params.timeframe);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getFunnelAnalysis(args: unknown) {
    const params = SimpleFunnelSchema.parse(args);
    const result = await analyzeFunnelMVP(this.client!, this.propertyId, params.steps);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getTopChannelsAnalysis(args: unknown) {
    const params = TopChannelsSchema.parse(args);
    const result = await getTopChannels(this.client!, this.propertyId, params.metric);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Analytics MCP server running on stdio');
  }
}

const server = new GoogleAnalyticsMCPServer();
server.run().catch(console.error);