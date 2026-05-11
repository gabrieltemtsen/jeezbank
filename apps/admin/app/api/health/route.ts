import { NextResponse } from "next/server";

const BASE = process.env.FUSECORE_BASE_URL || "http://localhost:3000/api/v1";
const KEY = process.env.FUSECORE_API_KEY || "";
const ROOT = BASE.replace("/api/v1", "");

async function probe(path: string) {
  const res = await fetch(`${ROOT}${path}`, {
    headers: { "X-API-Key": KEY },
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function GET() {
  try {
    const [ready, live] = await Promise.allSettled([
      probe("/api/v1/health/ready"),
      probe("/api/v1/health/live"),
    ]);

    const readyResult = ready.status === "fulfilled" ? ready.value : null;
    const liveResult = live.status === "fulfilled" ? live.value : null;

    // Parse Terminus response shape
    // { status: "ok"|"error", info: {...}, error: {...}, details: {...} }
    const readyData = readyResult?.data ?? {};
    const liveData = liveResult?.data ?? {};

    const services = {
      database: readyData?.details?.database?.status ?? "unknown",
      redis: readyData?.details?.redis?.status ?? "unknown",
      queues: readyData?.details?.queues?.status ?? "unknown",
    };

    return NextResponse.json({
      overall: readyData?.status === "ok" ? "healthy" : "degraded",
      fusecore: {
        ready: readyData?.status ?? "error",
        live: liveData?.status ?? "error",
        uptime: liveData?.uptime ?? null,
        timestamp: liveData?.timestamp ?? null,
      },
      services,
      raw: { ready: readyData, live: liveData },
      checkedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { overall: "down", error: "FuseCore unreachable", checkedAt: new Date().toISOString() },
      { status: 503 }
    );
  }
}
