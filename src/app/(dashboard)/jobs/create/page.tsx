"use client";

import { createJob } from "@/app/actions/jobs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateJobPage() {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const loadingToast = toast.loading("Mem-posting lowongan...");
    
    try {
      const res = await createJob(formData);
      
      if (res?.error) {
        toast.error(res.error, { id: loadingToast });
      } else if (res?.success) {
        toast.success("Lowongan berhasil dibuat!", { id: loadingToast });
        setTimeout(() => {
          router.push(res.redirectUrl || "/jobs");
        }, 1000);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Post Lowongan Baru
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Isi detail pekerjaan untuk menemukan talenta terbaik.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Judul Lowongan</label>
            <input
              name="title"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="e.g. Senior Frontend Developer (React)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deskripsi Pekerjaan</label>
            <textarea
              name="description"
              rows={4}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Jelaskan tanggung jawab dan kualifikasi yang dibutuhkan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Anggaran (Rp)</label>
            <input
              name="budget"
              type="number"
              required
              step="1000"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="5000000"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link
              href="/jobs"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Post Lowongan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
