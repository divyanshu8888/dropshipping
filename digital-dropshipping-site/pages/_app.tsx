import '../src/styles/globals.css'
import type { AppProps } from 'next/app'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { AuthProvider } from '../src/contexts/AuthContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  )
}
