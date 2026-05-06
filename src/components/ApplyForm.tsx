"use client";

import { useState, useRef } from "react";
import { applyToJob } from "@/app/actions/applications";
import { supabase, MAX_PORTFOLIO_SIZE_BYTES, ALLOWED_PORTFOLIO_TYPES } from "@/lib/supabase";
import toast from "react-hot-toast";
import { Upload, FileText, X, Loader2 } from "lucide-react";

type ApplyFormProps = {
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
};

export default function ApplyForm({ jobId, jobTitle, companyName, jobDescription }: ApplyFormProps) {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi ekstensi file di sisi client (pertahanan awal)
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "zip"].includes(fileExt || "")) {
      toast.error("Hanya file ZIP atau PDF yang diizinkan.");
      return;
    }

    // Validasi ukuran (maks 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB.");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Mengunggah portofolio...");

    try {
      // Upload melalui API Route server kita (bukan langsung ke Supabase dari browser)
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload gagal.");
      }

      setUploadedUrl(data.url);
      setFileName(file.name);
      toast.success("Portofolio berhasil diunggah!", { id: toastId });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error("Gagal mengunggah: " + msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    if (uploadedUrl) {
      formData.set("resumeUrl", uploadedUrl);
    }

    try {
      await applyToJob(formData);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan.";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      {/* Job Info Header */}
      <div className="mb-8 pb-6 border-b border-gray-100">
        <h2 className="text-2xl font-black tracking-tight text-gray-900">Lamar Pekerjaan</h2>
        <p className="mt-3 text-xl font-bold text-blue-600">{jobTitle}</p>
        <p className="mt-1 text-sm text-gray-500">Perusahaan: <span className="font-semibold text-gray-700">{companyName}</span></p>
        <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">{jobDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="hidden" name="jobId" value={jobId} />
        <input type="hidden" name="resumeUrl" value={uploadedUrl || ""} />

        {/* Proposal */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">
            Proposal / Penawaran Anda <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500">
            Jelaskan alasan Anda adalah kandidat terbaik dan bagaimana Anda akan menyelesaikan proyek ini.
          </p>
          <textarea
            name="proposal"
            rows={6}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm"
            placeholder="Saya memiliki pengalaman 3 tahun di bidang ini, dengan portofolio yang mencakup..."
          />
        </div>

        {/* Portfolio Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700">
            Upload Portofolio (ZIP / PDF) <span className="text-gray-400 font-normal">— Opsional, maks. 2MB</span>
          </label>
          <p className="text-xs text-gray-500">
            File akan disimpan aman di server kami. Perusahaan hanya bisa mengunduh setelah Anda melamar.
          </p>

          {!uploadedUrl ? (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition
                ${uploading ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300"}`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 text-blue-600">
                  <Loader2 className="w-7 h-7 animate-spin" />
                  <span className="text-sm font-medium">Mengunggah...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload className="w-7 h-7" />
                  <span className="text-sm font-medium text-gray-500">Klik untuk pilih file</span>
                  <span className="text-xs text-gray-400">ZIP atau PDF, maks. 5MB</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".zip,.pdf,application/zip,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <FileText className="w-8 h-8 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-800 truncate">{fileName}</p>
                <p className="text-xs text-emerald-600 mt-0.5">Berhasil diunggah ✓</p>
              </div>
              <button
                type="button"
                onClick={() => { setUploadedUrl(null); setFileName(null); }}
                className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-600 transition"
                title="Hapus file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <a href="/jobs" className="text-sm font-medium text-gray-500 hover:text-gray-700 transition">
            ← Batal
          </a>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Mengirim..." : "Kirim Lamaran"}
          </button>
        </div>
      </form>
    </div>
  );
}
