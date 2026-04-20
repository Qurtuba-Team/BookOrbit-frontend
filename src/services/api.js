// ─── BookOrbit API Configuration ────────────────────────────────────────────
import { API_V1, tokenStore } from "../utils/constants";

// ─── Token Refresh Queue ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Core API Client ─────────────────────────────────────────────────────────
async function apiRequest(path, options = {}) {
  let { accessToken, refreshToken: storedRefreshToken, expiresOnUtc } = tokenStore.get();
  
  // ─── Proactive Token Refresh (Before 15m expiration) ──────────────────────
  if (accessToken && storedRefreshToken && expiresOnUtc && !options.skipAuth) {
    const expiresAt = new Date(expiresOnUtc).getTime();
    const now = new Date().getTime();
    const timeRemaining = expiresAt - now;

    // Refresh if less than 2 minutes (120000 ms) remain
    if (timeRemaining > 0 && timeRemaining < 2 * 60 * 1000) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_V1}/identity/token/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({ 
              refreshToken: storedRefreshToken, 
              expiredAccessToken: accessToken 
            }),
          });

          if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            const rememberMe = localStorage.getItem("refreshToken") !== null;
            tokenStore.set(newTokens, rememberMe);
            accessToken = newTokens.accessToken; // Use the new token for this request
            processQueue(null, newTokens.accessToken);
          } else {
            throw new Error("Session expired during proactive refresh");
          }
        } catch (err) {
          processQueue(err, null);
          window.dispatchEvent(new CustomEvent("auth:logout"));
          throw err; // Proactive refresh failed, abort request
        } finally {
          isRefreshing = false;
        }
      } else {
        // If another request is already refreshing, wait for it
        try {
          accessToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        } catch (e) {
          throw e;
        }
      }
    }
  }

  const headers = { ...options.headers,"ngrok-skip-browser-warning": "69420" };

  if (accessToken && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  } else {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_V1}${path}`, {
    ...options,
    headers,
  });

  // ✅ قراءة الـ Response Body كنص أولاً للتعامل مع جميع الـ Content-Types
  const responseText = await response.text();

  if (!response.ok) {
    // ✅ محاولة تحليل الخطأ كـ JSON، ولو فشل نستخدم النص كما هو
    let errorData;
    try {
      errorData = responseText ? JSON.parse(responseText) : { detail: "حدث خطأ غير متوقع" };
    } catch {
      errorData = { detail: responseText || `HTTP ${response.status}` };
    }

    // ─── Rate Limit (429) Handling ──────────────────────────────────────────
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
      
      const retryCount = options._retryCount || 0;
      if (retryCount < 2) { // Retry up to 2 times
        await new Promise(resolve => setTimeout(resolve, waitTime * (retryCount + 1)));
        return apiRequest(path, { ...options, _retryCount: retryCount + 1 });
      }
    }

    // ─── Token Refresh Interceptor ───────────────────────────────────────────
    if (response.status === 401 && !options.skipAuth && storedRefreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_V1}/identity/token/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({ 
              refreshToken: storedRefreshToken, 
              expiredAccessToken: accessToken 
            }),
          });

          if (refreshRes.ok) {
            const newTokens = await refreshRes.json();
            // Preserve the storage type based on where it was found
            const rememberMe = localStorage.getItem("refreshToken") !== null;
            tokenStore.set(newTokens, rememberMe);
            processQueue(null, newTokens.accessToken);
          } else {
            throw new Error("Session expired");
          }
        } catch (err) {
          processQueue(err, null);
          window.dispatchEvent(new CustomEvent("auth:logout"));
          throw err;
        } finally {
          isRefreshing = false;
        }
      }

      // Wait in queue and retry when refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiRequest(path, options))
        .catch((err) => { throw err; });
    }

    // لو مفيش Refresh Token أو الـ Refresh نفسه فشل
    if (response.status === 401 && !options.skipAuth) {
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    const errorMessage = errorData.detail || errorData.message || errorData.title || `HTTP ${response.status}`;
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.detail = errorData.detail;
    error.title = errorData.title;
    error.instance = errorData.instance;
    
    // ✅ دعم أخطاء التحقق من الحقول (لو موجودة)
    if (errorData.errors) {
      error.errors = errorData.errors;
    } else if (errorData.extensions?.errors) {
      error.errors = errorData.extensions.errors;
    }
    
    throw error;
  }

  // ✅ للتعامل مع 204 No Content
  if (response.status === 204) return null;

  // ✅ التعامل مع الـ Response بناءً على الـ Content-Type
  const contentType = response.headers.get("content-type");
  
  if (contentType?.includes("application/json")) {
    try {
      return responseText ? JSON.parse(responseText) : null;
    } catch {
      return responseText;
    }
  } else {
    // لو الـ Response نص عادي (زي "Email Sent")، نرجعه كما هو
    return responseText;
  }
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

  /** ✅ POST /identity/send-email-confirmation?email={email} */
  sendEmailConfirmation: (email) =>
    apiRequest(`/identity/send-email-confirmation?email=${encodeURIComponent(email)}`, {
      method: "POST",
      skipAuth: true,
    }),

  /** POST /identity/confirm-email?email={email}&token={token} */
  confirmEmail: (email, token) =>
    apiRequest(`/identity/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, {
      method: "POST",
      skipAuth: true,
    }),

  /** POST /identity/forgot-password */
  requestPasswordReset: (email) =>
    apiRequest("/identity/forgot-password", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email }),
    }),

  /** POST /identity/reset-password */
  resetPassword: (data) =>
    apiRequest("/identity/reset-password", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify(data),
    }),
};

// ─── 2. STUDENTS ─────────────────────────────────────────────────────────────
export const studentsApi = {
  /** POST /students — Register new student (multipart/form-data) */
  create: (formData) =>
    apiRequest("/students", { 
      method: "POST", 
      skipAuth: true, 
      body: formData 
    }),

  /** PATCH /students/{studentId} — Update student profile (multipart/form-data) */
  update: (studentId, formData) =>
    apiRequest(`/students/${studentId}`, { 
      method: "PATCH", 
      body: formData 
    }),

  /** GET /students/me — Current student profile */
  getMe: () => apiRequest("/students/me"),

  /** GET /students/{studentId} — Student by ID */
  getById: (studentId) => apiRequest(`/students/${studentId}`),

  /** GET /students — All students (Admin only) */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/students?${query}`);
  },

  /** PATCH /students/{studentId}/approve */
  approve: (studentId) => 
    apiRequest(`/students/${studentId}/approve`, { method: "PATCH" }),

  /** PATCH /students/{studentId}/activate */
  activate: (studentId) => 
    apiRequest(`/students/${studentId}/activate`, { method: "PATCH" }),

  /** PATCH /students/{studentId}/ban */
  ban: (studentId) => 
    apiRequest(`/students/${studentId}/ban`, { method: "PATCH" }),

  /** PATCH /students/{studentId}/unban */
  unban: (studentId) => 
    apiRequest(`/students/${studentId}/unban`, { method: "PATCH" }),

  /** PATCH /students/{studentId}/reject */
  reject: (studentId) => 
    apiRequest(`/students/${studentId}/reject`, { method: "PATCH" }),

  /** PATCH /students/{studentId}/pend */
  pend: (studentId) => 
    apiRequest(`/students/${studentId}/pend`, { method: "PATCH" }),
};

// ─── 3. BOOKS ────────────────────────────────────────────────────────────────
export const booksApi = {
  /** POST /books — Create new book (multipart/form-data) */
  create: (formData) => 
    apiRequest("/books", { 
      method: "POST", 
      body: formData 
    }),

  /** GET /books — Paginated list of books */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books?${query}`);
  },

  /** GET /books/{bookId} — Book by ID */
  getById: (bookId) => apiRequest(`/books/${bookId}`),

  /** PATCH /books/{bookId} — Update book (JSON) */
  update: (bookId, data) =>
    apiRequest(`/books/${bookId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** DELETE /books/{bookId} — Delete book */
  delete: (bookId) => 
    apiRequest(`/books/${bookId}`, { 
      method: "DELETE" 
    }),
};

// ─── 4. BOOK COPIES ──────────────────────────────────────────────────────────
export const bookCopiesApi = {
  /** POST /students/me/books/{bookId}/copies — Create book copy */
  create: (bookId, condition) =>
    apiRequest(`/students/me/books/${bookId}/copies`, {
      method: "POST",
      body: JSON.stringify({ condition }),
    }),

  /** GET /books/copies/{bookCopyId} — Book copy by ID */
  getById: (bookCopyId) => apiRequest(`/books/copies/${bookCopyId}`),

  /** PATCH /books/copies/{bookCopyId} — Update book copy */
  update: (bookCopyId, condition) =>
    apiRequest(`/books/copies/${bookCopyId}`, {
      method: "PATCH",
      body: JSON.stringify({ condition }),
    }),

  /** GET /books/{bookId}/copies — Copies by book ID */
  getByBookId: (bookId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books/${bookId}/copies?${query}`);
  },

  /** GET /students/{studentId}/books/copies — Copies by student ID */
  getByStudentId: (studentId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/students/${studentId}/books/copies?${query}`);
  },

  /** GET /books/copies — All copies (paginated) */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books/copies?${query}`);
  },

  /** POST /students/me/books/copies/{bookCopyId}/list — Add to lending list */
  listForLending: (bookCopyId, borrowingDurationInDays) =>
    apiRequest(
      `/students/me/books/copies/${bookCopyId}/list?borrowingDurationInDays=${borrowingDurationInDays}`,
      { method: "POST" }
    ),
};

// ─── 5. LENDING LIST ─────────────────────────────────────────────────────────
export const lendingApi = {
  /** GET /lendinglist — Paginated list of lending records */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/lendinglist?${query}`);
  },

  /** GET /lendinglist/{lendingListRecordId} — Record by ID */
  getById: (lendingListRecordId) => 
    apiRequest(`/lendinglist/${lendingListRecordId}`),
};

// ─── 6. BORROWING REQUESTS ───────────────────────────────────────────────────
export const borrowingApi = {
  /** GET /borrowingrequests — Paginated list of requests */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/borrowingrequests?${query}`);
  },

  /** GET /borrowingrequests/{borrowingRequestId} — Request by ID */
  getById: (borrowingRequestId) => 
    apiRequest(`/borrowingrequests/${borrowingRequestId}`),

  /** POST /lendinglist/{lendingListRecordId}/request — Create borrowing request */
  create: (lendingListRecordId) =>
    apiRequest(`/lendinglist/${lendingListRecordId}/request`, {
      method: "POST",
    }),
};

// ─── 7. IMAGES ───────────────────────────────────────────────────────────────
export const imagesApi = {
  /** GET /images/students/{studentId} — Student profile image */
  getStudentImage: (studentId) =>
    apiRequest(`/images/students/${studentId}`, {
      headers: { "Accept": "application/json" },
    }),

  /** GET /images/books/{bookId} — Book cover image */
  getBookImage: (bookId) =>
    apiRequest(`/images/books/${bookId}`, {
      headers: { "Accept": "application/json" },
    }),
};
