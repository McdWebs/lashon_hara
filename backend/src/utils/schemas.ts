import { z } from "zod";

export const submissionSchema = z.object({
  kind: z.enum(["commitment", "school", "ambassador", "contact", "quote", "donate", "newsletter"]),
  sourcePath: z.string().max(200).optional(),
  payload: z.record(z.string(), z.unknown()),
});

export const commitmentPayload = z.object({
  firstName: z.string().min(1).max(80),
  phone: z.string().min(7).max(20),
  email: z.string().email(),
  consent: z.boolean(),
});

export const contactPayload = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().min(1).max(4000),
});
