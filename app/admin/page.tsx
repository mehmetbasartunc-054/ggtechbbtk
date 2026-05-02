"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, X, Image as ImageIcon, Loader2, Upload, LogOut } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { uploadImage } from "@/lib/supabase-admin"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Product {
  id: number
  name: string
  price: number
  image: string
  brand: string
  vibe?: string
  sex?: string
  created_at?: string
}

const VIBE_OPTIONS = [
  { value: "sahil", label: "Sahil", color: "from-sky-500 to-cyan-400" },
  { value: "tracking", label: "Tracking", color: "from-emerald-500 to-green-400" },
  { value: "spor", label: "Spor", color: "from-orange-500 to-red-400" },
]

export default function AdminPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    brand: "",
    vibe: "sahil",
    sex: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      router.push("/auth/login")
      return
    }

    // Hesap türü kontrolü - sadece ticari hesaplar admin paneline girebilir
    const accountType = user.user_metadata?.account_type
    if (accountType !== 'ticari') {
      alert("Bu sayfaya sadece ticari (satıcı) hesaplar erişebilir.")
      router.push("/")
      return
    }

    setUser({ email: user.email! })
    fetchProducts()
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProducts(data)
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success("Logged out successfully")
    router.push("/auth/login/seller")
  }

  function resetForm() {
    setFormData({ name: "", price: "", image: "", brand: "", vibe: "sahil", sex: "" })
    setImageFile(null)
    setImagePreview("")
    setShowForm(false)
    setEditingProduct(null)
  }

  function startEdit(product: Product) {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      brand: product.brand,
      vibe: product.vibe || "sahil",
      sex: product.sex || "",
    })
    setImagePreview(product.image)
    setImageFile(null)
    setShowForm(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      let imageUrl = formData.image

      if (imageFile) {
        setUploading(true)
        imageUrl = await uploadImage(imageFile)
        setUploading(false)
      }

      if (!imageUrl) {
        toast.error("Please provide an image or upload one")
        setSubmitting(false)
        return
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageUrl,
        brand: formData.brand,
        vibe: formData.vibe,
        sex: formData.sex || null,
      }

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)

        if (error) throw error
        toast.success("Product updated successfully")
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData)

        if (error) throw error
        toast.success("Product added successfully")
      }

      resetForm()
      fetchProducts()
    } catch (error: any) {
      console.error("Supabase Admin Hata Detayı:", error);
      toast.error(error?.message || error?.details || "Bir hata oluştu (Konsolu kontrol et)")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)

      if (error) throw error
      toast.success("Product deleted successfully")
      fetchProducts()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred")
    }
  }

  if (!user) {
    return (
      <div className="relative pt-24 pb-20 px-4 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.65_0.25_295)]" />
      </div>
    )
  }

  return (
    <div className="relative pt-24 pb-20 px-4">
      {/* Back button and user info */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-[oklch(0.7_0_0)] hover:text-[oklch(0.65_0.25_295)] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to store</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[oklch(0.55_0_0)]">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] text-[oklch(0.7_0_0)] hover:text-red-400 hover:border-red-400/50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[oklch(0.95_0_0)]">
              Admin <span className="text-[oklch(0.65_0.25_295)]">Panel</span>
            </h1>
            <p className="text-[oklch(0.55_0_0)] mt-1">Manage your products</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white font-medium hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={resetForm} />
          <div className="relative w-full max-w-lg rounded-2xl bg-[oklch(0.12_0.02_280_/_0.95)] backdrop-blur-xl border border-[oklch(0.25_0.03_280_/_0.5)] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[oklch(0.95_0_0)]">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={resetForm}
                className="w-8 h-8 rounded-full bg-[oklch(0.15_0.02_280)] flex items-center justify-center text-[oklch(0.7_0_0)] hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[oklch(0.7_0_0)] mb-1.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.4_0_0)] focus:outline-none focus:border-[oklch(0.65_0.25_295)] transition-colors"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[oklch(0.7_0_0)] mb-1.5">Brand</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.4_0_0)] focus:outline-none focus:border-[oklch(0.65_0.25_295)] transition-colors"
                    placeholder="Brand name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[oklch(0.7_0_0)] mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.4_0_0)] focus:outline-none focus:border-[oklch(0.65_0.25_295)] transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[oklch(0.7_0_0)] mb-1.5">Cinsiyet (Sex)</label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] text-[oklch(0.95_0_0)] focus:outline-none focus:border-[oklch(0.65_0.25_295)] transition-colors"
                  >
                    <option value="">Seçiniz</option>
                    <option value="unisex">Unisex</option>
                    <option value="kadin">Kadın</option>
                    <option value="erkek">Erkek</option>
                  </select>
                </div>
              </div>

              {/* Vibe/Kategori Seçimi */}
              <div>
                <label className="block text-sm text-[oklch(0.7_0_0)] mb-1.5">Kategori / Vibe</label>
                <div className="grid grid-cols-3 gap-2">
                  {VIBE_OPTIONS.map((vibe) => (
                    <button
                      key={vibe.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, vibe: vibe.value })}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                        formData.vibe === vibe.value
                          ? `bg-gradient-to-r ${vibe.color} text-white border-transparent`
                          : "bg-[oklch(0.15_0.02_280)] border-[oklch(0.25_0.03_280)] text-[oklch(0.7_0_0)] hover:text-white"
                      }`}
                    >
                      {vibe.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm text-[oklch(0.7_0_0)] mb-1.5">Product Image</label>
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[oklch(0.25_0.03_280)] hover:border-[oklch(0.65_0.25_295)] transition-colors cursor-pointer bg-[oklch(0.15_0.02_280)]">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-[oklch(0.65_0.25_295)]" />
                        <span className="text-sm text-[oklch(0.55_0_0)]">Uploading...</span>
                      </div>
                    ) : imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Upload className="w-6 h-6 text-[oklch(0.4_0_0)]" />
                        <span className="text-sm text-[oklch(0.55_0_0)]">Click to upload image</span>
                        <span className="text-xs text-[oklch(0.4_0_0)]">PNG, JPG, WEBP up to 5MB</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.4_0_0)]" />
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData({ ...formData, image: e.target.value })
                        if (!imageFile) {
                          setImagePreview(e.target.value)
                        }
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.4_0_0)] focus:outline-none focus:border-[oklch(0.65_0.25_295)] transition-colors"
                      placeholder="Or paste image URL"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] text-[oklch(0.7_0_0)] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white font-medium hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingProduct ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    editingProduct ? "Update Product" : "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.65_0.25_295)]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 text-[oklch(0.25_0.02_280)] mx-auto mb-4" />
            <p className="text-[oklch(0.55_0_0)] text-lg">No products yet</p>
            <p className="text-[oklch(0.4_0_0)] text-sm mt-1">Click &quot;Add Product&quot; to get started</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-[oklch(0.12_0.02_280_/_0.9)] backdrop-blur-lg border border-[oklch(0.25_0.03_280_/_0.5)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[oklch(0.25_0.03_280_/_0.5)]">
                    <th className="text-left px-6 py-4 text-sm text-[oklch(0.55_0_0)] font-medium uppercase tracking-wider">Product</th>
                    <th className="text-left px-6 py-4 text-sm text-[oklch(0.55_0_0)] font-medium uppercase tracking-wider">Brand</th>
                    <th className="text-left px-6 py-4 text-sm text-[oklch(0.55_0_0)] font-medium uppercase tracking-wider">Vibe</th>
                    <th className="text-left px-6 py-4 text-sm text-[oklch(0.55_0_0)] font-medium uppercase tracking-wider">Price</th>
                    <th className="text-right px-6 py-4 text-sm text-[oklch(0.55_0_0)] font-medium uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const vibeOption = VIBE_OPTIONS.find(v => v.value === product.vibe)
                    return (
                    <tr
                      key={product.id}
                      className="border-b border-[oklch(0.25_0.03_280_/_0.3)] hover:bg-[oklch(0.15_0.02_280_/_0.5)] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[oklch(0.15_0.02_280)] flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none"
                              }}
                            />
                          </div>
                          <span className="text-[oklch(0.9_0_0)] font-medium line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[oklch(0.7_0_0)]">{product.brand}</td>
                      <td className="px-6 py-4">
                        {vibeOption ? (
                          <span className={`px-2.5 py-1 rounded-full bg-gradient-to-r ${vibeOption.color} text-white text-xs font-medium`}>
                            {vibeOption.label}
                          </span>
                        ) : (
                          <span className="text-[oklch(0.4_0_0)]">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[oklch(0.7_0.15_295)] font-semibold">${product.price}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="w-9 h-9 rounded-lg bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] flex items-center justify-center text-[oklch(0.7_0_0)] hover:text-[oklch(0.65_0.25_295)] hover:border-[oklch(0.65_0.25_295_/_0.5)] transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="w-9 h-9 rounded-lg bg-[oklch(0.15_0.02_280)] border border-[oklch(0.25_0.03_280)] flex items-center justify-center text-[oklch(0.7_0_0)] hover:text-red-400 hover:border-red-400/50 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
