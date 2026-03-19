#!/usr/bin/env node
/**
 * SEO Sitemap Generator
 * Gera sitemap.xml dinamicamente com todas as páginas edináveis
 * Execute: node generate-sitemap.js
 */

import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'https://lightplast.vercel.app';
const STATIC_PAGES = [
  { url: '/', changefreq: 'weekly', priority: 1.0 },
  { url: '/catalogo.html', changefreq: 'weekly', priority: 0.9 },
  { url: '/sobre.html', changefreq: 'monthly', priority: 0.8 },
  { url: '/blog.html', changefreq: 'weekly', priority: 0.8 },
];

const CATEGORY_PAGES = [
  { url: '/categoria-sacos-de-lixo.html', priority: 0.85 },
  { url: '/categoria-sacolas-personalizadas.html', priority: 0.85 },
  { url: '/categoria-filmes-tecnicos.html', priority: 0.85 },
];

function getProdutoPages() {
  const files = readdirSync('.');
  return files
    .filter(f => f.startsWith('produto-') && f.endsWith('.html'))
    .map(f => ({ url: `/${f}`, priority: 0.75, changefreq: 'weekly' }));
}

function getBlogPages() {
  const files = readdirSync('.');
  return files
    .filter(f => f.startsWith('blog-') && f.endsWith('.html') && f !== 'blog.html')
    .map(f => ({ url: `/${f}`, priority: 0.7, changefreq: 'monthly' }));
}

function generateSitemap() {
  const allPages = [
    ...STATIC_PAGES,
    ...CATEGORY_PAGES,
    ...getProdutoPages(),
    ...getBlogPages(),
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
    xml += `    <changefreq>${page.changefreq || 'monthly'}</changefreq>\n`;
    xml += `    <priority>${page.priority || 0.5}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  writeFileSync('sitemap.xml', xml, 'utf-8');
  console.log(`✅ Sitemap gerado com ${allPages.length} URLs`);
  console.log(`📝 Arquivo: sitemap.xml`);
  process.exit(0);
}

generateSitemap();
