import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Table Definitions (Mental Map for Database)
/*
  - products: 
      id: uuid
      name: text
      price: int
      brand: enum
      description: text
      
  - inventory:
      id: uuid
      product_id: uuid (FK products)
      credentials: text (Encrypted: email|pass|profile)
      status: enum (available, sold)
      
  - orders:
      id: uuid
      user_id: uuid (FK auth.users)
      product_id: uuid (FK products)
      status: enum (pending, completed, failed)
      credentials: text (Shadow copy for historical access)
      created_at: timestamp
*/
