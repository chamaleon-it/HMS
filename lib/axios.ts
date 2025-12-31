// lib/axios.ts
"use client";

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import type { GetServerSidePropsContext } from "next";
import configuration from "@/config/configuration";
import { syncService } from "./sync.service";
import { toast } from "react-hot-toast";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

type RefreshResponse = {
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

type CreateApiOptions = {
  ctx?: GetServerSidePropsContext | null;
  baseURL?: string;
};

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function enqueueRefresh(cb: (token: string | null) => void) {
  refreshQueue.push(cb);
}
function flushRefreshQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

/** Central helpers for reading/writing tokens via nookies */
export const tokenStore = {
  get(ctx?: GetServerSidePropsContext | null) {
    const cookies = parseCookies({ req: ctx?.req });
    return {
      access: cookies[ACCESS_COOKIE] || null,
      refresh: cookies[REFRESH_COOKIE] || null,
    };
  },
  set(access: string, refresh: string, ctx?: GetServerSidePropsContext | null) {
    // NOTE: For best security, set HttpOnly on the server. Using nookies here per your requirement.
    const cookieOptions = {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    };
    setCookie(ctx, ACCESS_COOKIE, access, cookieOptions);
    setCookie(ctx, REFRESH_COOKIE, refresh, cookieOptions);
  },
  clear(ctx?: GetServerSidePropsContext | null) {
    destroyCookie(ctx, ACCESS_COOKIE, { path: "/" });
    destroyCookie(ctx, REFRESH_COOKIE, { path: "/" });
  },
};

/** Create an Axios instance that attaches tokens and auto-refreshes on 401 */
export function createApi(options: CreateApiOptions = {}): AxiosInstance {
  const { ctx = null, baseURL = process.env.NEXT_PUBLIC_API_URL || "" } = options;

  const api = axios.create({
    baseURL,
    withCredentials: true,
  });

  /** Attach Authorization header from cookie before each request */
  api.interceptors.request.use((config) => {
    const { access } = tokenStore.get(ctx);
    if (access && config && config.headers) {
      config.headers.Authorization = `Bearer ${access}`;
    }
    return config;
  });

  /** Handle 401s: refresh tokens once, queue pending requests, then retry */
  api.interceptors.response.use(
    async (res) => {
      // Cache successful GET requests
      if (res.config.method === "get" && res.data && res.data.data) {
        const url = new URL(res.config.url || "", res.config.baseURL).pathname;
        const collection = url.split("/")[1];
        if (collection && ["patients", "billing", "pharmacy", "appointments", "lab"].includes(collection)) {
          const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
          await syncService.bulkUpdate(collection, data);
        }
      }
      return res;
    },
    async (error: AxiosError) => {
      const original = error.config as AxiosRequestConfig & { _retry?: boolean };

      // Handle Network Errors (Offline)
      if (!error.response) {
        // Fallback for GET requests
        if (original.method === "get") {
          const url = new URL(original.url || "", original.baseURL).pathname;
          const collection = url.split("/")[1];
          if (collection && ["patients", "billing", "pharmacy", "appointments", "lab"].includes(collection)) {
            try {
              const localData = await syncService.getAll(collection);
              return {
                data: { data: localData, message: "Loaded from offline cache" },
                status: 200,
                statusText: "OK",
                headers: {},
                config: original,
              };
            } catch (e) {
              console.error("Local cache fetch failed:", e);
            }
          }
        }

        // Queue for Mutations
        if (["post", "put", "delete", "patch"].includes(original.method || "")) {
          const url = new URL(original.url || "", original.baseURL).pathname;
          if (url === "/sync") return Promise.reject(error); // Don't queue sync itself

          const collection = url.split("/")[1] || "general";
          await syncService.queueAction({
            method: (original.method?.toUpperCase() as any) || "POST",
            url: original.url || "",
            body: original.data,
            module: collection,
          });
          toast.success("Saved offline. Will sync when online.");
          return {
            data: { message: "Saved offline", data: original.data },
            status: 200,
            statusText: "OK",
            headers: {},
            config: original,
          };
        }
        return Promise.reject(error);
      }

      // If already retried -> reject
      if (original?._retry) {
        return Promise.reject(error);
      }

      const status = error.response.status;
      if (status !== 401) {
        return Promise.reject(error);
      }

      // Mark request as retryable to avoid loops
      original._retry = true;

      // If a refresh is already in progress, wait for it and then retry
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          enqueueRefresh((newAccess) => {
            if (!newAccess) return reject(error);
            original.headers = original.headers ?? {};
            (original.headers).Authorization = `Bearer ${newAccess}`;
            resolve(api(original));
          });
        });
      }

      // Begin a new refresh flow
      isRefreshing = true;

      try {
        const { refresh } = tokenStore.get(ctx);
        if (!refresh) {
          tokenStore.clear(ctx);
          return Promise.reject(error);
        }

        // Use a bare axios (no interceptors) to avoid recursion
        const refreshClient = axios.create({ baseURL, withCredentials: true });

        const { data } = await refreshClient.post<RefreshResponse>("/auth/refresh_token", {
          refreshToken: refresh,
        });

        const newAccess = data?.data?.accessToken;
        const newRefresh = data?.data?.refreshToken;

        if (!newAccess || !newRefresh) {
          tokenStore.clear(ctx);
          flushRefreshQueue(null);
          return Promise.reject(error);
        }

        // Persist new tokens
        tokenStore.set(newAccess, newRefresh, ctx);

        // Update default header for subsequent requests
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

        // Release queued requests
        flushRefreshQueue(newAccess);

        // Retry the original request with the fresh access token
        original.headers = original.headers ?? {};
        (original.headers).Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        // Refresh failed: clear tokens and fail all queued requests
        tokenStore.clear(ctx);
        flushRefreshQueue(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return api;
}

const api = createApi({
  baseURL: configuration().backendUrl
})

export default api