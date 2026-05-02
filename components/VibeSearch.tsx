'use client';

import { useState } from 'react';

// DEV_MODE: Tasarımı test ederken true yapabilirsin.
// Sunumda yapay zekanın gerçek cevap vermesi için FALSE yapmayı unutma!
const DEV_MODE = false;

export default function VibeSearch({ onAnalysisComplete }: { onAnalysisComplete: (analysis: { vibe: string, sex?: string | null, size?: string | null }) => void }) {
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
          onAnalysisComplete({ vibe: 'spor' });
        } else if (q.includes('doğa') || q.includes('kamp') || q.includes('trek') || q.includes('tracking')) {
          onAnalysisComplete({ vibe: 'tracking' });
        } else {
          onAnalysisComplete({ vibe: 'sahil' });
        }
        return;
      }

      // GERÇEK API ÇAĞRISI
      const promptText = `Sen bir e-ticaret yapay zeka stil danışmanısın. Kullanıcının yazdığı cümleyi analiz edeceksin.

Kullanıcı şunu yazdı: "${query}"

GÖREV: Bu metni analiz et ve aşağıdaki JSON formatında cevap ver.

CİNSİYET TESPİTİ KURALLARI (ÇOK ÖNEMLİ):
- "erkek", "beyefendi", "bay", "adam", "abi", "abim", "takım elbise", "kravat", "erkek gömlek" gibi kelimeler varsa → sex: "erkek"
- "kadın", "bayan", "hanımefendi", "ablam", "elbise", "etek", "topuklu", "kadın ayakkabı" gibi kelimeler varsa → sex: "kadin"
- "erkeğim", "erkek olarak", "benim için erkek", "kız arkadaşıma" (bu durumda kadın ürünü) gibi bağlamsal ipuçları da değerlendir
- "kız arkadaşıma", "sevgilime kadın", "annem için" gibi ifadeler kadın ürünü demektir
- "erkek arkadaşıma", "babam için", "abime" gibi ifadeler erkek ürünü demektir
- Eğer cinsiyet hiç anlaşılamıyorsa → sex: null

TARZ TESPİTİ KURALLARI:
- Deniz, plaj, yaz, tatil, sahil, güneş, mayo → vibe: "sahil"
- Doğa, kamp, trekking, dağ, yürüyüş, outdoor → vibe: "tracking"  
- Spor, fitness, koşu, gym, antrenman, egzersiz → vibe: "spor"
- Emin olamıyorsan en yakın kategoriyi seç

BEDEN TESPİTİ: Eğer metinde XS, S, M, L, XL, XXL gibi bir beden yazıyorsa onu al, yoksa null yap.

CEVAP FORMATI (SADECE BU JSON'U DÖNDÜR, BAŞKA HİÇBİR ŞEY YAZMA):
{
  "vibe": "sahil veya tracking veya spor",
  "sex": "erkek veya kadin veya null",
  "size": "XS veya S veya M veya L veya XL veya XXL veya null"
}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,

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
      console.log("Gemini API Yanıtı:", JSON.stringify(data).substring(0, 500));

      if (data.error) {
        console.error("API Hatası DETAY:", JSON.stringify(data.error));
        if (data.error.message?.includes('quota') || data.error.message?.includes('rate')) {
          alert("\u26a0\ufe0f API limit a\u015f\u0131ld\u0131! L\u00fctfen 1 dakika bekleyip tekrar deneyin.");
        } else {
          alert("API Hatas\u0131: " + data.error.message);
        }
        setLoading(false);
        return;
      }

      const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
      const jsonStr = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      let analysisResult = { vibe: 'sahil', sex: null, size: null } as any;

      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.vibe && ['sahil', 'tracking', 'spor'].includes(parsed.vibe.toLowerCase())) {
          analysisResult.vibe = parsed.vibe.toLowerCase();
        } else {
          const textLower = jsonStr.toLowerCase();
          if (textLower.includes('tracking')) analysisResult.vibe = 'tracking';
          else if (textLower.includes('spor')) analysisResult.vibe = 'spor';
        }
        if (parsed.sex) analysisResult.sex = parsed.sex.toLowerCase();
        if (parsed.size) analysisResult.size = parsed.size.toUpperCase();
      } catch (error) {
        console.error("JSON Parse Hatası:", error);
        const textLower = jsonStr.toLowerCase();
        if (textLower.includes('tracking')) analysisResult.vibe = 'tracking';
        else if (textLower.includes('spor')) analysisResult.vibe = 'spor';
      }

      onAnalysisComplete(analysisResult);

    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      onAnalysisComplete({ vibe: 'sahil' });
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