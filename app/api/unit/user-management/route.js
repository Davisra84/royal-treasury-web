import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Unit will call this endpoint to manage/lookup users for the White-Label App.
// We map Unit user <-> Supabase user by email or subject.
export async function POST(req) {
  try {
    // Simple shared-secret auth (set this same secret in Unit if they support headers)
    const secret = req.headers.get("x-unit-callback-secret");
    if (!process.env.UNIT_CALLBACK_SECRET || secret !== process.env.UNIT_CALLBACK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Typical fields you might receive (Unit varies):
    // body.sub, body.email, body.userId, body.action, etc.
    const email = body.email || body.user?.email || null;
    const sub = body.sub || body.userId || body.user?.id || null;

    if (!email && !sub) {
      return NextResponse.json({ error: "Missing user identifier" }, { status: 400 });
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Find Supabase user by email if provided
    let user = null;

    if (email) {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 2000 });
      if (error) return NextResponse.json({ error: "User lookup failed" }, { status: 500 });

      user = data?.users?.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
    }

    // If still no user and we have sub, try direct get user (sub should be Supabase user id)
    if (!user && sub) {
      const { data, error } = await admin.auth.admin.getUserById(sub);
      if (!error) user = data?.user || null;
    }

    if (!user) {
      // If Unit expects "create user" behavior, we can return not found.
      return NextResponse.json({ found: false }, { status: 200 });
    }

    // Return a mapping object Unit can use (Unit’s exact schema may vary)
    // We return a stable ID and email.
    return NextResponse.json(
      {
        found: true,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}