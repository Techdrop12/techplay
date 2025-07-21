/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.techplay.fr',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 5000,
  changefreq: 'weekly',
  priority: 0.7,
  exclude: [
    '/admin/*',
    '/maintenance',
    '/fr/maintenance',
    '/en/maintenance',
    '/api/*'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/'
      },
      {
        userAgent: '*',
        disallow: [
          '/admin',
          '/admin/*',
          '/maintenance',
          '/fr/maintenance',
          '/en/maintenance',
          '/api',
          '/api/*'
        ]
      }
    ]
  }
}
