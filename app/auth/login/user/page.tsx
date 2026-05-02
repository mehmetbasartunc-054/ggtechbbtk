"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from "@/lib/supabase"; // Supabase bağlantısı
import { useRouter } from "next/navigation"; // Yönlendirme için

export default function UserLoginPage() {
  const router = useRouter();
  
  // Input verilerini tutan state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Supabase Auth ile Giriş İşlemi
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert("Giriş başarısız: " + error.message);
    } else {
      alert("Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz.");
      router.push("/"); // Başarılı girişte ana sayfaya yolla
    }
  };

  // Input değişimlerini yakalayan fonksiyon
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.type]: e.target.value });
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
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-[oklch(0.65_0.25_295)] rounded-full blur-[180px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-[oklch(0.5_0.3_280)] rounded-full blur-[150px] opacity-10"></div>
      </div>

      <main className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md space-y-10 p-8 sm:p-10 rounded-3xl bg-[oklch(0.15_0.02_280_/_0.3)] backdrop-blur-xl border border-[oklch(0.25_0.03_280_/_0.5)] shadow-2xl">
          
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-12 h-12 rounded-2xl bg-[oklch(0.65_0.25_295_/_0.1)] border border-[oklch(0.65_0.25_295_/_0.2)] flex items-center justify-center">
                <User className="w-6 h-6 text-[oklch(0.65_0.25_295)]" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-[oklch(0.95_0_0)] to-[oklch(0.7_0_0)] bg-clip-text text-transparent">
              Hoş Geldiniz
            </h1>
            <p className="text-[oklch(0.55_0_0)] text-base">
              Vibe&apos;ınızı keşfetmeye devam etmek için giriş yapın.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[oklch(0.1_0.01_280_/_0.4)] border border-[oklch(0.2_0.02_280_/_0.5)] rounded-2xl text-white outline-none focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] transition-all duration-300"
                placeholder="E-posta adresiniz"
              />
              <input
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full h-14 px-5 bg-[oklch(0.1_0.01_280_/_0.4)] border border-[oklch(0.2_0.02_280_/_0.5)] rounded-2xl text-white outline-none focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] transition-all duration-300"
                placeholder="Şifre"
              />
            </div>

            <button type="submit" className="group w-full h-14 bg-white text-black rounded-2xl font-bold text-lg hover:bg-[oklch(0.95_0_0)] transform transition-all active:scale-[0.97] shadow-xl flex items-center justify-center gap-2">
              Giriş Yap
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="flex flex-col items-center space-y-6 pt-2">
            <div className="text-sm text-[oklch(0.55_0_0)]">
              Hesabınız yok mu?{" "}
              <Link href="/auth/register" className="text-white font-bold hover:text-[oklch(0.65_0.25_295)] transition-colors underline-offset-4 hover:underline">
                Hemen Kayıt Ol
              </Link>
            </div>

            <div className="w-full pt-6 border-t border-[oklch(0.2_0.02_280_/_0.5)]">
              <Link href="/auth/login/seller" className="group w-full h-12 flex items-center justify-center gap-2 rounded-xl border border-[oklch(0.65_0.25_295_/_0.3)] text-[oklch(0.65_0.25_295)] hover:bg-[oklch(0.65_0.25_295_/_0.1)] transition-all text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Satıcı mısınız? Mağaza Paneline Git
              </Link>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[oklch(0.06_0.015_280)] to-transparent pointer-events-none z-20" />
    </div>
  );
}