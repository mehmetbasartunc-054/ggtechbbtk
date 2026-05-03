"use client"
import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
}

const COLORS = {
    success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-400", bar: "bg-emerald-500" },
    error: { bg: "bg-red-500/10", border: "border-red-500/30", icon: "text-red-400", bar: "bg-red-500" },
    warning: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400", bar: "bg-amber-500" },
    info: { bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "text-purple-400", bar: "bg-purple-500" },
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback((message: string, type: ToastType = "info") => {
        const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
    }, [])

    const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed top-6 right-6 z-[99999] flex flex-col gap-2.5 pointer-events-none" style={{ maxWidth: '380px' }}>
                {toasts.map((t, i) => {
                    const Icon = ICONS[t.type]
                    const c = COLORS[t.type]
                    return (
                        <div
                            key={t.id}
                            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl ${c.bg} border ${c.border} backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-5 fade-in duration-300`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <Icon className={`w-5 h-5 ${c.icon} flex-shrink-0 mt-0.5`} />
                            <p className="text-sm text-white font-medium flex-1 leading-snug">{t.message}</p>
                            <button onClick={() => dismiss(t.id)} className="text-zinc-500 hover:text-white transition-colors flex-shrink-0">
                                <X className="w-4 h-4" />
                            </button>
                            {/* Progress bar */}
                            <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-white/5 overflow-hidden">
                                <div className={`h-full ${c.bar} rounded-full animate-shrink`} />
                            </div>
                        </div>
                    )
                })}
            </div>
            <style jsx global>{`
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
                .animate-shrink {
                    animation: shrink 3.5s linear forwards;
                }
            `}</style>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used within ToastProvider")
    return ctx
}
