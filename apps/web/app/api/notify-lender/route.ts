import { NextResponse } from "next/server";
import { notifyLender } from "@/lib/notify-lender";

/** Public post-sign / system hook — validates payload shape only; edge fn uses service role. */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body?.event as string | undefined;
    if (event === "agreement_signed" && typeof body.token === "string") {
      await notifyLender({ event: "agreement_signed", token: body.token });
      return NextResponse.json({ ok: true });
    }
    if (event === "proof_pending" && typeof body.recordId === "string") {
      await notifyLender({ event: "proof_pending", recordId: body.recordId });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
