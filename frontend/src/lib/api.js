import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const mediaUrl = (url) => (url ? `${BACKEND_URL}${url}` : url);

const client = axios.create({ baseURL: API });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("sojaru_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErr(e, fallback = "Something went wrong. Please try again.") {
  const d = e?.response?.data?.detail;
  if (!d) return e?.message || fallback;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x?.msg || JSON.stringify(x)).join(" ");
  return d?.msg || fallback;
}

export const store = {
  config: () => client.get("/store/config").then((r) => r.data),
  categories: () => client.get("/categories").then((r) => r.data),
  settings: () => client.get("/settings").then((r) => r.data),
};

export const admin = {
  updateSettings: (payload) => client.put("/admin/settings", payload).then((r) => r.data),
  uploadHero: (formData) => client.post("/admin/hero-images", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deleteHero: (id) => client.delete(`/admin/hero-images/${id}`).then((r) => r.data),
};

export const products = {
  list: (params) => client.get("/products", { params }).then((r) => r.data),
  bySlug: (slug) => client.get(`/products/slug/${slug}`).then((r) => r.data),
  byId: (id) => client.get(`/products/${id}`).then((r) => r.data),
  variations: (id) => client.get(`/products/${id}/variations`).then((r) => r.data),
  related: (id) => client.get(`/related/${id}`).then((r) => r.data),
};

export const orders = {
  create: (payload) => client.post("/orders", payload).then((r) => r.data),
  validateCoupon: (code) => client.get("/coupons/validate", { params: { code } }).then((r) => r.data),
};

export const auth = {
  register: (payload) => client.post("/auth/register", payload).then((r) => r.data),
  login: (payload) => client.post("/auth/login", payload).then((r) => r.data),
  me: () => client.get("/auth/me").then((r) => r.data),
  myOrders: () => client.get("/account/orders").then((r) => r.data),
  updateProfile: (payload) => client.put("/account/profile", payload).then((r) => r.data),
};

export default client;
