#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
// @ts-ignore
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  GetSitemapSchema,
  IndexInspectSchema,
  ListSitemapsSchema,
  SearchAnalyticsSchema,
  SubmitSitemapSchema,
} from './schemas.js';
import { z } from 'zod';
import { SearchConsoleService } from './search-console.js';

const server = new Server(
  {
    name: 'gsc-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  },
);

const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
  process.exit(1);
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_sites',
        description: 'List all sites in Google Search Console',
        inputSchema: zodToJsonSchema(z.object({})),
      },
      {
        name: 'search_analytics',
        description: 'Get search performance data from Google Search Console',
        inputSchema: zodToJsonSchema(SearchAnalyticsSchema),
      },
      {
        name: 'index_inspect',
        description: 'Inspect a URL to see if it is indexed or can be indexed',
        inputSchema: zodToJsonSchema(IndexInspectSchema),
      },
      {
        name: 'list_sitemaps',
        description: 'List sitemaps for a site in Google Search Console',
        inputSchema: zodToJsonSchema(ListSitemapsSchema),
      },
      {
        name: 'get_sitemap',
        description: 'Get a sitemap for a site in Google Search Console',
        inputSchema: zodToJsonSchema(GetSitemapSchema),
      },
      {
        name: 'submit_sitemap',
        description: 'Submit a sitemap for a site in Google Search Console',
        inputSchema: zodToJsonSchema(SubmitSitemapSchema),
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    const searchConsole = new SearchConsoleService(GOOGLE_APPLICATION_CREDENTIALS);

    switch (request.params.name) {
      case 'search_analytics': {
        const args = SearchAnalyticsSchema.parse(request.params.arguments);
        const siteUrl = args.siteUrl;
        const requestBody = {
          startDate: args.startDate,
          endDate: args.endDate,
          dimensions: args.dimensions,
          searchType: args.type,
          aggregationType: args.aggregationType,
          rowLimit: args.rowLimit,
        };
        const response = await searchConsole.searchAnalytics(siteUrl, requestBody);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'list_sites': {
        const response = await searchConsole.listSites();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'index_inspect': {
        const args = IndexInspectSchema.parse(request.params.arguments);
        const requestBody = {
          siteUrl: args.siteUrl,
          inspectionUrl: args.inspectionUrl,
          languageCode: args.languageCode,
        };
        const response = await searchConsole.indexInspect(requestBody);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'list_sitemaps': {
        const args = ListSitemapsSchema.parse(request.params.arguments);
        const requestBody = {
          siteUrl: args.siteUrl,
          sitemapIndex: args.sitemapIndex,
        };
        const response = await searchConsole.listSitemaps(requestBody);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_sitemap': {
        const args = GetSitemapSchema.parse(request.params.arguments);
        const requestBody = {
          siteUrl: args.siteUrl,
          feedpath: args.feedpath,
        };
        const response = await searchConsole.getSitemap(requestBody);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'submit_sitemap': {
        const args = SubmitSitemapSchema.parse(request.params.arguments);
        const requestBody = {
          siteUrl: args.siteUrl,
          feedpath: args.feedpath,
        };
        const response = await searchConsole.submitSitemap(requestBody);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid arguments: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      );
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Google Search Console MCP Server running on stdio');
}

runServer().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
