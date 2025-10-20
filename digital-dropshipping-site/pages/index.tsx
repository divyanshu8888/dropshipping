import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Header from '../src/components/Header';
import QuoteRequestForm from '../src/components/QuoteRequestForm';
import { supabase } from '../src/lib/supabase';

// Chip Component - Superhuman Style
type ChipProps = { 
  label: string; 
  icon?: React.ReactNode; 
  gradient?: 'violet'|'teal'|'blue'; 
  onClick?: () => void;
};

const Chip = ({ label, icon, gradient = 'violet', onClick }: ChipProps) => {
  const gradientMap = {
    violet: 'from-fuchsia-500/25 via-violet-500/20 to-indigo-500/20',
    teal: 'from-emerald-500/25 via-teal-500/20 to-cyan-500/20',
    blue: 'from-sky-500/25 via-blue-500/20 to-indigo-500/20',
  } as const;

  return (
    <button
      onClick={onClick}
      className={[
        'group relative inline-flex items-center gap-2',
        'rounded-2xl px-5 py-3 text-text-base/90 backdrop-blur',
        'bg-gradient-to-r', gradientMap[gradient],
        'border border-white/12 shadow-chip',
        'transition-all hover:-translate-y-0.5 hover:brightness-110',
        'focus:outline-none focus:ring-2 focus:ring-white/40'
      ].join(' ')}
    >
      {/* glossy overlay + specular edge */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-white/3 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      <span className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-white/30 opacity-40" />
      {icon && <span className="text-white/90">{icon}</span>}
      <span className="font-medium">{label}</span>
      {/* tiny arrow on hover */}
      <svg className="ml-1 size-4 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none">
        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
};

// Services Strip Component - Superhuman Style with Marquee
const ServicesStrip = () => {
  const services = [
    { label: 'Web Development', icon: '💻', gradient: 'violet' as const },
    { label: 'Mobile Apps', icon: '📱', gradient: 'teal' as const },
    { label: 'Design', icon: '🎨', gradient: 'blue' as const },
    { label: 'Writing', icon: '✍️', gradient: 'violet' as const },
    { label: 'Marketing', icon: '📢', gradient: 'teal' as const },
    { label: 'Video', icon: '🎬', gradient: 'blue' as const },
    { label: 'Photo', icon: '📸', gradient: 'violet' as const },
    { label: 'Data & Analytics', icon: '📊', gradient: 'teal' as const },
    { label: 'SEO', icon: '🔍', gradient: 'blue' as const },
    { label: 'DevOps', icon: '⚙️', gradient: 'violet' as const },
    { label: 'Testing', icon: '🧪', gradient: 'teal' as const },
    { label: 'Support', icon: '🎧', gradient: 'blue' as const },
    { label: 'Translation', icon: '🌐', gradient: 'violet' as const },
    { label: 'Consulting', icon: '💼', gradient: 'teal' as const },
  ];

  return (
    <section className="relative overflow-hidden bg-superhuman">
      {/* floating stickers (emoji-style) */}
      <div className="pointer-events-none absolute -top-6 left-[8%] translate-y-2 animate-float text-5xl">💡</div>
      <div className="pointer-events-none absolute top-10 right-[10%] -translate-y-2 animate-float text-5xl" style={{animationDelay: '1s'}}>🔍</div>
      <div className="pointer-events-none absolute top-20 left-[15%] translate-y-1 animate-float text-4xl" style={{animationDelay: '2s'}}>✨</div>

      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-center text-3xl md:text-4xl font-black text-white tracking-tight">Expert Skills</h2>
        <p className="mt-4 text-center text-lg md:text-xl text-text-soft font-medium max-w-2xl mx-auto leading-relaxed">Connect with skilled freelancers who bring your projects to life</p>

        {/* Marquee Skills Section - Like "Meet our customers" */}
        <div className="mt-12 mb-8">
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex gap-8 animate-marquee">
              {/* Skills marquee - seamless loop with proper duplication */}
              {services.map((service) => (
                <div key={`${service.label}-1`} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg">{service.icon}</span>
                  <span className="text-text-soft font-medium">{service.label}</span>
                </div>
              ))}
              {services.map((service) => (
                <div key={`${service.label}-2`} className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg">{service.icon}</span>
                  <span className="text-text-soft font-medium">{service.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

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
  const [showQuoteForm, setShowQuoteForm] = useState(false);

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
        {/* Animated metallic gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                80% 120% at 50% 0%,
                rgba(139,92,246,0.25),
                rgba(59,130,246,0.15) 45%,
                rgba(6,182,212,0.12) 70%,
                transparent 80%
              ),
              #0B0C0F
            `,
            animation: 'gradientShift 12s ease-in-out infinite alternate'
          }}
        />

        {/* Single slow glow orb - breathing blur */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-violet-500/15 blur-[140px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-slow-pulse"></div>

        <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-32 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] font-display fade-up" style={{animationDelay: '100ms'}}>
            Where Businesses Meet <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">World-Class Talent</span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg text-white/70 leading-[1.7] font-medium fade-up" style={{animationDelay: '200ms'}}>
            Connect with vetted freelancers. Get quotes. Start projects — all in one platform.
          </p>

            <div className="mt-16 flex flex-col sm:flex-row gap-4 justify-center fade-up" style={{animationDelay: '300ms'}}>
              <button
              onClick={() => setShowQuoteForm(true)}
              className="group inline-flex items-center gap-2 rounded-xl px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_24px_rgba(96,165,250,0.35)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(96,165,250,0.7)] hover:-translate-y-1"
            >
              Request a Quote
              <svg className="size-5 transition group-hover:translate-x-1 group-hover:scale-110" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <Link
              href="/freelancers"
              className="rounded-full px-8 py-4 text-lg font-medium border border-white/10 bg-white/5 text-white/80 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Browse Freelancers
            </Link>
            </div>
            
          {/* Price Beat Guarantee */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-4 py-2 text-sm text-white/80 fade-up" style={{animationDelay: '400ms'}}>
            <span className="text-lg">💰</span>
            <span><span className="font-medium">Found cheaper?</span> We'll beat it by 10%.</span>
            <span className="underline text-cyan-400 ml-1">Learn more</span>
          </div>
        </div>
      </section>

      {/* What we offer - Superhuman Style */}
      <ServicesStrip />

      {/* Product Proof Section */}
      <section className="bg-bg-base">
        <div className="mx-auto max-w-6xl px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-[1.1]">Quote. Connect. Deliver.</h2>
            <p className="mt-4 text-lg md:text-xl text-text-soft font-medium leading-relaxed">Get quotes from skilled freelancers, connect with the perfect match, and watch your project come to life.</p>
            <ul className="mt-8 space-y-4 text-lg text-text-soft font-medium">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-brand-b rounded-full"></span>
                Get instant quotes from verified freelancers
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-brand-c rounded-full"></span>
                Secure escrow protection for your projects
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-brand-a rounded-full"></span>
                Track progress with real-time updates
              </li>
            </ul>
          </div>
          <div className="relative rounded-2xl bg-bg-surface shadow-card border border-white/10 p-2">
            <div className="rounded-xl w-full h-64 bg-gradient-to-br from-brand-a/20 via-brand-b/20 to-brand-c/20 relative overflow-hidden">
              {/* Animated UI Mockup */}
              <div className="absolute inset-4 bg-bg-base/80 rounded-lg border border-white/10">
                {/* Chat Interface Mockup */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-a to-brand-b rounded-full animate-pulse"></div>
                    <div className="flex-1 h-3 bg-white/20 rounded animate-pulse delay-200"></div>
                  </div>
                  <div className="flex items-center space-x-3 ml-8">
                    <div className="flex-1 h-3 bg-white/15 rounded animate-pulse delay-400"></div>
                    <div className="w-6 h-6 bg-gradient-to-br from-brand-b to-brand-c rounded animate-bounce"></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-c to-brand-a rounded-full animate-pulse delay-600"></div>
                    <div className="flex-1 h-3 bg-white/20 rounded animate-pulse delay-800"></div>
                  </div>
                  
                  {/* Quote Request Mockup */}
                  <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-2 w-16 bg-white/20 rounded animate-pulse delay-1000"></div>
                      <div className="h-2 w-12 bg-brand-b/40 rounded animate-pulse delay-1200"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-white/15 rounded animate-pulse delay-1400"></div>
                      <div className="h-2 w-3/4 bg-white/15 rounded animate-pulse delay-1600"></div>
                    </div>
                  </div>
              </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-2 right-2 w-4 h-4 bg-brand-a/40 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-2 left-2 w-3 h-3 bg-brand-c/40 rounded-full animate-pulse delay-500"></div>
              <div className="absolute top-1/2 right-1 w-2 h-2 bg-brand-b/40 rounded-full animate-bounce delay-700"></div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* Dynamic Pages Showcase - Framer Style */}
      <section className="bg-bg-base py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-lg text-brand-b font-bold tracking-wide uppercase mb-4">Dynamic Pages</h2>
            <p className="mt-2 text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
              Create, collaborate,<br/>
              and <span className="bg-gradient-to-r from-brand-a to-brand-c bg-clip-text text-transparent">go live</span>
            </p>
            <p className="mt-4 text-lg md:text-xl text-text-soft max-w-3xl mx-auto font-medium leading-relaxed">
              Generate site layouts and advanced components in seconds with AI, so you can skip the blank canvas and start designing with confidence.
            </p>
          </div>


          {/* Dynamic Pages Interface - Framer Style */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Left Panel - AI Features */}
            <div className="lg:col-span-1 bg-bg-surface rounded-2xl border border-white/10 p-6 flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-3">AI</h3>
                <p className="text-text-mute text-sm leading-relaxed">
                  Generate site layouts and advanced components in seconds with AI, so you can skip the blank canvas and start designing with confidence.
                </p>
                <Link href="/freelancers" className="inline-block mt-4 text-brand-b hover:text-brand-a transition-colors text-sm font-medium">
                  Learn more →
              </Link>
            </div>
            
              <div className="space-y-4 flex-1">
                <Link href="/freelancers" className="block text-text-mute hover:text-white transition-colors text-sm font-medium">
                  Design
                </Link>
                <Link href="/products" className="block text-text-mute hover:text-white transition-colors text-sm font-medium">
                  CMS
                </Link>
                <Link href="/admin" className="block text-text-mute hover:text-white transition-colors text-sm font-medium">
                  Collaborate
                </Link>
              </div>
            </div>

            {/* Middle Panel - AI Chat Interface */}
            <div className="lg:col-span-1 bg-bg-surface rounded-2xl border border-white/10 p-6 flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-6">
                <Link href="/freelancers" className="text-text-mute hover:text-white transition-colors text-sm">
                  ← Wireframer
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-brand-a/40 rounded-full animate-pulse"></div>
                  <span className="text-text-mute text-sm">Live</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 flex-1">
                {/* User Message */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-text-base text-sm">
                    Design three unique landing pages for a modern design agency.
                  </p>
                </div>

                {/* AI Response */}
                <div className="bg-gradient-to-r from-brand-a/10 to-brand-b/10 rounded-xl p-4 border border-brand-b/20">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-brand-a to-brand-b rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">T</span>
                    </div>
                    <span className="text-text-base text-sm font-medium">TalentHub Pro</span>
                  </div>
                  <p className="text-text-base text-sm">
                    I created three unique landing pages in dark mode for your modern design startup: a main landing page, a creative-focused page, and a studio showcase page.
                  </p>
                </div>
              </div>

              {/* Chat Input */}
              <div className="mt-4 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-4 bg-white/20 rounded animate-pulse"></div>
                  <div className="w-6 h-6 bg-brand-b/40 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Right Panel - Live Preview */}
            <div className="lg:col-span-1 bg-bg-surface rounded-2xl border border-white/10 overflow-hidden">
              {/* Preview Header */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <div className="px-3 py-1 bg-brand-b/20 text-brand-b rounded-lg text-xs font-medium">
                      Landing Page 1
                    </div>
                    <div className="px-3 py-1 bg-white/5 text-text-mute rounded-lg text-xs font-medium">
                      Landing Page 2
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-brand-a/40 rounded animate-pulse"></div>
                    <span className="text-text-mute text-xs">Live Preview</span>
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 h-full bg-gradient-to-br from-bg-base to-bg-surface relative">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold text-white">Nuance®</h4>
                    <div className="flex space-x-4">
                      <span className="text-text-mute text-sm">Features</span>
                      <span className="text-text-mute text-sm">Pricing</span>
                    </div>
                  </div>

                  {/* Hero Section */}
                  <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white leading-tight">
                      Modern studio design.
                    </h1>
                    <p className="text-text-mute text-lg">
                      Distinct visuals. Lasting impact.
                    </p>
                  </div>

                  {/* Feature Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="w-8 h-8 bg-brand-a/20 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-brand-a text-lg">🎨</span>
                      </div>
                      <div className="h-3 w-16 bg-white/20 rounded animate-pulse mb-2"></div>
                      <div className="h-2 w-full bg-white/15 rounded animate-pulse"></div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="w-8 h-8 bg-brand-b/20 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-brand-b text-lg">⚡</span>
                      </div>
                      <div className="h-3 w-14 bg-white/20 rounded animate-pulse mb-2"></div>
                      <div className="h-2 w-full bg-white/15 rounded animate-pulse"></div>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="pt-4">
                    <div className="flex space-x-3">
                      <div className="flex-1 h-10 bg-gradient-to-r from-brand-a to-brand-b rounded-lg animate-pulse"></div>
                      <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-bg-surface/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Freelancers', value: `${stats.totalFreelancers}+`, icon: '👥', delay: 'delay-0' },
              { label: 'Projects Completed', value: `${stats.totalProjects.toLocaleString()}+`, icon: '✨', delay: 'delay-200' },
              { label: 'Happy Clients', value: `${stats.totalReviews.toLocaleString()}+`, icon: '😊', delay: 'delay-400' },
              { label: 'Countries', value: `${stats.countries}+`, icon: '🌍', delay: 'delay-600' },
            ].map((stat, index) => (
              <div key={index} className={`relative text-center p-8 rounded-2xl bg-bg-surface shadow-card border border-white/5 hover:scale-105 transition-all duration-300 ${stat.delay}`}>
                <div className="absolute inset-0 rounded-2xl bg-metal-sheen pointer-events-none"></div>
                <div className="absolute -top-px left-6 right-6 h-px bg-specular-line opacity-30"></div>
                
                {/* Animated background elements */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-brand-a/30 rounded-full animate-pulse"></div>
                <div className="absolute bottom-2 left-2 w-1 h-1 bg-brand-c/40 rounded-full animate-bounce"></div>
                
                <div className="relative w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-brand-a/20 to-brand-c/20 rounded-2xl flex items-center justify-center hover:rotate-12 transition-transform duration-300">
                  <span className="text-4xl animate-bounce">{stat.icon}</span>
                </div>
                <div className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-brand-a via-brand-b to-brand-c bg-clip-text text-transparent mb-4 animate-pulse">{stat.value}</div>
                <div className="text-text-base font-bold text-xl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-bg-base py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-lg text-brand-b font-bold tracking-wide uppercase mb-4">Why Choose Us</h2>
            <p className="mt-2 text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] tracking-tight">
              Everything you need to<br/>
              <span className="bg-gradient-to-r from-brand-a to-brand-c bg-clip-text text-transparent">succeed</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Verified Freelancers',
                description: 'All freelancers go through our rigorous verification process',
                icon: '✅',
                delay: 'delay-0',
                color: 'from-green-500 to-emerald-600'
              },
              {
                title: 'Secure Payments',
                description: 'Escrow protection ensures you only pay for completed work',
                icon: '🔒',
                delay: 'delay-200',
                color: 'from-blue-500 to-cyan-600'
              },
              {
                title: '24/7 Support',
                description: 'Round-the-clock customer support for all your needs',
                icon: '🛟',
                delay: 'delay-400',
                color: 'from-purple-500 to-violet-600'
              },
              {
                title: 'Quality Guarantee',
                description: '100% satisfaction guarantee or your money back',
                icon: '💯',
                delay: 'delay-600',
                color: 'from-orange-500 to-red-600'
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
                  <div className="text-5xl mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-lg text-text-soft font-medium leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-bg-surface/60 backdrop-blur-sm py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.9] mb-6">What our clients say</h2>
            <p className="text-xl md:text-2xl text-text-soft font-medium">Don't just take our word for it</p>
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
      <section className="bg-bg-base py-24">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.9] mb-8">
            Ready to get started?
          </h2>
          <p className="text-xl md:text-2xl text-text-soft mb-12 font-medium leading-relaxed max-w-4xl mx-auto">
            Join thousands of satisfied clients and freelancers who trust TalentHub Pro
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-brand-a via-brand-b to-brand-c shadow-[0_0_32px_rgba(96,165,250,0.4)] hover:scale-[1.05] transition-all duration-300"
            >
              Start free
              <svg className="size-5 transition group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </Link>
            <Link
              href="/freelancers"
              className="rounded-2xl border-2 border-white/20 bg-white/10 text-white px-8 py-4 text-lg font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 backdrop-blur-sm"
            >
              Browse freelancers
            </Link>
          </div>
        </div>
      </section>

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

    // Fetch real stats from database via API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    let stats = {
      totalFreelancers: 0,
      totalProjects: 0,
      totalReviews: 0,
      countries: 0
    };

    try {
      const statsResponse = await fetch(`${baseUrl}/api/homepage-stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        stats = statsData;
      }
    } catch (apiError) {
      console.error('Error fetching stats from API:', apiError);
      // Use fallback stats if API fails
      stats = {
        totalFreelancers: 0,
        totalProjects: 0,
        totalReviews: 0,
        countries: 0
      };
    }

    return {
      props: {
        testimonials: testimonialsData || [],
        stats
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Return mock data as fallback
    const mockTestimonials = [
      {
        id: '1',
        client_name: 'Sarah Johnson',
        client_role: 'CEO',
        client_company: 'TechStart Inc',
        testimonial_text: 'TalentHub Pro has revolutionized how we find and work with freelancers. The quality is exceptional!',
        rating: 5
      },
      {
        id: '2',
        client_name: 'Michael Chen',
        client_role: 'Marketing Director',
        client_company: 'GrowthCorp',
        testimonial_text: 'The escrow system gives us peace of mind. We always get exactly what we pay for.',
        rating: 5
      },
      {
        id: '3',
        client_name: 'Emily Rodriguez',
        client_role: 'Product Manager',
        client_company: 'InnovateLab',
        testimonial_text: 'Fast, reliable, and professional. This platform has become essential to our workflow.',
        rating: 5
      }
    ];

    const stats = {
      totalFreelancers: 0,
      totalProjects: 0,
      totalReviews: 0,
      countries: 0
    };

    return {
      props: {
        testimonials: mockTestimonials,
        stats
      }
    };
  }
};

export default HomePage;
