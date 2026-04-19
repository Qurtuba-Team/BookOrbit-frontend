// ─── BookOrbit API Configuration ────────────────────────────────────────────
import { API_V1, tokenStore } from "../utils/constants";

// ─── Core API Client ─────────────────────────────────────────────────────────
async function apiRequest(path, options = {}) {
  const { accessToken } = tokenStore.get();
  
  // ننشئ نسخة من الـ headers لتجنب التعديل على الكائن الأصلي
  const headers = { ...options.headers };

  // إضافة التوكن إذا وجد ولم نطلب تخطيه
  if (accessToken && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // التعديل الجوهري هنا:
  // إذا كانت البيانات FormData، نترك المتصفح يضع الـ Content-Type بنفسه (ليضيف الـ boundary)
  // إذا كانت البيانات JSON (أو أي شيء آخر)، نضع application/json
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  } else {
    // نضمن حذف أي Content-Type قد يكون مرر يدوياً في حالة الـ FormData
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_V1}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // محاولة قراءة الخطأ من السيرفر لإظهاره للمستخدم (مثل رسالة الصورة مطلوبة)
    const error = await response.json().catch(() => ({ message: "خطأ غير متوقع" }));
    throw new Error(error.detail || error.message || (error.errors && JSON.stringify(error.errors)) || `HTTP ${response.status}`);
  }

  // للتعامل مع Responses الـ 204 (No Content)
  if (response.status === 204) return null;

  return response.json();
}

// ─── 1. IDENTITY ─────────────────────────────────────────────────────────────
export const identityApi = {
  /** POST /identity/token — Login */
  login: (email, password) =>
    apiRequest("/identity/token", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    }),

  /** POST /identity/token/refresh — Refresh tokens */
  refreshToken: (refreshToken, expiredAccessToken) =>
    apiRequest("/identity/token/refresh", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ refreshToken, expiredAccessToken }),
    }),

  /** GET /identity/users/me — Current user info */
  getMe: () => apiRequest("/identity/users/me"),

  /** POST /identity/users/{userId}/send-email-confirmation */
  sendEmailConfirmation: (userId) =>
    apiRequest(`/identity/users/${userId}/send-email-confirmation`, {
      method: "POST",
    }),

    // Change-Password / send OTP 
  confirmEmail: (userId, token) =>
  apiRequest(`/identity/confirm-email?Id=${userId}&token=${token}`, {
    method: "GET",
    skipAuth: true,
  }),

requestPasswordReset: (email) =>
  apiRequest("/identity/users/request-password-reset", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify({ email }),
  }),

verifyPasswordResetOtp: (data) =>
  apiRequest("/identity/users/verify-password-reset-otp", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(data),
  }),

resetPassword: (data) =>
  apiRequest("/identity/users/reset-password", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(data),
  }),
};

// ─── 2. STUDENTS ─────────────────────────────────────────────────────────────
export const studentsApi = {
  /** POST /students — Register new student (multipart/form-data) */
  create: (formData) =>
    apiRequest("/students", { method: "POST", skipAuth: true, body: formData }),

  /** PATCH /students/{id} — Update student profile (multipart/form-data) */
  update: (studentId, formData) =>
    apiRequest(`/students/${studentId}`, { method: "PATCH", body: formData }),

  /** GET /students/me — Current student profile */
  getMe: () => apiRequest("/students/me"),

  /** GET /students/{id} — Student by ID */
 getById: (studentId) => apiRequest(`/students/${studentId}`),

  /** GET /students — All students (Admin only) */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/students?${query}`);
  },

  /** PATCH /students/{id}/approve */
approve:  (studentId) => apiRequest(`/students/${studentId}/approve`,  { method: "PATCH" }),  /** PATCH /students/{id}/activate */
  activate: (studentId) => apiRequest(`/students/${studentId}/activate`, { method: "PATCH" }),
  /** PATCH /students/{id}/ban */
  ban: (studentId) => apiRequest(`/students/${studentId}/ban`, { method: "PATCH" }),
  /** PATCH /students/{id}/unban */
  unban: (studentId) => apiRequest(`/students/${studentId}/unban`, { method: "PATCH" }),
  /** PATCH /students/{id}/reject */
  reject: (studentId) => apiRequest(`/students/${studentId}/reject`, { method: "PATCH" }),
  /** PATCH /students/{id}/pend */
  pend: (studentId) => apiRequest(`/students/${studentId}/pend`, { method: "PATCH" }),
};

// بقية الكود (Books, BookCopies, LendingList) تظل كما هي لأنها تستخدم نفس apiRequest
export const booksApi = {
  create: (formData) => apiRequest("/books", { method: "POST", body: formData }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books?${query}`);
  },
  getById: (bookId) => apiRequest(`/books/${bookId}`),
  update: (bookId, data) =>
    apiRequest(`/books/${bookId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (bookId) => apiRequest(`/books/${bookId}`, { method: "DELETE" }),
};

// ─── 4. BOOK COPIES ──────────────────────────────────────────────────────────
export const bookCopiesApi = {
  /** POST /students/me/books/copies — لاحظ التغيير لـ /me بدل الـ ID */
  create: (bookId, condition) =>
    apiRequest(`/students/me/books/copies`, {
      method: "POST",
      body: JSON.stringify({ bookId, condition }),
    }),

  /** GET /books/copies/{bookCopyId} */
  getById: (bookCopyId) => apiRequest(`/books/copies/${bookCopyId}`),

  /** PATCH /books/copies/{bookCopyId} */
  update: (bookCopyId, condition) =>
    apiRequest(`/books/copies/${bookCopyId}`, {
      method: "PATCH",
      body: JSON.stringify({ condition }),
    }),

  /** POST /students/me/books/copies/{bookCopyId}/list — لاحظ التغيير لـ /me */
  listForLending: (bookCopyId, borrowingDurationInDays) =>
    apiRequest(
      `/students/me/books/copies/${bookCopyId}/list?borrowingDurationInDays=${borrowingDurationInDays}`,
      { method: "POST" }
    ),
};

export const lendingApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/lendinglist?${query}`);
  },
getById: (lendingListRecordId) => apiRequest(`/lendinglist/${lendingListRecordId}`),};