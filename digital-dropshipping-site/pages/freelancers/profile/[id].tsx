import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../src/components/Header';
import QuoteRequestForm from '../../../src/components/QuoteRequestForm';
import { supabase } from '../../../src/lib/supabase';

interface FreelancerService {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  delivery_time: number;
}

interface Freelancer {
  id: string;
  display_name: string;
  title: string;
  bio: string;
  description: string;
  skills: string[];
  rating: number;
  total_reviews: number;
  completed_projects: number;
  response_time: string;
  availability: string;
  services?: FreelancerService[];
}

interface Review {
  id: string;
  client_name: string;
  client_company: string | null;
  rating: number;
  review_text: string;
  project_title: string | null;
  is_verified: boolean;
  created_at: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  summary: string;
  thumbnail_url: string | null;
  tags: string[];
  project_url: string | null;
}

interface FreelancerProfileProps {
  freelancer: Freelancer;
  reviews: Review[];
  portfolio: PortfolioItem[];
}

export default function FreelancerProfile({ freelancer, reviews, portfolio }: FreelancerProfileProps) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <Head>
        <title>{freelancer?.display_name || 'Freelancer'} - TalentHub Pro</title>
        <meta name="description" content={freelancer?.description || 'Professional freelancer profile'} />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/freelancers" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Freelancers
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-2xl border-4 border-white/30">
                {freelancer.display_name.charAt(0)}{freelancer.display_name.split(' ')[1]?.charAt(0) || ''}
              </div>
              <div className="ml-6">
                <h1 className="text-4xl font-extrabold mb-2">{freelancer.display_name}</h1>
                <p className="text-xl text-indigo-100 mb-2">{freelancer.title}</p>
                <div className="mt-3 flex items-center flex-wrap gap-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-300 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 font-bold">{freelancer.rating}</span>
                    <span className="ml-1 text-indigo-200">({freelancer.total_reviews} reviews)</span>
                  </div>
                  <span className="text-indigo-200">•</span>
                  <span className="text-indigo-100">{freelancer.completed_projects} projects</span>
                  {freelancer.availability === 'Available' && (
                    <>
                      <span className="text-indigo-200">•</span>
                      <span className="flex items-center text-green-300">
                        <span className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></span>
                        Available Now
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowQuoteForm(true)}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Get Quote
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed text-lg">{freelancer.description}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {freelancer.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-xl font-semibold text-sm border-2 border-indigo-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Services */}
            {freelancer.services && freelancer.services.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Services & Pricing</h2>
                <div className="grid gap-6 md:grid-cols-2">
                  {freelancer.services.map((service) => (
                    <div key={service.id} className="border-2 border-gray-100 rounded-xl p-6 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-indigo-600">${(service.price / 100).toFixed(0)}</div>
                          <div className="text-sm text-gray-500">{service.delivery_time} days delivery</div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full">
                          {service.category}
                        </span>
                        <button 
                          onClick={() => setShowQuoteForm(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Get Quote
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {portfolio.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {portfolio.map((item) => (
                    <div key={item.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-indigo-300 transition-all hover:shadow-lg">
                      {item.thumbnail_url && (
                        <img
                          src={item.thumbnail_url}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.summary}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Client Reviews ({reviews.length})
              </h2>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {review.client_name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-semibold text-gray-900">{review.client_name}</div>
                          {review.client_company && (
                            <div className="text-sm text-gray-500">{review.client_company}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        {review.is_verified && (
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    {review.project_title && (
                      <div className="text-sm font-medium text-indigo-600 mb-2">
                        Project: {review.project_title}
                      </div>
                    )}
                    <p className="text-gray-700 leading-relaxed">{review.review_text}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No reviews yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  Get Custom Quote
                </div>
                <p className="text-sm text-gray-600">Pricing tailored to your project needs</p>
                <p className="text-xs text-gray-500 mt-2">Response time: {freelancer.response_time}</p>
              </div>

              <button
                onClick={() => setShowQuoteForm(true)}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 mb-4"
              >
                Get Quote
              </button>

              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{freelancer.completed_projects} projects completed</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{freelancer.rating} ({freelancer.total_reviews} reviews)</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified freelancer</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                <div className="flex items-center text-green-800 font-semibold mb-2">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Price Beat Guarantee
                </div>
                <p className="text-sm text-green-700">Find cheaper? Get 10% more off!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Request Form Modal */}
      {showQuoteForm && (
        <QuoteRequestForm
          onClose={() => setShowQuoteForm(false)}
          onSuccess={() => {
            setShowQuoteForm(false);
            // You can add a success notification here
          }}
        />
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const { id } = context.params!;

    // Fetch freelancer details with services
    const { data: freelancer, error: freelancerError } = await supabase
      .from('freelancers_public')
      .select(`
        *,
        freelancer_services (
          id,
          title,
          description,
          price,
          category,
          delivery_time
        )
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .single();

    if (freelancerError || !freelancer) {
      return { notFound: true };
    }

    // Fetch reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('freelancer_id', id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    // Fetch portfolio
    const { data: portfolio, error: portfolioError } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('freelancer_id', id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (portfolioError) {
      console.error('Error fetching portfolio:', portfolioError);
    }

    // Transform freelancer data to include services
    const freelancerWithServices = {
      ...freelancer,
      services: freelancer.freelancer_services || []
    };

    return {
      props: {
        freelancer: freelancerWithServices,
        reviews: reviews || [],
        portfolio: portfolio || [],
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

