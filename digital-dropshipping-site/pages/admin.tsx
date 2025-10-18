import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../src/components/Header'
import { supabase } from '../src/lib/supabase'

interface Freelancer {
  id: string;
  display_name: string;
  title: string;
  country: string;
  skills: string[];
  hourly_rate: number;
  base_fee: number;
  contact_email: string;
  contact_phone: string | null;
  rating: number;
  total_reviews: number;
  completed_projects: number;
  status: string;
  created_at: string;
}

interface AdminProps {
  freelancers: Freelancer[];
  pendingCount: number;
  approvedCount: number;
  quoteRequests: number;
}

export default function AdminDashboard({ freelancers, pendingCount, approvedCount, quoteRequests }: AdminProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(null)

  const filteredFreelancers = freelancers.filter(f => filter === 'all' || f.status === filter)

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/freelancers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })

      if (response.ok) {
        alert(`Freelancer ${status} successfully!`)
        window.location.reload()
      } else {
        alert('Error updating freelancer')
      }
    } catch (error) {
      alert('Error updating freelancer')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - TalentHub Pro</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">Admin Dashboard</h1>
                <p className="text-xl text-indigo-100">Manage freelancer applications and platform</p>
              </div>
              <Link
                href="/admin/quotes"
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                View Quote Requests ({quoteRequests})
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Applications', value: freelancers.length, color: 'from-blue-500 to-cyan-500', icon: '👥' },
              { label: 'Pending Review', value: pendingCount, color: 'from-yellow-500 to-orange-500', icon: '⏳' },
              { label: 'Approved', value: approvedCount, color: 'from-green-500 to-emerald-500', icon: '✅' },
              { label: 'Quote Requests', value: quoteRequests, color: 'from-purple-500 to-pink-500', icon: '💬' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 transform hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Admin Navigation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Sections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/products"
                className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl text-white mr-4">
                  📦
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Products</h3>
                  <p className="text-sm text-gray-600">Add, edit, and manage store products</p>
                </div>
              </Link>
              
              <Link
                href="/admin/orders"
                className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-2xl text-white mr-4">
                  🛒
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Orders</h3>
                  <p className="text-sm text-gray-600">View and update order status</p>
                </div>
              </Link>
              
              <Link
                href="/admin/quotes"
                className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl text-white mr-4">
                  💬
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quote Requests</h3>
                  <p className="text-sm text-gray-600">Manage client quote requests</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex space-x-4">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filter === status
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Freelancers Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Freelancer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Skills</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hourly Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Min Fee</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFreelancers.map((freelancer) => (
                    <tr key={freelancer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {freelancer.display_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{freelancer.display_name}</div>
                            <div className="text-sm text-gray-500">{freelancer.title}</div>
                            <div className="text-xs text-gray-400">{freelancer.contact_email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{freelancer.country}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {freelancer.skills.slice(0, 2).map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                          {freelancer.skills.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{freelancer.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${(freelancer.hourly_rate / 100).toFixed(0)}/hr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${(freelancer.base_fee / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatusColor(freelancer.status)}`}>
                          {freelancer.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedFreelancer(freelancer)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                          >
                            View
                          </button>
                          {freelancer.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(freelancer.id, 'approved')}
                                className="text-green-600 hover:text-green-900 font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(freelancer.id, 'rejected')}
                                className="text-red-600 hover:text-red-900 font-semibold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selectedFreelancer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Freelancer Details</h2>
                  <button
                    onClick={() => setSelectedFreelancer(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Name</label>
                      <p className="text-gray-900 text-lg">{selectedFreelancer.display_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedFreelancer.contact_email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedFreelancer.contact_phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Hourly Rate</label>
                      <p className="text-2xl font-bold text-indigo-600">${(selectedFreelancer.hourly_rate / 100).toFixed(0)}/hour</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Minimum Project Fee</label>
                      <p className="text-2xl font-bold text-green-600">${(selectedFreelancer.base_fee / 100).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Country</label>
                      <p className="text-gray-900">{selectedFreelancer.country}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Status</label>
                      <span className={`px-3 py-1 text-sm font-bold rounded-full border-2 ${getStatusColor(selectedFreelancer.status)}`}>
                        {selectedFreelancer.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Skills</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedFreelancer.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  {selectedFreelancer.status === 'pending' && (
                    <>
                      <button
                        onClick={() => { updateStatus(selectedFreelancer.id, 'approved'); setSelectedFreelancer(null); }}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { updateStatus(selectedFreelancer.id, 'rejected'); setSelectedFreelancer(null); }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedFreelancer(null)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch all freelancers (including private data)
    const { data: freelancers, error } = await supabase
      .from('freelancers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get counts
    const { count: quoteCount } = await supabase
      .from('quote_requests')
      .select('*', { count: 'exact', head: true })

    const pendingCount = freelancers?.filter(f => f.status === 'pending').length || 0
    const approvedCount = freelancers?.filter(f => f.status === 'approved').length || 0

    return {
      props: {
        freelancers: freelancers || [],
        pendingCount,
        approvedCount,
        quoteRequests: quoteCount || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching admin data:', error)
    return {
      props: {
        freelancers: [],
        pendingCount: 0,
        approvedCount: 0,
        quoteRequests: 0,
      },
    }
  }
}
