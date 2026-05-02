"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CreditCard, ShieldCheck, Truck, Lock, ShoppingBag, Loader2, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { AmbientBackground } from "@/components/ambient-background"
import { useCart } from "@/contexts/CartContext"

const CITIES = ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"].sort((a, b) => a.localeCompare(b));

// DINAMIK KONUM FONKSIYONU
const getVibeLocation = (city: string) => {
  if (!city) return "Vibe-Hub Ana Dağıtım Merkezi";
  const hubs = [
    "Ana Dağıtım Merkezi",
    "Lojistik Aktarma Üssü",
    "Vibe-Hub Bölge Müdürlüğü",
    "Akıllı Ayrıştırma Merkezi",
    "Sıralama Terminali"
  ];
  const index = city.length % hubs.length;
  return `${city} ${hubs[index]}`;
}

function generateOrderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = "VC-"
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default function CheckoutPage() {
  const { items, totalPrice, shippingCost, shippingZone, setShippingZone, clearCart } = useCart()
 const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  const [user, setUser] = useState<{ email: string; id: string } | null>(null)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderCode, setOrderCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isCardFlipped, setIsCardFlipped] = useState(false)

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", address: "", city: "", zipCode: ""
  })

  const [paymentData, setPaymentData] = useState({
    cardHolder: "", cardNumber: "", expiry: "", cvc: ""
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({ email: user.email!, id: user.id })
        setFormData(prev => ({ ...prev, email: user.email! }))
      }
    })
  }, [])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 11);
    if (value.length > 0 && value[0] !== '0') value = '0' + value;
    if (value.length > 1 && value[1] !== '5') value = value[0] + '5' + value.substring(2);
    setFormData({ ...formData, phone: value });
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 5);
    setFormData({ ...formData, zipCode: value });
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    setPaymentData({ ...paymentData, cardNumber: v.replace(/(\d{4})(?=\d)/g, '$1 ') });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) {
      let month = parseInt(v.substring(0, 2));
      if (month > 12) month = 12;
      if (month === 0) month = 1;
      const monthStr = month.toString().padStart(2, '0');
      v = monthStr + (v.length > 2 ? '/' + v.substring(2) : '');
    }
    setPaymentData({ ...paymentData, expiry: v });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return alert("Sepetiniz boş")
    setSubmitting(true)

    setSubmitting(true)
    const code = generateOrderCode()
    const total = totalPrice + shippingCost

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_code: code,
          user_id: user?.id || null,
          status: "pending",
          total,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          shipping_zone: shippingZone,
        })
        .select().single()
      if (orderError) throw orderError

      const orderItems = items.map(i => ({
        order_id: order.id,
        product_id: i.id,
        product_name: i.name,
        quantity: i.quantity,
        price: i.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      setOrderCode(code)
      setOrderComplete(true)
    } catch (error: unknown) {
      alert("Sipariş oluşturulamadı: " + (error instanceof Error ? error.message : ""))
    } finally {
      setSubmitting(false)
    }
  }

  if (orderComplete) {
    return (
      <main className="relative min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
        <AmbientBackground />
        
        <div className="relative z-10 w-full max-w-3xl space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 animate-pulse">
              Ödeme Onaylandı
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase">
              Yolculuk <span className="text-[oklch(0.65_0.25_295)]">Başladı</span>
            </h1>
            <p className="text-zinc-500 font-bold tracking-widest text-xs uppercase italic">
              Takip Numarası: <span className="text-white">{orderCode}</span>
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 text-center">Siparişin Alındı!</h1>
          <p className="text-zinc-400 mb-6 text-center">Sipariş takip kodun:</p>
          <p className="text-4xl font-black text-[oklch(0.65_0.25_295)] mb-8">{orderCode}</p>
          <div className="flex gap-4">
            <Link href="/" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white font-bold hover:scale-105 transition-transform">
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#09090b] text-white selection:bg-[oklch(0.65_0.25_295_/_0.3)]">
      <AmbientBackground />
      
      <nav className="fixed top-0 left-0 w-full p-8 z-[100]">
        <Link href="/" className="group inline-flex items-center gap-3 transition-transform hover:scale-105">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.25_295)] to-[#3b1f6e] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-xl font-bold tracking-tighter">VibeCart</span>
        </Link>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto pt-32 pb-20 px-6">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-8">
            <header className="space-y-2">
               <h1 className="text-4xl font-black tracking-tighter uppercase italic opacity-90">Güvenli Ödeme</h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl space-y-6 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 text-[oklch(0.65_0.25_295)]">
                  <Truck className="w-5 h-5" />
                  <h2 className="font-bold text-white uppercase tracking-widest text-xs">Teslimat Bilgileri</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text" required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ad Soyad"
                    className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all placeholder:text-zinc-600"
                  />
                  <input
                    type="tel" required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Telefon"
                    className="h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all placeholder:text-zinc-600"
                  />
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="E-posta"
                    className="md:col-span-2 h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all placeholder:text-zinc-600"
                  />
                  <textarea
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Teslimat Adresi"
                    rows={3}
                    className="md:col-span-2 p-4 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] outline-none transition-all placeholder:text-zinc-600 resize-none"
                  />
                </div>
              </section>

              <section className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl space-y-8 shadow-2xl">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 text-[oklch(0.65_0.25_295)]">
                  <CreditCard className="w-5 h-5" />
                  <h2 className="font-bold text-white uppercase tracking-widest text-xs">Ödeme Bilgileri</h2>
                </div>

                <div className="relative w-full max-w-[320px] h-[200px] mx-auto [perspective:1000px]">
                  <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isCardFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2rem] bg-gradient-to-br from-[oklch(0.65_0.25_295)] to-[#2d1b4e] p-7 flex flex-col justify-between shadow-2xl border border-white/10 overflow-hidden text-white">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-8 bg-yellow-500/30 rounded-md border border-yellow-500/20 shadow-inner" />
                        <span className="text-xl font-black italic tracking-tighter opacity-90">Vibe</span>
                      </div>
                      
                      <div className="flex flex-row justify-between w-full font-mono text-lg tracking-[0.1em] text-white/90">
                        {(paymentData.cardNumber || "**** **** **** ****").split(" ").map((group, i) => (
                          <span key={i} className="flex-1 text-center">{group}</span>
                        ))}
                      </div>

                      <div className="flex justify-between items-end uppercase">
                        <div className="flex flex-col">
                          <span className="text-[7px] opacity-50 font-bold">Kart Sahibi</span>
                          <span className="text-xs font-black tracking-widest truncate max-w-[140px] uppercase">{paymentData.cardHolder || "AD SOYAD"}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[7px] opacity-50 font-bold">S.K.T</span>
                          <span className="text-xs font-black tracking-widest">{paymentData.expiry || "MM/YY"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] rounded-[2rem] bg-[#1a1a1e] [transform:rotateY(180deg)] p-7 flex flex-col justify-between border border-white/5 shadow-2xl">
                      <div className="h-10 w-full bg-black/90 -mx-7 mt-2" />
                      <div className="flex flex-col gap-1.5 items-end">
                        <span className="text-[8px] text-zinc-500 uppercase font-black pr-2">Security Code</span>
                        <div className="w-full h-10 bg-zinc-100 rounded-xl flex items-center justify-end px-4 font-mono text-black font-black text-lg italic tracking-widest shadow-inner">
                          {paymentData.cvc || "***"}
                        </div>
                      </div>
                      <div className="opacity-10 text-[9px] font-bold italic">VibeCart Secure System</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <input type="text" required placeholder="Kart Üzerindeki İsim" className="w-full h-14 px-5 rounded-2xl bg-black/40 border border-white/10 outline-none uppercase focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] transition-all placeholder:text-zinc-600" value={paymentData.cardHolder} onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value })} />
                  <input type="text" required placeholder="Kart Numarası" className="w-full h-14 px-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] transition-all placeholder:text-zinc-600" value={paymentData.cardNumber} onChange={handleCardNumberChange} />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" required placeholder="MM/YY" className="h-14 px-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] transition-all placeholder:text-zinc-600" value={paymentData.expiry} onChange={handleExpiryChange} />
                    <input type="text" required placeholder="CVC" maxLength={3} className="h-14 px-5 rounded-2xl bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-[oklch(0.65_0.25_295)] transition-all placeholder:text-zinc-600" onFocus={() => setIsCardFlipped(true)} onBlur={() => setIsCardFlipped(false)} value={paymentData.cvc} onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })} />
                  </div>
                </div>
              </section>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="w-full h-14 bg-gradient-to-r from-[oklch(0.65_0.25_295)] to-[oklch(0.5_0.3_280)] text-white rounded-2xl font-bold text-lg hover:opacity-90 transform transition-all active:scale-[0.98] shadow-lg shadow-[oklch(0.65_0.25_295_/_0.3)] flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> İşleniyor...</> : <><Lock className="w-5 h-5" /> Ödemeyi Tamamla</>}
              </button>
            </form>
          </div>

          {/* SİPARİŞ ÖZETİ */}
          <div className="lg:w-[400px]">
            <div className="sticky top-32 p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-[oklch(0.65_0.25_295_/_0.3)] shadow-[0_0_40px_oklch(0.65_0.25_295_/_0.1)] space-y-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" /> Sipariş Özeti
              </h3>

              <div className="space-y-4 text-sm">
                {items.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">Sepetiniz boş</p>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-zinc-400">{item.name} x{item.quantity}</span>
                      <span className="text-white">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}

                <div className="border-t border-white/10 pt-4">
                  <label className="text-zinc-500 text-xs block mb-2">Kargo Bölgesi</label>
                  <select
                    value={shippingZone}
                    onChange={e => setShippingZone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-white text-sm outline-none"
                  >
                    <option value="TR">Türkiye (Ücretsiz)</option>
                    <option value="EU">Avrupa ($20)</option>
                    <option value="US">Amerika ($30)</option>
                    <option value="OTHER">Diğer ($40)</option>
                  </select>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-4">
                  <span className="text-zinc-400">Kargo</span>
                  <span className="text-emerald-400">${shippingCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between border-t border-white/10 pt-4">
                  <span className="text-lg font-bold text-white">Toplam</span>
                  <span className="text-2xl font-bold text-[oklch(0.65_0.25_295)]">${(totalPrice + shippingCost).toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-widest">Toplam</span>
                <span className="text-4xl font-black text-[oklch(0.65_0.25_295)] tracking-tighter">₺{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}