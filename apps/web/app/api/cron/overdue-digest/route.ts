import { NextResponse } from "next/server";
import { assertCronAuthorized } from "@/lib/cron-auth";
import { notifyLender } from "@/lib/notify-lender";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Invoked by Vercel Cron daily — emails lenders with overdue installments. */
export async function GET(req: Request) {
  const denied = assertCronAuthorized(req);
  if (denied) return denied;

  await notifyLender({ event: "overdue_digest" });
  return NextResponse.json({ ok: true });
}
