import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabaseServer = getSupabaseServer();
  const body = (await request.json()) as { password?: string };
  const password = body.password;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: "Missing ADMIN_PASSWORD in environment." }, { status: 500 });
  }

  if (!password || password !== expected) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data, error } = await supabaseServer
    .from("responses")
    .select("id, created_at, guest_name, invite_type, partner_name, children_count, accepted, answers")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ responses: data ?? [] });
}
