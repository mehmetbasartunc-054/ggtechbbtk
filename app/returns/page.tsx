"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Package, Loader2, XCircle, CheckCircle, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AmbientBackground } from "@/components/ambient-background"

function generateReturnCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "RTN-"
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

const returnStatusMap: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  pending: { label: "İnceleniyor", icon: Clock, color: "text-yellow-400" },
  approved: { label: "Onaylandı", icon: CheckCircle, color: "text-emerald-400" },
  rejected: { label: "Reddedildi", icon: XCircle, color: "text-red-400" },
  refunded: { label: "İade Edildi", icon: CheckCircle, color: "text-blue-400" },
}

function ReturnsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; id: string } | null>(null)
  const [orderCode, setOrderCode] = useState(searchParams.get("order") || "")
  const [productName, setProductName] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [returnCode, setReturnCode] = useState<string | null>(null)
  const [myReturns, setMyReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser({ email: user.email!, id: user.id })
      fetchMyReturns(user.id)
    } else {
      setLoading(false)
    }
  }

  async function fetchMyReturns(userId: string) {
    const { data } = await supabase
      .from("returns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    if (data) setMyReturns(data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderCode || !productName || !reason) return

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    const code = generateReturnCode()

    const { error } = await supabase
      .from("returns")
      .insert({
        return_code: code,
        order_code: orderCode.toUpperCase(),
        user_id: user?.id || null,
        product_name: productName,
        reason,
        status: "pending",
      })

    setSubmitting(false)

    if (error) {
      alert("İade talebi oluşturulamadı: " + error.message)
    } else {
      setReturnCode(code)
      setOrderCode("")
      setProductName("")
      setReason("")
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-[oklch(0.65_0.25_295)]" /></div>
  }

  if (returnCode) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">İade Talebi Oluşturuldu</h2>
          <p className="text-zinc-400">İade takip kodun:</p>
          <p className="text-3xl font-black text-[oklch(0.65_0.25_295)] mt-2">{returnCode}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/orders" className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all">
            Siparişlerime Dön
          </Link>
          <button
            onClick={() => setReturnCode(null)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white hover:scale-105 transition-transform"
          >
            Yeni İade Talebi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/orders" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Siparişlere Dön</span>
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          İade<span className="text-red-400"> Sistemi</span>
        </h1>
        <p className="text-zinc-500">İade talebi oluştur ve takip et</p>
      </div>

      {/* İade Talebi Formu */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-[oklch(0.65_0.25_295)]" />
          Yeni İade Talebi
        </h2>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Sipariş Kodu</label>
          <input
            type="text"
            value={orderCode}
            onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
            placeholder="VC-XXXXXXX"
            className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:border-[oklch(0.65_0.25_295)] outline-none transition-all uppercase"
            maxLength={11}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">Ürün Adı</label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="İade edilecek ürün"
            className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:border-[oklch(0.65_0.25_295)] outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1.5">İade Nedeni</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:border-[oklch(0.65_0.25_295)] outline-none transition-all appearance-none"
            required
          >
            <option value="" className="bg-[#09090b]">Seçiniz</option>
            <option value="defective" className="bg-[#09090b]">Kusurlu / Hasarlı Ürün</option>
            <option value="wrong" className="bg-[#09090b]">Yanlış Ürün Gönderildi</option>
            <option value="not_as_described" className="bg-[#09090b]">Açıklamada Farklı</option>
            <option value="changed_mind" className="bg-[#09090b]">Fikrim Değişti</option>
            <option value="other" className="bg-[#09090b]">Diğer</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold disabled:opacity-50 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>İade Talebi Oluştur <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>

      {/* Mevcut İade Talepleri */}
      {user && myReturns.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">İade Taleplerim ({myReturns.length})</h2>
          {myReturns.map((ret) => (
            <div key={ret.id} className="p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{ret.return_code}</p>
                  <p className="text-zinc-500 text-sm">{ret.product_name}</p>
                  <p className="text-zinc-600 text-xs mt-1">{ret.order_code}</p>
                </div>
                <div className={`flex items-center gap-1.5 ${returnStatusMap[ret.status]?.color || "text-zinc-400"}`}>
                  {(() => { const S = returnStatusMap[ret.status]?.icon || Clock; return <S className="w-4 h-4" /> })()}
                  <span className="text-sm font-medium">{returnStatusMap[ret.status]?.label || ret.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Giriş yapmamış kullanıcılar */}
      {!user && (
        <div className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
          <p className="text-zinc-400 mb-4">İade taleplerini takip etmek için giriş yap</p>
          <Link href="/auth/login/user" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white font-semibold hover:scale-105 transition-transform">
            Giriş Yap
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ReturnsPage() {
  return (
    <main className="relative min-h-screen bg-[#09090b]">
      <AmbientBackground />
      <div className="relative z-10 max-w-4xl mx-auto pt-8 px-4">
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[oklch(0.65_0.25_295)]" /></div>}>
          <ReturnsContent />
        </Suspense>
      </div>
    </main>
  )
}
