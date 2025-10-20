import { useState, useEffect, useRef } from 'react'
import { GetServerSideProps } from 'next'
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
        <title>Products Management - TalentHub Pro</title>
      </Head>

      <div className="min-h-screen bg-bg-base">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Products Management</h1>
              <p className="text-text-soft mt-2">Manage your freelancer services and products</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Add New Product
              </button>
            </div>
          </div>

          <div className="bg-bg-surface rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{product.name}</div>
                        <div className="text-text-soft text-sm line-clamp-2">{product.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-accent-blue/20 text-accent-blue text-xs rounded-full">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">
                        ${(product.price / 100).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-white">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          product.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors"
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
            <div className="text-center py-16">
              <div className="text-text-soft text-lg">No products found</div>
              <p className="text-text-mute mt-2">Set up your database to get started</p>
              
              <div className="mt-6 p-6 bg-bg-surface rounded-xl border border-white/10 max-w-lg mx-auto">
                <h3 className="text-white font-semibold mb-3">Database Setup Required</h3>
                <p className="text-sm text-text-mute mb-4">
                  You need to create the products table and insert sample data first.
                </p>
                <Link href="/admin/setup">
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                    Go to Database Setup
                  </button>
                </Link>
                <p className="text-xs text-text-mute mt-3">
                  This will create the products table and insert 10 sample products
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Product Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-bg-surface rounded-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
                    className="text-text-mute hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:border-accent-blue focus:outline-none"
                        placeholder="Enter product name"
                      />
                      {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Category</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-accent-blue focus:outline-none"
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:border-accent-blue focus:outline-none"
                      placeholder="Enter product description"
                    />
                    {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Price ($)</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:border-accent-blue focus:outline-none"
                        placeholder="0.00"
                      />
                      {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Stock</label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-mute focus:border-accent-blue focus:outline-none"
                        placeholder="0"
                      />
                      {errors.stock && <p className="text-red-400 text-sm mt-1">{errors.stock}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Product Image</label>
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
                          className="px-4 py-2 bg-accent-blue/20 text-accent-blue rounded-lg hover:bg-accent-blue/30 transition-colors disabled:opacity-50"
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                      </div>
                      {errors.image_url && <p className="text-red-400 text-sm mt-1">{errors.image_url}</p>}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-accent-blue bg-white/5 border-white/10 rounded focus:ring-accent-blue"
                    />
                    <label className="ml-2 text-sm text-white">Active Product</label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
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
                      className="px-6 py-3 text-text-mute hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAction}
                      className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 disabled:opacity-50"
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
