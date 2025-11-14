import React, { useMemo, useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../src/components/Header';
import QuoteRequestForm from '../src/components/QuoteRequestForm';
import { getProducts, Product } from '../src/lib/api';

interface ProductsPageProps {
  products: Product[];
  selectedCategory?: string | null;
}

const formatPrice = (product: Product) => {
  if (!product.base_price_cents) {
    return 'Custom pricing';
  }
  try {
    const amount = product.base_price_cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: product.currency || 'AUD',
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `From ${(product.base_price_cents / 100).toFixed(0)} ${product.currency || 'AUD'}`;
  }
};

export default function ProductsPage({ products, selectedCategory }: ProductsPageProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  const pageTitle = useMemo(() => {
    if (selectedCategory) {
      return `${selectedCategory} Services - Uniti`;
    }
    return 'Freelancer Services & Products - Uniti';
  }, [selectedCategory]);

  const handleGetQuote = (_product: Product) => {
    setShowQuoteModal(true);
  };

  const heroDescription = selectedCategory
    ? `Specialist services inside ${selectedCategory}. Each offer is delivered by a vetted Uniti operator.`
    : 'Discover professional services and digital products from our verified freelancers';

  const renderedProducts = products ?? [];

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content="Discover professional services and digital products from our verified freelancers. Get custom quotes and view detailed service information." />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">Freelancer Services & Products</h1>
            <p className="mt-2 text-text-soft">{heroDescription}</p>
            <nav className="mt-2">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/" className="text-text-mute hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-text-mute">/</li>
                <li className="text-white font-medium">Services & Products</li>
                {selectedCategory && (
                  <>
                    <li className="text-text-mute">/</li>
                    <li className="text-white font-medium">{selectedCategory}</li>
                  </>
                )}
              </ol>
            </nav>
          </div>

          {selectedCategory && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-text-soft">
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
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:bg-white/10"
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={product.image_url || '/images/products/product-placeholder.jpg'}
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-text-soft text-sm mb-4 line-clamp-3">
                      {product.summary || product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white font-semibold">{formatPrice(product)}</p>
                        {product.freelancer_name && (
                          <p className="text-xs text-text-mute mt-1">Operated by {product.freelancer_name}</p>
                        )}
                      </div>
                      {product.delivery_days && (
                        <span className="text-xs text-text-soft">{product.delivery_days}-day delivery</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGetQuote(product)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Request Quote
                      </button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-white/20 text-sm font-medium rounded-xl text-white bg-white/5 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                      >
                        View Details
                      </Link>
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

      {/* Quote Request Form Modal */}
      {showQuoteModal && (
        <QuoteRequestForm
          onClose={() => setShowQuoteModal(false)}
          onSuccess={() => {
            setShowQuoteModal(false);
          }}
        />
      )}
    </>
  );
}


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  try {
    const categoryParam = typeof query.category === 'string' ? query.category : null;

    // Get products from database
    const products = await getProducts(
      categoryParam
        ? {
            categoryName: categoryParam
          }
        : {}
    );
    
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
