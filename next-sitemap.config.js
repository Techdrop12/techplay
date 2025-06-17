// next-sitemap.config.js
module.exports = {
  siteUrl: 'https://www.techplay.com', // ✅ à corriger si ton domaine réel est différent
  generateRobotsTxt: true,
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin/*'], // exclut tout l’espace admin
};
