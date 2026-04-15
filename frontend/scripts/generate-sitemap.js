import fs from 'fs'
import axios from 'axios'

const SITE_URL = 'https://ashtrixtees.com'
const API_URL = 'http://localhost:8000/api' // Adjust if needed for production

async function generateSitemap() {
  console.log('Generating sitemap...')
  
  const corePages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/shop', priority: 0.9, changefreq: 'daily' },
    { url: '/cart', priority: 0.5, changefreq: 'monthly' },
  ]

  const categories = [
    'oversized', 'printed', 'plain', 'acid-wash', 'polo', 'crop'
  ].map(c => ({ url: `/shop?category=${c}`, priority: 0.8, changefreq: 'weekly' }))

  const locations = [
    '/tshirts-in-thiruvarur',
    '/tshirts-delivery-mannargudi',
    '/buy-tshirts-needamangalam',
    '/tshirts-kodavasal',
    '/tshirts-vedaranyam'
  ].map(l => ({ url: l, priority: 0.9, changefreq: 'monthly' }))

  let productPages = []
  try {
    const res = await axios.get(`${API_URL}/products?per_page=1000`)
    productPages = res.data.items.map(p => ({
      url: `/product/${p.slug}`,
      priority: 0.7,
      changefreq: 'weekly'
    }))
  } catch (err) {
    console.warn('Could not fetch products for sitemap, using core pages only.')
  }

  const allPages = [...corePages, ...categories, ...locations, ...productPages]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  fs.writeFileSync('./public/sitemap.xml', sitemap)
  console.log('Sitemap generated successfully at ./public/sitemap.xml')
}

generateSitemap()
