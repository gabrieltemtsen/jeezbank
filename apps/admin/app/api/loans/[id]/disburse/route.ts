import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { disburseLoan } from "@/lib/fusecore";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const disbursedBy = body.disbursedBy || session.name || "admin";

  try {
    const data = await disburseLoan(id, { disbursedBy });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
