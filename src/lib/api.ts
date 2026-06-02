import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL,
  // Render's free tier can take 15-25s to wake up. Allow 30s before failing.
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cold-start retry: if the very first request fails with a network/timeout
// error, retry up to 2 times with a small delay. Once the backend is warm,
// subsequent calls are fast.
const MAX_RETRIES = 2;
api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const cfg = error.config as
    | (InternalAxiosRequestConfig & { _retryCount?: number })
    | undefined;
  if (!cfg) return Promise.reject(error);

  const isNetwork = !error.response;
  const isServerSpinUp =
    error.response?.status === 502 ||
    error.response?.status === 503 ||
    error.response?.status === 504;
  const isTimeout = error.code === "ECONNABORTED";

  if (!(isNetwork || isServerSpinUp || isTimeout))
    return Promise.reject(error);

  cfg._retryCount = (cfg._retryCount || 0) + 1;
  if (cfg._retryCount > MAX_RETRIES) return Promise.reject(error);

  const delay = 1500 * cfg._retryCount;
  await new Promise((r) => setTimeout(r, delay));
  return api(cfg);
});

// Fire-and-forget warm-up so the first user click hits an already-warm
// backend on Render's free tier. Safe to ignore failures.
let warmedUp = false;
export function warmupBackend() {
  if (warmedUp || !baseURL) return;
  warmedUp = true;
  try {
    const url = `${baseURL.replace(/\/$/, "")}/health`;
    fetch(url, { method: "GET", mode: "cors", cache: "no-store" }).catch(
      () => {},
    );
  } catch {
    // ignore
  }
}

export default api;
