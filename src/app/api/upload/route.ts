import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Nama bucket sesuai dashboard Supabase Anda
const BUCKET_NAME = "portfolios";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ["pdf", "zip"];

export async function POST(req: NextRequest) {
  // 1. Verifikasi bahwa pengguna sudah login via sesi cookie kita
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get("session")?.value;

  if (!sessionValue) {
    return NextResponse.json({ error: "Anda harus login terlebih dahulu." }, { status: 401 });
  }

  let session: { userId: string; role: string };
  try {
    session = JSON.parse(sessionValue);
  } catch {
    return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  }

  if (session.role !== "FREELANCER") {
    return NextResponse.json({ error: "Hanya Freelancer yang dapat mengunggah portofolio." }, { status: 403 });
  }

  // 2. Ambil file dari form data
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan dalam request." }, { status: 400 });
  }

  // 3. Validasi ekstensi file
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return NextResponse.json({ error: "Hanya file PDF atau ZIP yang diizinkan." }, { status: 400 });
  }

  // 4. Validasi ukuran file
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran file maksimal 5MB." }, { status: 400 });
  }

  // 5. Gunakan Service Role Key untuk bypass RLS (upload dari server, bukan browser)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl || serviceRoleKey.startsWith("ISI_DENGAN")) {
    console.error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di .env");
    return NextResponse.json(
      { error: "Konfigurasi server belum lengkap. Hubungi administrator." },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // 6. Upload file ke Supabase Storage
  const filePath = `${session.userId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    return NextResponse.json({ error: "Gagal mengunggah file: " + uploadError.message }, { status: 500 });
  }

  // 7. Ambil public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrl }, { status: 200 });
}
