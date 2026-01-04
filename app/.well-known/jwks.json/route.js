import { NextResponse } from "next/server";

export async function GET() {
  const priv = JSON.parse(process.env.UNIT_PRIVATE_JWK || "{}");

  const pub = { ...priv };
  delete pub.d; delete pub.p; delete pub.q; delete pub.dp; delete pub.dq; delete pub.qi;

  pub.kid = process.env.UNIT_KEY_ID || pub.kid;

  return NextResponse.json({ keys: [pub] }, { status: 200 });
}