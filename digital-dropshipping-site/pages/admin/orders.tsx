import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../../src/components/Header'

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

export default function OrdersManagement() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    // Check if user is logged in and is an admin
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }

    const userObj = JSON.parse(userData)
    if (userObj.role !== 'ADMIN' && userObj.role !== 'TEAM_MEMBER') {
      router.push('/admin')
      return
    }

    setLoading(false)
    fetchOrders()
  }, [router])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })

      if (response.ok) {
        fetchOrders()
        setSelectedOrder(null)
      } else {
        alert('Failed to update order status')
      }
    } catch (error) {
      alert('Error updating order status')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
      case 'SHIPPED': return 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
      case 'PROCESSING': return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
      case 'PENDING': return 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
      default: return 'bg-white/10 text-white/50 border border-white/10'
    }
  }

  const filteredOrders = orders.filter(order =>
    filter === 'all' || order.status === filter
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Orders Management - Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-[#0B0D10]">
        <Header />

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_150%_at_50%_-20%,rgba(6,182,212,0.12)_0%,rgba(15,15,20,1)_65%)] pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">Orders Management</h1>
                <p className="text-lg text-white/70">Manage customer orders and fulfillment</p>
              </div>
              <Link
                href="/admin"
                className="rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 py-2 hover:bg-white/10 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 mb-8">
            <div className="flex flex-wrap gap-3">
              {(['all', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-2xl font-semibold transition-all ${
                    filter === status
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900'
                      : 'rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Orders ({filteredOrders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">Order</th>
                    <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">Customer</th>
                    <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">Total</th>
                    <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">Status</th>
                    <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">Date</th>
                    <th className="bg-white/5 text-xs uppercase tracking-widest text-white/40 px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-white">#{order.id}</div>
                          <div className="text-sm text-white/50">{order.customerAddress}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{order.customerName}</div>
                          <div className="text-sm text-white/50">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        ${order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white/70">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-xl border border-white/10 bg-white/5 text-white/70 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 transition"
                          >
                            View
                          </button>
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition"
                            >
                              Process
                            </button>
                          )}
                          {order.status === 'PROCESSING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition"
                            >
                              Ship
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition"
                            >
                              Deliver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
              <p className="text-white/50">No orders match your current filter.</p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="rounded-2xl border border-white/10 bg-[#0B0D10] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-white">Order #{selectedOrder.id}</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white/40 hover:text-white/70 text-2xl transition"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Customer Name</label>
                      <p className="text-white text-lg">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                      <p className="text-white">{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Shipping Address</label>
                      <p className="text-white">{selectedOrder.customerAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Order Date</label>
                      <p className="text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Total Amount</label>
                      <p className="text-2xl font-bold text-emerald-400">${selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1.5">Status</label>
                      <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => { updateOrderStatus(selectedOrder.id, 'PROCESSING'); setSelectedOrder(null); }}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold hover:bg-amber-500/25 transition"
                    >
                      Mark as Processing
                    </button>
                  )}
                  {selectedOrder.status === 'PROCESSING' && (
                    <button
                      onClick={() => { updateOrderStatus(selectedOrder.id, 'SHIPPED'); setSelectedOrder(null); }}
                      className="px-5 py-2.5 rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold hover:bg-cyan-500/25 transition"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'SHIPPED' && (
                    <button
                      onClick={() => { updateOrderStatus(selectedOrder.id, 'DELIVERED'); setSelectedOrder(null); }}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-xl border border-white/10 bg-white/5 text-white/70 px-5 py-2.5 hover:bg-white/10 transition font-bold"
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
  return {
    props: {},
  };
};
