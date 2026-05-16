import { useMemo } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../src/components/Header';
import { QuoteRequestContext } from '../src/components/QuoteRequestForm';
import { buildQuoteHref } from '../src/lib/quoteLink';
import { getProducts, Product } from '../src/lib/api';

interface ProductsPageProps {
  products: Product[];
  selectedCategory?: string | null;
}

const PRODUCTS_CACHE_TTL_MS = 60 * 1000; // 1 minute
let cachedProducts: { payload: Product[]; expiresAt: number } | null = null;

const categoryChips = [
  { label: 'All Playbooks', value: null },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Design', value: 'design' },
  { label: 'Development', value: 'web-development' },
  { label: 'Data & AI', value: 'data-science' },
  { label: 'Operations', value: 'business' },
  { label: 'Content', value: 'writing' }
];

export default function ProductsPage({ products, selectedCategory }: ProductsPageProps) {

  const pageTitle = useMemo(() => {
    if (selectedCategory) {
      return `${selectedCategory} Services - Uniti`;
    }
    return 'Freelancer Services & Products - Uniti';
  }, [selectedCategory]);

  const getQuoteHref = (context: QuoteRequestContext) => buildQuoteHref(context);

  const renderedProducts = products ?? [];

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Discover professional services and digital products from our verified freelancers. Get custom quotes and view detailed service information." />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <section>
          <div className="relative overflow-hidden rounded-none border-y border-white/5 bg-gradient-to-r from-[#05060c] via-[#0b1023] to-[#070812] shadow-[0_30px_120px_-60px_rgba(65,110,255,0.6)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(91,143,254,0.3),_transparent_60%)] pointer-events-none" />
            <div className="relative w-full px-6 sm:px-10 py-16 max-w-6xl mx-auto">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                Uniti service catalog
              </p>
              <h1 className="mt-5 text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                Find the{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_4px_25px_rgba(82,156,255,0.35)]">
                  Perfect Playbook
                </span>
              </h1>
              <p className="mt-4 text-lg text-white/80 leading-relaxed">
                Browse done-for-you service playbooks delivered by verified operators. Every package includes onboarding, QA, and milestone-based delivery.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-2xl bg-white text-sm font-semibold text-[#0e101d] px-6 py-3 shadow-lg shadow-indigo-900/40 hover:-translate-y-0.5 transition"
                >
                  Browse Playbooks
                </Link>
                <Link
                  href={getQuoteHref({
                    source: 'general',
                    intent: 'brief',
                    title: 'Request a custom brief',
                    subtitle: 'Tell us about the scope you need and we’ll prepare options.'
                  })}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/40 text-sm font-semibold text-white px-6 py-3 hover:bg-white/10 transition"
                >
                  Request a Custom Brief
                </Link>
              </div>
              <p className="mt-3 text-sm text-white/70">
                Not sure what you need? We’ll map scope, timeline, and budget in one quote request.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-white/55">
                <span>Trusted by 120+ brands</span>
                <span className="hidden sm:inline">•</span>
                <span>Flexible engagement options</span>
                <span className="hidden sm:inline">•</span>
                <span>Milestone-based payments</span>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-10 overflow-x-auto sticky top-[72px] z-10 bg-bg-base/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="flex gap-3 min-w-max py-4">
              {categoryChips.map((chip) => {
                const isActive = chip.value === (selectedCategory || null);
                const href = chip.value ? `/products?category=${chip.value}` : '/products';
                return (
                  <Link
                    key={chip.label}
                    href={href}
                    scroll={false}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'border-white bg-white text-[#11121f]'
                        : 'border-white/15 text-white/80 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {chip.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <nav className="mb-8 text-sm">
            <ol className="flex items-center space-x-2 text-text-mute">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-white">Services & Products</li>
              {selectedCategory && (
                <>
                  <li>/</li>
                  <li className="text-white">{selectedCategory}</li>
                </>
              )}
            </ol>
          </nav>

          {selectedCategory && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-text-soft">
              <span>
                Showing offers in <span className="text-white font-medium">{selectedCategory}</span>
              </span>
              <Link href="/products" className="text-cyan-400 hover:text-cyan-300">
                Clear filter
              </Link>
            </div>
          )}

          {renderedProducts.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-white">No services available</h2>
              <p className="mt-2 text-text-soft">Our freelancers are preparing amazing services for you. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderedProducts.map((product) => (
                <div
                  key={product.slug}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:via-white/5 group-hover:to-white/10" />
                  <div className="relative">
                    <div className="relative h-48 overflow-hidden rounded-t-[28px]">
                      <img
                        src={product.image_url || '/images/products/product-placeholder.jpg'}
                        alt={product.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        {product.category && (
                          <span className="inline-flex items-center rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">
                            {product.category}
                          </span>
                        )}
                        {product.is_featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1 text-xs font-semibold text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white leading-tight line-clamp-2">
                          {product.service_name || product.title}
                        </h3>
                        <p className="mt-2 text-sm text-white/70 line-clamp-3">
                          {product.summary || product.description}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/70 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white text-sm font-semibold">Custom quote</p>
                          <p className="text-white/60 mt-0.5">
                            {product.freelancer_name
                              ? `Operated by ${product.freelancer_name}`
                              : 'Verified Uniti operator'}
                          </p>
                        </div>
                        {product.delivery_days && (
                          <div className="text-right">
                            <p className="text-white text-sm font-semibold">{product.delivery_days} days</p>
                            <p className="text-white/60">Avg delivery</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <Link
                          href={getQuoteHref({
                            source: 'product',
                            intent: 'proposal',
                            title: `Proposal for ${product.service_name || product.title}`,
                            subtitle: product.summary || product.description || undefined,
                            badge: product.category || undefined,
                            meta: product.freelancer_name ? `Operated by ${product.freelancer_name}` : undefined,
                            category: product.category || undefined,
                            freelancerId: product.freelancer_id ?? undefined,
                            freelancerName: product.freelancer_name ?? undefined
                          })}
                          className="flex-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 px-5 h-12 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 whitespace-nowrap"
                          aria-label={`Request proposal for ${product.service_name || product.title}`}
                        >
                          Request Proposal
                        </Link>
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 h-12 text-sm font-semibold text-white/90 hover:text-white hover:border-white/40 hover:bg-white/5 transition focus:outline-none focus:ring-2 focus:ring-white/20 whitespace-nowrap"
                          aria-label={`View scope for ${product.service_name || product.title}`}
                        >
                          View Scope
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {renderedProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-text-soft text-lg">No products available</div>
              <p className="text-text-mute mt-2">Products need to be added through the admin dashboard</p>
              <div className="mt-4 p-4 bg-bg-surface rounded-xl border border-white/10 max-w-md mx-auto">
                <p className="text-sm text-text-mute mb-2">Admin Setup Required:</p>
                <p className="text-xs text-text-mute">
                  1. Go to Admin Dashboard → Manage Products<br/>
                  2. Create products table in Supabase if needed<br/>
                  3. Add products with images through admin interface
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </>
  );
}


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const categoryParam = typeof query.category === 'string' ? query.category : null;

    let products: Product[];
    const now = Date.now();

    if (!categoryParam && cachedProducts && cachedProducts.expiresAt > now) {
      products = cachedProducts.payload;
    } else {
      products = await getProducts(
        categoryParam
          ? {
              categoryName: categoryParam
            }
          : {}
      );

      if (!categoryParam) {
        cachedProducts = {
          payload: products || [],
          expiresAt: now + PRODUCTS_CACHE_TTL_MS
        };
      }
    }
    
    return {
      props: {
        products: products || [],
        selectedCategory: categoryParam
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      props: {
        products: [],
      },
    };
  }
};
