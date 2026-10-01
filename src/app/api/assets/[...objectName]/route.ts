import { NextResponse } from "next/server";
import { ensureStorageBucket, storage, storageBucket } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ objectName: string[] }> }) {
  try {
    const { objectName } = await params;
    if (!objectName.length || objectName.some((segment) => segment.includes("..")))
      return new NextResponse(null, { status: 400 });
    await ensureStorageBucket();
    const stream = await storage.getObject(storageBucket, objectName.join("/"));
    const chunks: Buffer[] = [];
    for await (const chunk of stream)
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return new NextResponse(Buffer.concat(chunks), {
      headers: { "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
