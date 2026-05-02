"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from "@/lib/supabase"; // Supabase bağlantısını içe aktar
import { useRouter } from "next/navigation"; // Yönlendirme için

export default function RegisterPage() {
  const router = useRouter();
  
  // Form verilerini tutacak state'ler
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Supabase Auth ile kayıt işlemi
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
        }
      }
    });

    if (error) {
      alert("Hata oluştu: " + error.message);
    } else {
      alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
      router.push("/auth/login/user");
    }
  };

  // Input değişimlerini yakalayan fonksiyon
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="relative min-h-screen bg-[oklch(0.06_0.015_280)] text-[oklch(0.95_0_0)] flex flex-col justify-center items-center px-4 py-12 overflow-hidden">
      
      {/* Sol Üst: Logo / Marka İsmi */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[oklch(0.65_0.25_295)] to-[oklch(0.45_0.3_280)] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xs">V</span>
          </div>
          <span className="text-xl font-semibold text-[oklch(0.95_0_0)] tracking-tight">
            Vibe<span className="text-[oklch(0.65_0.25_295)]">Cart</span>
          </span>
        </Link>
      </div>

      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[oklch(0.65_0.25_295)] rounded-full blur-[200px] opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[oklch(0.45_0.3_280)] rounded-full blur-[180px] opacity-10"></div>
      </div>

      <div className="relative z-10 max-lg w-full space-y-8 p-8 sm:p-10 rounded-3xl bg-[oklch(0.15_0.02_280_/_0.3)] backdrop-blur-xl border border-[oklch(0.25_0.03_280_/_0.5)] shadow-2xl">
        
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[oklch(0.65_0.25_295)] to-[oklch(0.75_0.2_280)] flex items-center justify-center shadow-lg shadow-[oklch(0.65_0.25_295_/_0.3)]">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Yeni Hesap Oluştur</h1>
          <p className="text-[oklch(0.55_0_0)]">VibeCart ekosistemine ilk adımınızı atın.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-[oklch(0.7_0_0)]">Ad</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-[oklch(0.1_0.01_280_/_0.6)] border border-[oklch(0.2_0.02_280_/_0.8)] rounded-xl text-white placeholder:text-[oklch(0.4_0_0)] focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all"
                placeholder="Barış Can"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1 text-[oklch(0.7_0_0)]">Soyad</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-[oklch(0.1_0.01_280_/_0.6)] border border-[oklch(0.2_0.02_280_/_0.8)] rounded-xl text-white placeholder:text-[oklch(0.4_0_0)] focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all"
                placeholder="Daşcı"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-[oklch(0.7_0_0)]">E-posta</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-[oklch(0.1_0.01_280_/_0.6)] border border-[oklch(0.2_0.02_280_/_0.8)] rounded-xl text-white placeholder:text-[oklch(0.4_0_0)] focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all"
              placeholder="ornek@mail.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ml-1 text-[oklch(0.7_0_0)]">Şifre</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full h-12 px-4 bg-[oklch(0.1_0.01_280_/_0.6)] border border-[oklch(0.2_0.02_280_/_0.8)] rounded-xl text-white placeholder:text-[oklch(0.4_0_0)] focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="group w-full h-14 bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.55_0_280)] text-white rounded-2xl font-bold text-lg hover:opacity-90 transform transition-all active:scale-[0.98] shadow-lg shadow-[oklch(0.65_0.25_295_/_0.3)] flex items-center justify-center gap-2"
          >
            Hesabı Oluştur
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="pt-6 border-t border-[oklch(0.2_0.02_280_/_0.5)] text-center">
          <p className="text-sm text-[oklch(0.55_0_0)]">
            Zaten üye misiniz?{" "}
            <Link href="/auth/login/user" className="text-white font-bold hover:text-[oklch(0.65_0.25_295)] transition-colors underline-offset-4 hover:underline">
              Giriş Yapın
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 text-center">
          <div className="flex items-center justify-center gap-2 text-[10px] text-[oklch(0.5_0_0)] uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3 text-[oklch(0.65_0.25_295)]" />
            Hızlı Teslimat
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] text-[oklch(0.5_0_0)] uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3 text-[oklch(0.65_0.25_295)]" />
            Güvenli Ödeme
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[oklch(0.06_0.015_280)] to-transparent pointer-events-none z-20" />
    </main>
  );
}