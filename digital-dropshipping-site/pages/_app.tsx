import '../src/styles/globals.css'
import type { AppProps } from 'next/app'
import ErrorBoundary from '../src/components/ErrorBoundary'
import { AuthProvider } from '../src/contexts/AuthContext'
import { NotificationProvider } from '../src/contexts/NotificationContext'
import { ToastProvider } from '../src/components/Toast'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Component {...pageProps} />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}
