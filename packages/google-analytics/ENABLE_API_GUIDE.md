# Enable Google Analytics Data API Guide

## Quick Steps to Enable the API

1. **Visit the Google Cloud Console**
   - Go to: https://console.developers.google.com/apis/api/analyticsdata.googleapis.com/overview?project=859975794149
   - Or visit: https://console.cloud.google.com/

2. **Enable the Google Analytics Data API**
   - Click the "ENABLE" button on the API page
   - Wait 2-3 minutes for the API to be fully activated

3. **Verify API is Enabled**
   - The API status should show as "Enabled"
   - You should see API metrics and quota information

4. **Re-run the Analysis**
   ```bash
   cd /Users/yeisongomez/Documents/Proyectos/Agentes Ia/Growth Agent/mcp-google-analytics
   node comprehensive-analytics.js
   ```

## Alternative: Using gcloud CLI

If you have gcloud CLI installed:
```bash
gcloud services enable analyticsdata.googleapis.com --project=859975794149
```

## Troubleshooting

1. **Permission Issues**
   - Ensure your service account has the "Analytics Data API" permissions
   - Check that your service account has access to the GA4 property (294486074)

2. **API Quota**
   - The Google Analytics Data API has quotas
   - Default: 1,250 requests per minute
   - Can be increased if needed

3. **Service Account Permissions**
   - Go to Google Analytics Admin
   - Navigate to Property Access Management
   - Add your service account email with "Viewer" or "Analyst" role

## Next Steps

Once the API is enabled:
1. Wait 2-3 minutes for propagation
2. Run the comprehensive analytics script
3. Review the detailed reports for all 10 analysis types