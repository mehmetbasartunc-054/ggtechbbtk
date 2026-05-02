export const vibeThemes = {
  hhiking: {
    video: "https://cdn.pixabay.com/video/2023/10/21/185943-877209787_large.mp4",
    title: "DOĞANIN KALBİNE YOLCULUK",
    color: "rgba(20, 40, 20, 0.8)"
  },
  beach: {
    // Şimdilik test için aynı videoyu koydum.
    // İnternetten 5 saniyelik bir sahil .mp4'ü indirip adını 'beach.mp4' yapıp public klasörüne atarsan burayı "/beach.mp4" yapabilirsin.
    video: "/doga.mp4",
    title: "DENİZİN ÖZGÜRLÜĞÜ",
    color: "rgba(20, 30, 50, 0.8)"
  },
  business: {
    // Şimdilik test için aynı videoyu koydum. (Bunu da indirip public klasörüne atıp /business.mp4 yapabilirsin)
    video: "/doga.mp4",
    title: "PROFESYONEL DÜNYA",
    color: "rgba(10, 10, 10, 0.8)"
  }
};

// lib/mockProducts.ts dosyanı aç ve ürünlerin vibe kısımlarını şöyle değiştir:
export const mockProducts = [
  {
    id: "1",
    name: "Premium Keten Gömlek",
    price: 1450,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    brand: "SAHİL ÖZEL",
    vibe: "sahil" // ["sahil"] yerine sadece "sahil"
  },
  {
    id: "2",
    name: "Profesyonel Dağ Botu",
    price: 4200,
    image: "https://images.unsplash.com/photo-1520639889410-d65c36fcc9ca?w=800&q=80",
    brand: "PEAK TRACKING",
    vibe: "tracking" // ["tracking"] yerine sadece "tracking"
  },
  {
    id: "3",
    name: "Performans Koşu Taytı",
    price: 1850,
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
    brand: "SPOR PRO",
    vibe: "spor" // ["spor"] yerine sadece "spor"
  }
];