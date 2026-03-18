import { z } from "zod";

export const SessionSchema = z.object({
  username: z.string().email(),
});

export const PipelineConfigSchema = z.object({
  daily_news_target: z.number().int().min(1).max(24),
  schedule_times: z.string().min(4).max(120),
  auto_approve_if_quality_ok: z.boolean(),
});

export const DraftSchema = z.object({
  id: z.number().int(),
  news_title: z.string(),
  news_source: z.string(),
  news_url: z.string().url(),
  caption: z.string(),
  rewritten_text: z.string(),
  image_path: z.string(),
  media_url: z.string().nullable(),
  image_candidates: z.array(z.string().url()).default([]),
  selected_image_url: z.string().url().nullable().optional(),
  audio_path: z.string().nullable(),
  status: z.string(),
  auto_approved: z.boolean(),
  approved_by: z.string().nullable(),
  approved_at: z.string().nullable(),
  created_at: z.string(),
});

export const DraftListSchema = z.array(DraftSchema);

export const ReviewSchema = z.object({
  draft_id: z.number().int(),
  status: z.string(),
  news_title: z.string(),
  image_candidates: z.array(z.string().url()).default([]),
  instagram_preview: z.object({
    caption: z.string(),
    image_url: z.string().nullable(),
    audio_path: z.string().nullable(),
  }),
  facebook_preview: z.object({
    caption: z.string(),
    image_url: z.string().nullable(),
    audio_path: z.string().nullable(),
  }),
});

export type SessionDTO = z.infer<typeof SessionSchema>;
export type PipelineConfigDTO = z.infer<typeof PipelineConfigSchema>;
export type DraftDTO = z.infer<typeof DraftSchema>;
export type ReviewDTO = z.infer<typeof ReviewSchema>;
