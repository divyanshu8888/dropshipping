import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../src/components/Header';
import QuoteRequestForm from '../src/components/QuoteRequestForm';
import { getProducts } from '../src/lib/api';
import { Product } from '../src/lib/api';

interface ProductsPageProps {
  products: Product[];
}

export default function ProductsPage({ products }: ProductsPageProps) {
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleGetQuote = (product: Product) => {
    setSelectedProduct(product);
    setShowQuoteModal(true);
  };
  return (
    <>
      <Head>
        <title>Products - TalentHub Pro Store</title>
        <meta name="description" content="Browse our collection of digital products and services" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white">Our Products</h1>
            <p className="mt-2 text-text-soft">Discover amazing digital products and services</p>
            <nav className="mt-2">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link href="/" className="text-text-mute hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-text-mute">/</li>
                <li className="text-white font-medium">Products</li>
              </ol>
            </nav>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">No products available</h2>
              <p className="mt-2 text-gray-600">Check back soon for new products!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group"
                >
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Custom pricing available</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleGetQuote(product)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                          Get Quote
                        </button>
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const products = await getProducts();
    // Convert dates to strings for JSON serialization
    const serializedProducts = products.map(product => ({
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
    return {
      props: {
        products: serializedProducts,
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
