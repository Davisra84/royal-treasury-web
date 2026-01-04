import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Optional: Unit calls this to prefill the application form.
export async function POST(req) {
  try {
    const secret = req.headers.get("x-unit-callback-secret");
    if (!process.env.UNIT_CALLBACK_SECRET || secret !== process.env.UNIT_CALLBACK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const email = body.email || body.user?.email || null;
    const sub = body.sub || body.userId || body.user?.id || null;

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    let user = null;
    if (sub) {
      const { data } = await admin.auth.admin.getUserById(sub);
      user = data?.user || null;
    }

    // Pull onboarding metadata we stored earlier (if you used it)
    const meta = user?.user_metadata || {};

    return NextResponse.json(
      {
        // This is a generic prefill structure.
        // Unit’s exact keys may differ; we’ll map once you paste their prefill schema.
        email: user?.email || email,
        personal: meta.personal || {},
        business: meta.business || {},
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}