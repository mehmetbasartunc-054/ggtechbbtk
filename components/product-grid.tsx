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
  sex?: string
}

interface ProductGridProps {
  products?: Product[]
}

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  )
}