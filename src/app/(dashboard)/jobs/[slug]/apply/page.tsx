import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import ApplyForm from "@/components/ApplyForm";

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await getSession();

  if (!session || session.role !== "FREELANCER") {
    redirect("/login");
  }

  console.log("DEBUG: Accessing apply page for slug:", slug);
  const job = await db.job.findUnique({
    where: { slug },
    include: { company: true },
  });
  console.log("DEBUG: Job found:", job ? job.title : "NULL");

  if (!job) {
    console.log("DEBUG: Job not found, returning 404");
    return notFound();
  }

  // Redirect jika sudah pernah melamar
  const existingApp = await db.application.findFirst({
    where: { jobId: job.id, freelancerId: session.userId },
  });

  if (existingApp) redirect("/jobs");

  return (
    <div className="py-6">
      <ApplyForm
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company.name}
        jobDescription={job.description}
      />
    </div>
  );
}
