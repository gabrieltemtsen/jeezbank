import { NextRequest, NextResponse } from "next/server";

// In production: store OTP in Convex + send via Termii SMS
// For now: generate OTP, log it, accept any 6-digit code on verify

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`[JeezBank OTP] Phone: ${phone} | Code: ${otp}`);

  // TODO: Store OTP in Convex otps table + send via Termii
  // await convex.mutation(api.otps.createOtp, { phone, code: otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  // await termii.send({ to: phone, sms: `Your JeezBank OTP is ${otp}. Valid for 5 minutes.` });

  return NextResponse.json({ success: true, message: "OTP sent" });
}
