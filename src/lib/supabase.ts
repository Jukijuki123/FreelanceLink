import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Batas ukuran file portofolio: 5MB
export const MAX_PORTFOLIO_SIZE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_PORTFOLIO_TYPES = [
  "application/zip", 
  "application/x-zip-compressed", 
  "application/x-zip",
  "application/pdf",
  "application/octet-stream" // Sering digunakan untuk file ZIP
];
