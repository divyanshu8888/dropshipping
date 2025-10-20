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
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200'
      case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PENDING': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Orders Management - Admin Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
        <Header />

        {/* Hero */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-extrabold mb-2">🛒 Orders Management</h1>
                <p className="text-xl text-indigo-100">Manage customer orders and fulfillment</p>
              </div>
              <Link
                href="/admin"
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex space-x-4">
              {(['all', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filter === status
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Orders' : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Orders ({filteredOrders.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-bold text-gray-900">#{order.id}</div>
                          <div className="text-sm text-gray-500">{order.customerAddress}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-indigo-600 hover:text-indigo-900 font-semibold"
                          >
                            View
                          </button>
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                              className="text-yellow-600 hover:text-yellow-900 font-semibold"
                            >
                              Process
                            </button>
                          )}
                          {order.status === 'PROCESSING' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                              className="text-blue-600 hover:text-blue-900 font-semibold"
                            >
                              Ship
                            </button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                              className="text-green-600 hover:text-green-900 font-semibold"
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">No orders match your current filter.</p>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Customer Name</label>
                      <p className="text-gray-900 text-lg">{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedOrder.customerEmail}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Shipping Address</label>
                      <p className="text-gray-900">{selectedOrder.customerAddress}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Order Date</label>
                      <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Total Amount</label>
                      <p className="text-2xl font-bold text-green-600">${selectedOrder.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700">Status</label>
                      <span className={`px-3 py-1 text-sm font-bold rounded-full border-2 ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => { updateOrderStatus(selectedOrder.id, 'PROCESSING'); setSelectedOrder(null); }}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-bold"
                    >
                      Mark as Processing
                    </button>
                  )}
                  {selectedOrder.status === 'PROCESSING' && (
                    <button
                      onClick={() => { updateOrderStatus(selectedOrder.id, 'SHIPPED'); setSelectedOrder(null); }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
                    >
                      Mark as Shipped
                    </button>
                  )}
                  {selectedOrder.status === 'SHIPPED' && (
                    <button
                      onClick={() => { updateOrderStatus(selectedOrder.id, 'DELIVERED'); setSelectedOrder(null); }}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(null)}
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
  return {
    props: {},
  };
};