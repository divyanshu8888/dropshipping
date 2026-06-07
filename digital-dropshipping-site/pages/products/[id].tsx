import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../src/components/Header';
import { getProduct, Product } from '../../src/lib/api';
import { buildQuoteHref } from '../../src/lib/quoteLink';

interface ProductDetailProps {
  product: Product | null;
}

const PRODUCT_CACHE_TTL_MS = 60 * 1000;
const productCache = new Map<string, { data: Product; expiresAt: number }>();

const ProductDetail = ({ product }: ProductDetailProps) => {

  if (!product) {
        return (
      <div className="min-h-screen bg-bg-base">
                <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Service not found</h1>
          <p className="text-text-soft mb-6">The service you are looking for is no longer available.</p>
          <Link href="/products" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Services
          </Link>
                </div>
            </div>
        );
    }

  const categoryLabel = product.category || product.service_name;
  const displayTitle = product.service_name || product.title;
  const timelineLabel = product.delivery_days ? `${product.delivery_days} day delivery` : 'Flexible delivery';
  const serviceHighlights = [
    'Milestone-based delivery with QA checkpoints',
    'Operator-led communication and weekly syncs',
    'Escrow-backed payments & Unitiv compliance',
    'Switch to retainer or pause with 7-day notice'
  ];
  const assurancePoints = [
    {
      title: 'Launch-ready scopes',
      copy: 'Includes kickoff templates, reporting dashboards, and tooling access.'
    },
    {
      title: 'Dedicated operator',
      copy: product.freelancer_name
        ? `${product.freelancer_name} owns the engagement end-to-end.`
        : 'A verified Unitiv operator drives execution and reporting.'
    },
    {
      title: 'Post-handoff support',
      copy: 'Two-week stabilization window with async support.'
    }
  ];

    return (
        <>
            <Head>
        <title>{displayTitle} - Unitiv</title>
        <meta name="description" content={product.description || product.summary || ''} />
            </Head>

      <div className="min-h-screen bg-bg-base">
                <Header />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">
                    <nav className="mb-8">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li>
                <Link href="/" className="text-text-mute hover:text-white">
                                    Home
                                </Link>
                            </li>
              <li className="text-text-mute">/</li>
                            <li>
                <Link href="/products" className="text-text-mute hover:text-white">
                  Services
                                </Link>
                            </li>
              <li className="text-text-mute">/</li>
              <li className="text-white font-medium">{displayTitle}</li>
                        </ol>
                    </nav>

          <div className="space-y-10">
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#15192b] via-[#0c0f1c] to-[#05060c] px-6 py-10 lg:px-12">
              <div className="absolute -right-16 top-0 h-64 w-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-40 blur-[120px]" />
              <div className="relative grid gap-10 lg:grid-cols-2">
                <div className="space-y-6">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.25em] text-white/70">
                    {categoryLabel}
                  </span>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">
                      {displayTitle}
                    </h1>
                    <p className="mt-4 text-lg text-white/70 leading-relaxed">
                      {product.summary || product.description}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs text-white/60">Operated by</p>
                      <p className="mt-2 text-white font-semibold">
                        {product.freelancer_name || 'Verified Unitiv Operator'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs text-white/60">Delivery</p>
                      <p className="mt-2 text-white font-semibold">{timelineLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-xs text-white/60">Engagement</p>
                      <p className="mt-2 text-white font-semibold">Scope + milestones</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={buildQuoteHref({
                        source: 'product',
                        intent: 'proposal',
                        title: `Proposal for ${displayTitle}`,
                        subtitle: product.summary || product.description || undefined,
                        badge: categoryLabel || undefined,
                        meta: product.freelancer_name ? `Operated by ${product.freelancer_name}` : undefined,
                        category: product.category || undefined,
                        freelancerId: product.freelancer_id ?? undefined,
                        freelancerName: product.freelancer_name ?? undefined
                      })}
                      className="inline-flex flex-1 min-w-[160px] items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-rose-500 px-5 h-12 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 whitespace-nowrap"
                      aria-label={`Request proposal for ${displayTitle}`}
                    >
                      Request custom quote
                    </Link>
                    <Link
                      href="/freelancers"
                      className="inline-flex flex-1 min-w-[160px] items-center justify-center rounded-2xl border border-white/15 px-5 h-12 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 whitespace-nowrap"
                      aria-label="Browse freelancers"
                    >
                      Meet operators
                    </Link>
                  </div>
                </div>
                <div className="relative">
                  <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
                    <img
                      src={product.image_url || '/images/products/product-placeholder.jpg'}
                      alt={displayTitle}
                      className="h-80 w-full object-cover"
                            />
                        </div>
                                </div>
                                </div>
                            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                            <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/60">Scope overview</p>
                      <h2 className="mt-2 text-2xl font-semibold text-white">What&apos;s included</h2>
                            </div>
                    <span className="rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs text-white/70">
                      Playbook ready
                    </span>
                                </div>
                  <p className="mt-4 text-white/70 leading-relaxed whitespace-pre-line">
                    {product.description || product.summary || 'Detailed scope coming soon.'}
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {serviceHighlights.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/3 p-4 text-sm text-white/80">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Delivery promise</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Operator assurance</h2>
                  <div className="mt-6 grid gap-6 sm:grid-cols-3">
                    {assurancePoints.map((point) => (
                      <div key={point.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-sm font-semibold text-white">{point.title}</p>
                        <p className="mt-2 text-xs text-white/70">{point.copy}</p>
                      </div>
                    ))}
                  </div>
                </section>
                            </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Pricing</p>
                  <p className="mt-3 text-4xl font-semibold text-white">Request a quote</p>
                  <p className="mt-3 text-sm text-white/70">
                    Share your scope and we&apos;ll send a proposal with milestones, delivery dates, and automation add-ons.
                  </p>
                                <Link
                    href={buildQuoteHref({
                      source: 'product',
                      intent: 'proposal',
                      title: `Proposal for ${displayTitle}`,
                      subtitle: product.summary || product.description || undefined,
                      badge: categoryLabel || undefined,
                      meta: product.freelancer_name ? `Operated by ${product.freelancer_name}` : undefined,
                      category: product.category || undefined,
                      freelancerId: product.freelancer_id ?? undefined,
                      freelancerName: product.freelancer_name ?? undefined
                    })}
                    className="mt-6 inline-flex w-full justify-center rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Start quote
                                </Link>
                  <div className="mt-6 space-y-3 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Payment protection & escrow
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Cancel or pause with 7-day notice
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Swap operators if priorities change
                    </div>
                  </div>
                            </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 text-sm text-white/80">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-green-400/20 p-2 text-green-300">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-white">Verified delivery playbook</p>
                      <p className="text-xs text-white/70">Includes QA, approvals, and reporting cadence.</p>
                                    </div>
                                </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-green-400/20 p-2 text-green-300">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-white">Flexible engagement</p>
                      <p className="text-xs text-white/70">Convert to retainer or extend sprints anytime.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-green-400/20 p-2 text-green-300">
                      ✓
                    </span>
                    <div>
                      <p className="font-semibold text-white">Client success partner</p>
                      <p className="text-xs text-white/70">Unitiv success managers keep work on track.</p>
                    </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>

        </>
    );
};

export default ProductDetail;

export const getServerSideProps: GetServerSideProps<ProductDetailProps> = async ({ params }) => {
  try {
    const rawId = params?.id;
    const identifier = Array.isArray(rawId) ? rawId[0] : rawId;

    if (!identifier) {
      return { notFound: true };
    }

    const cacheKey = String(identifier);
    const now = Date.now();
    const cached = productCache.get(cacheKey);

    let product: Product | null;
    if (cached && cached.expiresAt > now) {
      product = cached.data;
    } else {
      product = await getProduct(identifier);
      if (product) {
        productCache.set(cacheKey, {
          data: product,
          expiresAt: now + PRODUCT_CACHE_TTL_MS
        });
      }
    }

    if (!product) {
      return { notFound: true };
    }

    return {
      props: {
        product
      }
    };
  } catch (error) {
    console.error('Failed to load product detail page:', error);
    return { notFound: true };
  }
};