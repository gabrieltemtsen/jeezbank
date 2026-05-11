import axios from "axios";

const fusecore = axios.create({
  baseURL: process.env.FUSECORE_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "X-API-Key": process.env.FUSECORE_API_KEY || "",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ── Customers ──────────────────────────────────────────────
export async function createCustomer(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bvn?: string;
  nin?: string;
}) {
  const res = await fusecore.post("/customers", data);
  return res.data;
}

export async function getCustomer(id: string) {
  const res = await fusecore.get(`/customers/${id}`);
  return res.data;
}

// ── Accounts ──────────────────────────────────────────────
export async function createAccount(data: { customerId: string; currency?: string }) {
  const res = await fusecore.post("/accounts", {
    customerId: data.customerId,
    currency: data.currency || "NGN",
    type: "SAVINGS",
  });
  return res.data;
}

export async function getAccount(id: string) {
  const res = await fusecore.get(`/accounts/${id}`);
  return res.data;
}

export async function getAccountTransactions(id: string, params?: { limit?: number; offset?: number }) {
  const res = await fusecore.get(`/accounts/${id}/transactions`, { params });
  return res.data;
}

// ── Payments / Transfers ───────────────────────────────────
export async function sendMoney(data: {
  fromAccountId: string;
  toAccountNumber: string;
  toBankCode: string;
  amount: number; // in kobo
  narration: string;
  idempotencyKey: string;
}) {
  const res = await fusecore.post("/payments", data);
  return res.data;
}

export default fusecore;
