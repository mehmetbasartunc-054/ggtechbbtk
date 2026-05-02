"use client"

import { useState } from "react"
import { Sparkles, ArrowRight } from "lucide-react"

const DEV_MODE = true

interface VibeInputProps {
  onAnalysisComplete: (vibe: string) => void
}

export function VibeInput({ onAnalysisComplete }: VibeInputProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [loading, setLoading] = useState(false)

  const analyzeIntent = async () => {
    if (!query.trim()) return

    setLoading(true)

    try {
      if (DEV_MODE) {
        await new Promise((r) => setTimeout(r, 1500))
        onAnalysisComplete("sahil")
        setQuery("")
        setLoading(false)
        return
      }

      const promptText = `
      Kullanıcı şunu yazdı: "${query}"

      En uygun kategoriyi seç:
      - sahil
      - tracking
      - spor

      Sadece kategori ismini döndür.
      `

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: promptText }]
              }
            ]
          })
        }
      )

      const data = await res.json()

      const raw =
        data?.candidates?.[0]?.content?.parts?.[0]?.text
          ?.trim()
          ?.toLowerCase() || "sahil"

      if (raw.includes("tracking")) onAnalysisComplete("tracking")
      else if (raw.includes("spor")) onAnalysisComplete("spor")
      else onAnalysisComplete("sahil")
    } catch (err) {
      console.error(err)
      onAnalysisComplete("sahil")
    } finally {
      setLoading(false)
      setQuery("")
    }
  }

  return (
    <>
      <div className="relative w-full max-w-3xl mx-auto">
        <div
          className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-[oklch(0.55_0.25_295)] via-[oklch(0.65_0.3_280)] to-[oklch(0.55_0.25_295)] opacity-75 blur-xl transition-all duration-500 ${
            isFocused ? "opacity-100 scale-105" : "opacity-50"
          }`}
        />

        <div
          className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.55_0.3_280)] transition-opacity duration-300 ${
            isFocused ? "opacity-100" : "opacity-60"
          }`}
        />

        <div className="relative flex items-center gap-4 rounded-2xl bg-[oklch(0.1_0.02_280_/_0.8)] backdrop-blur-xl border border-[oklch(0.3_0.05_295_/_0.3)] p-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Describe your vibe or weekend plan..."
            className="flex-1 bg-transparent text-lg text-[oklch(0.95_0_0)] placeholder:text-[oklch(0.5_0_0)] focus:outline-none py-3"
            onKeyDown={(e) => {
              if (e.key === "Enter") analyzeIntent()
            }}
          />

          <button
            onClick={analyzeIntent}
            className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
              query
                ? "bg-gradient-to-br from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] hover:scale-105"
                : "bg-[oklch(0.2_0.02_280)] cursor-not-allowed"
            }`}
            disabled={!query || loading}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p className="mt-6 text-white tracking-widest uppercase">
            AI analyzing vibe...
          </p>
        </div>
      )}
    </>
  )
}