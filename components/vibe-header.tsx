'use client';

import React, { useState, useEffect } from 'react';
import { Logo } from "./Logo"; 
import { Search, ShoppingBag, User, Shield, Package, LogOut, Home, Package2 } from "lucide-react";
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/CartContext"
import { CartDrawer } from "@/components/cart-drawer"
import { supabase } from "@/lib/supabase"

export function VibeHeader() {
  const router = useRouter()
  const { totalItems } = useCart()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; accountType?: string } | null>(null)

  // Supabase kullanıcı kontrolü
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUser({ email: user.email!, accountType: user.user_metadata?.account_type })
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/")
  }

  return (
    <>
      <header className="w-full py-6 px-8 flex justify-between items-center fixed top-0 left-0 right-0 z-[9999] bg-black/20 backdrop-blur-sm border-b border-white/5 font-sans">
        
        {/* 1. BÖLÜM: SENİN PREMIUM LOGO TASARIMIN (DOKUNULMADI) */}
        <div onClick={() => { window.location.href = '/' }} className="flex items-center gap-4 group cursor-pointer overflow-visible">
          <Logo />
          
          <div className="flex flex-col items-start leading-none overflow-visible">
            <div className="text-2xl font-black text-white flex items-center overflow-visible">
              <span className="tracking-tight">VIBE</span>
              
              {/* T HARFİ KESİLME ÇÖZÜMÜ */}
              <span className="relative inline-block ml-1.5 font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 py-1 pr-2">
                CART
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0" />
              </span>
            </div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-medium mt-1 opacity-80">
              Neural Shopping Experience
            </p>
          </div>
        </div>
        
        {/* 2. BÖLÜM: TÜM PANEL VE NAVİGASYON BAĞLANTILARI */}
        <nav className="flex items-center gap-3 md:gap-5">
          
          {/* GRUP PAKET / POOL (Yeni eklenen özellik) */}
          <Link 
            href="/pool" 
            className="text-zinc-400 hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-white/5"
            title="Grup Paketi"
          >
            <Package2 className="w-5 h-5" />
          </Link>

          {/* ADMIN PANELİ - Sadece ticari hesaplara görünür */}
          {user?.accountType === 'ticari' && (
            <Link 
              href="/admin" 
              className="text-zinc-400 hover:text-purple-400 transition-colors p-2 rounded-xl hover:bg-white/5"
              title="Admin Paneli"
            >
              <Shield className="w-5 h-5" />
            </Link>
          )}
          
          {/* SEPET (Drawer açan yeni versiyon) */}
          <button 
            onClick={() => setDrawerOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 relative"
            title="Sepetim"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                {totalItems}
              </span>
            )}
          </button>

          {/* KULLANICI / SATICI GİRİŞ KONTROLÜ */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-3 bg-white/5 pl-4 pr-1.5 py-1.5 rounded-full border border-white/10 hover:border-purple-500/50 transition-all">
                <span className="text-[10px] text-zinc-400 font-bold tracking-tight hidden sm:block truncate max-w-[100px]">{user.email}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-emerald-500 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              </button>
              
              {/* Arkadaşlarının eklediği kullanıcı menüsü (Siparişlerim vb.) */}
              <div className="absolute right-0 top-12 w-48 rounded-2xl bg-[#121214]/95 backdrop-blur-xl border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[10000] shadow-2xl">
                <button onClick={() => router.push("/orders")}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
                  Siparişlerim
                </button>
                <div className="border-t border-white/5 my-1.5" />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Çıkış Yap
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                href="/auth/login" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white hover:text-black transition-all uppercase tracking-[0.2em]"
              >
                <User className="w-4 h-4" />
                GİRİŞ
              </Link>

              <Link 
                href="/auth/register" 
                className="text-zinc-500 hover:text-emerald-400 transition-colors p-2 rounded-xl hover:bg-white/5"
                title="Kayıt Ol"
              >
                <Package className="w-5 h-5" />
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* ARKADAŞLARININ EKLEDİĞİ SEPET ÇEKMECESİ */}
      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}