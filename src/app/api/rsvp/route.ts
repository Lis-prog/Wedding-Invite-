import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

type InviteType = "single" | "couple" | "family";

type RsvpPayload = {
  inviteCode: string | null;
  guestName: string;
  inviteType: InviteType;
  partnerName: string | null;
  childrenCount: number;
  answers: Array<{ questionId: string; answer: string }>;
  accepted: boolean;
};

function validType(value: string): value is InviteType {
  return value === "single" || value === "couple" || value === "family";
}

export async function POST(request: Request) {
  try {
    const supabaseServer = getSupabaseServer();
    const payload = (await request.json()) as RsvpPayload;

    if (!payload.guestName || !validType(payload.inviteType)) {
      return NextResponse.json({ error: "Invalid RSVP payload." }, { status: 400 });
    }

    const { error } = await supabaseServer.from("responses").insert({
      invite_code: payload.inviteCode,
      guest_name: payload.guestName,
      invite_type: payload.inviteType,
      partner_name: payload.partnerName,
      children_count: Number.isFinite(payload.childrenCount)
        ? Math.max(0, payload.childrenCount)
        : 0,
      answers: payload.answers,
      accepted: payload.accepted,
      user_agent: request.headers.get("user-agent"),
      source: "link",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to submit RSVP." }, { status: 500 });
  }
}
