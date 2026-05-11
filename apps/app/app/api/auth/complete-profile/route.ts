import { NextRequest, NextResponse } from "next/server";
import { createCustomer, createAccount } from "@/lib/fusecore";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { phone, firstName, lastName, email, bvn, nin } = await req.json();
  if (!phone || !firstName || !lastName) {
    return NextResponse.json({ error: "Name and phone required" }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    // 1. Create customer in FuseCore
    const customer = await createCustomer({ firstName, lastName, email, phone, bvn, nin });
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
      customerId: String(customerId),
      accountId: String(accountId),
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
    // Surface the actual FuseCore error
    let message = "Failed to create account";
    if (err && typeof err === "object" && "response" in err) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const data = axiosErr.response?.data;
      if (data?.message) {
        message = Array.isArray(data.message) ? data.message.join(", ") : data.message;
      }
    } else if (err instanceof Error) {
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
