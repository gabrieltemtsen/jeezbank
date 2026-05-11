import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

// In production: verify OTP from Convex, check expiry, mark used
// For now: accept any 6-digit code (dev mode)

export async function POST(req: NextRequest) {
  const { phone, code } = await req.json();
  if (!phone || !code) return NextResponse.json({ error: "Phone and code required" }, { status: 400 });
  if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Invalid OTP format" }, { status: 400 });

  // TODO: verify from Convex
  // const otp = await convex.query(api.otps.getLatest, { phone });
  // if (!otp || otp.used || otp.expiresAt < Date.now() || otp.code !== code) return 401

  // Check if user exists in Convex
  // TODO: const user = await convex.query(api.users.getByPhone, { phone });
  const isNewUser = true; // Replace with Convex lookup

  if (isNewUser) {
    return NextResponse.json({ isNewUser: true });
  }

  // Existing user — issue token
  // const token = await signToken({ userId: user._id, phone, customerId: user.fusecoreCustomerId, accountId: user.fusecoreAccountId, name: user.name, kycTier: user.kycTier });
  const token = await signToken({ userId: `user_${phone}`, phone, kycTier: 0 });
  const res = NextResponse.json({ isNewUser: false });
  res.cookies.set("jeezbank_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 3600, path: "/" });
  return res;
}
