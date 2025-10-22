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
      return [
        ...testimonials.slice(currentTestimonialIndex),
        ...testimonials.slice(0, endIndex - testimonials.length)
      ];
    }
  };

  const currentTestimonials = getCurrentTestimonials();

  return (
    <div className="min-h-screen bg-bg-base">
      <Header />
      
      {/* Hero Section - Framer Style */}
      <section className="relative overflow-hidden bg-bg-base">
        <div className="absolute inset-0 bg-hero" />
        {/* Slow moving glow */}
        <div 
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-30 animate-spin"
          style={{
            background: 'conic-gradient(from 180deg at 50% 50%, rgba(110,231,249,.18), rgba(96,165,250,.18), rgba(167,139,250,.18), transparent 70%)'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-text-soft">
            <span className="h-2 w-2 rounded-full bg-brand-b animate-pulse" /> New: Supervised Client–Developer Chat
          </div>

          <h1 className="mt-6 text-6xl md:text-7xl font-semibold tracking-tight text-white">
            Where <span className="bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-clip-text text-transparent">Talent</span> Meets Delivery
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-soft">
            A modern marketplace with quotes, escrow, and policy-safe chat—so teams can scope, sign, and ship, faster.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-brand-a via-brand-b to-brand-c shadow-[0_0_24px_rgba(96,165,250,0.35)] hover:scale-[1.02] transition"
            >
              Start free
              <svg className="size-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </Link>
            <Link 
              href="/freelancers"
              className="rounded-xl border border-white/15 bg-white/5 text-white/90 px-6 py-3 hover:bg-white/10 transition"
            >
              Browse freelancers
            </Link>
          </div>
        </div>
      </section>

      {/* Logo Marquee */}
      <section className="bg-bg-base border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-center text-text-mute mb-6">Trusted by teams worldwide</p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex gap-16 animate-marquee">
              {/* Placeholder logos - replace with actual brand logos */}
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Microsoft</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Google</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Apple</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Meta</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Netflix</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Spotify</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Airbnb</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Uber</div>
              {/* Duplicate for seamless loop */}
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Microsoft</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Google</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Apple</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Meta</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Netflix</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Spotify</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Airbnb</div>
              <div className="h-7 opacity-70 text-text-mute font-semibold flex-shrink-0">Uber</div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Proof Section */}
      <section className="bg-bg-base">
        <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white">Scope. Sign. Ship.</h2>
            <p className="mt-3 text-text-soft">Request a quote, auto-generate SOW, fund escrow, and deliver milestones—without leaving the platform.</p>
            <ul className="mt-6 space-y-2 text-text-soft">
              <li>• Supervised chat blocks pricing and contact leaks</li>
              <li>• Admin approval on quotes and SOWs</li>
              <li>• Real-time status and SLA timers</li>
            </ul>
          </div>
          <div className="relative rounded-2xl bg-bg-surface shadow-card border border-white/10 p-2">
            <div className="rounded-xl w-full h-64 bg-gradient-to-br from-brand-a/20 via-brand-b/20 to-brand-c/20 flex items-center justify-center">
              <div className="text-center text-text-mute">
                <div className="text-4xl mb-2">🚀</div>
                <p className="text-sm">Product Demo</p>
                <p className="text-xs mt-1">Interactive preview coming soon</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-bg-surface/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Freelancers', value: `${stats.totalFreelancers}+`, icon: '👥' },
              { label: 'Projects Completed', value: `${stats.totalProjects.toLocaleString()}+`, icon: '✨' },
              { label: 'Happy Clients', value: `${stats.totalReviews.toLocaleString()}+`, icon: '😊' },
              { label: 'Countries', value: `${stats.countries}+`, icon: '🌍' },
            ].map((stat, index) => (
              <div key={index} className="relative text-center p-8 rounded-2xl bg-bg-surface shadow-card border border-white/5">
                <div className="absolute inset-0 rounded-2xl bg-metal-sheen pointer-events-none"></div>
                <div className="absolute -top-px left-6 right-6 h-px bg-specular-line opacity-30"></div>
                <div className="relative w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-brand-a/20 to-brand-c/20 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-clip-text text-transparent mb-3">{stat.value}</div>
                <div className="text-text-base font-semibold text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-bg-base py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-base text-brand-b font-semibold tracking-wide uppercase mb-3">Why Choose Us</h2>
            <p className="mt-2 text-4xl md:text-5xl font-bold text-text-base leading-tight">
              Everything you need to <span className="text-brand-c">succeed</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Verified Freelancers',
                description: 'All freelancers go through our rigorous verification process',
                icon: '✅'
              },
              {
                title: 'Secure Payments',
                description: 'Escrow protection ensures you only pay for completed work',
                icon: '🔒'
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock customer support for all your needs',
                icon: '🛟'
              },
              {
                title: 'Quality Guarantee',
                description: '100% satisfaction guarantee or your money back',
                icon: '💯'
              },
              {
                title: 'Fast Delivery',
                description: 'Get your projects delivered on time, every time',
                icon: '⚡'
              },
              {
                title: 'Global Network',
                description: 'Access to talent from around the world',
                icon: '🌍'
              }
            ].map((feature, index) => (
              <div key={index} className="relative p-6 rounded-2xl bg-bg-surface shadow-card border border-white/5 hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 rounded-2xl bg-metal-sheen pointer-events-none"></div>
                <div className="absolute -top-px left-6 right-6 h-px bg-specular-line opacity-30"></div>
                <div className="relative">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-text-base mb-2">{feature.title}</h3>
                  <p className="text-text-soft">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-bg-surface/60 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-text-base mb-4">What our clients say</h2>
            <p className="text-lg text-text-soft">Don't just take our word for it</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentTestimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="relative p-6 rounded-2xl bg-bg-surface shadow-card border border-white/5">
                <div className="absolute inset-0 rounded-2xl bg-metal-sheen pointer-events-none"></div>
                <div className="absolute -top-px left-6 right-6 h-px bg-specular-line opacity-30"></div>
                <div className="relative">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-lg">⭐</span>
                    ))}
                  </div>
                  <p className="text-text-soft mb-4 italic">"{testimonial.testimonial_text}"</p>
                  <div>
                    <p className="font-semibold text-text-base">{testimonial.client_name}</p>
                    <p className="text-sm text-text-mute">{testimonial.client_role} at {testimonial.client_company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-base py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-text-base mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-text-soft mb-8">
            Join thousands of satisfied clients and freelancers who trust TalentHub Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-brand-a via-brand-b to-brand-c shadow-[0_0_24px_rgba(96,165,250,0.35)] hover:scale-[1.02] transition"
            >
              Start free
              <svg className="size-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </Link>
            <Link 
              href="/freelancers"
              className="rounded-xl border border-white/15 bg-white/5 text-white/90 px-6 py-3 hover:bg-white/10 transition"
            >
              Browse freelancers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch testimonials from Supabase
    const { data: testimonialsData, error: testimonialsError } = await supabase
      .from('testimonials')
      .select('*')
      .limit(6);

    if (testimonialsError) {
      console.error('Error fetching testimonials:', testimonialsError);
    }

    // Stats data - fetch from database
    const stats = {
      totalFreelancers: 0,
      totalProjects: 0,
      totalReviews: 0,
      countries: 0
    };

    return {
      props: {
        testimonials: testimonialsData || [],
        stats
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Return empty data when there's an error - no mock data
    return {
      props: {
        testimonials: [],
        stats: {
          totalFreelancers: 0,
          totalProjects: 0,
          totalReviews: 0,
          countries: 0
        }
      }
    };
  }
};

export default HomePage;
