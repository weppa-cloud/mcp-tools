const { google } = require('googleapis');

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

    // First, let's try to get basic metrics by month
    console.log('=== MONTHLY TRAFFIC AND CONVERSIONS ===\n');
    
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
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'newUsers' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [
          { dimension: { dimensionName: 'yearMonth' } }
        ]
      }
    });

    console.log('Month | Sessions | Total Users | New Users | Conversions | Revenue | Avg Session Duration');
    console.log('-'.repeat(100));

    const monthlyData = monthlyResponse.data.rows || [];
    let totalSessions = 0;
    let totalUsers = 0;
    let totalNewUsers = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    monthlyData.forEach(row => {
      const month = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value || 0);
      const users = parseInt(row.metricValues[1].value || 0);
      const newUsers = parseInt(row.metricValues[2].value || 0);
      const conversions = parseFloat(row.metricValues[3].value || 0);
      const revenue = parseFloat(row.metricValues[4].value || 0);
      const avgDuration = parseFloat(row.metricValues[5].value || 0);

      // Format month (YYYYMM to Month YYYY)
      const year = month.substring(0, 4);
      const monthNum = month.substring(4, 6);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedMonth = `${monthNames[parseInt(monthNum) - 1]} ${year}`;

      console.log(`${formattedMonth} | ${sessions} | ${users} | ${newUsers} | ${conversions} | $${revenue.toFixed(2)} | ${(avgDuration/60).toFixed(2)} min`);

      totalSessions += sessions;
      totalUsers = users; // Last month's total users
      totalNewUsers += newUsers;
      totalConversions += conversions;
      totalRevenue += revenue;
    });

    console.log('-'.repeat(100));
    console.log(`TOTAL | ${totalSessions} | ${totalUsers} | ${totalNewUsers} | ${totalConversions} | $${totalRevenue.toFixed(2)}`);

    // Get traffic by source/medium
    console.log('\n\n=== TRAFFIC BY SOURCE/MEDIUM (Last 6 Months) ===\n');
    
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
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'conversions' },
          { name: 'totalRevenue' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' }
        ],
        orderBys: [
          { metric: { metricName: 'sessions' }, desc: true }
        ],
        limit: 20
      }
    });

    console.log('Source/Medium | Sessions | Users | Conversions | Revenue | Bounce Rate | Avg Duration');
    console.log('-'.repeat(120));

    const sourceData = sourceResponse.data.rows || [];
    sourceData.forEach(row => {
      const source = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value || 0);
      const users = parseInt(row.metricValues[1].value || 0);
      const conversions = parseFloat(row.metricValues[2].value || 0);
      const revenue = parseFloat(row.metricValues[3].value || 0);
      const bounceRate = parseFloat(row.metricValues[4].value || 0);
      const avgDuration = parseFloat(row.metricValues[5].value || 0);

      console.log(`${source.substring(0, 30).padEnd(30)} | ${sessions} | ${users} | ${conversions} | $${revenue.toFixed(2)} | ${(bounceRate * 100).toFixed(2)}% | ${(avgDuration/60).toFixed(2)} min`);
    });

    // Get campaign performance
    console.log('\n\n=== TOP CAMPAIGNS (Last 6 Months) ===\n');
    
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
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'conversions' },
          { name: 'totalRevenue' }
        ],
        dimensionFilter: {
          notExpression: {
            filter: {
              fieldName: 'sessionCampaignName',
              stringFilter: {
                value: '(not set)'
              }
            }
          }
        },
        orderBys: [
          { metric: { metricName: 'sessions' }, desc: true }
        ],
        limit: 10
      }
    });

    console.log('Campaign | Sessions | Users | Conversions | Revenue | Conv. Rate');
    console.log('-'.repeat(100));

    const campaignData = campaignResponse.data.rows || [];
    campaignData.forEach(row => {
      const campaign = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value || 0);
      const users = parseInt(row.metricValues[1].value || 0);
      const conversions = parseFloat(row.metricValues[2].value || 0);
      const revenue = parseFloat(row.metricValues[3].value || 0);
      const convRate = sessions > 0 ? (conversions / sessions * 100).toFixed(2) : '0.00';

      console.log(`${campaign.substring(0, 40).padEnd(40)} | ${sessions} | ${users} | ${conversions} | $${revenue.toFixed(2)} | ${convRate}%`);
    });

    // Try to get Google Ads specific data
    console.log('\n\n=== GOOGLE ADS PERFORMANCE (if available) ===\n');
    
    try {
      const googleAdsResponse = await analyticsData.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
          dateRanges: [{
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
          }],
          dimensions: [
            { name: 'googleAdsAdGroupName' }
          ],
          metrics: [
            { name: 'sessions' },
            { name: 'conversions' },
            { name: 'totalRevenue' }
          ],
          dimensionFilter: {
            notExpression: {
              filter: {
                fieldName: 'googleAdsAdGroupName',
                stringFilter: {
                  value: '(not set)'
                }
              }
            }
          },
          orderBys: [
            { metric: { metricName: 'sessions' }, desc: true }
          ],
          limit: 10
        }
      });

      if (googleAdsResponse.data.rows && googleAdsResponse.data.rows.length > 0) {
        console.log('Ad Group | Sessions | Conversions | Revenue');
        console.log('-'.repeat(80));

        googleAdsResponse.data.rows.forEach(row => {
          const adGroup = row.dimensionValues[0].value;
          const sessions = parseInt(row.metricValues[0].value || 0);
          const conversions = parseFloat(row.metricValues[1].value || 0);
          const revenue = parseFloat(row.metricValues[2].value || 0);

          console.log(`${adGroup.substring(0, 40).padEnd(40)} | ${sessions} | ${conversions} | $${revenue.toFixed(2)}`);
        });
      } else {
        console.log('No Google Ads data available in this property.');
      }
    } catch (adsError) {
      console.log('Could not retrieve Google Ads specific data.');
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Total Sessions (6 months): ${totalSessions}`);
    console.log(`Total Conversions: ${totalConversions}`);
    console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`Average Conversion Rate: ${(totalConversions / totalSessions * 100).toFixed(2)}%`);
    console.log(`Average Revenue per Session: $${(totalRevenue / totalSessions).toFixed(2)}`);

    console.log('\nNote: Advertising cost metrics (advertiserAdCost, advertiserAdClicks, etc.) are not available in this Google Analytics property.');
    console.log('These metrics are typically available only if you have linked Google Ads or other advertising platforms to your GA4 property.');
    console.log('To get advertising costs, you may need to:');
    console.log('1. Link your Google Ads account to GA4');
    console.log('2. Import cost data from other advertising platforms');
    console.log('3. Use the Google Ads API directly for cost data');

  } catch (error) {
    console.error('Error fetching data:', error.message);
    if (error.response && error.response.data) {
      console.error('Response details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the analysis
getAdvertisingCosts();