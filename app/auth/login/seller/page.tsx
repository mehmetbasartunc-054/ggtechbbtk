"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Store, ArrowLeft, Zap } from 'lucide-react';
import { supabase } from "@/lib/supabase"; // Supabase bağlantısı
import { useRouter } from "next/navigation"; // Yönlendirme için

export default function SellerLoginPage() {
  const router = useRouter();
  
  // Input verilerini tutan state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Supabase Auth ile Satıcı Giriş İşlemi
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert("Satıcı girişi başarısız: " + error.message);
    } else {
      alert("Mağaza paneline giriş başarılı!");
      router.push("/"); 
    }
  };

  // Input değişimlerini yakalayan fonksiyon
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Input ismine göre (email veya password) state güncellenir
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="relative min-h-screen bg-[oklch(0.06_0.015_280)] overflow-hidden">
      
      {/* SOL ÜST LOGO */}
      <nav className="fixed top-0 left-0 w-full p-8 z-[100] pointer-events-none">
        <Link 
          href="/" 
          className="group inline-flex items-center gap-3 pointer-events-auto transition-transform hover:scale-[1.02]"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_295)] to-[oklch(0.45_0.3_280)] flex items-center justify-center shadow-lg shadow-[oklch(0.65_0.25_295_/_0.3)]">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold text-[oklch(0.95_0_0)] tracking-tight">
            Vibe<span className="text-[oklch(0.65_0.25_295)]">Cart</span>
          </span>
        </Link>
      </nav>

      {/* ARKA PLAN EFEKTLERİ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[oklch(0.65_0.25_295)] rounded-full blur-[160px] opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[oklch(0.7_0.2_280)] rounded-full blur-[160px] opacity-10"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full space-y-10 p-8 sm:p-10 rounded-3xl bg-[oklch(0.15_0.02_280_/_0.3)] backdrop-blur-xl border border-[oklch(0.25_0.03_280_/_0.5)] shadow-2xl">
          
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative w-12 h-12 rounded-2xl bg-[oklch(0.65_0.25_295_/_0.1)] border border-[oklch(0.65_0.25_295_/_0.2)] flex items-center justify-center">
                <Store className="w-6 h-6 text-[oklch(0.65_0.25_295)]" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight text-white">
               Satıcı <span className="font-light opacity-70">Girişi</span>
            </h1>
            <p className="text-[oklch(0.55_0_0)] text-base">
              Mağazanızı yönetmek için giriş yapın.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[oklch(0.1_0.01_280_/_0.4)] border border-[oklch(0.2_0.02_280_/_0.5)] rounded-2xl text-white placeholder:text-[oklch(0.4_0_0)] focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] focus:border-transparent outline-none transition-all duration-300"
                placeholder="Kurumsal E-posta adresi"
              />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[oklch(0.1_0.01_280_/_0.4)] border border-[oklch(0.2_0.02_280_/_0.5)] rounded-2xl text-white placeholder:text-[oklch(0.4_0_0)] focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] focus:border-transparent outline-none transition-all duration-300"
                placeholder="Şifre"
              />
            </div>

            <button
              type="submit"
              className="group w-full h-14 bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white rounded-2xl font-bold text-lg hover:opacity-90 transform transition-all active:scale-[0.98] shadow-lg shadow-[oklch(0.65_0.25_295_/_0.3)] flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 group-hover:animate-pulse" />
              Panele Giriş Yap
            </button>
          </form>

          <div className="flex flex-col items-center space-y-4 pt-4 border-t border-[oklch(0.2_0.02_280_/_0.5)]">
            <Link 
              href="/auth/login/user" 
              className="group text-sm font-medium text-[oklch(0.55_0_0)] hover:text-white flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Müşteri girişine dön
            </Link>
            
            <div className="text-xs text-[oklch(0.4_0_0)]">
              VibeCart&apos;ta satış yapmak mı istiyorsunuz? <Link href="/auth/register" className="text-[oklch(0.65_0.25_295)] font-bold hover:underline">Şimdi Başvurun</Link>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[oklch(0.06_0.015_280)] to-transparent pointer-events-none z-20" />
    </div>
  );
}