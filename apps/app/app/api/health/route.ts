import { NextResponse } from "next/server";

/**
 * Proxies FuseCore health endpoints.
 * FuseCore /health returns @nestjs/terminus format:
 * {
 *   status: "ok" | "error",
 *   info: { database: { status: "up" }, redis: { status: "up" }, queues: { status: "up" } },
 *   error: {},
 *   details: { database: { status: "up" }, redis: { status: "up" }, queues: { status: "up" } }
 * }
 */

const BASE = process.env.FUSECORE_BASE_URL || "http://localhost:3000/api/v1";
const KEY = process.env.FUSECORE_API_KEY || "";

async function fetchHealth(path: string) {
  // Health endpoints are @Public() — no API key needed, but we send it anyway
  const res = await fetch(`${BASE.replace("/api/v1", "")}${path}`, {
    headers: { "X-API-Key": KEY },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  return res.json();
}

export async function GET() {
  try {
    const [ready, live] = await Promise.allSettled([
      fetchHealth("/api/v1/health/ready"),
      fetchHealth("/api/v1/health/live"),
    ]);

    return NextResponse.json({
      ready: ready.status === "fulfilled" ? ready.value : { status: "error", error: "unreachable" },
      live: live.status === "fulfilled" ? live.value : { status: "error", error: "unreachable" },
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { status: "error", error: "FuseCore unreachable", checkedAt: new Date().toISOString() },
      { status: 503 }
    );
  }
}
