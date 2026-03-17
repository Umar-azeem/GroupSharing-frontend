const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
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

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
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

  getMyGroups: () => fetchAPI("/groups/my-groups"),
};

// Admin API
export const adminAPI = {
  getStats: () => fetchAPI("/admin/stats"),
  getUsers: () => fetchAPI("/admin/users"),
  deleteUser: (id: string) => fetchAPI(`/admin/user/${id}`, { method: "DELETE" }),
  getAllPosts: () => fetchAPI("/admin/posts"),
  deletePost: (id: string) => fetchAPI(`/admin/post/${id}`, { method: "DELETE" }),
  updatePostStatus: (id: string, status: string) =>
    fetchAPI(`/admin/post/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  verifyPost: (id: string) =>
    fetchAPI(`/admin/post/${id}/verify`, { method: "PUT" }),
};
