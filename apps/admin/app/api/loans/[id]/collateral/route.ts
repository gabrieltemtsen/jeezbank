import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { addLoanCollateral, getLoanCollateral } from "@/lib/fusecore";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;

  try {
    const data = await getLoanCollateral(id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const type = String(body.type || "OTHER");
  const value = Number(body.value);
  const description = body.description;
  const reference = body.reference;

  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Invalid collateral value" }, { status: 400 });
  }

  try {
    const data = await addLoanCollateral(id, { type, value, description, reference });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
