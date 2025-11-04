import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../../src/components/Header';
import QuoteRequestForm from '../../../src/components/QuoteRequestForm';
import { query, queryOne } from '../../../src/lib/mysql';

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
  user_id?: number;
  display_name: string;
  headline?: string;
  title: string;
  bio?: string;
  description: string;
  country?: string;
  skills: string[];
  avatar_url?: string;
  hourly_rate_cents?: number;
  rating: number;
  total_reviews: number;
  completed_projects: number;
  response_time?: string;
  availability: string;
  verification_state?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
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
  description?: string | null;
  thumbnail_url: string | null;
  gallery_urls?: string[] | null;
  tags: string[];
  project_url: string | null;
  created_at?: string;
}

interface FreelancerProfileProps {
  freelancer: Freelancer;
  reviews: Review[];
  portfolio: PortfolioItem[];
}

export default function FreelancerProfile({ freelancer, reviews, portfolio }: FreelancerProfileProps) {
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'portfolio' | 'reviews'>('about');
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioItem | null>(null);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<{ url: string; index: number; allUrls: string[] } | null>(null);

  return (
    <div className="min-h-screen bg-[#0B0D10]">
      <Head>
        <title>{freelancer?.display_name || 'Freelancer'} - Uniti</title>
        <meta name="description" content={freelancer?.description || 'Professional freelancer profile'} />
      </Head>

      <Header />

      {/* Hero Section - Professional Dark Theme */}
      <section className="relative bg-gradient-to-br from-[#0B0D10] via-[#0c0f14] to-[#0a0d12] border-b border-white/5 overflow-hidden">
        {/* Background gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-violet-500/5 to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Link href="/freelancers" className="inline-flex items-center text-white/60 hover:text-white/90 mb-8 transition-colors group">
            <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Freelancers</span>
          </Link>
          
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-sky-500/20 via-violet-500/20 to-transparent border border-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-2xl">
                  {freelancer.avatar_url ? (
                    <img src={freelancer.avatar_url} alt={freelancer.display_name} className="w-full h-full rounded-xl object-cover" />
                  ) : (
                    <span>{freelancer.display_name.charAt(0)}{freelancer.display_name.split(' ')[1]?.charAt(0) || ''}</span>
                  )}
                </div>
                {freelancer.verification_state === 'verified' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full border-2 border-[#0B0D10] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{freelancer.display_name}</h1>
                  {freelancer.headline && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-gradient-to-r from-sky-500/20 to-violet-500/20 text-sky-300 border border-sky-500/30">
                      {freelancer.headline}
                    </span>
                  )}
                </div>
                <p className="text-lg text-white/70 mb-3 font-medium">{freelancer.title}</p>
                
                {/* Stats */}
                <div className="flex items-center flex-wrap gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(freelancer.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20 fill-white/20'}`}
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-bold text-white">{freelancer.rating}</span>
                    <span className="text-white/50">({freelancer.total_reviews} reviews)</span>
                  </div>
                  <span className="text-white/30">•</span>
                  <span className="text-white/70">{freelancer.completed_projects} projects completed</span>
                  {freelancer.country && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="text-white/70">{freelancer.country}</span>
                    </>
                  )}
                  {freelancer.availability === 'available' && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="flex items-center text-emerald-400">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                        Available Now
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={() => setShowQuoteForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#00C6FF] via-[#5F57FF] to-[#7D2AE8] text-white rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(125,42,232,0.5)] transition-all shadow-lg hover:scale-[1.02] whitespace-nowrap"
            >
              Request Quote
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="mb-6 border-b border-white/10">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'about'
                      ? 'text-white border-b-2 border-[#00C6FF]'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'portfolio'
                      ? 'text-white border-b-2 border-[#00C6FF]'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Portfolio {portfolio.length > 0 && `(${portfolio.length})`}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === 'reviews'
                      ? 'text-white border-b-2 border-[#00C6FF]'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {/* About Tab */}
              {activeTab === 'about' && (
                <>
                  <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <h2 className="text-xl font-bold text-white mb-3 tracking-tight">About</h2>
                    <p className="text-white/70 leading-relaxed text-sm">{freelancer.description || freelancer.bio || 'No description available.'}</p>
                  </div>

                  <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Skills & Expertise</h2>
                    <div className="flex flex-wrap gap-2">
                      {freelancer.skills && freelancer.skills.length > 0 ? (
                        freelancer.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 rounded-lg font-medium text-xs transition-all hover:border-sky-500/30"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-white/50 text-xs">No skills listed</p>
                      )}
                    </div>
                  </div>

                  {freelancer.services && freelancer.services.length > 0 && (
                    <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Services & Pricing</h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {freelancer.services.map((service) => (
                          <div key={service.id} className="border border-white/10 rounded-xl p-5 bg-white/5 hover:bg-white/10 hover:border-sky-500/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-bold text-white">{service.title}</h3>
                              <div className="text-right">
                                <div className="text-xl font-bold bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] bg-clip-text text-transparent">${(service.price / 100).toFixed(0)}</div>
                                <div className="text-xs text-white/50">{service.delivery_time} days delivery</div>
                              </div>
                            </div>
                            <p className="text-white/70 mb-3 text-xs">{service.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-1 bg-white/10 text-white/90 text-[10px] font-medium rounded-full border border-white/10">
                                {service.category}
                              </span>
                              <button 
                                onClick={() => setShowQuoteForm(true)}
                                className="px-3 py-1.5 bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] text-white rounded-lg font-medium text-xs hover:shadow-[0_0_15px_rgba(125,42,232,0.4)] transition-all"
                              >
                                Get Quote
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Portfolio Tab */}
              {activeTab === 'portfolio' && (
                <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Portfolio</h2>
                  {portfolio.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {portfolio.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedPortfolio(item)}
                          className="text-left border border-white/10 rounded-xl overflow-hidden bg-white/5 hover:bg-white/10 hover:border-sky-500/30 transition-all group cursor-pointer"
                        >
                          {item.thumbnail_url && (
                            <div className="relative overflow-hidden">
                              <img
                                src={item.thumbnail_url}
                                alt={item.title}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-white/70 text-xs mb-3 line-clamp-2">{item.summary}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.tags && item.tags.slice(0, 3).map((tag, index) => (
                                <span key={index} className="px-2 py-0.5 bg-white/10 text-white/80 text-[10px] rounded-full border border-white/10">
                                  {tag}
                                </span>
                              ))}
                              {item.tags && item.tags.length > 3 && (
                                <span className="px-2 py-0.5 bg-white/10 text-white/80 text-[10px] rounded-full border border-white/10">
                                  +{item.tags.length - 3}
                                </span>
                              )}
                            </div>
                            <div className="mt-3 text-xs text-sky-400 font-medium">View Details →</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-center py-12 text-sm">No portfolio items yet</p>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <h2 className="text-xl font-bold text-white mb-4 tracking-tight">
                    Client Reviews ({reviews.length})
                  </h2>
                  <div className="space-y-5">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-white/10 pb-5 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-sky-500/30 to-violet-500/30 rounded-full flex items-center justify-center text-white font-bold text-sm border border-white/10">
                              {review.client_name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <div className="font-semibold text-white text-sm">{review.client_name}</div>
                              {review.client_company && (
                                <div className="text-xs text-white/50">{review.client_company}</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20 fill-white/20'}`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            {review.is_verified && (
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-medium rounded-full border border-emerald-500/30">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                        {review.project_title && (
                          <div className="text-xs font-medium text-sky-400 mb-1.5">
                            Project: {review.project_title}
                          </div>
                        )}
                        <p className="text-white/80 leading-relaxed mb-1.5 text-sm">{review.review_text}</p>
                        <div className="text-xs text-white/40">
                          {new Date(review.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    ))}
                    {reviews.length === 0 && (
                      <p className="text-white/50 text-center py-6 text-sm">No reviews yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sticky top-24">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <div className="text-center mb-5 p-4 bg-gradient-to-br from-sky-500/10 via-violet-500/10 to-transparent rounded-xl border border-white/10">
                <div className="text-xl font-bold text-white mb-1.5">
                  Get Custom Quote
                </div>
                <p className="text-xs text-white/70">Pricing tailored to your project needs</p>
                {freelancer.response_time && (
                  <p className="text-[10px] text-white/50 mt-1.5">Response time: {freelancer.response_time}</p>
                )}
              </div>

              <button
                onClick={() => setShowQuoteForm(true)}
                className="w-full py-3 bg-gradient-to-r from-[#00C6FF] via-[#5F57FF] to-[#7D2AE8] text-white rounded-xl font-bold text-sm hover:shadow-[0_0_20px_rgba(125,42,232,0.5)] transition-all shadow-lg hover:scale-[1.02] mb-5"
              >
                Request Quote
              </button>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <div className="flex items-center text-white/80">
                  <svg className="w-4 h-4 mr-2.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs">{freelancer.completed_projects} projects completed</span>
                </div>
                <div className="flex items-center text-white/80">
                  <svg className="w-4 h-4 mr-2.5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-xs">{freelancer.rating} ({freelancer.total_reviews} reviews)</span>
                </div>
                {freelancer.verification_state === 'verified' && (
                  <div className="flex items-center text-white/80">
                    <svg className="w-4 h-4 mr-2.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">Verified freelancer</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Detail Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPortfolio(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-[#0c0f14] rounded-2xl border border-white/10 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setSelectedPortfolio(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Portfolio Content */}
            <div className="p-6 md:p-8">
              {/* Thumbnail */}
              {selectedPortfolio.thumbnail_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedPortfolio.thumbnail_url}
                    alt={selectedPortfolio.title}
                    className="w-full h-64 md:h-96 object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{selectedPortfolio.title}</h2>

              {/* Summary */}
              <p className="text-lg text-white/80 mb-4">{selectedPortfolio.summary}</p>

              {/* Description */}
              {selectedPortfolio.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Project Details</h3>
                  <p className="text-white/70 leading-relaxed text-sm">{selectedPortfolio.description}</p>
                </div>
              )}

              {/* Gallery */}
              {selectedPortfolio.gallery_urls && selectedPortfolio.gallery_urls.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedPortfolio.gallery_urls.map((url, index) => (
                      <div
                        key={index}
                        className="relative rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => setSelectedGalleryImage({
                          url,
                          index,
                          allUrls: selectedPortfolio.gallery_urls || []
                        })}
                      >
                        <img
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedPortfolio.tags && selectedPortfolio.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPortfolio.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 rounded-lg font-medium text-xs transition-all"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Project URL */}
              {selectedPortfolio.project_url && (
                <div className="flex gap-3">
                  <a
                    href={selectedPortfolio.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] text-white rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(125,42,232,0.5)] transition-all"
                  >
                    View Project →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Gallery Modal */}
      {selectedGalleryImage && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center" onClick={() => setSelectedGalleryImage(null)}>
          {/* Close Button */}
          <button
            onClick={() => setSelectedGalleryImage(null)}
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {selectedGalleryImage.index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGalleryImage({
                  url: selectedGalleryImage.allUrls[selectedGalleryImage.index - 1],
                  index: selectedGalleryImage.index - 1,
                  allUrls: selectedGalleryImage.allUrls
                });
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {selectedGalleryImage.index < selectedGalleryImage.allUrls.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGalleryImage({
                  url: selectedGalleryImage.allUrls[selectedGalleryImage.index + 1],
                  index: selectedGalleryImage.index + 1,
                  allUrls: selectedGalleryImage.allUrls
                });
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium z-10">
            {selectedGalleryImage.index + 1} / {selectedGalleryImage.allUrls.length}
          </div>

          {/* Fullscreen Image */}
          <div className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedGalleryImage.url}
              alt={`Gallery ${selectedGalleryImage.index + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Keyboard Navigation */}
          <div
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' && selectedGalleryImage.index > 0) {
                setSelectedGalleryImage({
                  url: selectedGalleryImage.allUrls[selectedGalleryImage.index - 1],
                  index: selectedGalleryImage.index - 1,
                  allUrls: selectedGalleryImage.allUrls
                });
              } else if (e.key === 'ArrowRight' && selectedGalleryImage.index < selectedGalleryImage.allUrls.length - 1) {
                setSelectedGalleryImage({
                  url: selectedGalleryImage.allUrls[selectedGalleryImage.index + 1],
                  index: selectedGalleryImage.index + 1,
                  allUrls: selectedGalleryImage.allUrls
                });
              } else if (e.key === 'Escape') {
                setSelectedGalleryImage(null);
              }
            }}
            className="absolute inset-0"
          />
        </div>
      )}

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
    const freelancerId = parseInt(id as string, 10);

    if (isNaN(freelancerId)) {
      return { notFound: true };
    }

           // Fetch freelancer details from MySQL
           // Note: hourly_rate_cents is excluded for confidentiality
           const freelancer = await queryOne(`
             SELECT
               id,
               user_id,
               display_name,
               headline,
               title,
               bio,
               description,
               country,
               skills,
               avatar_url,
               rating,
               total_reviews,
               completed_projects,
               response_time,
               availability,
               verification_state,
               status,
               created_at,
               updated_at
             FROM freelancers
             WHERE id = ? AND status = 'approved'
           `, [freelancerId]);

    if (!freelancer) {
      return { notFound: true };
    }

    // Parse JSON skills field
    let parsedSkills: string[] = [];
    try {
      parsedSkills = typeof freelancer.skills === 'string' 
        ? JSON.parse(freelancer.skills) 
        : freelancer.skills || [];
    } catch (e) {
      parsedSkills = [];
    }

    // Fetch reviews (if reviews table exists)
    let reviews: any[] = [];
    try {
      reviews = await query(`
        SELECT 
          id,
          client_name,
          client_company,
          rating,
          review_text as review_text,
          project_title,
          is_verified,
          created_at
        FROM reviews
        WHERE freelancer_id = ?
        ORDER BY created_at DESC
      `, [freelancerId]);
    } catch (error: any) {
      // Reviews table might not exist yet
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error fetching reviews:', error);
      }
    }

    // Fetch portfolio (if portfolios table exists)
    let portfolio: any[] = [];
    try {
      portfolio = await query(`
        SELECT 
          id,
          title,
          summary,
          description,
          thumbnail_url,
          gallery_urls,
          tags,
          project_url,
          created_at
        FROM portfolios
        WHERE freelancer_id = ? AND is_public = 'TRUE'
        ORDER BY created_at DESC
      `, [freelancerId]);
    } catch (error: any) {
      // Portfolios table might not exist yet
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        console.error('Error fetching portfolio:', error);
      }
    }

    // Transform portfolio tags and gallery_urls if they're JSON
    const portfolioWithParsedTags = portfolio.map((item: any) => {
      let tags: string[] = [];
      let gallery_urls: string[] = [];
      try {
        tags = typeof item.tags === 'string' 
          ? JSON.parse(item.tags) 
          : item.tags || [];
      } catch (e) {
        tags = [];
      }
      try {
        gallery_urls = typeof item.gallery_urls === 'string' 
          ? JSON.parse(item.gallery_urls) 
          : item.gallery_urls || [];
      } catch (e) {
        gallery_urls = [];
      }
      return {
        ...item,
        id: String(item.id),
        tags,
        gallery_urls
      };
    });

    // Helper function to serialize Date objects
    const serializeDate = (date: any): string => {
      if (!date) return '';
      if (date instanceof Date) {
        return date.toISOString();
      }
      if (typeof date === 'string') {
        return date;
      }
      return String(date || '');
    };

    // Transform freelancer data - serialize all Date objects
    const freelancerWithServices = {
      ...freelancer,
      id: String(freelancer.id),
      skills: parsedSkills,
      rating: Number(freelancer.rating) || 0,
      total_reviews: Number(freelancer.total_reviews) || 0,
      completed_projects: Number(freelancer.completed_projects) || 0,
      created_at: serializeDate(freelancer.created_at),
      updated_at: serializeDate(freelancer.updated_at),
      services: [] // Services can be added later if needed
    };

    return {
      props: {
        freelancer: freelancerWithServices,
        reviews: reviews.map((r: any) => ({
          ...r,
          id: String(r.id),
          rating: Number(r.rating) || 0,
          is_verified: r.is_verified === 'TRUE' || r.is_verified === true,
          created_at: serializeDate(r.created_at)
        })),
        portfolio: portfolioWithParsedTags.map((item: any) => ({
          ...item,
          created_at: serializeDate(item.created_at)
        })),
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return { notFound: true };
  }
};

