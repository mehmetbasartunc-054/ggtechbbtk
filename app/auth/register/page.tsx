"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowRight, Store, User, CheckCircle2, Sparkles } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type AccountType = 'bireysel' | 'ticari';

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>('bireysel');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    storeName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            account_type: accountType,
            store_name: accountType === 'ticari' ? formData.storeName : null,
          }
        }
      });

      if (error) throw error;

      // Profil tablosuna da kaydet
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          account_type: accountType,
          store_name: accountType === 'ticari' ? formData.storeName : null,
        });
      }

      alert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.");
      router.push("/auth/login");
    } catch (error: any) {
      alert("Hata oluştu: " + (error?.message || "Bilinmeyen hata"));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <main className="relative min-h-screen bg-[#09090b] text-white flex flex-col justify-center items-center px-4 py-12 overflow-hidden">

      {/* ARKA PLAN */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] bg-purple-500 rounded-full blur-[250px] opacity-[0.07]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px] opacity-[0.05]" />
      </div>

      {/* SOL ÜST LOGO */}
      <nav className="fixed top-0 left-0 w-full p-8 z-[100] pointer-events-none">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 pointer-events-auto transition-transform hover:scale-[1.02]"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Vibe<span className="text-purple-400">Cart</span>
          </span>
        </Link>
      </nav>

      <div className="relative z-10 w-full max-w-lg space-y-8">

        {/* BAŞLIK */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" /> Yeni Hesap
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Hesap <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Oluştur</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            VibeCart ekosistemine katıl, alışverişin geleceğini keşfet.
          </p>
        </div>

        {/* HESAP TÜRÜ SEÇİMİ */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setAccountType('bireysel')}
            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
              accountType === 'bireysel'
                ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${
              accountType === 'bireysel' ? 'bg-emerald-500 text-black' : 'bg-white/5 text-zinc-500'
            }`}>
              <User className="w-5 h-5" />
            </div>
            <p className={`font-bold text-sm ${accountType === 'bireysel' ? 'text-white' : 'text-zinc-400'}`}>Bireysel</p>
            <p className="text-[10px] text-zinc-500 mt-1">Alışveriş yap, siparişlerini takip et</p>
            {accountType === 'bireysel' && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={() => setAccountType('ticari')}
            className={`relative p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
              accountType === 'ticari'
                ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all ${
              accountType === 'ticari' ? 'bg-purple-500 text-white' : 'bg-white/5 text-zinc-500'
            }`}>
              <Store className="w-5 h-5" />
            </div>
            <p className={`font-bold text-sm ${accountType === 'ticari' ? 'text-white' : 'text-zinc-400'}`}>Ticari</p>
            <p className="text-[10px] text-zinc-500 mt-1">Ürün ekle, mağazanı yönet</p>
            {accountType === 'ticari' && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-purple-500" />
              </div>
            )}
          </button>
        </div>

        {/* FORM */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" name="firstName" required
                value={formData.firstName} onChange={handleChange}
                className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                placeholder="Ad"
              />
              <input
                type="text" name="lastName" required
                value={formData.lastName} onChange={handleChange}
                className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                placeholder="Soyad"
              />
            </div>

            <input
              type="email" name="email" required
              value={formData.email} onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              placeholder="E-posta adresi"
            />

            <input
              type="password" name="password" required minLength={6}
              value={formData.password} onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
              placeholder="Şifre (en az 6 karakter)"
            />

            {/* TİCARİ HESAP: MAĞAZA ADI */}
            {accountType === 'ticari' && (
              <div className="pt-2 border-t border-white/5 space-y-3">
                <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest">Mağaza Bilgileri</p>
                <input
                  type="text" name="storeName" required
                  value={formData.storeName} onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl bg-black/40 border border-purple-500/30 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  placeholder="Mağaza / Marka Adı"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`group w-full h-14 rounded-2xl font-bold text-lg transform transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${
              accountType === 'ticari'
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-purple-500/30'
                : 'bg-white text-black hover:bg-zinc-100'
            }`}
          >
            {loading ? 'Oluşturuluyor...' : (
              <>
                {accountType === 'ticari' ? 'Ticari Hesap Oluştur' : 'Hesap Oluştur'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* ALT LİNKLER */}
        <div className="text-center space-y-3 pt-4 border-t border-white/5">
          <p className="text-sm text-zinc-500">
            Zaten hesabın var mı?{" "}
            <Link href="/auth/login" className="text-white font-bold hover:text-purple-400 transition-colors">
              Giriş Yap
            </Link>
          </p>
        </div>

        {/* ÖZELLİKLER */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {['AI Asistan', 'Güvenli Ödeme', 'Hızlı Teslimat'].map((f) => (
            <div key={f} className="flex items-center justify-center gap-1.5 text-[9px] text-zinc-600 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
              {f}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none z-20" />
    </main>
  );
}