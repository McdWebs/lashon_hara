import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";

export function r2Configured() {
  const { accountId, accessKeyId, secretAccessKey, bucket, publicUrl } = env.r2;
  return Boolean(accountId && accessKeyId && secretAccessKey && bucket && publicUrl);
}

let client: S3Client | null = null;
function r2() {
  client ??= new S3Client({
    region: "auto",
    endpoint: `https://${env.r2.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: env.r2.accessKeyId, secretAccessKey: env.r2.secretAccessKey },
  });
  return client;
}

/** A short-lived address the browser can upload one file to, straight into the bucket. */
export async function signUpload(key: string, contentType: string, size: number) {
  const command = new PutObjectCommand({ Bucket: env.r2.bucket, Key: key, ContentType: contentType, ContentLength: size });
  return getSignedUrl(r2(), command, { expiresIn: 600 });
}

export function publicUrlFor(key: string) {
  return `${env.r2.publicUrl}/${key}`;
}

export async function deleteObject(key: string) {
  await r2().send(new DeleteObjectCommand({ Bucket: env.r2.bucket, Key: key }));
}
