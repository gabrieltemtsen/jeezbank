import axios from "axios";

const fusecore = axios.create({
  baseURL: process.env.FUSECORE_BASE_URL || "http://localhost:3000/api/v1",
  headers: {
    // Use canonical header name; server reads request.headers['x-api-key'].
    "x-api-key": process.env.FUSECORE_API_KEY || "",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export async function getCustomers(params?: { limit?: number; offset?: number; search?: string }) {
  const res = await fusecore.get("/customers", { params });
  return res.data;
}

export async function getCustomer(id: string) {
  const res = await fusecore.get(`/customers/${id}`);
  return res.data;
}

export async function getAccount(id: string) {
  const res = await fusecore.get(`/accounts/${id}`);
  return res.data;
}

export async function getTransactions(params?: { limit?: number; offset?: number; status?: string }) {
  const res = await fusecore.get("/transactions", { params });
  return res.data;
}

export async function getLoans(params?: { limit?: number; offset?: number; status?: string }) {
  const res = await fusecore.get("/loans", { params });
  return res.data;
}

export async function getLoan(id: string) {
  const res = await fusecore.get(`/loans/${id}`);
  return res.data;
}

export async function approveLoan(id: string, data: { approvedBy: string; notes?: string }) {
  const res = await fusecore.post(`/loans/${id}/approve`, data);
  return res.data;
}

export async function disburseLoan(id: string, data: { disbursedBy: string }) {
  const res = await fusecore.post(`/loans/${id}/disburse`, data);
  return res.data;
}

export async function getAmlAlerts(params?: { limit?: number; status?: string }) {
  const res = await fusecore.get("/aml/alerts", { params });
  return res.data;
}

export async function resolveAmlAlert(id: string, data: { resolution: string; resolvedBy: string }) {
  const res = await fusecore.post(`/aml/alerts/${id}/resolve`, data);
  return res.data;
}

export async function getCbnReturns(params: { period: string; format?: string }) {
  const res = await fusecore.get("/reporting/cbn/monthly-returns", { params });
  return res.data;
}

export async function getHealth() {
  const res = await fusecore.get("/health");
  return res.data;
}

export default fusecore;
