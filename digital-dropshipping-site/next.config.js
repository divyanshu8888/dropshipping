// Why: previous config leaked DROPSHIP_PROVIDER_API_KEY into the client JS
// bundle via `env`. Server-only secrets must be read from process.env at
// runtime in API routes — never listed here. Only NEXT_PUBLIC_* belongs client-side.
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['example.com'], // Replace with your image domains
  },
  // Why: security headers were missing entirely (clickjacking, MIME sniffing,
  // referrer leakage, permissive embedding).
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            // 'unsafe-inline'/'unsafe-eval' kept for Next.js runtime + Tailwind inline styles;
            // tighten with nonces later if needed.
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.stripe.com https://vitals.vercel-insights.com",
              "frame-src https://js.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/client-dashboard',
        destination: '/clients/dashboard',
        permanent: true,
      },
    ];
  },
};
