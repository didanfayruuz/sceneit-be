import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().min(3).max(2000),
  containsSpoiler: z.boolean().optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reportReviewSchema = z.object({
  reason: z.string().min(3).max(500),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;