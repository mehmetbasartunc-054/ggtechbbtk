'use client';

import { useState } from "react";
import { Heart, Plus, Sparkles } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export function ProductCard({ product }: { product: any }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.suggestedSize || 'M');
  const { addItem } = useCart();

  // Sayfadan gelen yapay zeka yorumu ve skorunu güvenli bir şekilde alıyoruz
  const dynamicRationale = product.aiReason || product.aiComment || product.reason || "Kişisel stil analizine göre eşleştirildi.";
  const matchScore = product.matchScore || product.match || product.aiMatch || 90;

  return (
    <div
      className="relative w-full group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 1. ANA KART KAPSAYICISI */}
      <div className="relative rounded-[2rem] bg-[#121214] border border-white/5 overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">

        {/* 2. AI MATCH ROZETİ */}
        <div className="absolute top-0 left-0 z-50 flex items-center gap-1.5 px-4 py-2 bg-emerald-500 rounded-br-[1.5rem] shadow-[0_5px_15px_rgba(16,185,129,0.3)] pointer-events-none">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-emerald-900 uppercase leading-none">AI Match</span>
            <span className="text-sm font-mono font-black text-white leading-none">%{matchScore}</span>
          </div>
        </div>

        {/* Favori Butonu */}
        <button className="absolute top-4 right-4 z-40 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all">
          <Heart className="w-5 h-5" />
        </button>

        {/* 3. RESİM ALANI - SABİT YÜKSEKLİK */}
        <div className="relative w-full h-72 bg-[#1a1a1c] overflow-hidden">
          <img
            src={product.image || product.img || product.imageUrl || "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80"}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110 opacity-30' : 'scale-100 opacity-100'}`}
          />

          {/* Hover Durumunda Çıkan Yapay Zeka Yorumu */}
          <div
            className={`absolute inset-0 bg-emerald-950/90 flex items-center justify-center p-6 text-center transition-all duration-500 ${
              isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <Sparkles className="w-8 h-8 text-emerald-400" />
              <p className="text-emerald-100 text-sm italic font-medium leading-relaxed">
                "{dynamicRationale}"
              </p>
            </div>
          </div>
        </div>

        {/* 4. ALT BİLGİ ALANI (Başlık, Fiyat ve Sepete Ekle) */}
        <div className="p-6 relative z-30 bg-[#121214]">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              {product.brand || "GENEL MARKALAR"}
            </p>
            <div className="flex gap-1">
              {product.sex && <span className="text-[9px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full uppercase">{product.sex}</span>}
            </div>
          </div>
          <h3 className="text-white font-semibold text-lg leading-tight mb-4 line-clamp-2">
            {product.name}
          </h3>

          <div className="mb-4">
            <p className="text-[10px] text-zinc-500 uppercase font-bold mb-2">Beden Seç:</p>
            <div className="flex gap-2">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(s);
                  }}
                  className={`w-7 h-7 rounded text-[10px] font-bold transition-all ${
                    selectedSize === s 
                      ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between mt-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white leading-none">
                {product.price || "0"}
              </span>
              <span className="text-sm text-zinc-500 font-bold">TL</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (addItem) {
                  addItem({ ...product, selectedSize });
                }
              }}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-emerald-400 hover:scale-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              title="Sepete Ekle"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}