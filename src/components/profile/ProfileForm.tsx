"use client";

import { useState, useRef } from "react";
import { updateProfile } from "@/app/actions/profile";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { UserCircle, Camera, Loader2, Globe, MapPin, Briefcase } from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  avatarUrl: string | null;
  skills: string[];
  location: string | null;
  website: string | null;
};

export default function ProfileForm({ user }: { user: UserProfile }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Mengunggah avatar...");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload ke Supabase Storage (Bucket 'avatars')
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarPreview(publicUrl);
      toast.success("Avatar berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Gagal mengunggah avatar: " + error.message, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Tambahkan avatarUrl jika ada preview baru
    if (avatarPreview) {
      formData.set("avatarUrl", avatarPreview);
    }

    const toastId = toast.loading("Menyimpan profil...");

    try {
      const res = await updateProfile(formData);
      if (res.error) {
        toast.error(res.error, { id: toastId });
      } else {
        toast.success("Profil berhasil diperbarui!", { id: toastId });
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Avatar Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-full h-full text-gray-300" />
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-md hover:bg-blue-700 transition transform group-hover:scale-110"
              disabled={uploading}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          <p className="mt-4 text-sm text-gray-500 font-medium">Klik ikon kamera untuk mengubah avatar</p>
        </div>

        {/* Basic Info */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
              <input
                name="name"
                defaultValue={user.name}
                required
                className="w-full px-4 py-2.5 rounded-xl text-gray-600 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Email (Read-only)</label>
              <input
                value={user.email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-gray-600 border border-gray-100 bg-gray-50  cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Bio / Deskripsi</label>
            <textarea
              name="bio"
              defaultValue={user.bio || ""}
              rows={4}
              placeholder={user.role === 'FREELANCER' ? "Ceritakan keahlian dan pengalaman Anda..." : "Deskripsikan visi dan misi perusahaan Anda..."}
              className="w-full px-4 py-2.5 rounded-xl text-gray-600 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Lokasi
              </label>
              <input
                name="location"
                defaultValue={user.location || ""}
                placeholder="Contoh: Jakarta, Indonesia"
                className="w-full px-4 py-2.5 rounded-xl text-gray-600 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" /> {user.role === 'FREELANCER' ? 'Portfolio URL' : 'Website Perusahaan'}
              </label>
              <input
                name="website"
                defaultValue={user.website || ""}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl text-gray-600 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {user.role === 'FREELANCER' && (
            <div className="space-y-2 pt-4 border-t border-gray-50">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400" /> Keterampilan (Pisahkan dengan koma)
              </label>
              <input
                name="skills"
                defaultValue={user.skills?.join(", ")}
                placeholder="React, Node.js, Design Grafis, dll."
                className="w-full px-4 py-2.5 rounded-xl text-gray-600 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
}
