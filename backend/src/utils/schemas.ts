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

const addressPayload = z.object({
  first_name: z.string().min(1).max(80),
  last_name: z.string().min(1).max(80),
  company: z.string().max(120).optional(),
  address_1: z.string().min(1).max(200),
  address_2: z.string().min(1).max(200),
  city: z.string().min(1).max(120),
  state: z.string().max(120).optional(),
  postcode: z.string().min(1).max(20),
  country: z.string().length(2),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
});

export const checkoutPayload = z.object({
  billing_address: addressPayload,
  shipping_address: addressPayload.optional(),
  customer_note: z.string().max(1000).optional(),
});
