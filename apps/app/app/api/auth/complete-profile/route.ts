import { NextRequest, NextResponse } from "next/server";
import { createCustomer, createAccount } from "@/lib/fusecore";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, firstName, lastName, bvn, nin } = await req.json();
  if (!phone || !firstName || !lastName) {
    return NextResponse.json({ error: "Name and phone required" }, { status: 400 });
  }

  try {
    // 1. Create customer in FuseCore
    const customer = await createCustomer({ firstName, lastName, phone, bvn, nin });
    const customerId = customer.data?.id || customer.id;

    // 2. Create account in FuseCore
    const account = await createAccount({ customerId });
    const accountId = account.data?.id || account.id;

    // 3. TODO: Save user to Convex
    // await convex.mutation(api.users.create, { phone, name: `${firstName} ${lastName}`, fusecoreCustomerId: customerId, fusecoreAccountId: accountId, kycTier: bvn ? 1 : 0, isActive: true, createdAt: Date.now() });

    // 4. Issue JWT
    const token = await signToken({
      userId: `user_${phone}`,
      phone,
      customerId,
      accountId,
      name: `${firstName} ${lastName}`,
      kycTier: bvn ? 1 : 0,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set("jeezbank_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 3600,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    console.error("complete-profile error:", err);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
