import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../src/components/Header';
import { query } from '../../src/lib/mysql';

interface QuoteRequest {
  id: number;
  client_name: string;
  client_email: string;
  client_phone?: string | null;
  phone_country?: string | null;
  project_title: string;
  project_description: string;
  budget?: number | null;
  timeline?: string | null;
  category: string;
  status: string;
  priority: string;
  notes?: string | null;
  admin_notes?: string | null;
  assigned_to?: string | null;
  attachments?: Array<{ url: string; originalName: string; storedName: string; size: number; type?: string | null }>;
  created_at: string;
  updated_at: string;
}

interface QuotesPageProps {
  initialQuoteRequests: QuoteRequest[];
}

export default function QuotesPage({ initialQuoteRequests }: QuotesPageProps) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>(initialQuoteRequests);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState('');

  const fetchQuoteRequests = async (status = selectedStatus, page = 1) => {
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
        const data = await response.json();
        if (data.quoteRequest) {
          setQuoteRequests((prev) =>
            prev.map((quote) => (quote.id === data.quoteRequest.id ? { ...quote, ...data.quoteRequest } : quote)),
          );
          setSelectedQuote((prev) => (prev ? { ...prev, ...data.quoteRequest } : prev));
        } else {
          setSelectedQuote((prev) => (prev ? { ...prev, status } : prev));
        }
      }
    } catch (error) {
      console.error('Error updating quote status:', error);
    }
  };

  useEffect(() => {
    if (selectedQuote) {
      setAdminNotesDraft(selectedQuote.admin_notes ?? '');
    } else {
      setAdminNotesDraft('');
    }
  }, [selectedQuote]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="rounded-full bg-amber-500/15 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">{status.replace('_', ' ')}</span>;
      case 'approved':
        return <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">{status.replace('_', ' ')}</span>;
      case 'rejected':
        return <span className="rounded-full bg-rose-500/15 border border-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-300">{status.replace('_', ' ')}</span>;
      case 'in_progress':
        return <span className="rounded-full bg-cyan-500/15 border border-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">in progress</span>;
      case 'completed':
        return <span className="rounded-full bg-blue-500/15 border border-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-300">{status.replace('_', ' ')}</span>;
      default:
        return <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/50">{status.replace('_', ' ')}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-bg-base">
      <Head>
        <title>Quote Requests - Admin Dashboard</title>
      </Head>

      <Header />

      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_150%_at_50%_-20%,rgba(6,182,212,0.15)_0%,rgba(15,15,20,1)_65%)] pt-28 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/60">
                Quote Requests
              </span>
              <h1 className="font-display text-3xl text-white">Manage <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Quote Requests</span></h1>
              <p className="text-sm text-white/60">Review and respond to client project inquiries</p>
            </div>
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              fetchQuoteRequests(e.target.value);
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/40 focus:outline-none transition"
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
        <div className="bg-bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Client</th>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Project</th>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Category</th>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Budget</th>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Status</th>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Priority</th>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Date</th>
                  <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quoteRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-white/40 m-4">
                        No quote requests found
                      </div>
                    </td>
                  </tr>
                ) : (
                  quoteRequests.map((quote) => (
                    <tr key={quote.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-sm text-white/80">
                        <div>
                          <div className="font-medium text-white">{quote.client_name}</div>
                          <div className="text-xs text-white/40">{quote.client_email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        <div>
                          <div className="font-medium text-white">{quote.project_title}</div>
                          <div className="text-xs text-white/40 truncate max-w-xs">{quote.project_description}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        <span className="rounded-full bg-white/10 border border-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70">
                          {quote.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        {quote.budget ? `$${quote.budget.toLocaleString()}` : 'Not specified'}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        {getStatusBadge(quote.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(quote.priority)}`}>
                          {quote.priority}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/40">
                        {new Date(quote.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:from-cyan-300 hover:to-blue-400 transition-all"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quote Details Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl mx-4 bg-[#0F1115] rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                        <div className="text-white">{selectedQuote.client_name}</div>
                      </div>
                      <div>
                        <label className="text-sm text-text-mute">Email</label>
                        <div className="text-white">{selectedQuote.client_email}</div>
                      </div>
                      {selectedQuote.client_phone && (
                        <div>
                          <label className="text-sm text-text-mute">Phone</label>
                          <div className="text-white">{selectedQuote.client_phone}</div>
                          {selectedQuote.phone_country && (
                            <p className="text-xs text-text-mute">Country code: {selectedQuote.phone_country}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-text-mute">Title</label>
                        <div className="text-white">{selectedQuote.project_title}</div>
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
                    {selectedQuote.project_description}
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
                    value={adminNotesDraft}
                    onChange={(event) => setAdminNotesDraft(event.target.value)}
                    className="w-full mt-2 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition resize-none"
                    rows={3}
                    placeholder="Add admin notes..."
                  />
                </div>

                {selectedQuote.attachments && selectedQuote.attachments.length > 0 && (
                  <div>
                    <label className="text-sm text-text-mute">Attachments</label>
                    <ul className="mt-2 space-y-2">
                      {selectedQuote.attachments.map((file) => (
                        <li key={file.storedName} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate underline-offset-2 hover:underline"
                          >
                            {file.originalName}
                          </a>
                          <span className="text-xs text-white/50">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'approved', adminNotesDraft)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-400 hover:to-green-400 transition-all shadow-lg"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'rejected', adminNotesDraft)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => updateQuoteStatus(selectedQuote.id, 'in_progress', adminNotesDraft)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition-all"
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

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const rows = await query<any>(
      `SELECT * FROM project_leads ORDER BY created_at DESC LIMIT 10`,
    );

    const formatted: QuoteRequest[] = rows.map((row: any) => ({
      ...row,
      budget: row.budget !== null ? Number(row.budget) : null,
      attachments: row.attachments ? JSON.parse(row.attachments) : [],
    }));

    return {
      props: {
        initialQuoteRequests: formatted,
        totalPages: 1,
        currentPage: 1,
      },
    };
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    return {
      props: {
        initialQuoteRequests: [],
        totalPages: 1,
        currentPage: 1,
      },
    };
  }
};