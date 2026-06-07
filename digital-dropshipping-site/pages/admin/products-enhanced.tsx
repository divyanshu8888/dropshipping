import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Header from '../../src/components/Header'

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export default function ProductsManagement() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    stock: '',
    is_active: true
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

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
    fetchProducts()
  }, [router])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data || [])
      } else {
        console.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, image_url: data.imageUrl }))
        return data.imageUrl
      } else {
        throw new Error('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.image_url.trim()) newErrors.image_url = 'Image is required'
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoadingAction(true)
    
    try {
      const productData = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        stock: parseInt(formData.stock)
      }
      
      const url = selectedProduct ? `/api/products?id=${selectedProduct.id}` : '/api/products'
      const method = selectedProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })
      
      if (response.ok) {
        await fetchProducts()
        setShowAddModal(false)
        setShowEditModal(false)
        setSelectedProduct(null)
        setFormData({
          name: '',
          description: '',
          price: '',
          category: '',
          image_url: '',
          stock: '',
          is_active: true
        })
        setErrors({})
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setLoadingAction(false)
    }
  }

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: (product.price / 100).toString(), // Convert from cents
      category: product.category,
      image_url: product.image_url,
      stock: product.stock.toString(),
      is_active: product.is_active
    })
    setShowEditModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchProducts()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }


  const categories = [
    'Web Development',
    'Mobile Development',
    'Graphic Design',
    'Content Writing',
    'Digital Marketing',
    'E-commerce',
    'UI/UX Design',
    'Data Analysis',
    'Video Production',
    'SEO',
    'Translation',
    'Consulting',
    'Social Media',
    'Database',
    'Photography',
    'Email Marketing',
    'DevOps',
    'Voice Over'
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Products Management - Unitiv</title>
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        {/* Hero Header */}
        <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(120%_150%_at_50%_-20%,rgba(6,182,212,0.15)_0%,rgba(15,15,20,1)_65%)] pt-28 pb-12">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/60">
                  Products
                </span>
                <h1 className="font-display text-3xl text-white">Manage <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">Products</span></h1>
                <p className="text-sm text-white/60">Manage your freelancer services and products</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg"
                >
                  + Add New Product
                </button>
                <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition">
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-bg-surface rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Image</th>
                    <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Name</th>
                    <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Category</th>
                    <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Price</th>
                    <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Stock</th>
                    <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Status</th>
                    <th className="text-xs uppercase tracking-widest text-white/40 py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4 text-sm text-white/80">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-xl border border-white/10"
                        />
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        <div className="text-white font-medium">{product.name}</div>
                        <div className="text-white/40 text-xs line-clamp-2 max-w-xs">{product.description}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-white">
                        ${(product.price / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        {product.stock}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        {product.is_active ? (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">Active</span>
                        ) : (
                          <span className="rounded-full bg-rose-500/15 border border-rose-500/20 px-2.5 py-0.5 text-xs font-semibold text-rose-300">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-white/80">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:from-cyan-300 hover:to-blue-400 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {products.length === 0 && (
            <div className="mt-6">
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-white/40">
                <div className="text-base font-medium text-white/50 mb-1">No products found</div>
                <p className="text-white/30 mb-6">Set up your database to get started</p>
                <div className="max-w-sm mx-auto rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <h3 className="text-white font-semibold mb-2 text-left">Database Setup Required</h3>
                  <p className="text-xs text-white/40 mb-4 text-left">
                    You need to create the products table and insert sample data first.
                  </p>
                  <Link href="/admin/setup">
                    <button className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg">
                      Go to Database Setup
                    </button>
                  </Link>
                  <p className="text-xs text-white/30 mt-3">
                    This will create the products table and insert 10 sample products
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Product Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#0F1115] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false)
                      setShowEditModal(false)
                      setSelectedProduct(null)
                      setFormData({
                        name: '',
                        description: '',
                        price: '',
                        category: '',
                        image_url: '',
                        stock: '',
                        is_active: true
                      })
                      setErrors({})
                    }}
                    className="text-white/40 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        placeholder="Enter product name"
                      />
                      {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-rose-400 text-xs mt-1">{errors.category}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                      placeholder="Enter product description"
                    />
                    {errors.description && <p className="text-rose-400 text-xs mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        placeholder="0.00"
                      />
                      {errors.price && <p className="text-rose-400 text-xs mt-1">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        className="bg-white/5 border border-white/10 rounded-xl text-white px-4 py-2.5 placeholder:text-white/30 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition w-full"
                        placeholder="0"
                      />
                      {errors.stock && <p className="text-rose-400 text-xs mt-1">{errors.stock}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Product Image</label>
                    <div className="space-y-4">
                      {formData.image_url && (
                        <div className="relative">
                          <img
                            src={formData.image_url}
                            alt="Product preview"
                            className="w-32 h-32 object-cover rounded-xl border border-white/10"
                          />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                      {errors.image_url && <p className="text-rose-400 text-xs mt-1">{errors.image_url}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-cyan-400 bg-white/5 border-white/10 rounded"
                    />
                    <label className="text-sm text-white/70">Active Product</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false)
                        setShowEditModal(false)
                        setSelectedProduct(null)
                        setFormData({
                          name: '',
                          description: '',
                          price: '',
                          category: '',
                          image_url: '',
                          stock: '',
                          is_active: true
                        })
                        setErrors({})
                      }}
                      className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="inline-flex items-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-2.5 text-sm font-semibold text-slate-900 hover:from-cyan-300 hover:to-blue-400 transition-all shadow-lg disabled:opacity-50"
                    >
                      {loadingAction ? 'Saving...' : (selectedProduct ? 'Update Product' : 'Add Product')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
