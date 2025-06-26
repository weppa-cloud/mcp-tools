const { google } = require('googleapis');
const path = require('path');

// Configure authentication
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || '/Users/yeisongomez/Downloads/claude-dev-434502-cf8836f5cc5e.json',
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});

const analyticsData = google.analyticsdata('v1beta');
const propertyId = process.env.GA_PROPERTY_ID || '294486074';

async function getAdvertisingCosts() {
  try {
    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    // Calculate date ranges for the last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    const formatDate = (date) => date.toISOString().split('T')[0];

    console.log('Fetching advertising cost data from Google Analytics...');
    console.log(`Date range: ${formatDate(startDate)} to ${formatDate(endDate)}\n`);

    // Get advertising metrics broken down by month
    const monthlyResponse = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        }],
        dimensions: [
          { name: 'yearMonth' }
        ],
        metrics: [
          { name: 'advertiserAdCost' },        // Total advertising cost
          { name: 'advertiserAdClicks' },      // Total ad clicks
          { name: 'advertiserAdImpressions' }, // Total ad impressions
          { name: 'sessions' },                // Sessions from ads
          { name: 'conversions' },             // Total conversions
          { name: 'totalRevenue' },            // Total revenue
        ],
        orderBys: [
          { dimension: { dimensionName: 'yearMonth' } }
        ]
      }
    });

    console.log('=== MONTHLY ADVERTISING COSTS ===\n');
    console.log('Month | Ad Cost | Clicks | Impressions | CPC | CPM | Sessions | Conversions | Revenue | ROAS | CPA');
    console.log('-'.repeat(120));

    const monthlyData = monthlyResponse.data.rows || [];
    let totalCost = 0;
    let totalClicks = 0;
    let totalImpressions = 0;
    let totalSessions = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    monthlyData.forEach(row => {
      const month = row.dimensionValues[0].value;
      const adCost = parseFloat(row.metricValues[0].value || 0);
      const clicks = parseInt(row.metricValues[1].value || 0);
      const impressions = parseInt(row.metricValues[2].value || 0);
      const sessions = parseInt(row.metricValues[3].value || 0);
      const conversions = parseFloat(row.metricValues[4].value || 0);
      const revenue = parseFloat(row.metricValues[5].value || 0);

      // Calculate derived metrics
      const cpc = clicks > 0 ? (adCost / clicks).toFixed(2) : '0.00';
      const cpm = impressions > 0 ? ((adCost / impressions) * 1000).toFixed(2) : '0.00';
      const roas = adCost > 0 ? (revenue / adCost).toFixed(2) : '0.00';
      const cpa = conversions > 0 ? (adCost / conversions).toFixed(2) : '0.00';

      // Format month (YYYYMM to Month YYYY)
      const year = month.substring(0, 4);
      const monthNum = month.substring(4, 6);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedMonth = `${monthNames[parseInt(monthNum) - 1]} ${year}`;

      console.log(`${formattedMonth} | $${adCost.toFixed(2)} | ${clicks} | ${impressions} | $${cpc} | $${cpm} | ${sessions} | ${conversions} | $${revenue.toFixed(2)} | ${roas}x | $${cpa}`);

      totalCost += adCost;
      totalClicks += clicks;
      totalImpressions += impressions;
      totalSessions += sessions;
      totalConversions += conversions;
      totalRevenue += revenue;
    });

    // Calculate totals and averages
    const avgCPC = totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : '0.00';
    const avgCPM = totalImpressions > 0 ? ((totalCost / totalImpressions) * 1000).toFixed(2) : '0.00';
    const totalROAS = totalCost > 0 ? (totalRevenue / totalCost).toFixed(2) : '0.00';
    const avgCPA = totalConversions > 0 ? (totalCost / totalConversions).toFixed(2) : '0.00';

    console.log('-'.repeat(120));
    console.log(`TOTAL | $${totalCost.toFixed(2)} | ${totalClicks} | ${totalImpressions} | $${avgCPC} | $${avgCPM} | ${totalSessions} | ${totalConversions} | $${totalRevenue.toFixed(2)} | ${totalROAS}x | $${avgCPA}`);

    // Get advertising costs by source/medium
    console.log('\n\n=== ADVERTISING COSTS BY SOURCE/MEDIUM ===\n');
    
    const sourceResponse = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        }],
        dimensions: [
          { name: 'sessionSourceMedium' }
        ],
        metrics: [
          { name: 'advertiserAdCost' },
          { name: 'advertiserAdClicks' },
          { name: 'advertiserAdImpressions' },
          { name: 'sessions' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'advertiserAdCost',
            numericFilter: {
              operation: 'GREATER_THAN',
              value: { doubleValue: 0 }
            }
          }
        },
        orderBys: [
          { metric: { metricName: 'advertiserAdCost' }, desc: true }
        ],
        limit: 20
      }
    });

    console.log('Source/Medium | Ad Cost | Clicks | Impressions | CPC | CPM | Sessions | Conversions | Revenue | ROAS | CPA');
    console.log('-'.repeat(140));

    const sourceData = sourceResponse.data.rows || [];
    sourceData.forEach(row => {
      const source = row.dimensionValues[0].value;
      const adCost = parseFloat(row.metricValues[0].value || 0);
      const clicks = parseInt(row.metricValues[1].value || 0);
      const impressions = parseInt(row.metricValues[2].value || 0);
      const sessions = parseInt(row.metricValues[3].value || 0);
      const conversions = parseFloat(row.metricValues[4].value || 0);
      const revenue = parseFloat(row.metricValues[5].value || 0);

      const cpc = clicks > 0 ? (adCost / clicks).toFixed(2) : '0.00';
      const cpm = impressions > 0 ? ((adCost / impressions) * 1000).toFixed(2) : '0.00';
      const roas = adCost > 0 ? (revenue / adCost).toFixed(2) : '0.00';
      const cpa = conversions > 0 ? (adCost / conversions).toFixed(2) : '0.00';

      console.log(`${source.substring(0, 30).padEnd(30)} | $${adCost.toFixed(2)} | ${clicks} | ${impressions} | $${cpc} | $${cpm} | ${sessions} | ${conversions} | $${revenue.toFixed(2)} | ${roas}x | $${cpa}`);
    });

    // Get campaign performance if available
    console.log('\n\n=== TOP CAMPAIGNS BY COST ===\n');
    
    const campaignResponse = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        }],
        dimensions: [
          { name: 'sessionCampaignName' }
        ],
        metrics: [
          { name: 'advertiserAdCost' },
          { name: 'advertiserAdClicks' },
          { name: 'sessions' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
        ],
        dimensionFilter: {
          andGroup: {
            expressions: [
              {
                filter: {
                  fieldName: 'advertiserAdCost',
                  numericFilter: {
                    operation: 'GREATER_THAN',
                    value: { doubleValue: 0 }
                  }
                }
              },
              {
                notExpression: {
                  filter: {
                    fieldName: 'sessionCampaignName',
                    stringFilter: {
                      value: '(not set)'
                    }
                  }
                }
              }
            ]
          }
        },
        orderBys: [
          { metric: { metricName: 'advertiserAdCost' }, desc: true }
        ],
        limit: 10
      }
    });

    console.log('Campaign | Ad Cost | Clicks | CPC | Sessions | Conversions | Revenue | ROAS | CPA');
    console.log('-'.repeat(120));

    const campaignData = campaignResponse.data.rows || [];
    campaignData.forEach(row => {
      const campaign = row.dimensionValues[0].value;
      const adCost = parseFloat(row.metricValues[0].value || 0);
      const clicks = parseInt(row.metricValues[1].value || 0);
      const sessions = parseInt(row.metricValues[2].value || 0);
      const conversions = parseFloat(row.metricValues[3].value || 0);
      const revenue = parseFloat(row.metricValues[4].value || 0);

      const cpc = clicks > 0 ? (adCost / clicks).toFixed(2) : '0.00';
      const roas = adCost > 0 ? (revenue / adCost).toFixed(2) : '0.00';
      const cpa = conversions > 0 ? (adCost / conversions).toFixed(2) : '0.00';

      console.log(`${campaign.substring(0, 40).padEnd(40)} | $${adCost.toFixed(2)} | ${clicks} | $${cpc} | ${sessions} | ${conversions} | $${revenue.toFixed(2)} | ${roas}x | $${cpa}`);
    });

    console.log('\n=== KEY METRICS SUMMARY ===');
    console.log(`Total Ad Spend (6 months): $${totalCost.toFixed(2)}`);
    console.log(`Average Monthly Ad Spend: $${(totalCost / 6).toFixed(2)}`);
    console.log(`Overall ROAS: ${totalROAS}x`);
    console.log(`Average CPC: $${avgCPC}`);
    console.log(`Average CPM: $${avgCPM}`);
    console.log(`Average CPA: $${avgCPA}`);
    console.log(`Total Conversions: ${totalConversions}`);
    console.log(`Total Revenue from Ads: $${totalRevenue.toFixed(2)}`);

  } catch (error) {
    console.error('Error fetching data:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the analysis
getAdvertisingCosts();