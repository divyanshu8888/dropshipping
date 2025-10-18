import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../src/components/Header'
import QuoteRequestModal from '../src/components/QuoteRequestModal'
import { supabase } from '../src/lib/supabase'
import { getFreelancerAvatar, getServiceIcon, getCategoryColor } from '../src/utils/imageUtils'

interface FreelancerService {
  id: string;
  title: string;
  price: number;
  category: string;
  delivery_time: number;
}

interface Freelancer {
  id: string;
  display_name: string;
  title: string;
  description: string;
  country: string;
  skills: string[];
  rating: number;
  total_reviews: number;
  completed_projects: number;
  response_time: string;
  availability: string;
  services?: FreelancerService[];
}

interface FreelancersPageProps {
  freelancers: Freelancer[];
}

export default function FreelancersPage({ freelancers }: FreelancersPageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  const categories = ['all', ...Array.from(new Set(freelancers.map(f => f.title.split(' ')[0]).filter(Boolean)))]

  const filteredFreelancers = freelancers.filter(freelancer => {
    const matchesSearch = freelancer.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         freelancer.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || freelancer.title.toLowerCase().includes(selectedCategory.toLowerCase())
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <Head>
        <title>Find Freelancers - TalentHub Pro</title>
        <meta name="description" content="Browse verified freelancers and hire top talent for your projects" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
              Find the Perfect Freelancer
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Browse {freelancers.length}+ verified professionals ready to bring your projects to life
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, skill, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl"
                />
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="bg-white shadow-sm sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="price-low">Lowest Price</option>
                <option value="price-high">Highest Price</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>
        </section>

        {/* Freelancers Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-indigo-600">{filteredFreelancers.length}</span> freelancers
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              All freelancers verified
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFreelancers.map((freelancer) => (
              <div
                key={freelancer.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group transform hover:-translate-y-2"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {freelancer.display_name.charAt(0)}{freelancer.display_name.split(' ')[1]?.charAt(0) || ''}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-bold text-gray-900">{freelancer.display_name}</h3>
                        <p className="text-sm text-gray-600">{freelancer.title}</p>
                        <p className="text-xs text-gray-500 mt-1">📍 {freelancer.country}</p>
                      </div>
                    </div>
                    {freelancer.availability === 'Available' && (
                      <span className="flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                        Available
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {freelancer.description}
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {freelancer.skills.slice(0, 3).map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {freelancer.skills.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        +{freelancer.skills.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Services */}
                  {freelancer.services && freelancer.services.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Services:</h4>
                      <div className="space-y-1">
                        {freelancer.services.slice(0, 2).map((service) => (
                          <div key={service.id} className="flex justify-between items-center text-xs">
                            <span className="text-gray-600 truncate">{service.title}</span>
                            <span className="text-indigo-600 font-medium">${(service.price / 100).toFixed(0)}</span>
                          </div>
                        ))}
                        {freelancer.services.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{freelancer.services.length - 2} more services
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-t border-b border-gray-100">
                    <div>
                      <div className="flex items-center text-yellow-400 mb-1">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-gray-900 font-semibold">{freelancer.rating}</span>
                        <span className="ml-1 text-gray-500 text-xs">({freelancer.total_reviews})</span>
                      </div>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold">{freelancer.completed_projects}</p>
                      <p className="text-xs text-gray-500">Projects Done</p>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      💰 <span className="font-semibold">Custom pricing</span> based on project
                    </div>
                    <Link
                      href={`/freelancer/${freelancer.id}`}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Get Quote
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredFreelancers.length === 0 && (
            <div className="text-center py-16">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No freelancers found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Are you a freelancer?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join TalentHub Pro and connect with thousands of clients worldwide
            </p>
            <Link
              href="/apply"
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Apply as Freelancer
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch all approved freelancers from database (NO PRICING!)
    const { data: freelancers, error } = await supabase
      .from('freelancers')
      .select(`
        id, 
        display_name, 
        title, 
        description, 
        country, 
        skills, 
        rating, 
        total_reviews, 
        completed_projects, 
        response_time, 
        availability,
        freelancer_services (
          id,
          title,
          price,
          category,
          delivery_time
        )
      `)
      .eq('status', 'approved')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching freelancers:', error);
      throw error;
    }

    // Transform the data to include services
    const freelancersWithServices = freelancers?.map(freelancer => ({
      ...freelancer,
      services: freelancer.freelancer_services || []
    })) || [];

    return {
      props: {
        freelancers: freelancersWithServices,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        freelancers: [],
      },
    };
  }
}