import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProjectId } from "@/lib/project";

/** Sync debt_note_profiles.email from auth.users after email_change. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = await getProjectId();
  const { error } = await supabase.rpc("debt_note_ensure_profile", {
    p_project_id: projectId,
    p_display_name: "",
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Belt-and-suspenders: explicit email write from session.
  if (user.email) {
    await supabase
      .from("debt_note_profiles")
      .update({ email: user.email })
      .eq("id", user.id);
  }

  return NextResponse.json({ ok: true, email: user.email ?? null });
}
