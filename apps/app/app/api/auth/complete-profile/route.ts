import { NextRequest, NextResponse } from "next/server";
import { createCustomer, createAccount } from "@/lib/fusecore";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, firstName, lastName, email, bvn, nin } = await req.json();

  if (!phone || !firstName || !lastName) {
    return NextResponse.json({ error: "First name, last name and phone are required" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // 1. Create customer in FuseCore
    const customer = await createCustomer({ firstName, lastName, email, phone, bvn, nin });
    const customerId = String(customer.data?.id ?? customer.id ?? "");

    // 2. Create account in FuseCore
    const account = await createAccount({ customerId });
    const accountId = String(account.data?.id ?? account.id ?? "");

    // 3. TODO: Save user to Convex
    // await convex.mutation(api.users.create, { ... })

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
      sameSite: "lax",
      maxAge: 7 * 24 * 3600,
      path: "/",
    });
    return res;
  } catch (err: unknown) {
    // Surface the real FuseCore error message
    let message = "Failed to create account";
    if (err && typeof err === "object") {
      const e = err as { response?: { data?: { message?: string | string[]; error?: string } } };
      const d = e.response?.data;
      if (d?.message) {
        message = Array.isArray(d.message) ? d.message.join(", ") : String(d.message);
      } else if (d?.error) {
        message = String(d.error);
      } else if (err instanceof Error) {
        message = err.message;
      }
    }
    console.error("[complete-profile] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
