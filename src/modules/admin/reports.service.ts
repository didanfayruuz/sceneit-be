import { eq, desc } from "drizzle-orm";
import { db } from "../../db";
import { reportedReviews, reviews } from "../../db/schema";

export async function getAllReports() {
  return db.query.reportedReviews.findMany({
    orderBy: desc(reportedReviews.createdAt),
    with: {
      review: { columns: { id: true, content: true, rating: true } },
            reporter: { columns: { id: true, name: true } },
    },
  });
}

export async function updateReportStatus(reportId: number, status: "reviewed" | "removed") {
  const existing = await db.query.reportedReviews.findFirst({ 
    where: eq(reportedReviews.id, reportId),
	});
	if (!existing) throw new Error("NOT_FOUND");

	// kalau admin memutuskan "removed", review aslinya ikut dihapus dari platform
  if (status === "removed") {
    await db.delete(reviews).where(eq(reviews.id, existing.reviewId));
  }

  const [updated] = await db
    .update(reportedReviews)
    .set({ status })
    .where(eq(reportedReviews.id, reportId))
    .returning();

  return updated;
}
