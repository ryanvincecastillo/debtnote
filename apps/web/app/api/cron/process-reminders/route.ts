import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Invoked by Vercel Cron every 5 minutes — drains pending reminder queue. */
export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.DEBTNOTE_EDGE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Missing Supabase env" }, { status: 500 });
  }

  const res = await fetch(`${url}/functions/v1/debt-note-process-reminder-queue`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    /* keep raw */
  }

  return NextResponse.json(
    { ok: res.ok, status: res.status, result: body },
    { status: res.ok ? 200 : 502 },
  );
}
