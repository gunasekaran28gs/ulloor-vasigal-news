import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { canWrite } from "@/lib/permissions";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await auth();
  const role = (session?.user as any)?.role;

  if (!session || !canWrite(role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, WEBP, or GIF images are allowed" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `articles/${userId}-${Date.now()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
  });

  return NextResponse.json({ url: blob.url });
}
