import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import Header from '../src/components/Header';
import { highlightSnippetLine } from '../src/lib/highlightSnippet';
import { buildQuoteHref } from '../src/lib/quoteLink';
import { query } from '../src/lib/mysql';
import { useAuth } from '../src/contexts/AuthContext';


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
            aria-label="Previous services"
            disabled={atStart}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-neutral-900 shadow-lg h-8 w-8 grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 hover:scale-110 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
          >
            ‹
          </button>
          <button
            onClick={() => scrollByCards("right")}
            aria-label="Next services"
            disabled={atEnd}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white text-neutral-900 shadow-lg h-8 w-8 grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200 hover:scale-110 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70"
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
    code: `// Unitiv: Connect with verified talent
import { createClient } from "@unitiv/client";

const client = createClient({
  apiKey: process.env.UNITIV_API_KEY,
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
    terminal: `$ unitiv init project website-redesign
✔ Project initialized
✔ Connected to Unitiv

$ unitiv create --category "Web Dev" --timeline "4-6 weeks"
✔ Project created: #PROJ-123
✔ 3 verified professionals matched

$ unitiv select --id "pro_456"
✔ Professional selected: Expert Developer
✔ Project started with milestone tracking

$ unitiv status
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

  // Why: the old version's string-highlight regex matched the class="" attributes of its own
  // injected spans, printing raw `"text-cyan-300">` artifacts on screen. Strings/comments are
  // now extracted to placeholders first, so later rules can never touch generated markup.
  // Why: delegated to src/lib/highlightSnippet.ts — the robust placeholder-based
  // implementation that can't corrupt its own generated markup.
  const highlightSyntax = (line: string) => highlightSnippetLine(line);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _legacyHighlightSyntax = (line: string) => {
    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const tokens: string[] = [];
    // Why: emit spans directly — none of the later keyword rules can match the
    // inserted class attributes, so no placeholder round-trip is needed at all.
    const stash = (html: string) => html; // legacy placeholder impl removed: (html: string) => `${tokens.push(html) - 1}`;

    let out = escaped
      .replace(/(\/\/.*$)/g, (m) => stash(`<span class="text-white/40">${m}</span>`))
      .replace(/(&quot;.*?&quot;|".*?")/g, (m) => stash(`<span class="text-emerald-300">${m}</span>`))
      .replace(/('.*?')/g, (m) => stash(`<span class="text-emerald-300">${m}</span>`))
      .replace(/\b(import|from|const|let|type|async|await|return|if|throw|new|export|function)\b/g, '<span class="text-cyan-300">$1</span>')
      .replace(/\b(string|number|boolean|any|undefined|void)\b/g, '<span class="text-violet-300">$1</span>')
      .replace(/\b(POST|GET|PUT|DELETE)\b(\s+\/[^\s]+)?/g, (_m, verb, path) =>
        `<span class="text-yellow-300">${verb}</span>${path ? `<span class="text-blue-300">${path}</span>` : ''}`)
      .replace(/(✔|📊|💰|📅|👨‍💻)/g, '<span class="text-emerald-400">$1</span>');

    // Why: stash() now returns html directly, so the placeholder-restore pass must not run —
    // it would have replaced every digit in the snippet with garbage.
    if (false) out = out.replace(/(\d+)/g, (_m, i) => tokens[Number(i)] /* restored */);
    return out;
  };

  return (
    <div className="relative bg-[#0B0C0F] py-16 overflow-hidden">
      {/* slow conic halo */}
      <div
        className="pointer-events-none absolute -top-1/2 left-1/2 -translate-x-1/2 w-[min(1200px,100vw)] h-[min(1200px,100vw)] rounded-full blur-3xl opacity-20 -z-10"
        style={{
          background: "conic-gradient(from 180deg,#67e8f9,#60a5fa,#a78bfa,transparent 70%)",
          animation: "spin 36s linear infinite"
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left: editor */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_30px_80px_rgba(0,0,0,.35)]">
            {/* window controls */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-500/70" />
                <span className="size-2.5 rounded-full bg-yellow-500/70" />
                <span className="size-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="text-[10px] text-white/50">unitiv-hq/app/quote.ts</div>
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
            <pre className="relative p-3 md:p-4 text-[11px] leading-relaxed overflow-x-auto text-white/90 min-h-[280px] font-mono max-w-full [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full">
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
                <h2 className="text-2xl md:text-3xl font-semibold leading-tight tracking-[-0.01em] text-white">Where ideas unite your vision.</h2>
                <div className="h-[1.5px] w-12 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full mt-1.5 mb-2"></div>
                <p className="text-xs text-gray-400 mb-4">
                  <span className="text-cyan-300 font-medium">Unit</span> (from Unity) +
                  <span className="text-violet-300 font-medium"> i</span> (from Idea) +
                  <span className="text-emerald-300 font-medium"> v</span> (for Vision) =
                  <span className="text-white font-semibold"> Unitiv</span>
              </p>
              <p className="max-w-[58ch] text-sm text-gray-200 leading-6">
                  Unitiv connects clients with <span className="font-medium text-gray-100">verified professionals</span> in a secure, data-driven workspace. 
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

// Hero pointer state shared between the hero container and the canvas
type HeroPointer = { x: number; y: number; active: boolean };

// Constellation particle canvas — single canvas, DPR capped at 2, <=70 particles.
// Fully gated behind prefers-reduced-motion; pauses on tab hide; cleans up on unmount.
const ConstellationCanvas = ({ pointerRef }: { pointerRef: React.MutableRefObject<HeroPointer> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Reduced-motion users get no canvas animation at all — static gradient scene only
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let rafId = 0;
    let running = true;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const COUNT = width < 640 ? 42 : 70;
    const LINK_DIST = 120;
    const CURSOR_DIST = 160;

    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      r: Math.random() * 1.4 + 0.6,
      isCyan: Math.random() > 0.42,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Drift + edge wrap
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }

      // Particle-to-particle links
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.16;
            ctx.strokeStyle = a.isCyan
              ? `rgba(0, 198, 255, ${alpha})`
              : `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Links toward the cursor (opacity proportional to proximity)
      const pointer = pointerRef.current;
      if (pointer.active) {
        for (const p of particles) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_DIST) {
            const alpha = (1 - dist / CURSOR_DIST) * 0.32;
            ctx.strokeStyle = `rgba(0, 198, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      // Dots
      for (const p of particles) {
        ctx.fillStyle = p.isCyan ? 'rgba(0, 198, 255, 0.55)' : 'rgba(167, 139, 250, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        rafId = requestAnimationFrame(loop);
      }
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    rafId = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pointerRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
};

const HERO_MARQUEE_CATEGORIES = [
  'Web Development',
  'AI/ML',
  'Logo Design',
  'UX/UI Design',
  'Voice Over',
  'UGC Videos',
  'Social Media Marketing',
  'SEO',
  'Data Analytics',
  'DevOps',
  'Brand Identity',
  'Content Writing',
];

const HERO_QUICK_SEARCHES = [
  { label: 'Logo Design', href: '/products?category=Design' },
  { label: 'Web Development', href: '/products?category=Web Development' },
  { label: 'AI / ML', href: '/products?category=AI & ML' },
  { label: 'SEO', href: '/products?category=Digital Marketing' },
];

const HomePage = ({ testimonials, stats }: HomePageProps) => {
  const { isFreelancer } = useAuth();
  const viewerIsFreelancer = isFreelancer();
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [isAutoPlaying, _setIsAutoPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [scrollY, setScrollY] = useState(0);

  // Hero scene refs — pointer shared with canvas, spotlight moved via direct style writes
  const heroPointerRef = useRef<HeroPointer>({ x: 0, y: 0, active: false });
  const spotlightRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    prefersReducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleHeroPointerMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroPointerRef.current.x = x;
    heroPointerRef.current.y = y;
    heroPointerRef.current.active = true;
    if (!prefersReducedMotionRef.current && spotlightRef.current) {
      spotlightRef.current.style.opacity = '1';
      spotlightRef.current.style.transform = `translate(${x - 240}px, ${y - 240}px)`;
    }
  };

  const handleHeroPointerLeave = () => {
    heroPointerRef.current.active = false;
    if (spotlightRef.current) {
      spotlightRef.current.style.opacity = '0';
    }
  };

  // 3D tilt for floating stat cards (max 8deg, reset on leave)
  const handleCardTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotionRef.current) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg)`;
  };

  const handleCardTiltReset = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg)';
  };

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

  return (
    <div className="min-h-screen bg-[#050507]">
      <Head>
        <title>Unitiv — Your Vision, Built by Experts</title>
        <meta name="description" content="Connect with verified freelancers across web, design, AI, and marketing. Secure milestones, transparent pricing, and real-time collaboration — all in one workspace." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph — Why: og:site_name/canonical/og:type live in _app.tsx; duplicates removed */}
        <meta property="og:title" content="Unitiv — Your Vision, Built by Experts" />
        <meta property="og:description" content="Connect with verified freelancers across web, design, AI, and marketing. Secure milestones, transparent pricing, and real-time collaboration." />
        <meta property="og:image" content="/images/logo/logo2.1.png" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Unitiv — Your Vision, Built by Experts" />
        <meta name="twitter:description" content="Connect with verified freelancers across web, design, AI, and marketing." />
        <meta name="twitter:image" content="/images/logo/logo2.1.png" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Unitiv',
              url: 'https://uniti.com.au',
              logo: '/images/logo/logo2.1.png',
              description: 'Freelancer marketplace connecting clients with verified professionals in web, design, AI, and marketing.',
              sameAs: []
            })
          }}
        />
      </Head>
      <Header />

      {/* Why: semantic <main> landmark for screen readers and SEO */}
      <main>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-[#050507] text-white min-h-screen flex flex-col">
        {/* Subtle purple/pink glow blobs — no photo, pure dark like Figma */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 h-[55rem] w-[55rem] -translate-y-1/4 translate-x-1/4 rounded-full bg-violet-700/[0.08] blur-[200px]" />
          <div className="absolute -bottom-32 left-0 h-[44rem] w-[44rem] -translate-x-1/4 rounded-full bg-fuchsia-700/[0.07] blur-[180px]" />
        </div>
        <ConstellationCanvas pointerRef={heroPointerRef} />
        <div ref={spotlightRef} aria-hidden="true" className="hero-spotlight pointer-events-none absolute left-0 top-0 z-[3]" />

        <div
          className="relative z-10 mx-auto my-auto flex w-full max-w-4xl flex-col items-center px-4 pt-32 pb-16 text-center sm:px-6 lg:px-8"
          onMouseMove={handleHeroPointerMove}
          onMouseLeave={handleHeroPointerLeave}
        >
          {/* Trust badge — matches Figma */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[13px] text-white/70 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Trusted by 500+ businesses worldwide
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up mt-6 text-[clamp(44px,7vw,88px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            Your vision,<br />
            <span className="hero-gradient-refined">built by experts.</span>
          </h1>

          <p className="animate-fade-in-up mt-5 max-w-[580px] text-[clamp(15px,1.6vw,18px)] leading-relaxed text-white/60">
            Hire verified freelancers across design, development, AI, and marketing. Every project backed by milestone payment protection.
          </p>

          {/* Search bar — Figma style */}
          <div className="animate-fade-in-up mt-8 w-full max-w-[700px]">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex h-[58px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 backdrop-blur-sm transition-all duration-300 focus-within:border-violet-500/40 focus-within:bg-white/8"
            >
              <svg className="h-5 w-5 shrink-0 text-white/40" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                maxLength={200}
                aria-label="Search services or freelancers"
                aria-expanded={searchSuggestions.length > 0}
                className="h-full flex-1 bg-transparent text-white text-[15px] outline-none placeholder:text-white/35"
                placeholder="Search for a skill, service, or expert..."
              />
              <button
                type="submit"
                className="hero-cta-sheen h-10 shrink-0 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(139,92,246,0.55)]"
              >
                Search
              </button>
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-[#0e1018] shadow-[0_20px_60px_rgba(0,0,0,.7)] overflow-hidden z-50 text-left">
                  {searchSuggestions.map((item, idx) => (
                    <a key={idx} href={item.url} className="flex items-center gap-3 px-5 py-3 text-sm text-white/80 hover:bg-white/8 hover:text-white transition-colors border-b border-white/6 last:border-0">
                      <span className="shrink-0 rounded-md bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold text-white/50">
                        {item.type === 'product' ? 'Service' : 'Talent'}
                      </span>
                      {item.name}
                    </a>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Popular tags — matches Figma */}
          <div className="animate-fade-in-up mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-white/45">
            <span className="font-medium">Popular:</span>
            {HERO_MARQUEE_CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat}
                href={`/products?category=${encodeURIComponent(cat)}`}
                className="rounded-full border border-white/12 bg-white/5 px-3.5 py-1 text-white/65 transition-all hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="animate-fade-in-up mt-8 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            {!viewerIsFreelancer && (
              <Link
                href={buildQuoteHref({ source: 'general', intent: 'proposal', title: 'Request a quote' })}
                className="hero-cta-sheen inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(139,92,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(139,92,246,0.6)] sm:w-auto sm:min-w-[200px]"
              >
                Request a Quote
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
            {!viewerIsFreelancer && (
              <Link
                href="/freelancers"
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-white/15 bg-white/5 px-8 text-sm font-semibold text-white/85 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/10 sm:w-auto sm:min-w-[180px]"
              >
                Browse Freelancers
              </Link>
            )}
            {viewerIsFreelancer && (
              <Link
                href="/open-projects"
                className="hero-cta-sheen inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(139,92,246,0.45)] transition-all duration-300 hover:-translate-y-0.5 sm:w-auto sm:min-w-[200px]"
              >
                Find Open Projects
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-in-up mt-12 flex items-center justify-center gap-10 sm:gap-16">
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">
                {stats.totalFreelancers > 0 ? `${stats.totalFreelancers.toLocaleString()}+` : '50+'}
              </div>
              <div className="mt-0.5 text-xs text-white/40">Verified experts</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">
                {stats.averageRating && stats.averageRating !== '0.0' ? stats.averageRating : '4.9'}/5
              </div>
              <div className="mt-0.5 text-xs text-white/40">Average rating</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-extrabold text-white">
                {stats.totalProjects > 0 ? `${stats.totalProjects.toLocaleString()}+` : '100+'}
              </div>
              <div className="mt-0.5 text-xs text-white/40">Projects done</div>
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

            <div className="trust-marquee-strip">
              <div className="trust-marquee-track">
                {["FORTUNE 500","TECH LEADERS","STARTUPS","AGENCIES","INNOVATORS","ENTERPRISE","DIGITAL PROS","CREATORS","FORTUNE 500","TECH LEADERS","STARTUPS","AGENCIES","INNOVATORS","ENTERPRISE","DIGITAL PROS","CREATORS"].map((name, i) => (
                  <span key={i} className="trust-marquee-item">
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
                fallback: '50+',
                suffix: '+',
                icon: '👥',
                meta: 'Vetted & available now',
                tip: 'Passed ID & portfolio checks',
              },
              {
                label: 'Projects Completed',
                value: stats.projectsLast90Days,
                fallback: '100+',
                suffix: '',
                icon: '✨',
                meta: 'Last 90 days',
                tip: 'Completed projects in recent quarter',
              },
              {
                label: 'Happy Clients',
                value: stats.totalReviews,
                fallback: '200+',
                suffix: '+',
                icon: '😊',
                meta: `Avg. rating ${stats.averageRating && stats.averageRating !== '0.0' ? stats.averageRating : '4.9'}/5`,
                tip: 'Based on verified client reviews',
              },
              {
                label: 'Countries',
                value: stats.countries,
                fallback: '20+',
                suffix: '+',
                icon: '🌍',
                meta: 'Active delivery regions',
                tip: 'Global expert network',
              },
            ].map((stat, index) => {
              const displayValue = stat.value && stat.value > 0
                ? `${stat.value.toLocaleString()}${stat.suffix}`
                : stat.fallback;
              return (
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
                  {displayValue}
                </div>

                {/* Label */}
                <div className="mt-1.5 text-sm md:text-base font-semibold text-white/90">{stat.label}</div>

                {/* Meta text */}
                <div className="mt-1 text-xs text-white/60">{stat.meta}</div>
              </Link>
              );
            })}
          </div>

          {/* Footnote */}
          <p className="mt-6 text-xs text-white/50">
            Based on Unitiv project data. Updated weekly.
                  </p>
        </div>
      </section>

      {/* Testimonials Section - Professional Design */}
      <section className="relative bg-gradient-to-b from-bg-surface/80 via-bg-surface/60 to-bg-surface/80 backdrop-blur-sm py-20 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">What our</span>{" "}
              <span className="text-white/95">clients say</span>
            </h2>
            <p className="mt-1.5 text-[10px] text-white/60">Don&apos;t just take our word for it</p>
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
                          &ldquo;{testimonial.testimonial_text}&rdquo;
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
      </main>

    </div>
  );
};


export const getStaticProps: GetStaticProps = async () => {
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
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM freelancers WHERE status = "approved" AND verification_state = "verified"'),
      
      // Count completed projects
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM projects WHERE status = "completed"'),
      
      // Count total reviews/testimonials
      query<{ count: number | string }>('SELECT COUNT(*) as count FROM testimonials WHERE is_active = "TRUE"'),
      
      // Get unique countries from freelancers
      query<{ country: string }>('SELECT DISTINCT country FROM freelancers WHERE country IS NOT NULL AND status = "approved" AND verification_state = "verified"'),
      
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
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    
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
      },
      revalidate: 60
    };
  }
};

export default HomePage;
