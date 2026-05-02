"use client"
import { createContext, useContext, useState, useRef, ReactNode } from "react"

interface CartItem {
    id: number | string
    name: string
    price: number
    image: string
    brand?: string
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    addItem: (product: any) => void
    removeItem: (id: number | string) => void
    updateQuantity: (id: number | string, qty: number) => void
    clearCart: () => void
    totalPrice: number
    totalItems: number
    shippingCost: number
    shippingZone: string
    setShippingZone: (zone: string) => void
}

const CartContext = createContext<CartContextType | null>(null)

const SHIPPING_RATES: Record<string, number> = {
    TR: 0, EU: 20, US: 30, OTHER: 40,
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [shippingZone, setShippingZone] = useState("TR")
    const [toast, setToast] = useState<{ name: string; image: string } | null>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const addItem = (product: any) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id)
            if (existing) {
                return prev.map(i =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...prev, {
                id: product.id, name: product.name, price: product.price,
                image: product.image, brand: product.brand, quantity: 1
            }]
        })

        if (timerRef.current) clearTimeout(timerRef.current)
        setToast({ name: product.name, image: product.image })
        timerRef.current = setTimeout(() => setToast(null), 2500)
    }

    const removeItem = (id: number | string) => {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    const updateQuantity = (id: number | string, qty: number) => {
        if (qty <= 0) return removeItem(id)
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
    }

    const clearCart = () => setItems([])

    const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const shippingCost = items.length > 0 ? SHIPPING_RATES[shippingZone] : 0

    return (
        <CartContext.Provider value={{
            items, addItem, removeItem, updateQuantity,
            clearCart, totalPrice, totalItems, shippingCost,
            shippingZone, setShippingZone
        }}>
            {children}

            {toast && (
                <div className="fixed top-24 right-4 z-[99999] pointer-events-none animate-in slide-in-from-right-4 fade-in duration-300">
                    <div className="flex items-center gap-3 p-3 pr-5 rounded-2xl bg-black/80 backdrop-blur-xl border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] min-w-[260px] max-w-[320px]">
                        <img
                            src={toast.image}
                            alt={toast.name}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/10"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mb-0.5">
                                ✓ Sepete Eklendi
                            </p>
                            <p className="text-white text-sm font-semibold truncate">{toast.name}</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </div>
                </div>
            )}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error("useCart must be used within CartProvider")
    return ctx
}
