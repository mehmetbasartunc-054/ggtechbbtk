"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "./product-card"
import { supabase } from "@/lib/supabase"

interface Product {
  id: number
  name: string
  price: number
  image: string
  brand: string
  vibe?: string
}

interface ProductGridProps {
  products?: Product[]
}

const masonryPattern = [
  "large", "small", "medium",
  "small", "large", "small",
  "medium", "medium"
] as const

export function ProductGrid({ products: externalProducts }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!externalProducts)

  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts)
      setLoading(false)
      return
    }

    async function fetchProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })

      if (!error && data) {
        setProducts(data)
      }

      setLoading(false)
    }

    fetchProducts()

    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        fetchProducts
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [externalProducts])

  if (loading) {
    return <div className="text-center text-white py-20">Loading vibes...</div>
  }

  if (products.length === 0) {
    return <div className="text-center text-zinc-400 py-20">No products found.</div>
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
        {products.map((product, index) => (
          <div key={product.id} className="break-inside-avoid mb-4">
            <ProductCard
              product={product}
              size={masonryPattern[index % masonryPattern.length]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}