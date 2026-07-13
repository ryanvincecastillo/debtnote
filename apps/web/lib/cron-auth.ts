import { NextResponse } from "next/server";

/**
 * Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
 * Local/manual invokes can use the same secret.
 */
export function assertCronAuthorized(req: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
