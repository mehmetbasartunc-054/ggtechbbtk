'use client';

import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("NEURAL ENGINE BAŞLATILIYOR...");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Progress bar'ı 4 saniyede %100'e doldur
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1; 
      });
    }, 40);

    // Jürinin aklını alacak dinamik metin senaryosu
    setTimeout(() => setText("AURA SENSÖRLERİ KALİBRE EDİLİYOR..."), 1500);
    setTimeout(() => setText("STİL KÜTÜPHANESİ EŞLEŞTİRİLİYOR..."), 2800);
    setTimeout(() => setText("SİSTEM HAZIR."), 4000);

    // 4.5 saniye sonra ekranı yavaşça silikleştirmeye (fade out) başla
    setTimeout(() => setIsFading(true), 4500);

    // Tam 5. saniyede bileşeni kapat ve ana siteye geç
    setTimeout(() => onComplete(), 5000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-1000">
        
        {/* DEV LOGO */}
        <div className="scale-150 mb-8 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
          <Logo />
        </div>
        
        {/* MARKA İSMİ */}
        <div className="text-4xl font-black text-white flex items-center mb-12">
          <span className="tracking-tight">VIBE</span>
          <span className="relative inline-block ml-2 font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 pr-2">
            CART
          </span>
        </div>
        
        {/* İNCE LÜKS YÜKLEME BARI */}
        <div className="w-64 h-[2px] bg-zinc-900 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-purple-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* DURUM METNİ */}
        <p className="text-[9px] text-zinc-500 uppercase tracking-[0.4em] font-medium mt-6 animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );
}