import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '../src/components/Header';
import { supabase } from '../src/lib/supabase';

interface Testimonial {
  id: string;
  client_name: string;
  client_role: string;
  client_company: string;
  testimonial_text: string;
  rating: number;
}

interface Stats {
  totalFreelancers: number;
  totalProjects: number;
  totalReviews: number;
  countries: number;
}

interface HomePageProps {
  testimonials: Testimonial[];
  stats: Stats;
}

const HomePage = ({ testimonials, stats }: HomePageProps) => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 3) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prevIndex) => 
        (prevIndex + 1) % (testimonials.length - 2)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Get current testimonials to display (3 at a time)
  const getCurrentTestimonials = () => {
    if (testimonials.length <= 3) return testimonials;
    
    const endIndex = currentTestimonialIndex + 3;
    if (endIndex <= testimonials.length) {
      return testimonials.slice(currentTestimonialIndex, endIndex);
    } else {
      // Handle wrap-around
      return [
        ...testimonials.slice(currentTestimonialIndex),
        ...testimonials.slice(0, endIndex - testimonials.length)
      ];
    }
  };

  const currentTestimonials = getCurrentTestimonials();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-teal-400/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="text-center animate-fade-in">
            <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-full border border-emerald-200">
              <span className="text-emerald-700 font-semibold text-sm">🚀 #1 Freelance Marketplace</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600">
                TalentHub Pro
              </span>
              <br />
              <span className="text-gray-800">Where Talent Meets Opportunity</span>
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
              Connect with world-class freelancers and transform your business with expert services at unbeatable prices.
            </p>
            
            {/* Price Beat Guarantee Badge - Dynamic & Moving */}
            <div className="mt-8 inline-flex items-center bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white px-8 py-4 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300 animate-pulse hover:animate-none relative overflow-hidden animate-glow">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 opacity-0 hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
              
              <div className="w-12 h-12 mr-4 bg-white/20 rounded-full flex items-center justify-center relative z-10 animate-float">
                <svg className="w-6 h-6 animate-wiggle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="text-left relative z-10">
                <div className="font-bold text-xl mb-1 animate-pulse">Price Beat Guarantee</div>
                <div className="text-sm font-semibold animate-bounce">Find cheaper? Get 10% more off! 💰</div>
                <div className="text-xs mt-1 opacity-90 animate-pulse">100% Money Back Guarantee</div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-ping animation-delay-200"></div>
              <div className="absolute top-1/2 -left-2 w-2 h-2 bg-pink-400 rounded-full animate-ping animation-delay-400"></div>
              
              {/* Moving sparkle effects */}
              <div className="absolute top-2 right-4 text-yellow-300 animate-ping animation-delay-200">✨</div>
              <div className="absolute bottom-2 left-6 text-green-300 animate-ping animation-delay-400">⭐</div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/freelancers"
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 rounded-xl hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2 text-lg">👥</span>
                <span className="relative z-10">Browse Freelancers</span>
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-semibold text-emerald-600 bg-white border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="mr-2 text-lg">🚀</span>
                Start as Freelancer
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              ✨ Join {stats.totalReviews.toLocaleString()}+ satisfied clients worldwide
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - DYNAMIC */}
      <section className="py-20 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Freelancers', value: `${stats.totalFreelancers}+`, icon: '👥', color: 'from-emerald-500 to-cyan-500' },
              { label: 'Projects Completed', value: `${stats.totalProjects.toLocaleString()}+`, icon: '✨', color: 'from-cyan-500 to-blue-500' },
              { label: 'Happy Clients', value: `${stats.totalReviews.toLocaleString()}+`, icon: '😊', color: 'from-blue-500 to-indigo-500' },
              { label: 'Countries', value: `${stats.countries}+`, icon: '🌍', color: 'from-indigo-500 to-purple-500' },
            ].map((stat, index) => (
              <div key={index} className="text-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-100 to-cyan-100 rounded-2xl flex items-center justify-center">
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <div className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}>{stat.value}</div>
                <div className="text-gray-700 font-semibold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase mb-3">Why Choose Us</h2>
            <p className="mt-2 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Everything you need to <span className="text-indigo-600">succeed</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Verified Freelancers',
                description: 'Every freelancer is vetted with verified portfolios and skills.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                ),
                gradient: 'from-blue-500 to-cyan-500',
              },
              {
                title: 'Price Beat Guarantee',
                description: 'Found cheaper? We\'ll beat it by 10% or your money back!',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'from-green-500 to-emerald-500',
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock customer support for any questions or issues.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                gradient: 'from-yellow-500 to-orange-500',
              },
              {
                title: 'Secure Payments',
                description: 'Escrow protection and secure payment processing for peace of mind.',
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ),
                gradient: 'from-purple-500 to-pink-500',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - DYNAMIC FROM DATABASE */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Loved by <span className="text-indigo-600">thousands</span>
            </h2>
            <p className="text-xl text-gray-600">See what our clients say about us</p>
          </div>
          {/* Testimonials Carousel */}
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-1000 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonialIndex * (100 / 3)}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-1/3 flex-shrink-0 px-4">
                    <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="flex mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"{testimonial.testimonial_text}"</p>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {testimonial.client_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{testimonial.client_name}</div>
                          <div className="text-sm text-gray-500">{testimonial.client_role}{testimonial.client_company && `, ${testimonial.client_company}`}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            {testimonials.length > 3 && (
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: testimonials.length - 2 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentTestimonialIndex(i);
                      setIsAutoPlaying(false);
                      setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
                    }}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i === currentTestimonialIndex 
                        ? 'bg-indigo-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Play/Pause Button */}
            {testimonials.length > 3 && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  {isAutoPlaying ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>Play</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="mt-4 text-xl text-indigo-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of successful businesses and freelancers. Start your journey today with TalentHub Pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/freelancers"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              Browse Freelancers
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/apply"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-indigo-800 rounded-xl hover:bg-indigo-900 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl border-2 border-indigo-400"
            >
              Apply as Freelancer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">TalentHub Pro</h3>
              <p className="text-gray-400">Connecting talent with opportunity worldwide.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/freelancers" className="text-gray-400 hover:text-white transition-colors">Browse Freelancers</Link></li>
                <li><Link href="/apply" className="text-gray-400 hover:text-white transition-colors">Become a Freelancer</Link></li>
                <li><Link href="/admin" className="text-gray-400 hover:text-white transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Price Beat Guarantee</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 TalentHub Pro. All rights reserved. | Built with ❤️ for freelancers and businesses worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch testimonials
    const { data: testimonials, error: testimonialsError } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_featured', true)
      .order('display_order')
      .limit(6);

    if (testimonialsError) throw testimonialsError;

    // Fetch stats
    const { data: freelancersCount } = await supabase
      .from('freelancers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { data: projectsData } = await supabase
      .from('freelancers')
      .select('completed_projects')
      .eq('status', 'approved');

    const { data: reviewsData } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true });

    const { data: countriesData } = await supabase
      .from('freelancers')
      .select('country')
      .eq('status', 'approved');

    const totalProjects = projectsData?.reduce((sum, f) => sum + (f.completed_projects || 0), 0) || 0;
    const uniqueCountries = new Set(countriesData?.map(f => f.country) || []).size;

    const stats = {
      totalFreelancers: freelancersCount || 0,
      totalProjects,
      totalReviews: reviewsData || 0,
      countries: uniqueCountries,
    };

    return {
      props: {
        testimonials: testimonials || [],
        stats,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        testimonials: [],
        stats: {
          totalFreelancers: 0,
          totalProjects: 0,
          totalReviews: 0,
          countries: 0,
        },
      },
    };
  }
};

export default HomePage;