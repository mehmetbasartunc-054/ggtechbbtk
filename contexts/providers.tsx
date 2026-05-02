"use client"
import { CartProvider } from "@/contexts/CartContext"
import { PoolProvider } from "@/contexts/PoolContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CartProvider>
            <PoolProvider>
                {children}
            </PoolProvider>
        </CartProvider>
    )
}
