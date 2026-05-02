"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Package, Search, LogOut, Loader2, Eye, Clock, Truck, CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AmbientBackground } from "@/components/ambient-background"

function generateOrderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "VC-"
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const statusMap: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "Beklemede", icon: Clock, color: "text-yellow-400" },
  processing: { label: "Hazırlanıyor", icon: Truck, color: "text-blue-400" },
  shipped: { label: "Kargoda", icon: Truck, color: "text-purple-400" },
  delivered: { label: "Teslim Edildi", icon: CheckCircle, color: "text-emerald-400" },
  cancelled: { label: "İptal Edildi", icon: XCircle, color: "text-red-400" },
}

interface Order {
  id: number
  order_code: string
  status: string
  total: number
  full_name: string
  email: string
  address: string
  created_at: string
}

interface OrderItem {
  id: number
  product_name: string
  quantity: number
  price: number
}

export default function OrdersPage() {
  const [user, setUser] = useState<{ email: string; id: string } | null>(null)
  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCode, setSearchCode] = useState("")
  const [trackResult, setTrackResult] = useState<Order | null>(null)
  const [trackItems, setTrackItems] = useState<OrderItem[]>([])
  const [trackLoading, setTrackLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([])
  const [viewLoading, setViewLoading] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser({ email: user.email!, id: user.id })
      fetchUserOrders(user.id)
    } else {
      setLoading(false)
    }
  }

  async function fetchUserOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!error && data) setUserOrders(data)
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    setUserOrders([])
  }

  async function handleTrackOrder() {
    if (!searchCode.trim()) return
    setTrackLoading(true)
    setTrackResult(null)
    setTrackItems([])

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_code", searchCode.trim().toUpperCase())
      .single()

    if (error || !order) {
      setTrackLoading(false)
      return
    }

    setTrackResult(order)

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)

    setTrackItems(items || [])
    setTrackLoading(false)
  }

  async function handleViewOrder(order: Order) {
    setViewLoading(true)
    setSelectedOrder(order)
    setSelectedItems([])

    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)

    setSelectedItems(items || [])
    setViewLoading(false)
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AmbientBackground />
        <Loader2 className="w-8 h-8 animate-spin text-[oklch(0.65_0.25_295)]" />
      </div>
    )
  }

  return (
    <main className="relative min-h-screen bg-[#09090b]">
      <AmbientBackground />

      {/* Header */}
      <div className="relative z-10 max-w-4xl mx-auto pt-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Ana Sayfaya Dön</span>
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500">{user.email}</span>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-400/50 transition-all">
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-xs">Çıkış</span>
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Sipariş<span className="text-[oklch(0.65_0.25_295)]">lerim</span>
          </h1>
          <p className="text-zinc-500">Siparişlerini takip et ve yönet</p>
        </div>

        {/* Sipariş Kodu ile Takip */}
        {!user && (
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[oklch(0.65_0.25_295)]" />
              Sipariş Takibi
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Sipariş kodunu gir (örn: VC-A3B7K9M2)"
                className="flex-1 h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:border-[oklch(0.65_0.25_295)] outline-none transition-all uppercase"
                maxLength={11}
              />
              <button
                onClick={handleTrackOrder}
                disabled={trackLoading || !searchCode}
                className="px-6 h-12 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white font-semibold disabled:opacity-50 hover:scale-105 transition-transform flex items-center gap-2"
              >
                {trackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Takip Et
              </button>
            </div>

            {trackResult && (
              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-bold">{trackResult.order_code}</p>
                    <p className="text-zinc-500 text-sm">{new Date(trackResult.created_at).toLocaleDateString("tr-TR")}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 ${statusMap[trackResult.status]?.color || "text-zinc-400"}`}>
                    {(() => { const S = statusMap[trackResult.status]?.icon || Clock; return <S className="w-4 h-4" /> })()}
                    <span className="text-sm font-medium">{statusMap[trackResult.status]?.label || trackResult.status}</span>
                  </div>
                </div>
                {trackItems.length > 0 && (
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    {trackItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-zinc-400">{item.product_name} x{item.quantity}</span>
                        <span className="text-white">₺{item.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10">
                      <span>Toplam</span>
                      <span>₺{trackResult.total}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Giriş yapmamış kullanıcılar için login butonu */}
        {!user && (
          <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
            <Package className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">Sipariş giriş yapmak için hesabına giriş yap</p>
            <Link href="/auth/login/user" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white font-semibold hover:scale-105 transition-transform">
              Giriş Yap
            </Link>
          </div>
        )}

        {/* Giriş yapmış kullanıcılar için sipariş listesi */}
        {user && (
          <div className="space-y-4">
            {userOrders.length === 0 ? (
              <div className="text-center p-12 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
                <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg">Henüz siparişin yok</p>
                <p className="text-zinc-600 text-sm mt-1">Alışverişe başlayarak ilk siparişini oluştur</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-4">{userOrders.length} Sipariş</h2>
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    onClick={() => handleViewOrder(order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-bold">{order.order_code}</p>
                          <p className="text-zinc-500 text-sm">{new Date(order.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-1.5 ${statusMap[order.status]?.color || "text-zinc-400"}`}>
                          {(() => { const S = statusMap[order.status]?.icon || Clock; return <S className="w-4 h-4" /> })()}
                          <span className="text-sm font-medium">{statusMap[order.status]?.label || order.status}</span>
                        </div>
                        <p className="text-white font-bold">₺{order.total}</p>
                        <Eye className="w-4 h-4 text-zinc-500" />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
            <div className="relative w-full max-w-lg rounded-2xl bg-[oklch(0.12_0.02_280_/_0.95)] backdrop-blur-xl border border-[oklch(0.25_0.03_280_/_0.5)] p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedOrder.order_code}</h2>
                  <p className="text-zinc-500 text-sm">{new Date(selectedOrder.created_at).toLocaleDateString("tr-TR")}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-black/40">
                {(() => { const S = statusMap[selectedOrder.status]?.icon || Clock; return <S className={`w-5 h-5 ${statusMap[selectedOrder.status]?.color}`} /> })()}
                <span className={`font-medium ${statusMap[selectedOrder.status]?.color}`}>{statusMap[selectedOrder.status]?.label}</span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Adres</span>
                  <span className="text-zinc-300 text-right max-w-[60%]">{selectedOrder.address}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Email</span>
                  <span className="text-zinc-300">{selectedOrder.email}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Ürünler</h3>
                {viewLoading ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[oklch(0.65_0.25_295)]" /></div>
                ) : selectedItems.length === 0 ? (
                  <p className="text-zinc-600 text-sm text-center py-4">Ürün bilgisi yok</p>
                ) : (
                  <div className="space-y-2">
                    {selectedItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm p-2 rounded-lg bg-black/20">
                        <span className="text-zinc-300">{item.product_name} x{item.quantity}</span>
                        <span className="text-white font-medium">₺{item.price}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-white font-bold pt-3 border-t border-white/10">
                      <span>Toplam</span>
                      <span>₺{selectedOrder.total}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Link
                  href={`/returns?order=${selectedOrder.order_code}`}
                  className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-center font-semibold block"
                >
                  İade Talebi Oluştur
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
