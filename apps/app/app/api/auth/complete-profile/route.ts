import { NextRequest, NextResponse } from "next/server";
import {
  createCustomer,
  createAccount,
  type Gender,
  type IdentityType,
  type CustomerType,
  type CustomerAddress,
} from "@/lib/fusecore";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    phone,
    firstName,
    middleName,
    lastName,
    email,
    dateOfBirth,
    gender,
    type,
    identityType,
    identityNumber,
    bvn,
    nin,
    address,
  } = body as {
    phone?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: Gender;
    type?: CustomerType;
    identityType?: IdentityType;
    identityNumber?: string;
    bvn?: string;
    nin?: string;
    address?: CustomerAddress;
  };

  if (!phone || !firstName || !lastName) {
    return NextResponse.json(
      { error: "First name, last name and phone are required" },
      { status: 400 }
    );
  }
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!dateOfBirth) {
    return NextResponse.json({ error: "Date of birth is required" }, { status: 400 });
  }
  if (!gender) {
    return NextResponse.json({ error: "Gender is required" }, { status: 400 });
  }
  if (!identityType || !identityNumber) {
    return NextResponse.json(
      { error: "Identity type and identity number are required" },
      { status: 400 }
    );
  }
  if (!address?.street || !address?.city || !address?.state || !address?.country) {
    return NextResponse.json(
      { error: "Street, city, state and country are required" },
      { status: 400 }
    );
  }

  try {
    // 1. Create customer in FuseCore
    const customer = await createCustomer({
      firstName,
      middleName: middleName || undefined,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      type: type || "INDIVIDUAL",
      identityType,
      identityNumber,
      bvn: bvn || undefined,
      nin: nin || (identityType === "NIN" ? identityNumber : undefined),
      address,
    });
    const customerId = String(customer.data?.id ?? customer.id ?? "");

    // 2. Create account in FuseCore
    const account = await createAccount({ customerId });
    const accountId = String(account.data?.id ?? account.id ?? "");

    // 3. Issue JWT
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
