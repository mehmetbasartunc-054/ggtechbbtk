import { createClient } from '@supabase/supabase-js'

// Değişken isimlerinin sol taraftaki .env dosyasıyla 
// birebir aynı olduğundan emin ol (Büyük/küçük harf duyarlıdır)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)