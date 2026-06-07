import Head from 'next/head';
import Header from '../src/components/Header';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { getProducts, Product } from '../src/lib/api';

interface CategoriesPageProps {
  products: Product[];
}

export default function CategoriesPage({ products }: CategoriesPageProps) {
  // Extract unique categories from products
  const categories = Array.from(
    new Set(
      products
        .map((product) => product.category)
        .filter((category): category is string => typeof category === 'string' && category.trim().length > 0)
    )
  );
  
  const categoryInfo: { [key: string]: { icon: string; description: string } } = {
    'Web Development': {
      icon: '💻',
      description: 'Custom websites and web applications'
    },
    'UI/UX Design': {
      icon: '🎨',
      description: 'User interface and experience design'
    },
    'Digital Marketing': {
      icon: '📱',
      description: 'SEO, social media, and content marketing'
    },
    'Data & Analytics': {
      icon: '📊',
      description: 'Data analysis and business intelligence'
    },
    'DevOps & Cloud': {
      icon: '☁️',
      description: 'Cloud infrastructure and deployment'
    },
    'AI & ML': {
      icon: '🤖',
      description: 'Artificial intelligence and machine learning'
    },
    'Content Writing': {
      icon: '✍️',
      description: 'Professional writing and content creation'
    }
  };

  return (
    <>
      <Head>
        <title>Service Categories - Unitiv</title>
        <meta name="description" content="Browse all service categories on Unitiv" />
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-6xl mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold text-white mb-4 text-center">Service Categories</h1>
          <p className="text-xl text-gray-300 mb-12 text-center">Find the right expertise for your project</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition group"
              >
                <div className="text-5xl mb-4">{categoryInfo[category]?.icon || '🔧'}</div>
                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition">
                  {category}
                </h2>
                <p className="text-gray-300 mb-4">
                  {categoryInfo[category]?.description || 'Professional services in this category'}
                </p>
                <p className="text-cyan-400 text-sm font-medium group-hover:underline">
                  Explore {category} →
                </p>
              </Link>
            ))}
            
            {/* If no categories, show default ones */}
            {categories.length === 0 && (
              <>
                {[
                  { name: 'Web Development', icon: '💻', desc: 'Custom websites and applications' },
                  { name: 'UI/UX Design', icon: '🎨', desc: 'User interface design' },
                  { name: 'Digital Marketing', icon: '📱', desc: 'Marketing and promotion' },
                  { name: 'Data Analytics', icon: '📊', desc: 'Data insights and BI' },
                  { name: 'DevOps', icon: '☁️', desc: 'Cloud and infrastructure' },
                  { name: 'AI & ML', icon: '🤖', desc: 'Artificial intelligence' }
                ].map(cat => (
                  <div key={cat.name} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                    <div className="text-5xl mb-4">{cat.icon}</div>
                    <h2 className="text-2xl font-bold text-white mb-3">{cat.name}</h2>
                    <p className="text-gray-300">{cat.desc}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link href="/freelancers" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-xl font-semibold hover:opacity-90 transition">
              Browse All Freelancers
            </Link>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const products = await getProducts();
    return {
      props: {
        products: products || []
      }
    };
  } catch (error) {
    return {
      props: {
        products: []
      }
    };
  }
};

