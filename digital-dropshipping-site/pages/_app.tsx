import '../src/styles/globals.css'
import type { AppProps } from 'next/app'
import ErrorBoundary from '../src/components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}
