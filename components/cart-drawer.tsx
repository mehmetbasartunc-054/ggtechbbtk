"use client"

import { useState } from "react"
import Link from "next/link"
import { useCart } from "@/contexts/CartContext"
import { usePool } from "@/contexts/PoolContext"
import { Minus, Plus, X, ShoppingBag, Package2, CheckCircle, LogIn } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface CartDrawerProps {
    isOpen: boolean
    onClose: () => void
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, removeItem, updateQuantity, totalPrice } = useCart()
    const { openPools, createPool, joinPool, myJoinedPoolIds, trackJoin } = usePool()


    const [tab, setTab] = useState<"cart" | "pool">("cart")
    const [userName, setUserName] = useState("")
    const [maxMembers, setMaxMembers] = useState(3)
    const [destination, setDestination] = useState("EU")
    const [joinedPoolId, setJoinedPoolId] = useState<string | null>(null)
    const [createdPoolId, setCreatedPoolId] = useState<string | null>(null)
    const [joinLoading, setJoinLoading] = useState(false)

    const cartItemsForPool = items.map(i => ({ name: i.name, price: i.price * i.quantity }))

    const handleJoin = async (poolId: string) => {
        if (!userName.trim()) return alert("İsminizi girin")
        if (items.length === 0) return alert("Önce sepete ürün ekleyin")

        const pool = openPools.find(p => p.id === poolId)
        if (!pool) return

        const alreadyJoined = pool.members.some(
            m => m.name.toLowerCase().trim() === userName.toLowerCase().trim()
        )
        if (alreadyJoined) {
            trackJoin(poolId)
            setJoinedPoolId(poolId)
            return
        }

        if (pool.members.length >= pool.maxMembers) {
            return alert("Paket dolu!")
        }

        setJoinLoading(true)
        const success = await joinPool(poolId, {
            userId: `user-${Date.now()}`,
            name: userName,
            items: cartItemsForPool,
        })
        setJoinLoading(false)

        if (success) {
            trackJoin(poolId)
            setJoinedPoolId(poolId)
        }
    }


    const handleCreate = async () => {
        if (items.length === 0) return alert("Önce sepete ürün ekleyin")
        setJoinLoading(true)
        const id = await createPool(maxMembers, destination)
        if (id) setCreatedPoolId(id)
        setJoinLoading(false)
    }



    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side="right"
                className="w-[420px] max-w-full bg-[oklch(0.08_0.015_280)] border-[oklch(0.2_0.02_280)] p-0 flex flex-col"
            >
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-[oklch(0.15_0.02_280)]">
                    <SheetTitle className="text-white flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[oklch(0.65_0.25_295)]" />
                        Sepetim
                    </SheetTitle>
                    <div className="flex gap-1 mt-3 p-1 rounded-xl bg-[oklch(0.12_0.02_280)]">
                        <button
                            onClick={() => setTab("cart")}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "cart"
                                ? "bg-[oklch(0.65_0.25_295)] text-white"
                                : "text-[oklch(0.55_0_0)] hover:text-white"
                                }`}
                        >
                            Sepet ({items.length})
                        </button>
                        <button
                            onClick={() => setTab("pool")}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "pool"
                                ? "bg-[oklch(0.65_0.25_295)] text-white"
                                : "text-[oklch(0.55_0_0)] hover:text-white"
                                }`}
                        >
                            Pakete Ekle
                        </button>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">

                    {/* SEPET SEKMESİ */}
                    {tab === "cart" && (
                        <div className="space-y-3">
                            {items.length === 0 ? (
                                <p className="text-center text-[oklch(0.4_0_0)] py-12">Sepetiniz boş</p>
                            ) : (
                                items.map(item => (
                                    <div
                                        key={`${item.id}-${item.selectedSize || ''}`}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-[oklch(0.12_0.02_280)] border border-[oklch(0.18_0.02_280)]"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                            {item.selectedSize && (
                                                <span className="text-emerald-500 text-[10px] font-bold uppercase">Beden: {item.selectedSize}</span>
                                            )}
                                            <p className="text-[oklch(0.65_0.25_295)] text-sm font-semibold">
                                                ₺{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-white text-xs w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-[oklch(0.4_0_0)] hover:text-red-400 transition-colors flex-shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* PAKETE EKLE SEKMESİ */}
                    {tab === "pool" && (
                        <div className="space-y-6">
                            {items.length === 0 && (
                                <p className="text-center text-[oklch(0.4_0_0)] text-sm py-4">
                                    Pakete eklemek için önce sepete ürün ekleyin.
                                </p>
                            )}

                            <input
                                type="text"
                                placeholder="Adınız (paket üyeleri görecek)"
                                value={userName}
                                onChange={e => setUserName(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl bg-[oklch(0.12_0.02_280)] border border-[oklch(0.2_0.02_280)] text-white text-sm outline-none focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] placeholder:text-[oklch(0.35_0_0)]"
                            />

                            {/* Sepetteki ürünler özeti */}
                            {items.length > 0 && (
                                <div className="p-3 rounded-xl bg-[oklch(0.12_0.02_280)] border border-[oklch(0.18_0.02_280)]">
                                    <p className="text-[oklch(0.55_0_0)] text-xs uppercase tracking-wider mb-2">Pakete eklenecek ürünler</p>
                                    {items.map(item => (
                                        <p key={item.id} className="text-white text-xs py-0.5">
                                            • {item.name} x{item.quantity} — <span className="text-[oklch(0.65_0.25_295)]">₺{(item.price * item.quantity).toFixed(2)}</span>
                                        </p>
                                    ))}
                                </div>
                            )}

                            {/* Açık paketler listesi */}
                            {openPools.length > 0 && (
                                <div>
                                    <p className="text-[oklch(0.55_0_0)] text-xs uppercase tracking-wider mb-3">Mevcut Açık Paketler</p>
                                    <div className="space-y-3">
                                        {openPools.map(pool => (
                                            <div
                                                key={pool.id}
                                                className="p-4 rounded-xl bg-[oklch(0.12_0.02_280)] border border-[oklch(0.18_0.02_280)]"
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <div>
                                                        <p className="text-white text-sm font-semibold">{pool.destination} Paketi</p>
                                                        <p className="text-[oklch(0.55_0_0)] text-xs">{pool.members.length}/{pool.maxMembers} üye</p>
                                                    </div>
                                                    <p className="text-emerald-400 text-sm font-bold">
                                                        ₺{pool.perPersonCost.toFixed(2)}
                                                        <span className="text-xs font-normal text-[oklch(0.45_0_0)]">/kişi kargo</span>
                                                    </p>
                                                </div>

                                                {/* Üyelerin ürünleri */}
                                                {pool.members.map((m, i) => (
                                                    <div key={i} className="mt-2 pt-2 border-t border-[oklch(0.15_0.02_280)]">
                                                        <p className="text-[oklch(0.7_0.15_295)] text-xs font-semibold mb-1">{m.name}</p>
                                                        {m.items.map((item, j) => (
                                                            <p key={j} className="text-[oklch(0.45_0_0)] text-xs">
                                                                • {item.name} — ₺{item.price}
                                                            </p>
                                                        ))}
                                                    </div>
                                                ))}

                                                {(myJoinedPoolIds.includes(pool.id)) ? (

                                                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mt-3">
                                                        <CheckCircle className="w-4 h-4" /> Ürünlerin bu pakete eklendi
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleJoin(pool.id)}
                                                        disabled={items.length === 0}
                                                        className="mt-3 w-full h-9 rounded-lg bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                                    >
                                                        <LogIn className="w-3.5 h-3.5" /> Sepetimi Bu Pakete Ekle
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Yeni paket oluştur */}
                            <div>
                                <p className="text-[oklch(0.55_0_0)] text-xs uppercase tracking-wider mb-3">Yeni Paket Oluştur</p>
                                {createdPoolId ? (
                                    <div className="p-4 rounded-xl bg-[oklch(0.12_0.02_280)] border border-emerald-500/30 text-center space-y-2">
                                        <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                                        <p className="text-white text-sm font-semibold">Paket oluşturuldu, ürünlerin eklendi!</p>
                                        <code className="text-xs text-[oklch(0.65_0.25_295)] break-all block">{createdPoolId}</code>
                                        <p className="text-[oklch(0.45_0_0)] text-xs">Bu kodu arkadaşlarınla paylaş</p>
                                        <button
                                            onClick={() => setCreatedPoolId(null)}
                                            className="text-xs text-[oklch(0.65_0.25_295)] hover:underline"
                                        >
                                            Yeni paket oluştur
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <select
                                                value={maxMembers}
                                                onChange={e => setMaxMembers(Number(e.target.value))}
                                                className="h-11 px-3 rounded-xl bg-[oklch(0.12_0.02_280)] border border-[oklch(0.2_0.02_280)] text-white text-sm outline-none"
                                            >
                                                {[2, 3, 4, 5].map(n => (
                                                    <option key={n} value={n}>{n} Kişilik</option>
                                                ))}
                                            </select>
                                            <select
                                                value={destination}
                                                onChange={e => setDestination(e.target.value)}
                                                className="h-11 px-3 rounded-xl bg-[oklch(0.12_0.02_280)] border border-[oklch(0.2_0.02_280)] text-white text-sm outline-none"
                                            >
                                                <option value="EU">Avrupa ₺25</option>
                                                <option value="US">Amerika ₺35</option>
                                                <option value="OTHER">Diğer ₺45</option>
                                            </select>
                                        </div>
                                        <button
                                            onClick={handleCreate}
                                            disabled={items.length === 0}
                                            className="w-full h-11 rounded-xl border-2 border-[oklch(0.65_0.25_295_/_0.5)] text-[oklch(0.65_0.25_295)] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[oklch(0.65_0.25_295_/_0.1)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                        >
                                            <Package2 className="w-4 h-4" /> Paket Oluştur ve Ürünlerimi Ekle
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* ALT: Ödemeye geç (sadece sepet sekmesinde) */}
                {tab === "cart" && items.length > 0 && (
                    <div className="px-6 py-4 border-t border-[oklch(0.15_0.02_280)] space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-[oklch(0.6_0_0)] text-sm">Ara Toplam</span>
                            <span className="text-white font-bold">₺{totalPrice.toFixed(2)}</span>
                        </div>
                        <Link
                            href="/checkout"
                            onClick={onClose}
                            className="block w-full h-12 bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white rounded-xl font-bold text-sm text-center leading-[48px] hover:opacity-90 transition-opacity"
                        >
                            Ödemeye Geç
                        </Link>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
