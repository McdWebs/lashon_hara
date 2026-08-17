import { Submission } from "../models/Submission.js";

export function normalizeCommitmentEmail(email: string) {
  return email.trim().toLowerCase();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findCommitmentByEmail(email: string) {
  const emailNormalized = normalizeCommitmentEmail(email);
  if (!emailNormalized) return null;

  return Submission.findOne({
    kind: "commitment",
    $or: [
      { "payload.emailNormalized": emailNormalized },
      { "payload.email": { $regex: new RegExp(`^${escapeRegex(emailNormalized)}$`, "i") } },
    ],
  }).lean();
}
