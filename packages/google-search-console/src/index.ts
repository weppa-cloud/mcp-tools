import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { createSearchConsoleClient, GoogleSearchConsoleConfig } from './auth.js';
import { google } from 'googleapis';
import {
  seoPulse,
  findKeywordOpportunities,
  analyzeContentGaps,
  getPagePerformance,
  analyzeSearchTrends,
  technicalSEOAudit,
  competitorAnalysis
} from './seo-tools.js';
import {
  SeoPulseSchema,
  KeywordOpportunitiesSchema,
  ContentGapsSchema,
  PagePerformanceSchema,
  SearchTrendsSchema,
  TechnicalAuditSchema,
  CompetitorAnalysisSchema
} from './schemas.js';

class GoogleSearchConsoleMCPServer {
  private server: Server;
  private searchConsole: any = null;
  private siteUrl: string;

  constructor() {
    this.server = new Server(
      {
        name: '@weppa-cloud/mcp-google-search-console',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.siteUrl = process.env.GSC_SITE_URL || '';
    
    this.setupHandlers();
  }

  private async initializeClient() {
    if (!this.searchConsole) {
      const config: GoogleSearchConsoleConfig = {
        credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        siteUrl: this.siteUrl,
      };
      this.searchConsole = await createSearchConsoleClient(config);
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // MVP Tools - Alta Prioridad
        {
          name: 'seo_pulse',
          description: '🚀 Health check instantáneo del SEO con alertas y quick wins',
          inputSchema: SeoPulseSchema,
        },
        {
          name: 'keyword_opportunities',
          description: '💰 Encuentra keywords fáciles de mejorar para ganar tráfico rápido',
          inputSchema: KeywordOpportunitiesSchema,
        },
        {
          name: 'content_gaps',
          description: '📝 Descubre qué contenido crear para capturar más búsquedas',
          inputSchema: ContentGapsSchema,
        },
        // Herramientas de Análisis
        {
          name: 'page_performance',
          description: '📊 Analiza el rendimiento de páginas específicas en búsquedas',
          inputSchema: PagePerformanceSchema,
        },
        {
          name: 'search_trends',
          description: '📈 Detecta tendencias y estacionalidad en las búsquedas',
          inputSchema: SearchTrendsSchema,
        },
        {
          name: 'technical_seo_audit',
          description: '🔧 Auditoría técnica: Core Web Vitals, mobile, indexación',
          inputSchema: TechnicalAuditSchema,
        },
        {
          name: 'competitor_analysis',
          description: '🎯 Compara tu SEO con competidores y encuentra oportunidades',
          inputSchema: CompetitorAnalysisSchema,
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.initializeClient();
      
      if (!this.searchConsole) {
        throw new Error('Google Search Console client not initialized');
      }

      switch (request.params.name) {
        case 'seo_pulse':
          return await this.getSeoPulse(request.params.arguments);
        
        case 'keyword_opportunities':
          return await this.getKeywordOpportunities(request.params.arguments);
        
        case 'content_gaps':
          return await this.getContentGaps(request.params.arguments);
        
        case 'page_performance':
          return await this.getPagePerformance(request.params.arguments);
        
        case 'search_trends':
          return await this.getSearchTrends(request.params.arguments);
        
        case 'technical_seo_audit':
          return await this.getTechnicalAudit(request.params.arguments);
        
        case 'competitor_analysis':
          return await this.getCompetitorAnalysis(request.params.arguments);
        
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async getSeoPulse(args: unknown) {
    const params = SeoPulseSchema.parse(args);
    const result = await seoPulse(this.searchConsole, this.siteUrl, params.timeframe);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getKeywordOpportunities(args: unknown) {
    const params = KeywordOpportunitiesSchema.parse(args);
    const result = await findKeywordOpportunities(
      this.searchConsole,
      this.siteUrl,
      params.minImpressions,
      params.positionRange,
      params.limit
    );
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getContentGaps(args: unknown) {
    const params = ContentGapsSchema.parse(args);
    const result = await analyzeContentGaps(
      this.searchConsole,
      this.siteUrl,
      params.minImpressions,
      params.maxPosition,
      params.limit
    );
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getPagePerformance(args: unknown) {
    const params = PagePerformanceSchema.parse(args);
    const result = await getPagePerformance(
      this.searchConsole,
      this.siteUrl,
      params.page,
      params.startDate,
      params.endDate,
      params.compareWithPrevious
    );
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getSearchTrends(args: unknown) {
    const params = SearchTrendsSchema.parse(args);
    const result = await analyzeSearchTrends(
      this.searchConsole,
      this.siteUrl,
      params.dimension,
      params.startDate,
      params.endDate,
      params.limit
    );
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getTechnicalAudit(args: unknown) {
    const params = TechnicalAuditSchema.parse(args);
    const result = await technicalSEOAudit(
      this.searchConsole,
      this.siteUrl,
      params.includePageExperience,
      params.includeMobileUsability,
      params.includeRichResults
    );
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }

  private async getCompetitorAnalysis(args: unknown) {
    const params = CompetitorAnalysisSchema.parse(args);
    const result = await competitorAnalysis(
      this.searchConsole,
      this.siteUrl,
      params.competitorDomains,
      params.startDate,
      params.endDate,
      params.focusMetric
    );
    
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
    console.error('Google Search Console MCP server running on stdio');
  }
}

const server = new GoogleSearchConsoleMCPServer();
server.run().catch(console.error);