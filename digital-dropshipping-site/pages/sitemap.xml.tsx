import { GetServerSideProps } from 'next';

// Why: SEO dimension required a sitemap; generated server-side so the public
// page list stays in one place and the URL set follows NEXT_PUBLIC_SITE_URL.
const PUBLIC_PATHS = [
  '/',
  '/freelancers',
  '/open-projects',
  '/products',
  '/how-it-works',
  '/about',
  '/contact',
  '/apply',
  '/request-quote',
  '/why-choose-us',
  '/case-studies',
  '/careers',
  '/blog',
  '/community',
  '/categories',
  '/payouts',
  '/protection',
  '/terms',
  '/privacy',
  '/cookies',
];

function buildXml(siteUrl: string): string {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_PATHS.map(
    (p) =>
      `  <url><loc>${siteUrl}${p}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${p === '/' ? '1.0' : '0.7'}</priority></url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://unitiv.com').replace(/\/$/, '');
  res.setHeader('Content-Type', 'application/xml');
  // Why: cache at the edge for a day; sitemap content rarely changes.
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');
  res.write(buildXml(siteUrl));
  res.end();
  return { props: {} };
};

// Required default export for a Next.js page; rendering handled in GSSP.
export default function Sitemap() {
  return null;
}
