"use client";

export type LoginResponse = {
  access_token: string;
  token_type: string;
  must_change_password: boolean;
  email: string;
  full_name: string;
};

export type MeResponse = {
  email: string;
  full_name: string;
  must_change_password: boolean;
};

export type VerificationSettings = {
  step_count: number;
  step1_seconds: number;
  step2_seconds: number;
  step3_seconds: number;
};

export type AnalyticsOverview = {
  total_links: number;
  total_clicks: number;
  total_content_posts: number;
  links_last_7_days: Array<{ day: string; value: number }>;
  links_by_category: Array<{ category: string; value: number }>;
};

export type ShortLinkItem = {
  code: string;
  short_url: string;
  original_url: string;
  category: string;
  title: string;
  active: boolean;
  click_count: number;
  created_at: string;
};

export type ContentItem = {
  slug: string;
  title: string;
  category: string;
  published: boolean;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "fsb_admin_token";

export function getApiUrl(): string {
  return API_URL;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (auth) {
    const token = getToken();
    if (!token) throw new Error("Missing auth token");
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.detail || `Request failed (${res.status})`);
  }

  return data as T;
}

export const api = {
  login(payload: { email: string; password: string }) {
    return request<LoginResponse>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request<MeResponse>("/v1/auth/me", {}, true);
  },
  changeCredentials(payload: {
    current_password: string;
    new_email?: string;
    new_password: string;
    full_name?: string;
  }) {
    return request<LoginResponse>("/v1/auth/change-credentials", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true);
  },
  analyticsOverview() {
    return request<AnalyticsOverview>("/v1/analytics/overview", {}, true);
  },
  categories() {
    return request<{ categories: string[] }>("/v1/categories");
  },
  getVerification() {
    return request<VerificationSettings>("/v1/settings/verification");
  },
  updateVerification(payload: VerificationSettings) {
    return request<VerificationSettings>("/v1/settings/verification", {
      method: "PUT",
      body: JSON.stringify(payload),
    }, true);
  },
  createShortLink(payload: { original_url: string; category: string; title: string }) {
    return request<{ code: string; short_url: string; category: string; title: string }>("/v1/short-links", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true);
  },
  listShortLinks(limit = 50) {
    return request<ShortLinkItem[]>(`/v1/short-links?limit=${limit}`, {}, true);
  },
  createContent(payload: { slug: string; title: string; category: string; markdown: string; published: boolean }) {
    return request<{ slug: string; title: string; category: string; markdown: string }>("/v1/content", {
      method: "POST",
      body: JSON.stringify(payload),
    }, true);
  },
  listAdminContent(limit = 100) {
    return request<ContentItem[]>(`/v1/content/admin/list?limit=${limit}`, {}, true);
  },
};
