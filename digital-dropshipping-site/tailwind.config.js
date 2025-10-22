module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Framer-inspired Theme
        bg: { 
          base: '#0B0C0F', 
          surface: '#101218', 
          raised: '#131620' 
        },
        text: { 
          base: '#EDEFF5', 
          soft: '#B6BAC8', 
          mute: '#8A90A2' 
        },
        brand: { 
          a: '#6EE7F9', 
          b: '#60A5FA', 
          c: '#A78BFA' 
        },
        // Legacy colors for backward compatibility
        accent: { 
          blue: '#60A5FA', 
          violet: '#A78BFA', 
          cyan: '#6EE7F9' 
        },
        // Legacy primary colors for backward compatibility
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.05) inset, 0 10px 30px rgba(0,0,0,0.45)',
        'metallic': '0 4px 20px rgba(59,130,246,0.25)',
        chip: 'inset 0 1px 0 rgba(255,255,255,.08), 0 6px 22px rgba(0,0,0,.45)',
      },
      borderRadius: { 
        xl: '14px', 
        '2xl': '20px' 
      },
      backgroundImage: {
        'hero': 'radial-gradient(1200px 600px at 10% -10%, rgba(96,165,250,.25), transparent), radial-gradient(900px 500px at 90% -20%, rgba(167,139,250,.22), transparent)',
        'metal-sheen': 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 35%), radial-gradient(60% 120% at 50% 0%, rgba(139,92,246,0.20), rgba(59,130,246,0.12) 45%, rgba(6,182,212,0.10) 70%, transparent 80%)',
        'specular-line': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35) 50%, transparent)',
        'hero-gradient': 'radial-gradient(1200px_600px_at_10%_-10%,rgba(139,92,246,0.25),transparent),radial-gradient(900px_500px_at_90%_-20%,rgba(59,130,246,0.18),transparent)',
        // Superhuman-like backdrop: subtle purple/teal glow on black
        'superhuman': 'radial-gradient(60% 120% at 50% 0%, rgba(168,85,247,.16), rgba(79,70,229,.10) 40%, transparent 70%), linear-gradient(180deg,#0B0C0F 0%, #101218 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'metallic-glow': 'metallicGlow 2s ease-in-out infinite alternate',
        'marquee': 'marquee 30s linear infinite',
        'spin': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradientShift': 'gradientShift 12s ease-in-out infinite alternate',
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'slow-pulse': 'slow-pulse 10s ease-in-out infinite',
        'conic-spin': 'conic-spin 40s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'word-rotate': 'word-rotate 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        metallicGlow: {
          '0%': { boxShadow: '0 4px 20px rgba(59,130,246,0.25)' },
          '100%': { boxShadow: '0 8px 40px rgba(139,92,246,0.35)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gradientShift: {
          'from': { backgroundPosition: '50% 0%' },
          'to': { backgroundPosition: '55% 5%' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '0.9' },
        },
        'slow-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'fade-up': {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'conic-spin': {
          'to': { transform: 'rotate(360deg)' },
        },
        'word-rotate': {
          '0%, 20%': { opacity: '1', transform: 'translateY(0)' },
          '25%, 45%': { opacity: '0', transform: 'translateY(-20px)' },
          '50%, 70%': { opacity: '1', transform: 'translateY(0)' },
          '75%, 95%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};