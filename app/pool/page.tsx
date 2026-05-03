"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Package2, Users, Plus, LogIn, CheckCircle, Truck, Share2, UserMinus, Bell, X, Copy, Check } from "lucide-react"
import { usePool } from "@/contexts/PoolContext"
import { useCart } from "@/contexts/CartContext"

const DESTINATIONS = [
    { value: "EU", label: "Avrupa", price: 20 },
    { value: "US", label: "Amerika", price: 30 },
    { value: "OTHER", label: "Diğer", price: 40 },
]

// Rastgele isimler (simülasyon için)
const FAKE_NAMES = ["Ayşe Y.", "Mehmet K.", "Zeynep A.", "Ali R.", "Selin D.", "Emre T.", "Deniz B.", "Ceren M."]

export default function PoolPage() {
    const { openPools, fullPools, createPool, joinPool, myJoinedPoolIds, trackJoin } = usePool()
    const { items } = useCart()

    const [createName, setCreateName] = useState("")
    const [maxMembers, setMaxMembers] = useState(5)
    const [destination, setDestination] = useState("EU")
    const [createdPoolId, setCreatedPoolId] = useState<string | null>(null)
    const [joinNames, setJoinNames] = useState<Record<string, string>>({})
    const [joinedPools, setJoinedPools] = useState<Set<string>>(new Set())
    const [joinErrors, setJoinErrors] = useState<Record<string, string>>({})
    const [notifications, setNotifications] = useState<{ name: string; poolId: string; time: string }[]>([])
    const [celebrating, setCelebrating] = useState<string | null>(null)
    const [shareModalPoolId, setShareModalPoolId] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Kutlama animasyonu
    useEffect(() => {
        if (celebrating) {
            const t = setTimeout(() => setCelebrating(null), 4000)
            return () => clearTimeout(t)
        }
    }, [celebrating])

    const handleCreate = async () => {
        if (!createName.trim()) return alert("İsminizi girin")
        if (items.length === 0) return alert("Paket oluşturmak için önce sepete ürün ekleyin")
        const id = await createPool(maxMembers, destination)
        if (!id) return
        const cartItems = items.map(i => ({ name: i.name, price: i.price * i.quantity }))
        await joinPool(id, { userId: `user-${Date.now()}`, name: createName, items: cartItems })
        trackJoin(id)
        setJoinedPools(prev => new Set([...prev, id]))
        setCreatedPoolId(id)
        addNotification(createName, id)
    }

    const handleJoin = async (poolId: string) => {
        const name = joinNames[poolId]?.trim()
        if (!name) return alert("İsminizi girin")
        if (items.length === 0) return alert("Pakete katılmak için önce sepete ürün ekleyin")
        const pool = openPools.find(p => p.id === poolId)
        if (pool?.members.some(m => m.name.toLowerCase() === name.toLowerCase())) {
            setJoinErrors(prev => ({ ...prev, [poolId]: "Bu isimle zaten katılınmış." }))
            return
        }
        const cartItems = items.map(i => ({ name: i.name, price: i.price * i.quantity }))
        const success = await joinPool(poolId, { userId: `user-${Date.now()}`, name, items: cartItems })
        if (success) {
            trackJoin(poolId)
            setJoinedPools(prev => new Set([...prev, poolId]))
            setJoinErrors(prev => ({ ...prev, [poolId]: "" }))
            addNotification(name, poolId)
            // Doldu mu?
            if (pool && pool.members.length + 1 >= pool.maxMembers) {
                setCelebrating(poolId)
            }
        } else {
            setJoinErrors(prev => ({ ...prev, [poolId]: "Paket dolu veya hata oluştu." }))
        }
    }

    // Simülasyon: "+ Biri katıldı" butonu
    const simulateJoin = async (poolId: string) => {
        const pool = openPools.find(p => p.id === poolId)
        if (!pool || pool.members.length >= pool.maxMembers) return
        const fakeName = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
        const success = await joinPool(poolId, {
            userId: `sim-${Date.now()}`,
            name: fakeName,
            items: [{ name: "Simüle Ürün", price: 50 }]
        })
        if (success) {
            addNotification(fakeName, poolId)
            if (pool.members.length + 1 >= pool.maxMembers) {
                setCelebrating(poolId)
            }
        }
    }

    const addNotification = (name: string, poolId: string) => {
        const time = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
        setNotifications(prev => [{ name, poolId, time }, ...prev.slice(0, 4)])
    }

    const handleShare = (poolId: string) => {
        setShareModalPoolId(poolId)
        setCopied(false)
    }

    const getInviteUrl = (poolId: string) => {
        const code = poolId.slice(-8).toUpperCase()
        return `https://vibecart.app/join/${code}`
    }

    const copyInviteUrl = () => {
        if (!shareModalPoolId) return
        navigator.clipboard.writeText(getInviteUrl(shareModalPoolId))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const allPools = [...openPools, ...fullPools]

    return (
        <div className="relative min-h-screen bg-[#09090b] overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[200px] opacity-[0.06]" />
                <div className="absolute bottom-0 -left-20 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px] opacity-[0.04]" />
            </div>

            <main className="relative z-10 max-w-3xl mx-auto pt-24 pb-20 px-6">
                <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 text-sm group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Ana Sayfaya Dön
                </Link>

                <div className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Grup Kargo</h1>
                    <p className="text-zinc-500 text-sm">Arkadaşlarınla aynı pakette sipariş ver — kargo ücreti herkese bölünür.</p>
                </div>

                {/* ═══ PAKET OLUŞTUR ═══ */}
                <section className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl mb-6">
                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/5">
                        <Package2 className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-bold text-white">Yeni Paket Oluştur</h2>
                    </div>

                    {createdPoolId ? (
                        <div className="text-center py-6 space-y-3">
                            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                            <p className="text-white font-bold text-lg">Paket Oluşturuldu!</p>
                            <code className="block px-4 py-2 rounded-xl bg-black/40 text-purple-400 font-mono text-sm border border-purple-500/20">{createdPoolId}</code>
                            <button onClick={() => handleShare(createdPoolId)} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/20 transition-all">
                                <Share2 className="w-4 h-4" /> Arkadaşlarını davet et
                            </button>
                            <button onClick={() => { setCreatedPoolId(null); setCreateName("") }} className="text-xs text-zinc-500 hover:text-white transition-colors">
                                Yeni Paket Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input type="text" placeholder="Adınız" value={createName} onChange={e => setCreateName(e.target.value)}
                                    className="h-11 px-4 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-600" />
                                <select value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))}
                                    className="h-11 px-4 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none">
                                    {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Kişilik</option>)}
                                </select>
                                <select value={destination} onChange={e => setDestination(e.target.value)}
                                    className="h-11 px-4 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none">
                                    {DESTINATIONS.map(d => <option key={d.value} value={d.value}>{d.label} (${d.price})</option>)}
                                </select>
                            </div>
                            {/* Tasarruf göstergesi */}
                            {(() => {
                                const full = DESTINATIONS.find(d => d.value === destination)?.price ?? 0
                                const per = full / maxMembers
                                return (
                                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                                        <div><p className="text-[10px] text-zinc-500 mb-0.5">Normal</p><p className="text-white font-bold text-sm">${full}</p></div>
                                        <div><p className="text-[10px] text-zinc-500 mb-0.5">Kişi Başı</p><p className="text-purple-400 font-bold text-sm">${per.toFixed(2)}</p></div>
                                        <div><p className="text-[10px] text-zinc-500 mb-0.5">Kazancın</p><p className="text-emerald-400 font-bold text-sm">${(full - per).toFixed(2)}</p></div>
                                    </div>
                                )
                            })()}
                            <button onClick={handleCreate} disabled={items.length === 0}
                                className="w-full h-11 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-30">
                                <Plus className="w-4 h-4" /> Paket Oluştur
                            </button>
                        </div>
                    )}
                </section>

                {/* ═══ AKTİVİTE BİLDİRİMLERİ ═══ */}
                {notifications.length > 0 && (
                    <div className="mb-6 space-y-2">
                        {notifications.slice(0, 3).map((n, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 animate-in slide-in-from-top-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-sm text-zinc-300 flex-1"><span className="font-bold text-white">{n.name}</span> gruba katıldı</p>
                                <span className="text-[10px] text-zinc-600">{n.time}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* ═══ AÇIK PAKETLER ═══ */}
                <section className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-bold text-white">Açık Paketler</h2>
                        <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold">{openPools.length} açık</span>
                    </div>

                    {openPools.length === 0 ? (
                        <p className="text-zinc-600 text-center py-10">Açık paket yok. İlk paketi sen oluştur!</p>
                    ) : (
                        <div className="space-y-4">
                            {openPools.map(pool => {
                                const isMember = myJoinedPoolIds.includes(pool.id) || joinedPools.has(pool.id)
                                const destLabel = DESTINATIONS.find(d => d.value === pool.destination)?.label ?? pool.destination
                                const fullPrice = pool.shippingCost
                                const filledSlots = pool.members.length
                                const emptySlots = pool.maxMembers - filledSlots
                                const finalPerPerson = fullPrice / pool.maxMembers

                                return (
                                    <div key={pool.id} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Package2 className="w-4 h-4 text-purple-400" />
                                                    <p className="text-white font-bold">Grup Kargo</p>
                                                </div>
                                                <p className="text-zinc-600 text-xs mt-0.5">Paket #{pool.id.slice(-6).toUpperCase()}</p>
                                            </div>
                                            <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold uppercase">Bekliyor</span>
                                        </div>

                                        {/* Ürün bilgisi */}
                                        {pool.members[0]?.items?.[0] && (
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-white/5">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                    <Package2 className="w-5 h-5 text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">{pool.members[0].items[0].name}</p>
                                                    <p className="text-zinc-500 text-xs">{destLabel} · ₺{pool.members[0].items[0].price}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* SLOT GÖRSELLEŞTİRMESİ */}
                                        <div>
                                            <p className="text-zinc-500 text-xs mb-2">Grup Üyeleri ({filledSlots} / {pool.maxMembers})</p>
                                            <div className="flex items-center gap-2 mb-2">
                                                {pool.members.map((m, i) => (
                                                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-[10px] font-bold border-2 border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]" title={m.name}>
                                                        {i === 0 ? "SEN" : m.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                ))}
                                                {Array.from({ length: emptySlots }).map((_, i) => (
                                                    <div key={`e-${i}`} className="w-10 h-10 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center">
                                                        <div className="w-3 h-3 rounded-full bg-zinc-800" />
                                                    </div>
                                                ))}
                                            </div>
                                            {/* Progress bar */}
                                            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
                                                    style={{ width: `${(filledSlots / pool.maxMembers) * 100}%` }} />
                                            </div>
                                            <p className="text-zinc-500 text-[10px] mt-1">
                                                {filledSlots} / {pool.maxMembers} kişi katıldı · <span className="text-emerald-400">{emptySlots} kişi daha gerek</span>
                                            </p>
                                        </div>

                                        {/* ANLIK FİYAT GÜNCELLEMESİ */}
                                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                                            <p className="text-emerald-400 text-xs font-bold mb-1">Kargo Ücreti (kişi başı)</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-zinc-500 text-sm line-through">₺{fullPrice.toFixed(2)}</span>
                                                <span className="text-white text-xl font-black">₺{pool.perPersonCost.toFixed(2)}</span>
                                                <span className="text-zinc-500 text-xs">/ kişi</span>
                                            </div>
                                            <p className="text-zinc-600 text-[10px] mt-1">
                                                Şu an {filledSlots} kişisiniz · tam dolunca <span className="text-emerald-400 font-bold">₺{finalPerPerson.toFixed(2)}/kişi</span>
                                            </p>
                                        </div>

                                        {/* KATILMA / DAVET */}
                                        {isMember ? (
                                            <div className="space-y-2">
                                                <button onClick={() => handleShare(pool.id)} className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-all">
                                                    <Share2 className="w-4 h-4" /> Arkadaşlarını davet et ↗
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <div className="flex gap-2">
                                                    <input type="text" placeholder="Adınız" value={joinNames[pool.id] || ""}
                                                        onChange={e => setJoinNames(prev => ({ ...prev, [pool.id]: e.target.value }))}
                                                        className="flex-1 h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:ring-1 focus:ring-purple-500/50 placeholder:text-zinc-600" />
                                                    <button onClick={() => handleJoin(pool.id)}
                                                        className="h-10 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-700 text-white text-sm font-bold hover:opacity-90 flex items-center gap-1.5">
                                                        <LogIn className="w-3.5 h-3.5" /> Katıl
                                                    </button>
                                                </div>
                                                {joinErrors[pool.id] && <p className="text-red-400 text-xs">{joinErrors[pool.id]}</p>}
                                            </div>
                                        )}

                                        {/* SİMÜLASYON BUTONLARI */}
                                        <div className="flex gap-2 pt-2 border-t border-white/5">
                                            <button onClick={() => simulateJoin(pool.id)} disabled={pool.members.length >= pool.maxMembers}
                                                className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg bg-white/5 text-zinc-400 text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-20">
                                                <Plus className="w-3 h-3" /> Biri katıldı
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>

                {/* ═══ DOLU PAKETLER — KUTLAMA ═══ */}
                {fullPools.length > 0 && (
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="w-5 h-5 text-emerald-400" />
                            <h2 className="text-lg font-bold text-white">Kargoya Hazır</h2>
                            <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">{fullPools.length} paket</span>
                        </div>
                        <div className="space-y-4">
                            {fullPools.map(pool => (
                                <div key={pool.id} className={`p-5 rounded-2xl border space-y-4 transition-all duration-700 ${celebrating === pool.id
                                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)]'
                                    : 'bg-white/[0.03] border-emerald-500/20'}`}>

                                    {/* Kutlama banner */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <Truck className="w-5 h-5 text-emerald-400" />
                                        <div>
                                            <p className="text-emerald-400 font-bold text-sm">🎉 Grup tamamlandı! Kargo yola çıkıyor</p>
                                            <p className="text-emerald-500/60 text-[10px]">Tüm üyeler katıldı — paket kargoya verildi</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-bold">{DESTINATIONS.find(d => d.value === pool.destination)?.label} Paketi</p>
                                            <p className="text-zinc-500 text-xs">{pool.members.length} üye · Kişi başı: <span className="text-emerald-400 font-bold">₺{pool.perPersonCost.toFixed(2)}</span></p>
                                        </div>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">DOLU ✓</span>
                                    </div>

                                    {/* Üye slotları */}
                                    <div className="flex items-center gap-2">
                                        {pool.members.map((m, i) => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white text-[10px] font-bold border-2 border-emerald-400/30" title={m.name}>
                                                {m.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Üyelerin ürünleri */}
                                    <div className="pt-3 border-t border-emerald-500/10 space-y-2">
                                        {pool.members.map((m, i) => (
                                            <div key={i}>
                                                <p className="text-emerald-300 text-[10px] font-bold">{m.name}</p>
                                                {m.items.map((item, j) => (
                                                    <p key={j} className="text-zinc-500 text-xs">• {item.name} — <span className="text-emerald-400">₺{item.price}</span></p>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* ═══ PAYLAŞIM MODALI ═══ */}
            {shareModalPoolId && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShareModalPoolId(null)} />
                    <div className="relative w-full max-w-sm p-6 rounded-2xl bg-[#141416] border border-white/10 shadow-2xl space-y-5 animate-in zoom-in-95 fade-in duration-200">

                        {/* Kapat */}
                        <button onClick={() => setShareModalPoolId(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>

                        {/* Başlık */}
                        <div className="text-center space-y-1">
                            <Share2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-white">Arkadaşlarını Davet Et</h3>
                            <p className="text-zinc-500 text-xs">Linki paylaş, grubunu doldur, kargo ücreti düşsün!</p>
                        </div>

                        {/* Sosyal Medya İkonları */}
                        <div className="grid grid-cols-4 gap-3">
                            <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('VibeCart Grup Kargo paketime katıl! ' + getInviteUrl(shareModalPoolId))}`, '_blank')}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group">
                                <svg className="w-6 h-6 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                <span className="text-[9px] text-zinc-400 group-hover:text-white">WhatsApp</span>
                            </button>

                            <button onClick={() => window.open('https://www.instagram.com/', '_blank')}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#E4405F]/10 border border-[#E4405F]/20 hover:bg-[#E4405F]/20 transition-all group">
                                <svg className="w-6 h-6 text-[#E4405F]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                <span className="text-[9px] text-zinc-400 group-hover:text-white">Instagram</span>
                            </button>

                            <button onClick={() => window.open('https://www.tiktok.com/', '_blank')}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48v-7.13a8.16 8.16 0 005.58 2.2v-3.45a4.85 4.85 0 01-1-.12 4.83 4.83 0 01-3.77-4.25V6.7z"/></svg>
                                <span className="text-[9px] text-zinc-400 group-hover:text-white">TikTok</span>
                            </button>

                            <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(getInviteUrl(shareModalPoolId))}&text=${encodeURIComponent('VibeCart Grup Kargo paketime katıl!')}`, '_blank')}
                                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/20 hover:bg-[#0088cc]/20 transition-all group">
                                <svg className="w-6 h-6 text-[#0088cc]" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                <span className="text-[9px] text-zinc-400 group-hover:text-white">Telegram</span>
                            </button>
                        </div>

                        {/* Davet URL'si */}
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5 pl-1">Davet Linki</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-10 px-3 rounded-xl bg-black/40 border border-white/10 flex items-center overflow-hidden">
                                    <span className="text-xs text-purple-400 font-mono truncate">{getInviteUrl(shareModalPoolId)}</span>
                                </div>
                                <button onClick={copyInviteUrl}
                                    className={`h-10 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}>
                                    {copied ? <><Check className="w-3.5 h-3.5" /> Kopyalandı</> : <><Copy className="w-3.5 h-3.5" /> Kopyala</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
