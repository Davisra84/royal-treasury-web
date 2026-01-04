import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SignJWT, importJWK } from "jose";

export async function POST(req) {
  try {
    const auth = req.headers.get("authorization") || "";
    const supaToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!supaToken) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await admin.auth.getUser(supaToken);
    if (error || !data?.user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const user = data.user;

    const issuer = process.env.UNIT_JWT_ISSUER;
    const audience = process.env.UNIT_JWT_AUDIENCE;
    const jwkStr = process.env.UNIT_PRIVATE_JWK;

    if (!issuer || !audience || !jwkStr) {
      return NextResponse.json(
        { error: "Missing UNIT_JWT_ISSUER / UNIT_JWT_AUDIENCE / UNIT_PRIVATE_JWK in .env.local" },
        { status: 500 }
      );
    }

    const jwk = JSON.parse(jwkStr);
    jwk.kid = process.env.UNIT_KEY_ID || jwk.kid;

    const key = await importJWK(jwk, "RS256");

    const jwt = await new SignJWT({
      email: user.email || "",
    })
      .setProtectedHeader({ alg: "RS256", kid: jwk.kid, typ: "JWT" })
      .setIssuer(issuer)
      .setAudience(audience)
      .setSubject(user.id)          // stable unique user id
      .setIssuedAt()
      .setExpirationTime("10m")
      .sign(key);

    return NextResponse.json({ token: jwt }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 });
  }
}