import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useAuth } from '../src/contexts/AuthContext';

const Header = dynamic(() => import('../src/components/Header'));

export default function DashboardRouter() {
  const router = useRouter();
  const { user, loading, hasAnyRole } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (hasAnyRole?.(['ADMIN', 'TEAM_MEMBER'])) {
      router.replace('/admin');
      return;
    }
    if (user.role === 'FREELANCER') {
      router.replace('/freelancers/dashboard');
      return;
    }
    if (user.role === 'CLIENT') {
      router.replace('/clients/dashboard');
      return;
    }
    router.replace('/'); // fallback
  }, [user, loading, hasAnyRole, router]);

  return (
    <div className="min-h-screen bg-bg-base text-white">
      {/* Why: private routing page — keep it out of search indexes. */}
      <Head>
        <title>Dashboard - Unitiv</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Header />
      <main className="flex items-center justify-center py-40">
        <h1 className="sr-only">Dashboard</h1>
        <div className="text-center text-white/70" role="status" aria-live="polite">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white/70" aria-hidden="true" />
          Redirecting to your dashboard…
        </div>
      </main>
    </div>
  );
}


