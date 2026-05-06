"use client";

import { useState, useRef } from "react";
import { buyAd } from "@/app/actions/ads";
import toast from "react-hot-toast";
import { Upload, ImageIcon, Loader2, Link as LinkIcon, Calendar } from "lucide-react";

export default function AdsPage() {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [days, setDays] = useState(1);
  const pricePerDay = 50000;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Mengunggah gambar iklan...");

    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/upload-ad", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload gagal.");
      }

      setUploadedUrl(data.url);
      toast.success("Gambar berhasil diunggah!", { id: toastId });
    } catch (error: any) {
      toast.error("Gagal mengunggah: " + (error.message || "Terjadi kesalahan"), { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedUrl) {
      toast.error("Silakan unggah gambar iklan terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.set("imageUrl", uploadedUrl);

    try {
      await buyAd(formData);
      toast.success("Iklan berhasil dipasang!");
      // Reset form (or handled by redirect)
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan.");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pasang Iklan Pop-up</h1>
        <p className="mt-2 text-sm text-gray-600">
          Iklan Anda akan muncul sebagai pop-up pertama kali saat freelancer mengunjungi website.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Upload Image */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Gambar Iklan (Max 2MB)</label>
            {!uploadedUrl ? (
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition ${uploading ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300"}`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-blue-600">
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span className="text-sm font-medium">Mengunggah...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Upload className="w-7 h-7" />
                    <span className="text-sm font-medium text-gray-500">Klik untuk pilih gambar</span>
                    <span className="text-xs text-gray-400">JPG, PNG, GIF, WEBP</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={uploadedUrl} alt="Ad Preview" className="w-full h-auto max-h-64 object-contain bg-gray-50" />
                <button
                  type="button"
                  onClick={() => setUploadedUrl(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md text-red-500 hover:bg-red-50"
                >
                  Ganti
                </button>
              </div>
            )}
          </div>

          {/* Link */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-gray-400" /> URL Tujuan Iklan (Opsional)
            </label>
            <input
              name="linkUrl"
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl text-gray-500 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Durasi */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" /> Durasi Iklan (Hari)
            </label>
            <input
              name="days"
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 rounded-xl text-gray-500 border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Harga */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-blue-900">Total Pembayaran</p>
              <p className="text-xs text-blue-700">Rp 50.000 / Hari</p>
            </div>
            <p className="text-xl font-black text-blue-700">
              Rp {new Intl.NumberFormat("id-ID").format(days * pricePerDay)}
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || uploading || !uploadedUrl}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? "Memproses Pembayaran..." : "Bayar & Pasang Iklan"}
          </button>
        </form>
      </div>
    </div>
  );
}
