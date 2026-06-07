import '../src/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { AuthProvider } from '../src/contexts/AuthContext'
import { NotificationProvider } from '../src/contexts/NotificationContext'
import { ToastProvider } from '../src/components/Toast'
import Footer from '../src/components/Footer'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const path = router.asPath.split(/[?#]/)[0] || '/'
  const canonicalUrl = siteUrl ? `${siteUrl}${path}` : undefined
  const isPrivateRoute = /^\/(admin|cart|checkout|dashboard|clients\/dashboard|freelancers\/dashboard)/.test(path)
  const showFooter = !isPrivateRoute

  return (
    <ErrorBoundary>
      <Head>
        <title>Unitiv - Verified Freelance Talent</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="application-name" content="Unitiv" />
        <meta name="theme-color" content="#07090d" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="robots" content={isPrivateRoute ? 'noindex,nofollow' : 'index,follow'} />
        <meta property="og:site_name" content="Unitiv" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Unitiv - Verified Freelance Talent" />
        <meta
          property="og:description"
          content="Hire verified freelancers, request project quotes, and manage digital work with milestone protection."
        />
        <meta name="twitter:card" content="summary_large_image" />
        {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      </Head>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Component {...pageProps} />
            {showFooter && <Footer />}
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
