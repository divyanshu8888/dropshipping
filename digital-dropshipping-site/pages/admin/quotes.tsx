import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../src/components/Header';

interface QuoteRequest {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  project_title: string;
  project_description: string;
  budget?: number;
  timeline?: string;
  category: string;
  status: string;
  priority: string;
  notes?: string;
  admin_notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

interface QuotesPageProps {
  initialQuoteRequests: QuoteRequest[];
  totalPages: number;
  currentPage: number;
}

export default function QuotesPage({ initialQuoteRequests, totalPages, currentPage }: QuotesPageProps) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(initialQuoteRequests);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  const fetchQuoteRequests = async (status = selectedStatus, page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', '10');

      const response = await fetch(`/api/admin/quote-requests?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQuoteRequests(data.quoteRequests);
      }
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuoteStatus = async (id: number, status: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/admin/quote-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
          adminNotes,
        }),
      });

      if (response.ok) {
        // Refresh the quote requests
        fetchQuoteRequests();
        setSelectedQuote(null);
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Head>
        <title>Quote Requests - Admin Dashboard</title>
      </Head>
      
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Quote Requests</h1>
              <p className="text-text-soft mt-2">Manage client quote requests and project inquiries</p>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 border border-white/10 bg-white/5 text-white/80 rounded-xl hover:bg-white/10 transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              fetchQuoteRequests(e.target.value);
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Quote Requests Table */}
        <div className="bg-bg-surface rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-base">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quoteRequests.map((quote) => (
                  <tr key={quote.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{quote.client_name}</div>
                        <div className="text-sm text-text-mute">{quote.client_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{quote.project_title}</div>
                        <div className="text-sm text-text-mute truncate max-w-xs">{quote.project_description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                        {quote.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {quote.budget ? `$${quote.budget.toLocaleString()}` : 'Not specified'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(quote.status)}`}>
                        {quote.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm border ${getPriorityColor(quote.priority)}`}>
                        {quote.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-mute">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quote Details Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl mx-4 bg-bg-surface rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-2xl font-bold text-white">Quote Request Details</h2>
                  <p className="text-text-soft mt-1">#{selectedQuote.id}</p>
                </div>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-text-mute hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Client Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Client Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-text-mute">Name</label>
                        <div className="text-white">{selectedQuote.clientName}</div>
                      </div>
                      <div>
                        <label className="text-sm text-text-mute">Email</label>
                        <div className="text-white">{selectedQuote.clientEmail}</div>
                      </div>
                      {selectedQuote.clientPhone && (
                        <div>
                          <label className="text-sm text-text-mute">Phone</label>
                          <div className="text-white">{selectedQuote.clientPhone}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-text-mute">Title</label>
                        <div className="text-white">{selectedQuote.projectTitle}</div>
                      </div>
                      <div>
                        <label className="text-sm text-text-mute">Category</label>
                        <div className="text-white">{selectedQuote.category}</div>
                      </div>
                      <div>
                        <label className="text-sm text-text-mute">Budget</label>
                        <div className="text-white">{selectedQuote.budget ? `$${selectedQuote.budget.toLocaleString()}` : 'Not specified'}</div>
                      </div>
                      {selectedQuote.timeline && (
                        <div>
                          <label className="text-sm text-text-mute">Timeline</label>
                          <div className="text-white">{selectedQuote.timeline}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Project Description */}
                <div>
                  <label className="text-sm text-text-mute">Project Description</label>
                  <div className="mt-2 p-4 bg-white/5 rounded-xl text-white whitespace-pre-wrap">
                    {selectedQuote.projectDescription}
                  </div>
                </div>

                {/* Notes */}
                {selectedQuote.notes && (
                  <div>
                    <label className="text-sm text-text-mute">Client Notes</label>
                    <div className="mt-2 p-4 bg-white/5 rounded-xl text-white whitespace-pre-wrap">
                      {selectedQuote.notes}
                    </div>
                  </div>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="text-sm text-text-mute">Admin Notes</label>
                  <textarea
                    defaultValue={selectedQuote.adminNotes || ''}
                    className="w-full mt-2 p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    rows={3}
                    placeholder="Add admin notes..."
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'approved')}
                    className="px-6 py-3 bg-green-500/20 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'rejected')}
                    className="px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'in_progress')}
                    className="px-6 py-3 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                  >
                    Mark In Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    // Import supabase for server-side fetching
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ptsvsfwkxuxzwsgvqecc.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: quoteRequests, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching quote requests:', error);
      return {
        props: {
          initialQuoteRequests: [],
          totalPages: 1,
          currentPage: 1,
        },
      };
    }

    return {
      props: {
        initialQuoteRequests: quoteRequests || [],
        totalPages: 1,
        currentPage: 1,
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        initialQuoteRequests: [],
        totalPages: 1,
        currentPage: 1,
      },
    };
  }
};