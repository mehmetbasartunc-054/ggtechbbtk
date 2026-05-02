'use client';

import { useState } from 'react';

// DEV_MODE: Tasarımı test ederken true yapabilirsin.
// Sunumda yapay zekanın gerçek cevap vermesi için FALSE yapmayı unutma!
const DEV_MODE = false;

export default function VibeSearch({ onAnalysisComplete }: { onAnalysisComplete: (vibe: string) => void }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const analyzeIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setLogs([]);

    // AI Log Animasyonu
    const logSteps = [
      "🔍 Giriş metni analiz ediliyor...",
      "🧠 NLP modelleri yükleniyor (Gemini-2.5)...",
      "✨ Anahtar kelimeler ayıklanıyor...",
      "📊 Kategori skorları hesaplanıyor...",
      "🚀 Stil kataloğu küratize ediliyor..."
    ];

    logSteps.forEach((step, i) => {
      setTimeout(() => setLogs(prev => [...prev, step]), i * 600);
    });

    try {
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 3500));
        const q = query.toLowerCase();
        if (q.includes('spor') || q.includes('koş') || q.includes('fitness') || q.includes('gym')) {
          onAnalysisComplete('spor');
        } else if (q.includes('doğa') || q.includes('kamp') || q.includes('trek') || q.includes('tracking')) {
          onAnalysisComplete('tracking');
        } else {
          onAnalysisComplete('sahil');
        }
        return;
      }

      // GERÇEK API ÇAĞRISI
      const promptText = `Sen bir e-ticaret stil danışmanısın. Kullanıcı şunu yazdı: "${query}". 
Bu metne en uygun kategoriyi şu üçünden biri olarak seç: 'sahil', 'tracking', veya 'spor'. 
Cevap olarak SADECE seçtiğin kelimeyi ver, başka hiçbir şey yazma.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,

        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: promptText }]
            }]
          })
        }
      );

      const data = await res.json();

      if (data.error) {
        console.error("API Hatası:", data.error.message);
        onAnalysisComplete('sahil');
        return;
      }

      const rawVibe = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || 'sahil';

      if (rawVibe.includes('tracking')) onAnalysisComplete('tracking');
      else if (rawVibe.includes('spor')) onAnalysisComplete('spor');
      else onAnalysisComplete('sahil');

    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      onAnalysisComplete('sahil');
    } finally {
      setLoading(false);
      setQuery('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 relative z-10">
      <form onSubmit={analyzeIntent} className="flex flex-col gap-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Bugün nasıl hissediyorsun? Stilini hayal edelim..."
          className="w-full p-5 rounded-2xl border border-zinc-800 bg-black/60 text-white backdrop-blur-xl focus:border-zinc-500 transition-all outline-none text-center text-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="relative group overflow-hidden px-6 py-4 bg-white text-black font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50"
        >
          <span className="relative z-10">{loading ? "Kişisel Stiliniz Yaratılıyor..." : "Tarzını Bul.. ✨"}</span>
        </button>

        {/* LOG PENCERESİ */}
        {loading && (
          <div className="mt-6 p-4 rounded-xl bg-black/60 border border-emerald-500/30 font-mono text-left space-y-2 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">AI Engine Logs</span>
            </div>
            {logs.map((log, i) => (
              <div key={i} className="text-[10px] text-zinc-400 animate-in slide-in-from-left-2 duration-300">
                <span className="text-emerald-900 mr-2">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span> {log}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}