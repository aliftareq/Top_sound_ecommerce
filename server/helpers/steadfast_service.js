import axios from "axios";

const BASE_URL =
  process.env.STEADFAST_BASE_URL || "https://portal.packzy.com/api/v1";

function ensureCreds() {
  if (!process.env.STEADFAST_API_KEY || !process.env.STEADFAST_SECRET_KEY) {
    throw new Error(
      "Missing STEADFAST_API_KEY or STEADFAST_SECRET_KEY in environment.",
    );
  }
}

export const steadfastClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

steadfastClient.interceptors.request.use((config) => {
  ensureCreds();
  config.headers = {
    ...(config.headers || {}),
    "Api-Key": process.env.STEADFAST_API_KEY,
    "Secret-Key": process.env.STEADFAST_SECRET_KEY,
    "Content-Type": "application/json",
  };
  return config;
});

export async function steadfastCreateOrder(payload) {
  const { data } = await steadfastClient.post("/create_order", payload);
  return data;
}

export async function steadfastStatusByInvoice(invoice) {
  const { data } = await steadfastClient.get(`/status_by_invoice/${invoice}`);
  return data;
}

export async function steadfastStatusByTrackingCode(trackingCode) {
  const { data } = await steadfastClient.get(
    `/status_by_trackingcode/${trackingCode}`,
  );
  return data;
}

export async function steadfastStatusByConsignmentId(consignmentId) {
  const { data } = await steadfastClient.get(`/status_by_cid/${consignmentId}`);
  return data;
}
