import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const PROOF_BUCKET = "debt-note-proofs";

function bearerToken(req: Request): string {
  const header = req.headers.get("Authorization") ?? "";
  return header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

async function removeUserProofs(
  admin: ReturnType<typeof createClient>,
  userId: string,
) {
  const prefix = userId;
  const { data: top, error } = await admin.storage.from(PROOF_BUCKET).list(prefix, {
    limit: 1000,
  });
  if (error || !top?.length) return;

  const paths: string[] = [];
  for (const entry of top) {
    if (entry.id === null) {
      // folder = record id
      const { data: files } = await admin.storage
        .from(PROOF_BUCKET)
        .list(`${prefix}/${entry.name}`, { limit: 1000 });
      for (const f of files ?? []) {
        if (f.name) paths.push(`${prefix}/${entry.name}/${f.name}`);
      }
    } else if (entry.name) {
      paths.push(`${prefix}/${entry.name}`);
    }
  }
  if (paths.length) {
    await admin.storage.from(PROOF_BUCKET).remove(paths);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), { status: 500 });
  }

  const token = bearerToken(req);
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body: { projectId?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const projectId = String(body.projectId ?? "").trim();
  if (!projectId) {
    return new Response(JSON.stringify({ error: "Missing projectId" }), { status: 400 });
  }

  const userClient = createClient(supabaseUrl, anonKey || serviceKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const userId = userData.user.id;

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Wipe proof files first (service role — storage delete may miss nested folders).
  try {
    await removeUserProofs(admin, userId);
  } catch (e) {
    console.error("proof wipe failed", e);
  }

  const { data: result, error: rpcErr } = await userClient.rpc("debt_note_delete_account", {
    p_project_id: projectId,
  });
  if (rpcErr) {
    return new Response(JSON.stringify({ error: rpcErr.message }), { status: 400 });
  }

  const deleteAuth = Boolean((result as { delete_auth?: boolean } | null)?.delete_auth);
  let authDeleted = false;
  if (deleteAuth) {
    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      return new Response(
        JSON.stringify({
          ok: true,
          data_deleted: true,
          auth_deleted: false,
          warning: delErr.message,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }
    authDeleted = true;
  }

  return new Response(
    JSON.stringify({
      ok: true,
      data_deleted: true,
      auth_deleted: authDeleted,
      shared_login_kept: !deleteAuth,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
