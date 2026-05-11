import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "jeezbank-admin-secret"
);

export type AdminRole = "MANAGER" | "OFFICER" | "CUSTOMER_CARE";

export interface AdminSession {
  adminId: string;
  email: string;
  name: string;
  role: AdminRole;
}

// Seed admin users (in production: store in Convex with hashed passwords)
export const SEED_ADMINS = [
  { id: "admin_1", email: "manager@jeezbank.com", password: "password123", name: "Bank Manager", role: "MANAGER" as AdminRole },
  { id: "admin_2", email: "officer@jeezbank.com", password: "password123", name: "Admin Officer", role: "OFFICER" as AdminRole },
  { id: "admin_3", email: "cc@jeezbank.com", password: "password123", name: "Customer Care", role: "CUSTOMER_CARE" as AdminRole },
];

export async function signAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AdminSession;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("jeezbank_admin_token")?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function canAccess(role: AdminRole, resource: string): boolean {
  const perms: Record<AdminRole, string[]> = {
    MANAGER: ["*"],
    OFFICER: ["customers", "transactions", "loans"],
    CUSTOMER_CARE: ["customers_read", "transactions_read"],
  };
  const allowed = perms[role];
  return allowed.includes("*") || allowed.includes(resource);
}
