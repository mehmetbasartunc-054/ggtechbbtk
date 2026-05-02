'use client';

import { useEffect, useState, ReactNode } from 'react';
import { Mountain, Droplets, Zap, Coffee, Music, Moon, ShoppingBag, Eye, Heart, PackageCheck } from 'lucide-react';

function getVibeIcon(actionStr: string, vibeStr: string): ReactNode {
  const a = actionStr.toLowerCase();
  const v = vibeStr.toLowerCase();

  // Önce eyleme göre ikon (Satın alma, favori vb.)
  if (a.includes('satın aldı') || a.includes('tamamladı')) return <PackageCheck className="w-5 h-5 text-zinc-300" />;
  if (a.includes('sepete')) return <ShoppingBag className="w-5 h-5 text-zinc-300" />;
  if (a.includes('favori')) return <Heart className="w-5 h-5 text-zinc-300" />;
  if (a.includes('inceliyor') || a.includes('değerlendiriyor')) return <Eye className="w-5 h-5 text-zinc-300" />;

  // Eylem bulunamazsa Vibe'a göre ikon
  if (v.includes('doğa') || v.includes('dağ')) return <Mountain className="w-5 h-5 text-zinc-300" />;
  if (v.includes('sahil')) return <Droplets className="w-5 h-5 text-zinc-300" />;
  if (v.includes('performans')) return <Zap className="w-5 h-5 text-zinc-300" />;
  if (v.includes('kahve')) return <Coffee className="w-5 h-5 text-zinc-300" />;
  if (v.includes('festival')) return <Music className="w-5 h-5 text-zinc-300" />;
  if (v.includes('cyberpunk') || v.includes('neon')) return <Moon className="w-5 h-5 text-zinc-300" />;

  return <ShoppingBag className="w-5 h-5 text-zinc-300" />;
}

const feedItems = [
  // Tamamen gerçekçi, FOMO yaratan müşteri eylemleri
  { name: "Ayşe H.", action: "az önce", vibe: "Yağmurlu Pazar Kahvesi", suffix: "tarzına uygun 3 ürünü sepete ekledi." },
  { name: "Can B.", action: "şu an", vibe: "Sokak Stili", suffix: "koleksiyonunu inceliyor." },
  { name: "Zeynep A.", action: "az önce", vibe: "İskandinav Tarzı", suffix: "kombini ile alışverişini tamamladı." },
  { name: "Burak T.", action: "az önce", vibe: "Festival Gecesi", suffix: "vibe'ına uygun bir ceket satın aldı." },
  { name: "Elif D.", action: "şu an", vibe: "Vintage 90'lar", suffix: "tarzı için önerileri değerlendiriyor." },
  { name: "Oğuzhan Y.", action: "az önce", vibe: "Alp Dağları Yürüyüşü", suffix: "kürasyonundan bir kamp çantası aldı." },
  { name: "Selin M.", action: "az önce", vibe: "Özel Gün", suffix: "koleksiyonunu favorilerine ekledi." },
  { name: "Deniz B.", action: "şu an", vibe: "Yüksek Performans", suffix: "kategorisinde tarzını oluşturuyor." },
];

export function LiveFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const initialDelay = setTimeout(() => setIsVisible(true), 1500);
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % feedItems.length);
        setIsVisible(true);
      }, 800);
    }, 7000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  const currentItem = feedItems[currentIndex];

  return (
    <div className="fixed bottom-10 left-10 z-[100] pointer-events-none">
      <div
        className={`transition-all duration-1000 ease-in-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
          }`}
      >
        <div className="flex items-center gap-4 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/50 p-4 pr-6 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative overflow-hidden group max-w-[420px]">

          <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/10 to-transparent opacity-30" />

          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
            {/* İkonu artık hem yapılan eyleme hem de vibe'a göre seçiyoruz */}
            {getVibeIcon(currentItem.suffix, currentItem.vibe)}
          </div>

          <div className="relative flex-1 py-1">
            <p className="text-[13px] text-zinc-400 font-light tracking-wide leading-[1.6]">
              <span className="text-zinc-200 font-medium">{currentItem.name}</span> {currentItem.action}{" "}
              <span className="text-zinc-100 font-semibold italic">
                {currentItem.vibe}
              </span>{" "}
              {currentItem.suffix}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}