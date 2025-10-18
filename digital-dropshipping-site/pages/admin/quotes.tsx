import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../src/components/Header'
import { supabase } from '../../src/lib/supabase'

interface QuoteRequest {
  id: string;
  freelancer_id: string | null;
  client_name: string;
  client_email: string;
  client_company: string | null;
  project_type: string;
  budget_range: string;
  timeline: string;
  description: string;
  status: string;
  created_at: string;
  freelancer?: {
    display_name: string;
    title: string;
  };
}

interface QuotesPageProps {
  quotes: QuoteRequest[];
}

export default function QuotesPage({ quotes }: QuotesPageProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <Head>
        <title>Quote Requests - Admin - TalentHub Pro</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />

        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">Quote Requests</h1>
                <p className="text-xl text-indigo-100">Manage client quote requests</p>
              </div>
              <Link
                href="/admin"
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
              <h2 className="text-2xl font-bold text-gray-900">All Quote Requests ({quotes.length})</h2>
              <p className="text-gray-600 mt-1">Review and respond to client inquiries</p>
            </div>

            <div className="divide-y divide-gray-200">
              {quotes.map((quote) => (
                <div key={quote.id} className="p-6 hover:bg-gray-50 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{quote.client_name}</h3>
                        {quote.client_company && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                            {quote.client_company}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">
                        📧 <a href={`mailto:${quote.client_email}`} className="text-indigo-600 hover:underline font-medium">
                          {quote.client_email}
                        </a>
                      </p>
                      {quote.freelancer && (
                        <p className="text-sm text-gray-500 mb-2">
                          Requested Freelancer: <span className="font-semibold text-indigo-600">{quote.freelancer.display_name}</span> ({quote.freelancer.title})
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatusColor(quote.status)}`}>
                        {quote.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Project Type</p>
                      <p className="font-semibold text-gray-900">{quote.project_type.replace('-', ' ').toUpperCase()}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Budget Range</p>
                      <p className="font-semibold text-gray-900">{quote.budget_range.replace('-', ' ').toUpperCase()}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Timeline</p>
                      <p className="font-semibold text-gray-900">{quote.timeline.replace('-', ' ').toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-bold text-gray-700 mb-2">Project Description:</p>
                    <p className="text-gray-700">{quote.description}</p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <a
                      href={`mailto:${quote.client_email}?subject=Re: Quote Request for ${quote.project_type}`}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"
                    >
                      Send Quote via Email
                    </a>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold text-sm">
                      Mark as Contacted
                    </button>
                  </div>
                </div>
              ))}

              {quotes.length === 0 && (
                <div className="p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No quote requests yet</h3>
                  <p className="mt-2 text-gray-500">New requests will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const { data: quotes, error } = await supabase
      .from('quote_requests')
      .select(`
        *,
        freelancer:freelancers(display_name, title)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      props: {
        quotes: quotes || [],
      },
    }
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return {
      props: {
        quotes: [],
      },
    }
  }
}
