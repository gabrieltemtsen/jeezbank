import axios, { AxiosError, AxiosRequestConfig } from "axios";

const fusecore = axios.create({
  baseURL: process.env.FUSECORE_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    "x-api-key": process.env.FUSECORE_API_KEY || "",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// ── Dev-friendly outbound logging ──────────────────────────────────
fusecore.interceptors.request.use((config) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[fusecore:admin] → ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  }
  return config;
});

// ── One-shot retry on transient failures ───────────────────────────
// Retries once on: timeouts (ECONNABORTED / ETIMEDOUT), network errors
// (no response received), and 5xx server errors. 4xx errors are NOT retried.
fusecore.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const cfg = err.config as AxiosRequestConfig & { __retried?: boolean };
    if (!cfg || cfg.__retried) return Promise.reject(err);

    const transient =
      err.code === "ECONNABORTED" ||
      err.code === "ETIMEDOUT" ||
      err.code === "ECONNRESET" ||
      err.code === "ENETUNREACH" ||
      !err.response || // network error
      (err.response.status >= 500 && err.response.status <= 599);

    if (!transient) return Promise.reject(err);

    cfg.__retried = true;
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[fusecore:admin] ↻ retrying ${cfg.method?.toUpperCase()} ${cfg.url} (` +
          (err.response ? `status ${err.response.status}` : err.code || "network") +
          `)`
      );
    }
    // small backoff
    await new Promise((r) => setTimeout(r, 350));
    return fusecore.request(cfg);
  }
);

// ── Error extraction helper ────────────────────────────────────────
// Pulls the most useful human-readable message out of any FuseCore error.
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
    if (status === 401 || status === 403) return `FuseCore auth failed (${status}): check FUSECORE_API_KEY`;
    if (!err.response) return `FuseCore unreachable (${err.code || "network error"})`;
    return `FuseCore ${status}: ${msg}`;
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

// ── Response normaliser ────────────────────────────────────────────
// FuseCore returns a few different envelope shapes; this picks the array
// + total reliably so each page doesn't have to guess.
export function unwrapList<T = any>(raw: any): { items: T[]; total: number } {
  const payload = raw?.data ?? raw;
  const items: T[] =
    payload?.items ??
    payload?.data ??
    payload?.customers ??
    payload?.transactions ??
    payload?.loans ??
    payload?.alerts ??
    (Array.isArray(payload) ? payload : []) ??
    [];
  const total: number = payload?.total ?? payload?.meta?.total ?? items.length;
  return { items, total };
}

// ── Customers ──────────────────────────────────────────────────────
export async function getCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const res = await fusecore.get("/customers", { params });
  return res.data;
}

export async function getCustomer(id: string) {
  const res = await fusecore.get(`/customers/${id}`);
  return res.data;
}

export async function getCustomerDocuments(id: string) {
  const res = await fusecore.get(`/customers/${id}/documents`);
  return res.data;
}

export async function getCustomerRelatedParties(id: string) {
  const res = await fusecore.get(`/customers/${id}/related-parties`);
  return res.data;
}

// ── Accounts ───────────────────────────────────────────────────────
export async function getAccounts(params?: {
  page?: number;
  limit?: number;
  customerId?: number;
  productId?: number;
  type?: string;
  status?: string;
}) {
  const res = await fusecore.get(`/accounts`, { params });
  return res.data;
}

export async function getAccountsByCustomer(customerId: number) {
  const res = await fusecore.get(`/accounts/customer/${customerId}`);
  return res.data;
}

export async function getAccount(id: string) {
  const res = await fusecore.get(`/accounts/${id}`);
  return res.data;
}

export async function getAccountByAccountNumber(accountNumber: string) {
  const res = await fusecore.get(`/accounts/no/${accountNumber}`);
  return res.data;
}

export async function getAccountBalance(accountNumber: string) {
  const res = await fusecore.get(`/accounts/no/${accountNumber}/balance`);
  return res.data;
}

export async function getAccountParties(id: number) {
  const res = await fusecore.get(`/accounts/${id}/parties`);
  return res.data;
}

export async function getAccountSignatories(id: number) {
  const res = await fusecore.get(`/accounts/${id}/signatories`);
  return res.data;
}

export async function getAccountMandates(id: number) {
  const res = await fusecore.get(`/accounts/${id}/mandates`);
  return res.data;
}

export async function getAccountBeneficiaries(id: number) {
  const res = await fusecore.get(`/accounts/${id}/beneficiaries`);
  return res.data;
}

// ── Transactions ───────────────────────────────────────────────────
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

// ── Loans ──────────────────────────────────────────────────────────
export async function getLoans(params?: {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: number;
  productId?: number;
}) {
  const res = await fusecore.get("/loans", { params });
  return res.data;
}

export async function getLoan(id: string) {
  const res = await fusecore.get(`/loans/${id}`);
  return res.data;
}

export async function approveLoan(id: string, data: { approvedBy: string; notes?: string }) {
  const res = await fusecore.patch(`/loans/${id}/approve`, data);
  return res.data;
}

export async function rejectLoan(id: string, data: { rejectedBy: string; reason: string; notes?: string }) {
  const res = await fusecore.patch(`/loans/${id}/reject`, data);
  return res.data;
}

export async function disburseLoan(id: string, data: { disbursedBy: string }) {
  const res = await fusecore.patch(`/loans/${id}/disburse`, data);
  return res.data;
}

export async function repayLoan(id: string, data: { amount: number; paidBy: string; channel?: string; narration?: string }) {
  const res = await fusecore.post(`/loans/${id}/repay`, data);
  return res.data;
}

export async function forecloseLoan(id: string, data: { foreclosedBy: string; notes?: string }) {
  const res = await fusecore.patch(`/loans/${id}/foreclose`, data);
  return res.data;
}

export async function recoverLoan(id: string, data: { recoveredBy: string; amount: number; notes?: string }) {
  const res = await fusecore.post(`/loans/${id}/recover`, data);
  return res.data;
}

// ── AML ────────────────────────────────────────────────────────────
export async function getAmlAlerts(params?: { limit?: number; status?: string }) {
  const res = await fusecore.get("/aml/alerts", { params });
  return res.data;
}

export async function resolveAmlAlert(id: string, data: { resolution: string; resolvedBy: string }) {
  const res = await fusecore.post(`/aml/alerts/${id}/resolve`, data);
  return res.data;
}

// ── Reporting ──────────────────────────────────────────────────────
export async function getCbnReturns(params: { period: string; format?: string }) {
  const res = await fusecore.get("/reporting/cbn/monthly-returns", { params });
  return res.data;
}

// ── Health ─────────────────────────────────────────────────────────
export async function getHealth() {
  const res = await fusecore.get("/health");
  return res.data;
}

export default fusecore;
