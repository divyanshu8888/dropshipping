import { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../src/components/Header';
import QuoteRequestForm from '../../src/components/QuoteRequestForm';
import { getProduct, Product } from '../../src/lib/api';

interface ProductDetailProps {
  product: Product | null;
}

const formatPrice = (product: Product) => {
  if (!product.base_price_cents) {
    return 'Custom pricing';
  }

  const amount = product.base_price_cents / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'AUD',
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${amount.toFixed(0)} ${product.currency || 'AUD'}`;
  }
};

const ProductDetail = ({ product }: ProductDetailProps) => {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

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
  const timelineLabel = product.delivery_days ? `${product.delivery_days} day delivery` : 'Flexible delivery';

  return (
    <>
      <Head>
        <title>{product.title} - Uniti</title>
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
              <li className="text-white font-medium">{product.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={product.image_url || '/images/products/product-placeholder.jpg'}
                alt={product.title}
                className="w-full h-96 object-cover"
              />
              <div className="p-8 space-y-6">
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-xs text-text-soft border border-white/10 uppercase tracking-wide">
                    {categoryLabel}
                  </span>
                  <h1 className="text-3xl font-bold text-white mt-4">{product.title}</h1>
                  <p className="text-text-soft mt-2">{product.summary || product.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-text-mute">Operated by</p>
                    <p className="text-white font-semibold mt-1">
                      {product.freelancer_name || 'Verified Uniti Operator'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-text-mute">Delivery</p>
                    <p className="text-white font-semibold mt-1">{timelineLabel}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">What&apos;s included</h3>
                  <p className="text-text-soft leading-relaxed whitespace-pre-line">
                    {product.description || product.summary || 'Detailed scope coming soon.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-text-mute text-sm mb-2">Starting from</p>
                <p className="text-4xl font-bold text-white">{formatPrice(product)}</p>
                <p className="text-text-soft text-sm mt-2">
                  Tell us about your exact scope and we&apos;ll tailor the final quote.
                </p>
                <button
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full mt-6 inline-flex justify-center px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:opacity-90 transition"
                >
                  Request Custom Quote
                </button>
                <Link
                  href="/freelancers"
                  className="mt-3 inline-flex w-full justify-center rounded-2xl border border-white/15 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  Browse Operators
                </Link>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 text-sm text-text-soft">
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <div>
                    <p className="text-white font-medium">Verified delivery playbook</p>
                    <p>Each offer is backed by Uniti QA, contracts, and milestone tracking.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <div>
                    <p className="text-white font-medium">Flexible engagement</p>
                    <p>Switch to retainers or pause scopes with 7-day notice.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <div>
                    <p className="text-white font-medium">Payment protection</p>
                    <p>Funds are held in escrow until deliverables are approved.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQuoteModal && (
        <QuoteRequestForm
          onClose={() => setShowQuoteModal(false)}
          onSuccess={() => setShowQuoteModal(false)}
        />
      )}
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

    const product = await getProduct(identifier);

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