"use client"
import { CartProvider } from "@/contexts/CartContext"
import { PoolProvider } from "@/contexts/PoolContext"
import { ToastProvider } from "@/contexts/ToastContext"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ToastProvider>
            <CartProvider>
                <PoolProvider>
                    {children}
                </PoolProvider>
            </CartProvider>
        </ToastProvider>
    )
}
