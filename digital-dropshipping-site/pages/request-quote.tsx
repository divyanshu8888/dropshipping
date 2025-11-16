import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../src/components/Header';
import QuoteRequestForm, { QuoteRequestContext } from '../src/components/QuoteRequestForm';

const RequestQuotePage = () => {
  const router = useRouter();

  const context = useMemo<QuoteRequestContext | undefined>(() => {
    if (!router.isReady) return undefined;
    const query = router.query;

    const normalize = (value?: string | string[]) =>
      Array.isArray(value) ? value[0] : value;

    const ctx: QuoteRequestContext = {
      source: normalize(query.source) as QuoteRequestContext['source'],
      intent: normalize(query.intent) as QuoteRequestContext['intent'],
      title: normalize(query.title),
      subtitle: normalize(query.subtitle),
      badge: normalize(query.badge),
      meta: normalize(query.meta),
      category: normalize(query.category)
    };

    const hasValues = Object.values(ctx).some(Boolean);
    return hasValues ? ctx : undefined;
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-bg-base">
      <Head>
        <title>Request a Quote — Uniti</title>
        <meta
          name="description"
          content="Tell us about your project and we’ll match you with a verified Uniti operator."
        />
      </Head>
      <Header />
      <main className="px-4 sm:px-6 lg:px-8 pt-24 pb-16 flex flex-col items-center gap-10">
        <section className="w-full max-w-4xl text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Uniti request desk</p>
          <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight">
            Request a Quote
          </h1>
          <p className="text-lg text-white/80">
            Tell us about your project and we’ll match you with a verified Uniti operator.
          </p>
        </section>
        <div className="w-full max-w-3xl">
          <QuoteRequestForm
            context={context}
            onClose={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            onSuccess={() => {
              router.push('/thank-you');
            }}
          />
        </div>
      </main>
    </div>
  );
};

export default RequestQuotePage;

