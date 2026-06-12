import { NextRequest, NextResponse } from "next/server";

// Stripe webhook handler — implementation in Phase 5
export async function POST(req: NextRequest) {
  // TODO: Phase 5 — handle subscription events
  return new NextResponse("OK", { status: 200 });
}
