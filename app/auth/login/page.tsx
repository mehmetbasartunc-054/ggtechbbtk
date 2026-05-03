"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Lock } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Kullanıcının hesap türünü kontrol et
      const accountType = data.user?.user_metadata?.account_type;

      if (accountType === 'ticari') {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      toast("Giriş başarısız: " + (error?.message || "Bilinmeyen hata"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#09090b] overflow-hidden">

      {/* ARKA PLAN */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[20%] w-[600px] h-[600px] bg-purple-500 rounded-full blur-[200px] opacity-[0.07] animate-pulse" />
        <div className="absolute bottom-[20%] left-[20%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[180px] opacity-[0.05]" />
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

      <main className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md space-y-8">

          {/* BAŞLIK */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/20 flex items-center justify-center backdrop-blur-xl">
                <Lock className="w-7 h-7 text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white">
              Tekrar <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">Hoşgeldin</span>
            </h1>
            <p className="text-zinc-500 text-sm">
              Hesabına giriş yap ve vibe'ını keşfetmeye devam et.
            </p>
          </div>

          {/* FORM */}
          <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5 block pl-1">E-posta</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-14 px-5 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none transition-all"
                    placeholder="ornek@mail.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1.5 block pl-1">Şifre</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-14 px-5 bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full h-14 bg-white text-black rounded-2xl font-bold text-lg hover:bg-zinc-100 transform transition-all active:scale-[0.97] shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Giriş yapılıyor...' : (
                  <>
                    Giriş Yap
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="flex flex-col items-center space-y-4 pt-4 border-t border-white/5">
              <p className="text-sm text-zinc-500">
                Hesabın yok mu?{" "}
                <Link href="/auth/register" className="text-white font-bold hover:text-purple-400 transition-colors">
                  Kayıt Ol
                </Link>
              </p>
            </div>
          </div>

          {/* ALT BİLGİ */}
          <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-600 uppercase tracking-[0.3em]">
            <Sparkles className="w-3 h-3 text-purple-500/50" />
            Powered by GG Team Neural Engine
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none z-20" />
    </div>
  );
}
