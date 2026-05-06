import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BUCKET_NAME = "ads"; // Bucket untuk iklan
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

export async function POST(req: NextRequest) {
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

  if (session.role !== "COMPANY") {
    return NextResponse.json({ error: "Hanya Perusahaan yang dapat memasang iklan." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File tidak ditemukan dalam request." }, { status: 400 });
  }

  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
    return NextResponse.json({ error: "Hanya file gambar (JPG, PNG, GIF, WEBP) yang diizinkan." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 2MB." }, { status: 400 });
  }

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
    console.error("Supabase upload ad error:", uploadError);
    return NextResponse.json({ error: "Gagal mengunggah gambar iklan: " + uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrl }, { status: 200 });
}
