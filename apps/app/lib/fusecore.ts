import axios, { AxiosError, AxiosRequestConfig } from "axios";

const BASE_URL = process.env.FUSECORE_BASE_URL;
const API_KEY = process.env.FUSECORE_API_KEY;

if (!BASE_URL) console.warn("[fusecore] FUSECORE_BASE_URL is not set");
if (!API_KEY) console.warn("[fusecore] FUSECORE_API_KEY is not set");

const fusecore = axios.create({
  baseURL: BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "x-api-key": API_KEY ?? "",
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Dev-friendly logging ───────────────────────────────────────────
fusecore.interceptors.request.use((config) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[fusecore:app] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// ── One-shot retry on transient failures ───────────────────────────
fusecore.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const cfg = err.config as AxiosRequestConfig & { __retried?: boolean };
    if (!cfg || cfg.__retried) return Promise.reject(err);

    // Never retry mutating requests (POST/PUT/PATCH/DELETE) — too risky for
    // a banking app where they may not be idempotent. Idempotency is handled
    // at the route level for transfers.
    const method = (cfg.method || "get").toLowerCase();
    if (method !== "get" && method !== "head") return Promise.reject(err);

    const transient =
      err.code === "ECONNABORTED" ||
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNRESET" ||
      err.code === "ENETUNREACH" ||
      !err.response ||
      (err.response.status >= 500 && err.response.status <= 599);

    if (!transient) return Promise.reject(err);

    cfg.__retried = true;
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[fusecore:app] ↻ retrying ${cfg.method?.toUpperCase()} ${cfg.url} (` +
          (err.response ? `status ${err.response.status}` : err.code || "network") +
          `)`
      );
    }
    await new Promise((r) => setTimeout(r, 350));
    return fusecore.request(cfg);
  }
);

// ── Error extraction helper ────────────────────────────────────────
export function extractError(err: unknown): string {
  if (!err) return "Unknown error";
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data: any = err.response?.data;
    const msg =
      (data && (Array.isArray(data.message) ? data.message.join(", ") : data.message)) ||
      data?.error ||
      err.message ||
      "Request failed";
    if (status === 401 || status === 403) return "Your session needs to be refreshed.";
    if (!err.response) return "We can't reach JMB servers right now. Check your connection.";
    if (status === 404) return "Not found.";
    if (status === 422 || status === 400) return msg;
    if (status && status >= 500) return "JMB is having a moment. Please try again.";
    return msg;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

// ── Response normaliser ────────────────────────────────────────────
export function unwrap<T = any>(raw: any): T {
  return (raw?.data ?? raw) as T;
}

export function unwrapList<T = any>(raw: any): { items: T[]; total: number } {
  const payload = raw?.data ?? raw;
  const items: T[] =
    payload?.items ??
    payload?.data ??
    payload?.transactions ??
    payload?.customers ??
    payload?.loans ??
    payload?.accounts ??
    (Array.isArray(payload) ? payload : []) ??
    [];
  const total: number = payload?.total ?? payload?.meta?.total ?? items.length;
  return { items, total };
}

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════
export type CustomerType = "INDIVIDUAL" | "CORPORATE";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type IdentityType = "NIN" | "BVN" | "PASSPORT" | "DRIVERS_LICENSE" | "VOTERS_CARD";

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  type?: CustomerType;
  identityType?: IdentityType;
  identityNumber?: string;
  bvn?: string;
  nin?: string;
  address?: CustomerAddress;
  [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════════
// Customers
// ═══════════════════════════════════════════════════════════════════
export async function createCustomer(data: CreateCustomerInput) {
  const res = await fusecore.post("/customers", data);
  return res.data;
}

export async function getCustomer(id: string) {
  const res = await fusecore.get(`/customers/${id}`);
  return res.data;
}

export async function updateCustomer(id: string, data: Record<string, any>) {
  const res = await fusecore.put(`/customers/${id}`, data);
  return res.data;
}

export async function searchCustomer(params: {
  bvn?: string;
  phone?: string;
  email?: string;
  customerNumber?: string;
}) {
  const res = await fusecore.get(`/customers/search`, { params });
  return res.data;
}

export async function getCustomerByNumber(customerNumber: string) {
  const res = await fusecore.get(`/customers/no/${customerNumber}`);
  return res.data;
}

// ── Customer documents ─────────────────────────────────────────────
export async function getCustomerDocuments(id: string) {
  const res = await fusecore.get(`/customers/${id}/documents`);
  return res.data;
}

export async function addCustomerDocument(
  id: string,
  data: { type: string; url?: string; filename?: string; meta?: Record<string, any> }
) {
  const res = await fusecore.post(`/customers/${id}/documents`, data);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════
// Accounts
// ═══════════════════════════════════════════════════════════════════
export interface OpenAccountInput {
  customerId: string | number;
  productId?: number;
  type?: string;
  currency?: string;
  [key: string]: any;
}

export async function createAccount(data: OpenAccountInput) {
  const res = await fusecore.post("/accounts", {
    currency: "NGN",
    type: "SAVINGS",
    ...data,
  });
  return res.data;
}

export async function getAccount(id: string) {
  const res = await fusecore.get(`/accounts/${id}`);
  return res.data;
}

export async function getAccountByNumber(accountNumber: string) {
  const res = await fusecore.get(`/accounts/no/${accountNumber}`);
  return res.data;
}

export async function getAccountBalance(accountNumber: string) {
  const res = await fusecore.get(`/accounts/no/${accountNumber}/balance`);
  return res.data;
}

export async function getAccountsByCustomer(customerId: string | number) {
  const res = await fusecore.get(`/accounts/customer/${customerId}`);
  return res.data;
}

export async function getAccountBeneficiaries(id: string | number) {
  const res = await fusecore.get(`/accounts/${id}/beneficiaries`);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════
// Transactions
// ═══════════════════════════════════════════════════════════════════
export async function getTransactions(params?: {
  page?: number;
  limit?: number;
  accountNumber?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}) {
  const res = await fusecore.get("/transactions", { params });
  return res.data;
}

// Back-compat helper used by older pages
export async function getAccountTransactions(
  accountIdOrNumber: string,
  params?: { limit?: number; page?: number }
) {
  // Prefer the canonical filter shape: accountNumber via /transactions
  const res = await fusecore.get("/transactions", {
    params: { accountNumber: accountIdOrNumber, ...params },
  });
  return res.data;
}

export async function getTransaction(id: string) {
  const res = await fusecore.get(`/transactions/${id}`);
  return res.data;
}

export async function getTransactionByReference(ref: string) {
  const res = await fusecore.get(`/transactions/ref/${ref}`);
  return res.data;
}

export async function getTransactionReceipt(id: string) {
  const res = await fusecore.get(`/transactions/${id}/receipt`);
  return res.data;
}

export interface InternalTransferInput {
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  narration?: string;
  initiatedBy?: string;
  reference?: string;
  [key: string]: any;
}

export async function internalTransfer(data: InternalTransferInput) {
  const res = await fusecore.post(`/transactions/transfer`, data);
  return res.data;
}

// External (inter-bank) — placeholder until FuseCore exposes outbound NIP.
// Falls back to the same internal endpoint and lets the server reject if
// out-of-bank transfers aren't supported yet.
export interface OutboundTransferInput {
  fromAccountNumber: string;
  toAccountNumber: string;
  toBankCode: string;
  amount: number;
  narration?: string;
  idempotencyKey: string;
}

export async function outboundTransfer(data: OutboundTransferInput) {
  // Some deployments use /payments, others use /transactions/transfer-external.
  // We try the canonical name first and rely on FuseCore returning a clear
  // 404/422 if it isn't available so the UI can surface it.
  try {
    const res = await fusecore.post(`/transactions/transfer-external`, data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      const res = await fusecore.post(`/payments`, data);
      return res.data;
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Loans (customer-side: view + repay)
// ═══════════════════════════════════════════════════════════════════
export async function getMyLoans(customerId: string | number, params?: { page?: number; limit?: number }) {
  const res = await fusecore.get("/loans", {
    params: { customerId, ...params },
  });
  return res.data;
}

export async function getLoan(id: string) {
  const res = await fusecore.get(`/loans/${id}`);
  return res.data;
}

export async function getLoanSchedule(id: string) {
  const res = await fusecore.get(`/loans/${id}/schedule`);
  return res.data;
}

export async function getLoanRepayments(id: string) {
  const res = await fusecore.get(`/loans/${id}/repayments`);
  return res.data;
}

export async function repayLoan(
  id: string,
  data: { amount: number; paidBy: string; channel?: string; narration?: string }
) {
  const res = await fusecore.post(`/loans/${id}/repay`, data);
  return res.data;
}

// ═══════════════════════════════════════════════════════════════════
// Health
// ═══════════════════════════════════════════════════════════════════
export async function getHealth() {
  const res = await fusecore.get("/health");
  return res.data;
}

export default fusecore;
