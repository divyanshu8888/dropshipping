import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Header from '../src/components/Header';
import QuoteRequestForm from '../src/components/QuoteRequestForm';
import { query } from '../src/lib/mysql';


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
  averageRating?: string;
  projectsLast90Days?: number;
}

interface HomePageProps {
  testimonials: Testimonial[];
  stats: Stats;
}

// Popular Services Section Component
const PopularServicesSection = () => {
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  const SERVICE_CATEGORIES = [
    { title: "Website Development", subtitle: "", grad: "from-yellow-100 to-lime-100", image: "website-design.png" },
    { title: "AI/ML Development", subtitle: "", grad: "from-teal-100 to-emerald-200", image: "ai-development.png" },
    { title: "Logo Design", subtitle: "", grad: "from-rose-100 to-orange-100", image: "logo-design.png" },
    { title: "UX/UI Design", subtitle: "", grad: "from-pink-100 to-fuchsia-100", image: "ui-ux-design.png" },
    { title: "Voice Over Services", subtitle: "", grad: "from-amber-100 to-orange-200", image: "voice-over.png" },
    { title: "UGC Videos", subtitle: "", grad: "from-rose-100 to-red-100", image: "ugc-videos.png" },
    { title: "Social Media Marketing", subtitle: "", grad: "from-blue-100 to-indigo-200", image: "social-media.png" },
    { title: "SEO Optimization", subtitle: "", grad: "from-purple-100 to-violet-200", image: "seo-optimization.png" },
    { title: "Data Analytics", subtitle: "", grad: "from-emerald-100 to-teal-200", image: "data-analytics.png" },
    { title: "DevOps Services", subtitle: "", grad: "from-orange-100 to-amber-200", image: "devops.png" },
    { title: "Brand Identity", subtitle: "", grad: "from-cyan-100 to-blue-200", image: "logo.png" },
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
    // Create a mapping of service titles to product names for better matching
    const serviceToProductMap: { [key: string]: string } = {
      'Website Development': 'Website Development',
      'AI/ML Development': 'AI/ML Development',
      'Logo Design': 'Logo Design',
      'UX/UI Design': 'UI/UX Design',
      'Voice Over Services': 'Content Writing', // Fallback to closest match
      'UGC Videos': 'Content Writing', // Fallback to closest match
      'Social Media Marketing': 'Social Media Marketing',
      'SEO Optimization': 'SEO Optimization',
      'Data Analytics': 'Data Analysis',
      'DevOps Services': 'DevOps Services',
      'Brand Identity': 'Logo Design', // Fallback to closest match
    };

    const mappedProductName = serviceToProductMap[serviceTitle];
    if (mappedProductName) {
      const product = products.find(p => p.name === mappedProductName);
      return product ? product.id : null;
    }

    // Fallback to fuzzy matching
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
    const step = (card?.offsetWidth ?? 200) + 12;
    el.scrollBy({ left: dir === "left" ? -step * 2 : step * 2, behavior: "smooth" });
  };

  return (
    <div className="relative bg-[#0B0C0F] pt-16 pb-12">
      {/* Ambient glow */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -z-10 top-24 mx-auto h-64 w-[34rem] bg-gradient-to-b from-sky-500/10 via-violet-500/10 to-transparent blur-3xl"
      />
      
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Heading */}
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Popular</span>{" "}
            <span className="text-white/95">Services</span>
          </h2>
          <p className="mt-1.5 text-[10px] text-white/60">Pre-vetted freelancers across every domain—on demand.</p>
        </div>

        {/* Carousel wrapper */}
        <div className="relative -mx-6 px-6">
          {/* Edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-[#0B0C0F] to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#0B0C0F] to-transparent z-20" />

          {/* Arrows */}
          <button
            onClick={() => scrollByCards("left")}
            aria-label="Previous"
            disabled={atStart}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-neutral-900 shadow-lg h-8 w-8 grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 hover:scale-110 text-sm"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByCards("right")}
            aria-label="Next"
            disabled={atEnd}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-neutral-900 shadow-lg h-8 w-8 grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 hover:scale-110 text-sm"
          >
            ›
          </button>

          {/* Scroller */}
          <div
            ref={scroller}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {SERVICE_CATEGORIES.map(({ title, subtitle, grad, image }) => {
              const productId = getProductId(title);
              // Create category-specific URLs for better navigation
              const categoryMap: { [key: string]: string } = {
                'Website Development': '/products?category=Web Development',
                'AI/ML Development': '/products?category=AI & ML',
                'Logo Design': '/products?category=Design',
                'UX/UI Design': '/products?category=Design',
                'Voice Over Services': '/products?category=Content Writing',
                'UGC Videos': '/products?category=Content Writing',
                'Social Media Marketing': '/products?category=Digital Marketing',
                'SEO Optimization': '/products?category=Digital Marketing',
                'Data Analytics': '/products?category=Data & Analytics',
                'DevOps Services': '/products?category=DevOps & Cloud',
                'Brand Identity': '/products?category=Design',
              };
              
              const href = productId ? `/products/${productId}` : (categoryMap[title] || '/products');
              
              return (
              <Link
                key={title}
                href={href}
                data-card
                className="snap-start shrink-0 w-[160px] md:w-[200px] rounded-2xl border border-white/10 bg-neutral-900/50 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 block"
              >
                {/* Top visual */}
                <div className={`rounded-t-2xl bg-gradient-to-br ${grad} h-24 md:h-28 grid place-items-center`}>
                  <img src={`/images/logo/${image}`} alt={title} loading="lazy" className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-sm" />
                </div>

                {/* Info slab */}
                <div className="rounded-b-2xl bg-black/60 p-2.5">
                  <h3 className="text-white font-semibold leading-tight text-[10px]">{title}</h3>
                  {subtitle && <p className="mt-1 text-[9px] text-white/55">{subtitle}</p>}
                  <div className="mt-1.5 inline-flex items-center gap-1 text-sky-300/90 hover:text-sky-200 text-[9px]">
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
  const intervalRef = useRef<number | null>(null);

  const snippets = {
    code: `// Uniti: Connect with verified talent
import { createClient } from "@uniti/client";

const client = createClient({
  apiKey: process.env.UNITI_API_KEY,
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
    terminal: `$ uniti init project website-redesign
✔ Project initialized
✔ Connected to Uniti

$ uniti create --category "Web Dev" --timeline "4-6 weeks"
✔ Project created: #PROJ-123
✔ 3 verified professionals matched

$ uniti select --id "pro_456"
✔ Professional selected: Expert Developer
✔ Project started with milestone tracking

$ uniti status
📊 Project Status: In Progress
💰 Budget: $5,000 allocated
📅 Timeline: 4-6 weeks
👨‍💻 Professional: Expert Developer (verified)`
  };

  const startTyping = (text: string) => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    setTyped('');
    setIsTyping(true);
    iRef.current = 0;

    intervalRef.current = window.setInterval(() => {
      if (iRef.current < text.length) {
        setTyped(text.slice(0, iRef.current + 1));
        iRef.current++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      }
    }, 15);
  };

  useEffect(() => {
    startTyping(snippets[tab]);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
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
      .replace(/(POST|GET|PUT|DELETE)\s+(\/[^\s]+)/g, '<span class="text-yellow-300">$1</span> <span class="text-blue-300">$2</span>')
      .replace(/(\$\s+)/g, '<span class="text-green-300">$1</span>')
      .replace(/(✔|📊|💰|📅|👨‍💻)/g, '<span class="text-emerald-400">$1</span>');
  };

  return (
    <div className="relative bg-[#0B0C0F] py-16 overflow-hidden">
      {/* slow conic halo */}
      <div
        className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-20 -z-10"
        style={{
          background: "conic-gradient(from 180deg,#67e8f9,#60a5fa,#a78bfa,transparent 70%)",
          animation: "spin 36s linear infinite"
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Left: editor */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_30px_80px_rgba(0,0,0,.35)]">
            {/* window controls */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/70" />
                <span className="size-2.5 rounded-full bg-yellow-500/70" />
                <span className="size-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="text-[10px] text-white/50">unitihq/app/quote.ts</div>
              <div />
            </div>

            {/* tabs */}
            <div className="flex gap-2 px-3 py-1.5 border-b border-white/10">
              <button
                onClick={() => setTab('code')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition ${
                  tab === 'code'
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xs">💻</span> Code
              </button>
              <button
                onClick={() => setTab('api')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition ${
                  tab === 'api'
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xs">☁️</span> API
              </button>
              <button
                onClick={() => setTab('terminal')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition ${
                  tab === 'terminal'
                    ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-xs">⚡</span> Terminal
              </button>
            </div>

            {/* code area */}
            <pre className="relative p-3 md:p-4 text-[11px] leading-relaxed overflow-auto text-white/90 min-h-[280px] font-mono">
              <code className="[&_*]:font-mono">
                {typed.split('\n').map((line, idx) => (
                  <div key={idx} className="tabular-nums">
                    <span className="select-none pr-3 text-white/30 text-[10px]">{idx + 1}</span>
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
            <div className="rounded-2xl ring-1 ring-white/5 bg-gradient-to-b from-[#0c0f14] to-[#0a0d12] p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              <div className="space-y-2.5 md:space-y-3">
                <h2 className="text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.01em] text-white">Uniti — where ideas unite.</h2>
                <div className="h-[1.5px] w-12 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full mt-1.5 mb-2"></div>
                <p className="text-xs text-gray-400 mb-4">
                  <span className="text-cyan-300 font-medium">Unit</span> (from Unity) + 
                  <span className="text-violet-300 font-medium"> i</span> (from Idea) = 
                  <span className="text-white font-semibold"> Uniti</span>
              </p>
              <p className="max-w-[58ch] text-sm text-gray-200 leading-6">
                  Uniti connects clients with <span className="font-medium text-gray-100">verified professionals</span> in a secure, data-driven workspace. 
                  From web and design to marketing and AI, you get work delivered right the first time—backed by milestone protection, 
                  portfolio verification, and real-time collaboration.
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-1.5 text-sm text-gray-200">
                  <li>Top freelancers across web, design, and AI</li>
                  <li>Simple milestones, clear billing</li>
                  <li>One workspace for updates</li>
              </ul>
                <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-400/25 bg-emerald-900/25 text-emerald-300">Secure</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] border border-sky-400/25 bg-sky-900/25 text-sky-300">Fast</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] border border-violet-400/25 bg-violet-900/25 text-violet-300">Reliable</span>
              </div>
            </div>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-violet-500/10 border border-gray-800/60 shadow-lg">
              <h3 className="text-base font-semibold text-gray-200 mb-2.5">Live Demo</h3>
              <div className="space-y-1 text-gray-200 text-xs leading-relaxed">
                <p><strong className="text-gray-100">Project:</strong> Website Redesign</p>
                <p><strong className="text-gray-100">Category:</strong> Web Development</p>
                <p><strong className="text-gray-100">Status:</strong> 3 experts matched</p>
                <p><strong className="text-gray-100">Budget:</strong> <span className="text-green-400">$5,000</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ testimonials, stats }: HomePageProps) => {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [scrollY, setScrollY] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState<{type:'',text:''}|{type:'success'|'error',text:string}>({type:'',text:''});

  useEffect(() => {
    // Fetch products and freelancers for search
    const fetchSearchData = async () => {
      try {
        const [productsRes, freelancersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/freelancers')
        ]);
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData);
        }
        if (freelancersRes.ok) {
          const freelancersData = await freelancersRes.json();
          setFreelancers(freelancersData);
        }
      } catch (error) {
        console.error('Error fetching search data:', error);
      }
    };
    fetchSearchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const suggestions = [
        ...products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(p => ({ id: p.id, name: p.name, type: 'product', url: `/products/${p.id}` })),
        ...freelancers.filter(f => f.display_name?.toLowerCase().includes(query.toLowerCase())).slice(0, 3).map(f => ({ id: f.id, name: f.display_name, type: 'freelancer', url: `/freelancers/profile/${f.id}` }))
      ];
      setSearchSuggestions(suggestions.slice(0, 5));
    } else {
      setSearchSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSuggestions.length > 0) {
      window.location.href = searchSuggestions[0].url;
    } else if (searchQuery) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };


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

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletterEmail);
    if (!ok) {
      setNewsletterMsg({type:'error',text:'Please enter a valid email address.'});
      return;
    }

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewsletterMsg({
          type: 'success',
          text: data.alreadySubscribed ? 'You are already subscribed!' : 'Thanks! You are subscribed.'
        });
        setNewsletterEmail('');
        setTimeout(() => setNewsletterMsg({type:'',text:''}), 5000);
      } else {
        setNewsletterMsg({type:'error',text: data.message || 'Failed to subscribe. Please try again.'});
        setTimeout(() => setNewsletterMsg({type:'',text:''}), 5000);
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterMsg({type:'error',text:'Something went wrong. Please try again later.'});
      setTimeout(() => setNewsletterMsg({type:'',text:''}), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Uniti',
              url: 'https://uniti.example.com',
              logo: '/images/logo/logo2.1.png'
            })
          }}
        />
      </Head>
      <Header />
      
      {/* Hero Section - Framer Style */}
      <section className="relative overflow-hidden bg-bg-base">
        {/* Breathing glow orbs */}
        <div className="pointer-events-none absolute -top-48 left-[12%] w-[28rem] h-[28rem] rounded-full bg-cyan-500/12 blur-[120px] animate-[pulse_12s_ease-in-out_infinite]"></div>
        <div className="pointer-events-none absolute -bottom-48 right-[10%] w-[26rem] h-[26rem] rounded-full bg-violet-500/12 blur-[110px] animate-[pulse_14s_ease-in-out_infinite]"></div>
        
        {/* Floating glow blob */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-violet-500/20 blur-3xl animate-[pulse_8s_ease-in-out_infinite]"></div>
        
        {/* Full-screen video banner */}
        <div className="relative w-full min-h-[75vh] overflow-hidden text-center">
            <video
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 hero-video-bg-refined"
              style={{ opacity: Math.max(0.4, 0.7 - scrollY / 1000) }}
              src="/Video/meeting.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_45%,rgba(0,0,0,.15),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/20 to-transparent" />
            <div className="absolute inset-0 hero-overlay-gradient-refined" />

            {/* Local contrast overlay only behind text */}
            <div className="pointer-events-none absolute left-1/2 top-[12vh] -translate-x-1/2 w-[900px] max-w-[90vw] h-[20vh] rounded-[32px] bg-gradient-to-b from-black/55 via-black/40 to-transparent blur-[18px]"></div>

            <div className="relative z-10 mx-auto max-w-[900px] px-6 pt-[12vh] text-center">
              {/* HEADLINE */}
              <h1
                className="mx-auto font-extrabold text-white 
                           text-[clamp(32px,5.5vw,48px)] leading-[1.15] whitespace-nowrap
                           animate-fade-in-up animate-delay-100 tracking-tight"
              >
                Your Vision,{" "}
                <span className="hero-gradient-refined animate-fade-in-up animate-delay-200">
                  Built by Experts
                </span>
          </h1>

              {/* TAGLINE */}
              <p
                className="mx-auto text-[clamp(14px,1.5vw,16px)] max-w-[600px] animate-fade-in-up animate-delay-300 hero-tagline"
              >
                Work with trusted experts to bring your ideas to life.
              </p>

              {/* SEARCH – pushed further down */}
              <div className="flex items-center justify-center animate-fade-in-up animate-delay-500 search-container-wrap">
                <form onSubmit={handleSearchSubmit} className="relative flex w-full max-w-[680px] items-center gap-3 rounded-full px-4 h-[50px] search-form-airglass">
                  <svg className="h-5 w-5 text-white/70 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    aria-label="Search services"
                    className="h-full flex-1 bg-transparent text-white outline-none search-input-field"
                    placeholder="Search services (e.g., 'Logo design')"
                  />
                  <button
                    type="submit"
                    className="shrink-0 h-[38px] px-4 rounded-full 
                               text-white font-medium transition-all search-submit-btn text-sm"
                  >
                    Search
                  </button>
                  {/* Search suggestions dropdown */}
                  {searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,.4)] overflow-hidden z-50">
                      {searchSuggestions.map((item, idx) => (
                        <a
                          key={idx}
                          href={item.url}
                          className="flex items-center px-6 py-3 text-white hover:bg-white/20 transition-colors border-b border-white/10 last:border-0"
                        >
                          <span className="mr-3 text-white/60">{item.type === 'product' ? '📦' : '👤'}</span>
                          <span className="font-medium">{item.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </form>
              </div>

              {/* CTAS */}
              <div className="cta-buttons-container animate-fade-in-up animate-delay-400">
              <button
              onClick={() => setShowQuoteForm(true)}
                  type="button"
                  className="cta-btn-primary"
                >
                  Request a Quote
                  <svg className="inline-block ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <Link
              href="/freelancers"
                  aria-label="Browse freelancers"
                  className="cta-btn-secondary"
            >
              Browse Freelancers
            </Link>
            </div>
          
              {/* FOOTER MICROCOPY */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-white/80 animate-fade-in-up animate-delay-400">
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" />Fast quotes
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400/90" />Secure milestones
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400/90" />Verified portfolios
                </span>
              </div>
          </div>
        </div>
      </section>

      {/* Trusted + Skills Section */}
      <section className="relative">
        {/* --- Trusted by --- */}
        <div className="relative border-t border-white/10 bg-[#0B0C0F]">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <p className="text-center text-[10px] tracking-[0.15em] text-white/45 font-bold uppercase">
              TRUSTED BY TEAMS WORLDWIDE
            </p>

            {/* marquee */}
            <div className="mt-6 relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
              <div className="flex gap-16 whitespace-nowrap animate-[marquee_45s_linear_infinite] hover:[animation-play-state:paused]">
                {["FORTUNE 500","TECH LEADERS","STARTUPS","AGENCIES","INNOVATORS","ENTERPRISE","DIGITAL PROS","CREATORS","FORTUNE 500","TECH LEADERS","STARTUPS","AGENCIES","INNOVATORS","ENTERPRISE","DIGITAL PROS","CREATORS"].map((name, i) => (
                  <span
                    key={i}
                    className="text-white/25 hover:text-white/90 transition-colors duration-300 text-sm md:text-base font-semibold tracking-wide"
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

      {/* Product Proof Section removed per request */}

      {/* Dynamic Pages Showcase removed per request */}

      {/* Stats Section */}
      <section className="relative bg-bg-base overflow-hidden">
        {/* Constellation Lines SVG Overlay */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 1 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,198,255,0.3)" />
              <stop offset="50%" stopColor="rgba(125,42,232,0.4)" />
              <stop offset="100%" stopColor="rgba(0,198,255,0.2)" />
            </linearGradient>
          </defs>
          <path
            d="M 25% 50 Q 37.5% 40, 50% 50 T 75% 50"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
            opacity="0.4"
            className="animate-pulse-slow"
          >
            <animate attributeName="stroke-dashoffset" values="0;20" dur="8s" repeatCount="indefinite" />
          </path>
        </svg>

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center" style={{ zIndex: 2 }}>
          {/* Section heading */}
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">Proof</span>{" "}
            <span className="text-white/95">in Numbers</span>
          </h2>
          <p className="mt-1.5 text-[10px] text-white/60">Real-world outcomes from vetted experts and transparent milestones.</p>

          {/* Stats grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { 
                label: 'Active Freelancers', 
                value: stats.totalFreelancers, 
                suffix: '+', 
                icon: '👥', 
                meta: 'Vetted & available now', 
                tip: 'Passed ID & portfolio checks',
                dynamicMeta: true
              },
              { 
                label: 'Projects Completed', 
                value: stats.projectsLast90Days, 
                suffix: '', 
                icon: '✨', 
                meta: 'Last 90 days', 
                tip: 'Completed projects in recent quarter',
                dynamicMeta: true
              },
              { 
                label: 'Happy Clients', 
                value: stats.totalReviews, 
                suffix: '+', 
                icon: '😊', 
                meta: `Avg. rating ${stats.averageRating}/5`, 
                tip: 'Based on verified client reviews',
                dynamicMeta: true
              },
              { 
                label: 'Countries', 
                value: stats.countries, 
                suffix: '+', 
                icon: '🌍', 
                meta: 'Active delivery regions', 
                tip: 'Global expert network',
                dynamicMeta: true
              },
            ].map((stat, index) => (
              <Link 
                key={index} 
                href="/freelancers" 
                className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-4 md:p-5 shadow-[0_8px_28px_rgba(0,0,0,0.35)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.45)] stats-card-aurora cursor-pointer" 
                title={stat.tip}
              >
                {/* Aurora inner glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(60%_80%_at_50%_0%,rgba(125,42,232,0.16),transparent),radial-gradient(60%_80%_at_50%_100%,rgba(0,198,255,0.12),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon chip */}
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white/85 ring-1 ring-white/15">
                  <span className="text-xl">{stat.icon}</span>
                </div>
            
                {/* Number with sheen effect */}
                <div className="stat-number bg-gradient-to-r from-[#00C6FF] via-[#5F57FF] to-[#7D2AE8] bg-clip-text text-4xl md:text-5xl font-extrabold tracking-tight text-transparent [font-variant-numeric:tabular-nums] leading-none">
                  {(stat.value ?? 0).toLocaleString()}
                  {stat.suffix}
              </div>

                {/* Label */}
                <div className="mt-1.5 text-sm md:text-base font-semibold text-white/90">{stat.label}</div>
                
                {/* Meta text */}
                <div className="mt-1 text-xs text-white/60">{stat.meta}</div>
                </Link>
            ))}
          </div>

          {/* Footnote */}
          <p className="mt-6 text-xs text-white/50">
            Based on Uniti project data. Updated weekly.
                  </p>
        </div>
      </section>

      {/* Testimonials Section - Professional Design */}
      <section className="relative bg-gradient-to-b from-bg-surface/80 via-bg-surface/60 to-bg-surface/80 backdrop-blur-sm py-20 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">What our</span>{" "}
              <span className="text-white/95">clients say</span>
            </h2>
            <p className="mt-1.5 text-[10px] text-white/60">Don't just take our word for it</p>
          </div>

          {currentTestimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
              {currentTestimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id || index}
                  className="group relative"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Testimonial Card */}
                  <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-bg-surface via-bg-surface/95 to-bg-surface border border-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] transform hover:-translate-y-1">

                    <div className="relative z-10">
                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 transition-all duration-300 ${
                              i < testimonial.rating
                                ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.4)]'
                                : 'text-white/10 fill-white/10'
                            }`}
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>


                      {/* Testimonial Text */}
                      <blockquote className="mb-4">
                        <p className="text-text-soft/90 text-sm leading-relaxed font-normal italic">
                          "{testimonial.testimonial_text}"
                        </p>
                      </blockquote>

                      {/* Client Info */}
                      <div className="pt-4 border-t border-white/10">
                        <p className="font-bold text-white text-xs mb-1">
                          {testimonial.client_name}
                        </p>
                        <p className="text-text-mute text-[10px] font-medium">
                          {testimonial.client_role}
                          {testimonial.client_company && ` at ${testimonial.client_company}`}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-8 rounded-2xl bg-bg-surface/50 border border-white/10">
                <p className="text-text-soft text-base font-medium">
                  No testimonials available yet. Check back soon!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-[#0B0D10]">
        {/* Soft brand wash */}
        <div className="pointer-events-none absolute inset-0 opacity-60 bg-[radial-gradient(40%_60%_at_10%_0%,rgba(0,198,255,.06),transparent),radial-gradient(40%_60%_at_90%_100%,rgba(125,42,232,.08),transparent)]" />
        
        <div className="relative mx-auto max-w-6xl px-6 py-10">
          {/* Top row: brand + newsletter */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <img 
                  src="/images/logo/logo2.1.png" 
                  alt="Uniti Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-semibold text-white">Uniti</span>
                </div>
              <p className="text-white/70 text-sm">
                Unity of ideas and experts. Build fast, build right.
              </p>
              </div>

            <div className="md:col-span-2">
              <form
                aria-label="Subscribe to product updates"
                className="flex w-full max-w-2xl items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 backdrop-blur-md"
                onSubmit={handleNewsletterSubmit}
              >
                <label htmlFor="newsletter" className="sr-only">Email address</label>
                <svg className="h-4 w-4 text-white/70" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="newsletter"
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Get product updates & tips"
                  className="h-9 w-full rounded-xl bg-transparent px-2 text-white placeholder-white/60 outline-none text-xs focus-visible:ring-2 focus-visible:ring-sky-400/60"
                />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center gap-1 rounded-xl px-4 font-medium text-white text-xs bg-gradient-to-r from-[#00C6FF] to-[#7D2AE8] hover:shadow-[0_0_18px_rgba(125,42,232,.45)] transition"
                >
                  Subscribe
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </form>
              <div role="status" aria-live="polite" className="mt-2 min-h-[1rem] text-xs">
                {newsletterMsg.type === 'success' && <span className="text-emerald-400">{newsletterMsg.text}</span>}
                {newsletterMsg.type === 'error' && <span className="text-rose-400">{newsletterMsg.text}</span>}
          </div>
              <p className="mt-1 text-[10px] text-white/55">
                By subscribing you agree to our <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
              </p>
        </div>
          </div>

          {/* Link columns */}
          <div className="mt-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <FooterCol
              heading="Products"
              items={[
                { label: "Browse Freelancers", href: "/freelancers" },
                { label: "Request a Quote", href: "/products", onClick: (e: React.MouseEvent) => { e.preventDefault(); setShowQuoteForm(true); } },
                { label: "Verified Portfolios", href: "/verified" },
                { label: "Categories", href: "/categories" },
              ]}
            />
            <FooterCol
              heading="For Clients"
              items={[
                { label: "How it Works", href: "/how-it-works" },
                { label: "Milestone Protection", href: "/protection" },
                { label: "Pricing & Payments", href: "/pricing" },
                { label: "Case Studies", href: "/case-studies" },
              ]}
            />
            <FooterCol
              heading="For Freelancers"
              items={[
                { label: "Apply to Uniti", href: "/apply" },
                { label: "Verification Guide", href: "/verification" },
                { label: "Payouts", href: "/payouts" },
                { label: "Community", href: "/community" },
              ]}
            />
            <FooterCol
              heading="Company"
              items={[
                { label: "About", href: "/about" },
                { label: "Why Choose Us", href: "/why-choose-us" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/contact" },
                { label: "Careers", href: "/careers" },
              ]}
            />
          </div>

          {/* Legal bar */}
          <div className="mt-8 flex flex-col-reverse items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 md:flex-row">
            <p>© {new Date().getFullYear()} Uniti. All rights reserved. ABN 00 000 000 000</p>
            <div className="flex items-center gap-5">
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/cookies" className="hover:text-white">Cookies</a>
                      </div>
                      </div>
                    </div>

        {/* Back to top */}
        <a
          href="#top"
          className="group fixed bottom-6 right-6 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.07] text-white/80 backdrop-blur-md hover:bg-white/10 hover:text-white transition z-50"
          aria-label="Back to top"
        >
          ↑
        </a>
      </footer>

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

// Footer Column Component
function FooterCol({
  heading,
  items,
}: {
  heading: string;
  items: { label: string; href: string; onClick?: (e: React.MouseEvent) => void }[];
}) {
  return (
    <nav aria-label={heading}>
      <h4 className="text-white/95 text-xs font-semibold uppercase tracking-wider mb-1.5">{heading}</h4>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.label}>
            <Link 
              href={i.href} 
              className="text-white/75 hover:text-white hover:underline underline-offset-4 text-[10px]"
              onClick={i.onClick}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch data directly from MySQL database
    // Using Promise.allSettled to handle errors gracefully for each query
    const results = await Promise.allSettled([
      // Fetch testimonials from database - prioritize featured ones, then by rating
      query(`
        SELECT * FROM testimonials 
        WHERE is_active = "TRUE" 
        ORDER BY is_featured DESC, rating DESC, created_at DESC 
        LIMIT 12
      `),
      
      // Count active freelancers
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM freelancers WHERE status = "approved"'),
      
      // Count completed projects
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM projects WHERE status = "completed"'),
      
      // Count total reviews/testimonials
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM testimonials WHERE is_active = "TRUE"'),
      
      // Get unique countries from freelancers
      query<{ country: string }>('SELECT DISTINCT country FROM freelancers WHERE country IS NOT NULL AND status = "approved"'),
      
      // Get projects from last 90 days
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM projects WHERE status = "completed" AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)')
    ]);

    // Extract results with fallbacks
    const testimonials = results[0].status === 'fulfilled' ? results[0].value : [];
    const freelancersCountResult = results[1].status === 'fulfilled' ? results[1].value : [{ count: 0 }];
    const projectsCountResult = results[2].status === 'fulfilled' ? results[2].value : [{ count: 0 }];
    const reviewsCountResult = results[3].status === 'fulfilled' ? results[3].value : [{ count: 0 }];
    const countries = results[4].status === 'fulfilled' ? results[4].value : [];
    const projectsLast90DaysResult = results[5].status === 'fulfilled' ? results[5].value : [{ count: 0 }];

    // Calculate stats from database results
    // MySQL COUNT(*) returns the count - convert to number (handles BigInt or string)
    const freelancerCount = Number(freelancersCountResult[0]?.count) || 0;
    const projectCount = Number(projectsCountResult[0]?.count) || 0;
    const reviewCount = Number(reviewsCountResult[0]?.count) || 0;
    const uniqueCountries = countries.length || 0;
    const projectsLast90DaysCount = Number(projectsLast90DaysResult[0]?.count) || 0;

    // Calculate average rating from testimonials
    const avgRating = testimonials.length > 0
      ? (testimonials.reduce((sum: number, t: any) => sum + (Number(t.rating) || 0), 0) / testimonials.length).toFixed(1)
      : '0.0';

    // Serialize testimonials - convert Date objects to strings and map field names
    // Database uses: content, client_title
    // Page expects: testimonial_text, client_role
    const serializedTestimonials = testimonials.map((t: any) => ({
      id: String(t.id || ''),
      client_name: t.client_name || '',
      client_role: t.client_title || '', // Map client_title to client_role
      client_company: t.client_company || '',
      testimonial_text: t.content || '', // Map content to testimonial_text
      rating: Number(t.rating) || 0,
      // Keep original fields for reference
      client_title: t.client_title || '',
      content: t.content || '',
      is_featured: t.is_featured === 'TRUE',
      is_active: t.is_active === 'TRUE',
      client_image_url: t.client_image_url || '',
      created_at: t.created_at instanceof Date 
        ? t.created_at.toISOString() 
        : typeof t.created_at === 'string' 
          ? t.created_at 
          : String(t.created_at || ''),
      updated_at: t.updated_at instanceof Date 
        ? t.updated_at.toISOString() 
        : typeof t.updated_at === 'string' 
          ? t.updated_at 
          : String(t.updated_at || '')
    }));

    const stats = {
      totalFreelancers: freelancerCount,
      totalProjects: projectCount,
      totalReviews: reviewCount,
      countries: uniqueCountries,
      averageRating: avgRating,
      projectsLast90Days: projectsLast90DaysCount
    };

    return {
      props: {
        testimonials: serializedTestimonials,
        stats
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    
    // Return empty data when there's an error - NO hardcoded testimonials
    // All data must come from database
    return {
      props: {
        testimonials: [], // Empty array - no hardcoded testimonials
        stats: {
          totalFreelancers: 0,
          totalProjects: 0,
          totalReviews: 0,
          countries: 0,
          averageRating: '0.0',
          projectsLast90Days: 0
        },
      }
    };
  }
};

export default HomePage;
