# PRODUCT REQUIREMENTS DOCUMENT (PRD): FREELANCELINK

## 1. PENDAHULUAN
FreelanceLink adalah platform marketplace tenaga kerja lepas yang mengutamakan komunikasi real-time dan keamanan transaksi. Aplikasi ini memfasilitasi perusahaan untuk menemukan talenta berbakat dan freelancer untuk mendapatkan proyek yang relevan.

## 2. TUJUAN PRODUK (MVP SCOPE)
* Membangun sistem autentikasi dua peran (Freelancer & Perusahaan).
* Menyediakan fitur posting lowongan kerja dengan sistem aktivasi iklan.
* Mengintegrasikan fitur chat real-time untuk negosiasi.
* Mengimplementasikan sistem pembayaran escrow sederhana untuk keamanan dana.

## 3. TECH STACK (DIREKOMENDASI)
* **Frontend:** Next.js 14/15 (App Router), Tailwind CSS, Shadcn/UI.
* **Backend:** Next.js API Routes (Node.js).
* **Database:** PostgreSQL (via Supabase - Tier Gratis).
* **ORM:** Prisma.
* **Real-time:** Supabase Realtime (untuk Chat & Notifikasi).
* **Auth:** NextAuth.js atau Supabase Auth.
* **Hosting:** Vercel.

## 4. FITUR UTAMA & FUNGSIONALITAS

### A. User Management
* Multi-Role Auth: Pengguna memilih peran saat mendaftar (Freelancer atau Perusahaan).
* Profil Freelancer: Nama, Foto, List Skill (Tagging), Deskripsi Pengalaman, dan Link Portofolio.
* Profil Perusahaan: Nama Bisnis, Deskripsi Perusahaan, dan Riwayat Lowongan.

### B. Job Board (Marketplace)
* **Post a Job:** Perusahaan mengisi Judul, Deskripsi, Kategori, Anggaran, dan Durasi.
* **Ad Payment System:** Lowongan tidak akan muncul di publik sebelum perusahaan melakukan simulasi pembayaran iklan.
* **Job Discovery:** Freelancer dapat mencari kerja berdasarkan Kata Kunci dan Filter (Kategori/Budget).

### C. Real-time Communication
* **Direct Chat:** Fitur chat otomatis terbuka saat perusahaan merespons lamaran freelancer.
* **Freelancer Collaboration:** Fitur chat antar freelancer untuk diskusi atau kolaborasi proyek.
* **Notifications:** Indikator pesan belum terbaca (Red Dot) pada menu chat.

### D. Escrow & Payment Logic
* **Deposit:** Perusahaan menyetor dana proyek ke sistem sebelum proyek dimulai (Status: Escrow).
* **Work Approval:** Tombol "Selesaikan Proyek" oleh Perusahaan untuk mencairkan dana.
* **Payout:** Dana diteruskan ke saldo Freelancer setelah dipotong biaya admin aplikasi (5%).

### E. Rating & Review
* Sistem penilaian bintang (1-5) dan komentar tekstual setelah status transaksi selesai.

---

## 5. STRUKTUR DATABASE (PRISMA SCHEMA)
Gunakan skema ini sebagai referensi utama untuk AI:

```prisma
enum Role {
  FREELANCER
  COMPANY
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String
  role        Role
  skills      String[]
  bio         String?
  avatarUrl   String?
  jobs        Job[]    @relation("CompanyJobs")
  apps        Application[]
}

model Job {
  id          String   @id @default(uuid())
  title       String
  description String
  budget      Float
  status      String   @default("OPEN") // OPEN, ONGOING, COMPLETED
  isPaidAd    Boolean  @default(false)
  companyId   String
  company     User     @relation("CompanyJobs", fields: [companyId], references: [id])
  apps        Application[]
}

model Application {
  id           String   @id @default(uuid())
  jobId        String
  job          Job      @relation(fields: [jobId], references: [id])
  freelancerId String
  freelancer   User     @relation(fields: [freelancerId], references: [id])
  status       String   @default("PENDING") // PENDING, ACCEPTED, REJECTED
}
```


## 6. ALUR PENGGUNA (USER FLOW)
1.  Pendaftaran: Pengguna daftar -> Pilih Role -> Lengkapi Profil.
2.  **Transaksi Iklan:** Perusahaan buat Lowongan -> Bayar Iklan -> Lowongan Publish.
3.  **Melamar:** Freelancer cari Lowongan -> Klik Apply -> Kirim Proposal.
4.  **Negosiasi:** Perusahaan lihat list pelamar -> Klik Chat -> Negosiasi di fitur Chat.
5.  **Mulai Proyek:** Perusahaan klik "Accept" -> Setor Dana (Escrow) -> Freelancer mulai kerja.
6.  **Selesai:** Proyek selesai -> Perusahaan konfirmasi -> Dana cair ke Freelancer -> Saling beri Rating.

## 7. PANDUAN UI/UX
* **Tema:** Minimalis Modern (Clean White/Dark Gray).
* **Navigasi:** Sidebar untuk Dashboard, Topbar untuk Notifikasi dan Profil.
* **Responsivitas:** Wajib Mobile-Friendly.

---
