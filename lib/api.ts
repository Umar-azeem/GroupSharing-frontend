const PRIMARY_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const FALLBACK_API_URL = process.env.NEXT_PUBLIC_API_URL_FALLBACK || "http://localhost:8000/api";

let activeBaseUrl = PRIMARY_API_URL;

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const fetchWithTimeout = (url: string, options: RequestInit, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    )
  ]);
};

const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    // Try primary or currently active URL
    const response = await fetch(`${activeBaseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Something went wrong");
    return data;
  } catch (error: any) {
    // If it's a network error or timeout, and we are not already on fallback
    if ((error.message === "Failed to fetch" || error.name === "TypeError" || error.message === "Timeout") && activeBaseUrl !== FALLBACK_API_URL) {
      console.warn(`Primary API failed, switching to fallback: ${FALLBACK_API_URL}`);
      activeBaseUrl = FALLBACK_API_URL;
      
      // Retry with fallback
      const response = await fetch(`${activeBaseUrl}${endpoint}`, {
        ...options,
        headers,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      return data;
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getProfile: () => fetchAPI("/auth/profile"),

  updateProfile: (formData: FormData) =>
    fetchAPI("/auth/profile", { method: "PUT", body: formData }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchAPI("/auth/change-password", { method: "PUT", body: JSON.stringify(data) }),
};

// Groups API
export const groupsAPI = {
  getAll: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/groups${query}`);
  },

  getOne: (id: string) => fetchAPI(`/groups/${id}`),

  create: (formData: FormData) =>
    fetchAPI("/groups", { method: "POST", body: formData }),

  update: (id: string, formData: FormData) =>
    fetchAPI(`/groups/${id}`, { method: "PUT", body: formData }),

  delete: (id: string) => fetchAPI(`/groups/${id}`, { method: "DELETE" }),

  like: (id: string) => fetchAPI(`/groups/${id}/like`, { method: "POST" }),
  view: (id: string) => fetchAPI(`/groups/${id}/view`, { method: "POST" }),
  getMyGroups: () => fetchAPI("/groups/my-groups"),
};

// Admin API
export const adminAPI = {
  getStats: () => fetchAPI("/admin/stats"),
  getUsers: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return fetchAPI(`/admin/users${query}`);
  },
  deleteUser: (id: string, adminPassword: string) => 
    fetchAPI(`/admin/user/${id}`, { method: "DELETE", body: JSON.stringify({ adminPassword }) }),
  getAllPosts: (search?: string) => 
    fetchAPI(`/admin/posts${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  deletePost: (id: string) => fetchAPI(`/admin/post/${id}`, { method: "DELETE" }),
  updatePostStatus: (id: string, status: string) =>
    fetchAPI(`/admin/post/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  verifyPost: (id: string) =>
    fetchAPI(`/admin/post/${id}/verify`, { method: "PUT" }),
  freezeUser: (id: string, adminPassword: string) =>
    fetchAPI(`/admin/user/${id}/freeze`, { method: "PUT", body: JSON.stringify({ adminPassword }) }),
  unfreezeUser: (id: string, adminPassword: string) =>
    fetchAPI(`/admin/user/${id}/unfreeze`, { method: "PUT", body: JSON.stringify({ adminPassword }) }),
};
