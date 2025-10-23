import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
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

interface Freelancer {
  id: string;
  display_name: string;
  title: string;
  avatar_url?: string;
  rating: number;
  skills: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface HomePageProps {
  testimonials: Testimonial[];
  stats: Stats;
  recentFreelancers: Freelancer[];
  featuredProjects: Project[];
}

// Popular Services Section Component
const PopularServicesSection = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const SERVICE_CATEGORIES = [
    { title: "Website Development", subtitle: "", grad: "from-yellow-100 to-lime-100", image: "website-design.png" },
    { title: "E-commerce Platform", subtitle: "", grad: "from-teal-100 to-emerald-200", image: "ai-development.png" },
    { title: "Mobile App Development", subtitle: "", grad: "from-rose-100 to-orange-100", image: "logo-design.png" },
    { title: "UI/UX Design", subtitle: "", grad: "from-pink-100 to-fuchsia-100", image: "website-design.png" },
    { title: "Logo Design", subtitle: "", grad: "from-amber-100 to-orange-200", image: "voice-over.png" },
    { title: "SEO Optimization", subtitle: "", grad: "from-rose-100 to-red-100", image: "ugc-videos.png" },
    { title: "Social Media Marketing", subtitle: "", grad: "from-blue-100 to-indigo-200", image: "seo-optimization.png" },
    { title: "Content Writing", subtitle: "", grad: "from-purple-100 to-violet-200", image: "video-editing.png" },
    { title: "Data Analysis", subtitle: "", grad: "from-emerald-100 to-teal-200", image: "photography.png" },
    { title: "DevOps Services", subtitle: "", grad: "from-orange-100 to-amber-200", image: "data-analytics.png" },
    { title: "API Development", subtitle: "", grad: "from-cyan-100 to-blue-200", image: "devops.png" },
    { title: "AI/ML Development", subtitle: "", grad: "from-indigo-100 to-purple-200", image: "translation.png" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const getProductId = (serviceTitle: string) => {
    const product = products.find(p => 
      p.name.toLowerCase().includes(serviceTitle.toLowerCase()) ||
      serviceTitle.toLowerCase().includes(p.name.toLowerCase())
    );
    return product ? product.id : null;
  };

  const updateEdgeState = () => {
    const el = scroller.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 4);
  };

  useEffect(() => {
    updateEdgeState();
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => updateEdgeState();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => updateEdgeState();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByCards = (dir: "left" | "right") => {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector<HTMLDivElement>("[data-card]");
    const step = (card?.offsetWidth ?? 320) + 24;
    el.scrollBy({ left: dir === "left" ? -step * 2 : step * 2, behavior: "smooth" });
  };

  return (
    <div className="relative bg-[#0B0C0F] py-24">
      {/* Ambient glow */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -z-10 top-24 mx-auto h-64 w-[34rem] bg-gradient-to-b from-sky-500/10 via-violet-500/10 to-transparent blur-3xl"
      />
      
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Popular</span>{" "}
            <span className="text-white/95">Services</span>
          </h2>
          <p className="mt-3 text-sm text-white/60">Pre-vetted freelancers across every domain—on demand.</p>
        </div>

        {/* Carousel wrapper */}
        <div className="relative">
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#0B0C0F] to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#0B0C0F] to-transparent z-20" />

          {/* Arrows */}
          <button
            onClick={() => scrollByCards("left")}
            aria-label="Previous"
            disabled={atStart}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-neutral-900 shadow-lg h-10 w-10 grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByCards("right")}
            aria-label="Next"
            disabled={atEnd}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-neutral-900 shadow-lg h-10 w-10 grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            ›
          </button>

          {/* Scroller */}
          <div
            ref={scroller}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SERVICE_CATEGORIES.map(({ title, subtitle, grad, image }) => {
              const productId = getProductId(title);
              const href = productId ? `/products/${productId}` : '/products';
              
              return (
              <Link
                key={title}
                href={href}
                data-card
                className="snap-start shrink-0 w-[240px] md:w-[280px] rounded-2xl border border-white/10 bg-neutral-900/50 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 block"
              >
                {/* Top visual */}
                <div className={`rounded-t-2xl bg-gradient-to-br ${grad} h-32 md:h-36 grid place-items-center`}>
                  <img src={`/images/logo/${image}`} alt={title} className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-sm" />
                </div>

                {/* Info slab */}
                <div className="rounded-b-2xl bg-black/60 p-4">
                  <h3 className="text-white font-semibold leading-tight text-sm">{title}</h3>
                  {subtitle && <p className="mt-1 text-xs text-white/55">{subtitle}</p>}
                  <div className="mt-3 inline-flex items-center gap-2 text-sky-300/90 hover:text-sky-200 text-xs">
                    <span>Explore</span>
                    <span>↗</span>
                  </div>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Coding Showcase Component with Animated Typing
const CodingShowcase = () => {
  const [tab, setTab] = useState<'code' | 'api' | 'terminal'>('code');
  const [typed, setTyped] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const iRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const snippets = {
    code: `// Unitea: Connect with verified talent
import { createClient } from "@unitea/client";

const client = createClient({
  apiKey: process.env.UNITEA_API_KEY,
  environment: "production"
});

type ProjectRequest = {
  title: string;
  description: string;
  category: "Web Dev" | "Design" | "Marketing";
  timeline: string;
  budget?: number;
};

export async function createProject(payload: ProjectRequest) {
  const response = await client.projects.create(payload);
  return response.data;
}

// Example: Create a new project
await createProject({
  title: "Website Redesign",
  description: "Modern responsive website with CMS",
  category: "Web Dev",
  timeline: "4-6 weeks",
  budget: 5000
});`,
    api: `POST /api/projects
Content-Type: application/json

{
  "title": "Website Redesign",
  "description": "Modern responsive website with CMS",
  "category": "Web Dev",
  "timeline": "4-6 weeks",
  "budget": 5000
}

Response:
{
  "id": "proj_123",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "estimated_delivery": "2024-02-15"
}`,
    terminal: `$ unitea init project website-redesign
✔ Project initialized
✔ Connected to Unitea

$ unitea create --category "Web Dev" --timeline "4-6 weeks"
✔ Project created: #PROJ-123
✔ 3 verified professionals matched

$ unitea select --id "pro_456"
✔ Professional selected: Expert Developer
✔ Project started with milestone tracking

$ unitea status
📊 Project Status: In Progress
💰 Budget: $5,000 allocated
📅 Timeline: 4-6 weeks
👨‍💻 Professional: Expert Developer (verified)`
  };

  const startTyping = (text: string) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTyped('');
    setIsTyping(true);
    iRef.current = 0;

    intervalRef.current = setInterval(() => {
      if (iRef.current < text.length) {
        setTyped(text.slice(0, iRef.current + 1));
        iRef.current++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 15);
  };

  useEffect(() => {
    startTyping(snippets[tab]);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tab]);

  const highlightSyntax = (line: string) => {
    return line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\b(import|from|const|let|type|async|await|return|if|throw|new|export|function)\b/g, '<span class="text-cyan-300">$1</span>')
      .replace(/\b(string|number|boolean|any|undefined|void)\b/g, '<span class="text-violet-300">$1</span>')
      .replace(/(".*?")/g, '<span class="text-emerald-300">$1</span>')
      .replace(/('.*?')/g, '<span class="text-emerald-300">$1</span>')
      .replace(/(\/\/.*$)/g, '<span class="text-white/40">$1</span>')
      .replace(/(POST|GET|PUT|DELETE)\s+\/api/g, '<span class="text-yellow-300">$1</span> <span class="text-blue-300">$2</span>')
      .replace(/(\$\s+)/g, '<span class="text-green-300">$1</span>')
      .replace(/(✔|📊|💰|📅|👨‍💻)/g, '<span class="text-emerald-400">$1</span>');
  };

  return (
    <div className="relative bg-[#0B0C0F] py-20 overflow-hidden">
      {/* slow conic halo */}
      <div
        className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-20 -z-10"
        style={{
          background: "conic-gradient(from 180deg,#67e8f9,#60a5fa,#a78bfa,transparent 70%)",
          animation: "spin 36s linear infinite"
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Left: editor */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_30px_80px_rgba(0,0,0,.35)]">
            {/* window controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="flex gap-2">
                <span className="size-3 rounded-full bg-red-500/70" />
                <span className="size-3 rounded-full bg-yellow-500/70" />
                <span className="size-3 rounded-full bg-green-500/70" />
              </div>
              <div className="text-xs text-white/50">uniteahq/app/quote.ts</div>
              <div />
            </div>

            {/* tabs */}
            <div className="flex gap-2 px-3 py-2 border-b border-white/10">
              <button
                onClick={() => setTab('code')}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === 'code'
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>💻</span> Code
              </button>
              <button
                onClick={() => setTab('api')}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === 'api'
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>☁️</span> API
              </button>
              <button
                onClick={() => setTab('terminal')}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
                  tab === 'terminal'
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>⚡</span> Terminal
              </button>
            </div>

            {/* code area */}
            <pre className="relative p-4 md:p-6 text-[13px] leading-relaxed overflow-auto text-white/90 min-h-[360px] font-mono">
              <code className="[&_*]:font-mono">
                {typed.split('\n').map((line, idx) => (
                  <div key={idx} className="tabular-nums">
                    <span className="select-none pr-4 text-white/30">{idx + 1}</span>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: highlightSyntax(line)
                      }}
                    />
                    {isTyping && idx === typed.split('\n').length - 1 && (
                      <span className="animate-pulse">|</span>
                    )}
                  </div>
                ))}
              </code>
            </pre>
          </div>

          {/* Right: result / value prop */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_30px_80px_rgba(0,0,0,.35)]">
              <h3 className="text-xl font-semibold text-white">Hire. Build. Launch.</h3>
              <p className="mt-2 text-white/70">
                Unitea connects you to verified professionals through our secure platform.
                Create projects, manage workflows, and ensure quality delivery with built-in protection.
              </p>

              <ul className="mt-4 space-y-2 text-white/85">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Verified professionals with portfolio reviews and skill assessments
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Secure milestone system protects your payments until project completion
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span>
                  Real-time project tracking and communication tools
                </li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-400/20 text-emerald-300/90 bg-emerald-400/10 px-3 py-1 text-xs">Secure</span>
                <span className="rounded-full border border-cyan-400/20 text-cyan-300/90 bg-cyan-400/10 px-3 py-1 text-xs">Fast</span>
                <span className="rounded-full border border-violet-400/20 text-violet-300/90 bg-violet-400/10 px-3 py-1 text-xs">Reliable</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_30px_80px_rgba(0,0,0,.35)]">
              <h4 className="text-sm font-semibold text-white/80">Live Demo</h4>
              <div className="mt-3 rounded-xl border border-white/10 bg-[#0F1216] p-4 text-white/80">
                <div className="text-sm">
                  <div><span className="text-white/50">Project:</span> Website Redesign</div>
                  <div><span className="text-white/50">Category:</span> Web Development</div>
                  <div><span className="text-white/50">Status:</span> 3 professionals matched</div>
                  <div><span className="text-white/50">Budget:</span> $5,000 allocated</div>
                </div>
                <div className="mt-3">
                  <a href="/products" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 transition">
                    View Projects →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA row under the band */}
        <div className="mt-8 flex justify-center">
          <a href="/products" className="rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_20px_rgba(96,165,250,.35)] hover:scale-[1.02] transition">
            Start Your Project →
          </a>
        </div>
      </div>
    </div>
  );
};

// Animated Word Swap Component with Visible Effects
const AnimatedWordSwap = () => {
  const words = ['World-Class Talent', 'Design Experts', 'Dev Teams', 'SEO Pros', 'Data & AI'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start blinking effect
      setIsBlinking(true);
      
      // Change word after a short delay
      setTimeout(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsBlinking(false);
      }, 400);
    }, 2500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-block min-h-[1.2em]">
      {words.map((word, index) => (
        <span
          key={word}
          className={`absolute inset-0 transition-all duration-600 ease-in-out ${
            index === currentWordIndex 
              ? `opacity-100 transform translate-y-0 scale-100 ${isBlinking ? 'animate-text-blink' : ''}` 
              : 'opacity-0 transform translate-y-6 scale-90'
          }`}
          style={{
            color: index === currentWordIndex ? '#06b6d4' : '#3b82f6',
            textShadow: index === currentWordIndex 
              ? '0 0 10px #06b6d4, 0 0 20px #06b6d4, 0 0 30px #06b6d4, 0 0 40px #06b6d4' 
              : 'none',
            filter: index === currentWordIndex 
              ? 'drop-shadow(0 0 8px #06b6d4) drop-shadow(0 0 16px #3b82f6) drop-shadow(0 0 24px #8b5cf6)' 
              : 'none',
            fontWeight: index === currentWordIndex ? '700' : '600'
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
};

const HomePage = ({ testimonials, stats, recentFreelancers, featuredProjects }: HomePageProps) => {
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
        {/* Ambient lighting behind hero */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.1),transparent_70%)] animate-pulse"></div>
        
        {/* Background depth - faint radial gradient for focus */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.08),transparent_70%)]"></div>
        
        {/* Breathing glow orbs */}
        <div className="pointer-events-none absolute -top-48 left-[12%] w-[28rem] h-[28rem] rounded-full bg-cyan-500/12 blur-[120px] animate-[pulse_12s_ease-in-out_infinite]"></div>
        <div className="pointer-events-none absolute -bottom-48 right-[10%] w-[26rem] h-[26rem] rounded-full bg-violet-500/12 blur-[110px] animate-[pulse_14s_ease-in-out_infinite]"></div>
        
        {/* Floating glow blob */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-violet-500/20 blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
        
        {/* Slow conic halo */}
        <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(60%_70%_at_50%_20%,black,transparent)]">
          <div 
            className="absolute left-1/2 top-[-30%] -translate-x-1/2 w-[1100px] h-[1100px] rounded-full blur-3xl opacity-20"
          style={{
              background: 'conic-gradient(from 180deg,#67e8f9,#60a5fa,#a78bfa,transparent 70%)',
              animation: 'spin 36s linear infinite'
            }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pt-28 pb-24 text-center">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white fade-up font-display" style={{animationDelay: '100ms'}}>
            Your Vision, <span className="gradient-text">Built by Experts</span>
          </h1>
          <p className="mt-4 text-lg text-white/70 fade-up font-body" style={{animationDelay: '200ms'}}>
            Hire. Build. Launch. Get it done right.
          </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center fade-up" style={{animationDelay: '300ms'}}>
              <button
              onClick={() => setShowQuoteForm(true)}
              className="group inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 shadow-[0_0_24px_rgba(96,165,250,0.35)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(96,165,250,0.5)] relative overflow-hidden focus:ring-2 focus:ring-white/50 focus:outline-none cta"
            >
              <span className="relative z-10">Request a Quote</span>
              <svg className="size-4 transition-transform group-hover:translate-x-0.5 relative z-10" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {/* Shimmer effect */}
              <div className="absolute inset-0 -top-1 -left-1 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <Link
              href="/freelancers"
              className="rounded-xl px-6 py-3 border border-white/12 bg-white/5 text-white/85 hover:bg-white/10 transition-all duration-200 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
            >
              Browse Freelancers
            </Link>
            </div>
          
          {/* Micro-trust line for credibility */}
          <p className="mt-8 text-sm text-white/50 fade-up" style={{animationDelay: '400ms'}}>Trusted by 200+ teams and creators worldwide</p>
            
          {/* Price Beat Guarantee */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-gradient-to-r from-blue-500/10 to-violet-500/10 px-4 py-2 text-sm text-white/80 fade-up" style={{animationDelay: '400ms'}}>
            <span className="text-lg">💰</span>
            <span><span className="font-medium">Found cheaper?</span> We'll beat it by 10%.</span>
            <a href="#" className="underline text-cyan-400 ml-1 hover:text-cyan-300 transition-colors duration-200 focus:ring-2 focus:ring-white/50 focus:outline-none rounded px-1 py-1">Learn more</a>
          </div>
        </div>
      </section>

      {/* Trusted + Skills Section */}
      <section className="relative">
        {/* --- Trusted by --- */}
        <div className="relative border-t border-white/10 bg-[#0B0C0F]">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-center text-xs tracking-widest text-white/50 font-semibold">
              TRUSTED BY TEAMS WORLDWIDE
            </p>

            {/* marquee */}
            <div className="mt-6 relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex gap-12 whitespace-nowrap animate-[marquee_35s_linear_infinite] hover:[animation-play-state:paused]">
                {["ACME","TECH","INNOVATE","GROWTH","STARTUP","CORP","DIGITAL","AGENCY","ACME","TECH","INNOVATE","GROWTH","STARTUP","CORP","DIGITAL","AGENCY"].map((name, i) => (
                  <span
                    key={i}
                    className="text-white/35 hover:text-white/80 transition text-lg md:text-2xl font-semibold tracking-wide"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* divider glow */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* --- Coding Showcase --- */}
        <CodingShowcase />

        {/* --- Popular Services Carousel --- */}
        <PopularServicesSection />
      </section>

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
    // Fetch data directly from Supabase database
    const [
      testimonialsResult,
      freelancersResult,
      projectsResult,
      reviewsResult,
      countriesResult
    ] = await Promise.all([
      // Fetch testimonials
      supabase
      .from('testimonials')
      .select('*')
        .limit(6),
      
      // Count active freelancers
      supabase
        .from('freelancers_public')
        .select('*', { count: 'exact', head: true }),
      
      // Count completed projects
      supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed'),
      
      // Count total reviews/testimonials
      supabase
        .from('testimonials')
        .select('*', { count: 'exact', head: true }),
      
      // Get unique countries from freelancers
      supabase
        .from('freelancers_public')
        .select('country')
        .not('country', 'is', null)
    ]);

    // Handle testimonials
    if (testimonialsResult.error) {
      console.error('Error fetching testimonials:', testimonialsResult.error);
    }
    const testimonials = testimonialsResult.data || [];

    // Calculate stats from database results
    const freelancerCount = freelancersResult.count || 0;
    const projectCount = projectsResult.count || 0;
    const reviewCount = reviewsResult.count || 0;
    const uniqueCountries = new Set(countriesResult.data?.map(f => f.country)).size || 0;

    const stats = {
      totalFreelancers: freelancerCount,
      totalProjects: projectCount,
      totalReviews: reviewCount,
      countries: uniqueCountries
    };

    // Fetch additional data for homepage
    const [
      recentFreelancersResult,
      featuredProjectsResult
    ] = await Promise.all([
      // Get recent freelancers for showcase
      supabase
        .from('freelancers_public')
        .select('id, display_name, title, avatar_url, rating, skills')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(6),
      
      // Get featured projects
      supabase
        .from('projects')
        .select('id, title, description, status, created_at')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(3)
    ]);

    return {
      props: {
        testimonials,
        stats,
        recentFreelancers: recentFreelancersResult.data || [],
        featuredProjects: featuredProjectsResult.data || []
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
        },
        recentFreelancers: [],
        featuredProjects: []
      }
    };
  }
};

export default HomePage;
