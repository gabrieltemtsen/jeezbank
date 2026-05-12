import axios from "axios";

const BASE_URL = process.env.FUSECORE_BASE_URL;
const API_KEY = process.env.FUSECORE_API_KEY;

if (!BASE_URL) console.warn("[fusecore] FUSECORE_BASE_URL is not set");
if (!API_KEY) console.warn("[fusecore] FUSECORE_API_KEY is not set");

const fusecore = axios.create({
  baseURL: BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    // Use canonical header name; server reads request.headers['x-api-key'].
    "x-api-key": API_KEY ?? "",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Log every outbound request in dev for debugging
fusecore.interceptors.request.use((config) => {
  console.log(`[fusecore] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  console.log(`[fusecore]   X-API-Key: ${config.headers["x-api-key"] ? "set ✓" : "MISSING ✗"}`);
  return config;
});

fusecore.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const body = err.response?.data;
    console.error(`[fusecore] ✗ ${status}`, JSON.stringify(body));
    return Promise.reject(err);
  }
);

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

export async function getAccountTransactions(
  id: string,
  params?: { limit?: number; offset?: number }
) {
  const res = await fusecore.get(`/accounts/${id}/transactions`, { params });
  return res.data;
}

// ── Payments / Transfers ───────────────────────────────────
export async function sendMoney(data: {
  fromAccountId: string;
  toAccountNumber: string;
  toBankCode: string;
  amount: number;
  narration: string;
  idempotencyKey: string;
}) {
  const res = await fusecore.post("/payments", data);
  return res.data;
}

export default fusecore;
