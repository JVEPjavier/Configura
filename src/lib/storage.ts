import { Client } from "minio";

export const storageBucket = "configura-assets";
export const storage = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "minio",
  port: Number(process.env.MINIO_PORT ?? 9000),
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER ?? "configura_local",
  secretKey: process.env.MINIO_ROOT_PASSWORD ?? "configura_local_only",
});

export async function ensureStorageBucket() {
  if (!(await storage.bucketExists(storageBucket))) await storage.makeBucket(storageBucket);
}
