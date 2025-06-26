import { GoogleAuth } from 'google-auth-library';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

export interface GoogleAnalyticsConfig {
  credentialsPath?: string;
  propertyId: string;
}

export async function createAnalyticsClient(config: GoogleAnalyticsConfig): Promise<BetaAnalyticsDataClient> {
  const auth = new GoogleAuth({
    keyFilename: config.credentialsPath,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  const client = new BetaAnalyticsDataClient({
    auth,
  });

  return client;
}