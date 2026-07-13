"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { peso } from "@/lib/format";
import { Button } from "@/components/ui/button";
import type { AgreementByToken } from "@/lib/types";

export function AgreementGuestView({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [agreement, setAgreement] = useState<AgreementByToken | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.rpc("debt_note_get_agreement_by_token", { p_token: token });
      if (data) setAgreement(data as AgreementByToken);
      setLoading(false);
    }
    load();
  }, [token]);

  function startDraw(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDrawing(true);
    setHasDrawn(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#fafafa";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function endDraw() {
    setDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  async function submitSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSigning(true);
    const signature = canvas.toDataURL("image/png");
    const supabase = createClient();
    const { data } = await supabase.rpc("debt_note_sign_agreement", {
      p_token: token,
      p_signature: signature,
    });
    if (data) setDone(true);
    setSigning(false);
  }

  if (loading) {
    return <p className="py-20 text-center text-muted">Loading agreement…</p>;
  }

  if (!agreement) {
    return (
      <div className="py-20 text-center">
        <p className="text-xl font-semibold text-paper">Agreement not found</p>
        <p className="mt-2 text-muted">This link may have expired.</p>
      </div>
    );
  }

  if (agreement.signed_at || done) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="mb-4 text-5xl text-receivable">✓</p>
        <p className="text-2xl font-bold text-paper">Signed successfully</p>
        <p className="mt-2 text-muted">
          Salamat, {agreement.borrower_name}. Your promissory note is on record.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="mb-2 text-xs uppercase tracking-widest text-accent">Digital Promissory Note</p>
      <h1 className="mb-2 text-2xl font-bold text-paper">{agreement.record_title}</h1>
      <p className="mb-6 text-muted">
        {agreement.borrower_name} · Balance {peso(agreement.balance)}
      </p>
      <div className="notebook-line mb-6 rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-muted">
        I, <strong className="text-paper">{agreement.borrower_name}</strong>, acknowledge the
        obligation above and agree to the repayment terms set by the lender via DebtNote.
      </div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-faint">Sign below with your finger or mouse:</p>
        {hasDrawn ? (
          <button type="button" onClick={clearCanvas} className="text-xs text-muted hover:text-paper">
            Clear
          </button>
        ) : null}
      </div>
      <canvas
        ref={canvasRef}
        width={480}
        height={160}
        className="w-full touch-none cursor-crosshair rounded-xl border border-dashed border-accent/40 bg-background"
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
      />
      <Button
        type="button"
        onClick={submitSignature}
        disabled={signing || !hasDrawn}
        className="mt-6 w-full"
      >
        {signing ? "Submitting…" : "Sign agreement"}
      </Button>
    </div>
  );
}
