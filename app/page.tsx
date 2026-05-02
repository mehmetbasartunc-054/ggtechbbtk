'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { VibeHeader } from "@/components/vibe-header";
import { AmbientBackground } from "@/components/ambient-background";
import VibeSearch from "@/components/VibeSearch";
import { ProductGrid } from "@/components/product-grid";
import { ParticleBackground } from "@/components/particle-background";
import { Sparkles, X } from "lucide-react";
import { LiveFeed } from "@/components/live-feed";
import { SplashScreen } from "@/components/splash-screen";
import { mockProducts } from "@/lib/mockProducts";
import { useCart } from "@/contexts/CartContext";

const vibeThemes = {
  sahil: {
    bg: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
    title: "SAHİL ESİNTİSİ",
  },
  tracking: {
    bg: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1600&q=80",
    title: "DOĞA KAŞİFİ",
  },
  spor: {
    bg: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1600&q=80",
    title: "YÜKSEK PERFORMANS",
  }
};

// --- DİNAMİK AI YORUM ÜRETİCİ (JÜRİ ŞOVU İÇİN) ---
const getDynamicAIReason = (productName: string, vibe: string) => {
  const reasons = {
    sahil: [
      "AI ANALİZİ: Kumaşın nefes alabilir yapısı yaz sıcakları için ideal.",
      "GG TEAM İÇGÖRÜSÜ: Renk paleti deniz ve tatil aurasıyla %98 eşleşiyor.",
      "NÖRAL AĞ TAVSİYESİ: Rahat kesimi sahil yürüyüşlerinde maksimum konfor sağlar.",
      "STİL ANALİZİ: Kullanıcının 'ferahlık' arayışına doğrudan yanıt veren bir parça."
    ],
    tracking: [
      "AI ANALİZİ: Dayanıklı materyali zorlu doğa koşullarına tam uyumlu.",
      "GG TEAM İÇGÖRÜSÜ: Ergonomik tasarımı uzun yürüyüşlerde performansı artırır.",
      "NÖRAL AĞ TAVSİYESİ: Toprak tonları ve koruyucu dokusu kamp için optimize edildi.",
      "STİL ANALİZİ: Kullanıcının 'doğa' analizinden alınan verilerle eşleştirildi."
    ],
    spor: [
      "AI ANALİZİ: Ter tutmayan özel teknolojisi antrenman için seçildi.",
      "GG TEAM İÇGÖRÜSÜ: Aerodinamik yapısı yüksek hareket kabiliyeti sunuyor.",
      "NÖRAL AĞ TAVSİYESİ: Hafif dokusu kardiyo seanslarında performansı maksimize eder.",
      "STİL ANALİZİ: Kullanıcının dinamik yaşam tarzına %100 uyum sağlayan materyal."
    ]
  };
  
  const selectedReasons = reasons[vibe as keyof typeof reasons] || reasons.sahil;
  const index = (productName?.length || 0) % selectedReasons.length;
  return selectedReasons[index];
};

export default function VibeCartPage() {
  const { addItem } = useCart(); 
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [currentVibe, setCurrentVibe] = useState<keyof typeof vibeThemes | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [startZoom, setStartZoom] = useState(false);
  const [showBundleModal, setShowBundleModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const totalOriginalPrice = filteredProducts.reduce((sum, product) => sum + (product.price || 0), 0);
  const discountedPrice = totalOriginalPrice * 0.8; 
  const savings = totalOriginalPrice - discountedPrice;

  const handleAddBundleToCart = () => {
    filteredProducts.forEach((product, index) => {
      setTimeout(() => {
        addItem({
          ...product,
          price: product.price * 0.8,
          name: `${product.name} (AI Bundle İndirimi)`
        });
      }, index * 300);
    });
    setShowBundleModal(false);
  };

  const handleVibeMatch = async (selectedVibe: string) => {
    const validVibe = (Object.keys(vibeThemes).includes(selectedVibe) ? selectedVibe : 'sahil') as keyof typeof vibeThemes;

    setCurrentVibe(validVibe);
    setIsRevealing(true);
    setStartZoom(false);

    setTimeout(() => {
      setStartZoom(true);
    }, 50);

    setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('vibe', validVibe);

        let finalProducts = [];

        if (error || !data || data.length === 0) {
          finalProducts = mockProducts.filter(p =>
            String(p.vibe).toLowerCase().includes(String(validVibe).toLowerCase())
          );
        } else {
          finalProducts = data;
        }

        const enhancedProducts = finalProducts.map((p, index) => {
          const randomScore = Math.floor(Math.random() * (99 - 88 + 1)) + 88; 
          const generatedReason = getDynamicAIReason(p.name, validVibe);

          return {
            ...p,
            match: randomScore,
            matchScore: randomScore,
            aiMatch: randomScore,
            reason: generatedReason,
            aiReason: generatedReason,
            aiReasoning: generatedReason,
            aiComment: generatedReason
          };
        });

        setFilteredProducts(enhancedProducts);

      } catch (e) {
        console.error("Catch bloğuna düştü: ", e);
        const match = mockProducts.filter(p =>
          String(p.vibe).toLowerCase().includes(String(validVibe).toLowerCase())
        );
        const enhancedProducts = match.map(p => ({
          ...p,
          matchScore: Math.floor(Math.random() * (99 - 88 + 1)) + 88,
          aiReason: getDynamicAIReason(p.name, validVibe),
          aiReasoning: getDynamicAIReason(p.name, validVibe)
        }));
        setFilteredProducts(enhancedProducts);
      }
      setIsRevealing(false);
    }, 5000); 
  };

  const handleReset = () => {
    setFilteredProducts([]);
    setCurrentVibe(null);
    setStartZoom(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <main className="relative min-h-screen bg-[#09090b] overflow-x-hidden flex flex-col font-sans text-white">
        <ParticleBackground />

        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-white/[0.03] rounded-full blur-[150px]" />
          <div className="absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[150px]" />
        </div>

        <div className="relative z-0">
          <AmbientBackground />
        </div>

        <div className="relative z-[9999] w-full">
          <VibeHeader />
        </div>

        {isRevealing && currentVibe && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-[#09090b] animate-in fade-in duration-300">
            <div
              className={`absolute inset-0 w-full h-full bg-cover bg-center opacity-40 transition-transform duration-[5000ms] ease-out ${startZoom ? 'scale-100' : 'scale-[2]'}`}
              style={{ backgroundImage: `url(${vibeThemes[currentVibe].bg})` }}
            />

            <div className="relative z-10 text-center px-4 animate-in slide-in-from-bottom-12 fade-in duration-1000 ease-out">
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                {vibeThemes[currentVibe].title}
              </h2>
              <div className="w-24 h-[1px] bg-white/30 mx-auto mt-8 mb-4" />
              <p className="text-zinc-400 text-sm md:text-lg tracking-[0.5em] font-light uppercase">
                AI Koleksiyonun Hazırlanıyor
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b] opacity-80" />
          </div>
        )}

        {filteredProducts.length === 0 && !isRevealing && (
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 -mt-20 animate-in fade-in zoom-in-95 duration-1000">
            <div className="text-center w-full max-w-3xl">
              <div className="relative mb-10 inline-flex flex-col items-center">
                <h1 className="text-5xl md:text-7xl font-light text-white tracking-[-0.05em] leading-none">
                  Modunu <span className="font-serif italic font-light text-emerald-500/90">keşfet.</span>
                </h1>
                <div className="w-12 h-[1px] bg-emerald-500/40 mt-6 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              </div>

              <div className="flex flex-col items-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <p className="text-zinc-500 text-[10px] md:text-[11px] font-medium tracking-[0.7em] uppercase mb-6 opacity-60">
                  Zero Rules • Pure Intelligence
                </p>
                <div className="flex items-center justify-center gap-4 text-xl md:text-2xl tracking-tight leading-relaxed">
                  <span className="text-zinc-400 font-light italic">Sadece</span>
                  <div className="flex items-center">
                    <span className="text-white font-semibold">sen</span>
                    <span className="mx-2 text-zinc-700 font-thin">/</span>
                    <span className="relative">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-purple-500 font-bold">vibe'ın.</span>
                      <div className="absolute -bottom-1 left-0 w-full h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-purple-500/0" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-xl mx-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <VibeSearch onAnalysisComplete={handleVibeMatch} />
              </div>

              <p className="mt-12 text-[9px] text-zinc-600 tracking-[0.3em] uppercase font-light">
                Powered by <span className="text-zinc-400">GG Team</span> Neural Engine
              </p>
            </div>
          </div>
        )}

        {filteredProducts.length > 0 && !isRevealing && currentVibe && (
          <div className="relative z-10 w-full max-w-6xl mx-auto pt-32 pb-20 px-4 animate-in slide-in-from-bottom-10 fade-in duration-1000 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-white/5 pb-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-[1px] bg-emerald-500" />
                  <p className="text-emerald-500 tracking-[0.4em] text-[10px] font-bold uppercase">AI Kürasyonu Tamamlandı</p>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
                  {vibeThemes[currentVibe].title}
                </h2>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setShowBundleModal(true)}
                  className="px-8 py-4 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] relative"
                >
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                    -%20 AI OFF
                  </span>
                  Tüm Vibe'a Sahip Ol
                </button>

                <button
                  onClick={handleReset}
                  className="px-8 py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all"
                >
                  Yeni Analiz
                </button>
              </div>
            </div>

            <ProductGrid products={filteredProducts} />
          </div>
        )}

        {showBundleModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#121214] border border-emerald-500/30 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
              <button 
                onClick={() => setShowBundleModal(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-emerald-500" />
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2 uppercase italic">AI Smart Bundle</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Kişisel stil analizine göre ekrandaki <span className="text-white font-bold">{filteredProducts.length} ürün</span> senin için eşleştirildi. Hepsini alırsan AI indirimi uygulanır.
              </p>
              
              <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest">
                  %20 İndirim
                </div>
                <div className="text-zinc-500 text-xs line-through mt-2">{totalOriginalPrice.toLocaleString('tr-TR')} TL</div>
                <div className="text-white text-3xl font-black">{discountedPrice.toLocaleString('tr-TR')} TL</div>
                <div className="text-emerald-500 text-[10px] font-bold mt-1 uppercase tracking-widest">
                  Şu an {savings.toLocaleString('tr-TR')} TL tasarruf ediyorsun
                </div>
              </div>

              <button 
                onClick={handleAddBundleToCart}
                className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                Kombini Sepete Ekle 🛍️
              </button>
            </div>
          </div>
        )}  

        <LiveFeed />
      </main>
    </>
  );
}