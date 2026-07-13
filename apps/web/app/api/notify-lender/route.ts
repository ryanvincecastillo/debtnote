import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { notifyLender } from "@/lib/notify-lender";

/**
 * Public guest hook for agreement_signed only.
 * - Requires a real public_token for a recently signed agreement.
 * - proof_pending is not accepted here (server actions / authenticated clients only).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body?.event as string | undefined;

    if (event !== "agreement_signed" || typeof body.token !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const token = body.token.trim();
    if (!token || token.length < 16) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: agr, error } = await supabase
      .from("debt_note_agreements")
      .select("id, signed_at")
      .eq("public_token", token)
      .maybeSingle();

    if (error || !agr?.signed_at) {
      return NextResponse.json({ error: "Agreement not signed" }, { status: 404 });
    }

    const signedAt = new Date(agr.signed_at).getTime();
    const ageMs = Date.now() - signedAt;
    // Only allow notify within 15 minutes of signing to limit replay spam.
    if (Number.isNaN(signedAt) || ageMs < 0 || ageMs > 15 * 60 * 1000) {
      return NextResponse.json({ error: "Notify window expired" }, { status: 410 });
    }

    await notifyLender({ event: "agreement_signed", token });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
