import { supabase } from "./supabase"

export interface Product {
  id?: number
  name: string
  price: number
  image: string
  brand: string
  vibe?: string
  created_at?: string
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export async function addProduct(product: Omit<Product, "id" | "created_at">): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) throw error
}

export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(fileName, file)

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from("product-images")
    .getPublicUrl(fileName)

  return data.publicUrl
}
