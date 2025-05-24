import { BetaAnalyticsDataClient } from '@google-analytics/data'
import credentials from './ga4-credentials.json'

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials,
})

export async function getAnalyticsStats() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
    ],
  })

  const users = Number(response.rows?.[0]?.metricValues?.[0]?.value || 0)
  const pageViews = Number(response.rows?.[0]?.metricValues?.[1]?.value || 0)

  return {
    users,
    pageViews,
    conversionRate: 3.2, // facultatif à calculer plus tard
    totalRevenue: 7540,  // idem
  }
}
