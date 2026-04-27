// ─── BookOrbit API Configuration ────────────────────────────────────────────
import { API_V1, tokenStore, BOOK_CATEGORY_LABELS } from "../utils/constants";

// ─── Token Refresh Queue ─────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const toLowerSafe = (value) => String(value ?? "").toLowerCase();

const studentStateMap = {
  0: "pending",   // Unconfirmed
  1: "approved",  // Confirmed (Browsing only)
  2: "active",    // Verified (Full permissions)
  3: "rejected",
  4: "banned",
};

const borrowingStateMap = {
  0: "Pending",
  1: "Approved",
  2: "Rejected",
  3: "Expired",
  4: "Completed",
};

export const normalizeStudent = (student = {}) => {
  const stateValue = student.state ?? student.State;
  
  // Direct mapping from backend state:
  // 0 / "pending"  => Pending (waiting for admin approval)
  // 1 / "approved" => Approved (waiting for admin activation)
  // 2 / "active"   => Active (fully verified)
  // 4 / "banned"   => Banned
  
  const status = typeof stateValue === "number"
    ? studentStateMap[stateValue] || "pending"
    : toLowerSafe(stateValue || "pending");

  return {
    ...student,
    id: student.id || student.Id,
    fullName: student.fullName || student.name || student.Name || "طالب",
    name: student.name || student.Name || student.fullName,
    universityMailAddress: student.universityMailAddress || student.UniversityMailAddress || "",
    phoneNumber: student.phoneNumber || student.PhoneNumber || "",
    telegramUserId: student.telegramUserId || student.TelegramUserId || "",
    points: student.points ?? student.Points ?? 0,
    status: status,
    state: stateValue ?? status,
    creationDate: student.creationDate || student.joinDate || student.JoinDate,
  };
};



const normalizeBook = (book = {}) => {
  try {
    const stateValue = book.status ?? book.state ?? book.Status ?? book.State;
    // Robust check for approval: state 1, or explicit true, or status strings
    const isApproved = 
      stateValue === 1 || 
      stateValue === true ||
      book.isApproved === true ||
      book.IsApproved === true ||
      ["approved", "active", "verified"].includes(String(stateValue ?? "").toLowerCase());
    
      const categoryRaw = book.category ?? book.Category;
      let categoryLabel = categoryRaw;
      if (typeof categoryRaw === 'number') {
        try {
          const labels = Object.values(BOOK_CATEGORY_LABELS);
          categoryLabel = labels[categoryRaw] || categoryRaw;
        } catch (e) {
          categoryLabel = categoryRaw;
        }
      }

      return {
        ...book,
        id: book.id || book.Id,
        title: book.title || book.Title || "بدون عنوان",
        author: book.author || book.Author || "مؤلف مجهول",
        publisher: book.publisher || book.Publisher || "",
        isbn: book.isbn || book.ISBN || "",
        category: categoryLabel || "عام",
        copiesCount: book.copiesCount ?? book.availableCopiesCount ?? 0,
        bookCoverImageUrl: book.bookCoverImageUrl || book.BookCoverImageUrl || "",
        state: stateValue,
        isApproved: isApproved,
        status: isApproved ? "active" : (stateValue === 0 || stateValue === "Pending" ? "pending" : "rejected")
      };
    } catch (err) {
      console.error("Error normalizing book:", err, book);
      return { ...book, id: book?.id || Math.random(), title: "خطأ في البيانات" };
    }
};

const normalizeBorrowingRequest = (request = {}) => {
  const stateValue = request.state ?? request.State;
  const mappedState = typeof stateValue === "number"
    ? borrowingStateMap[stateValue] || "Pending"
    : (stateValue || "Pending");

  return {
    ...request,
    id: request.id || request.Id,
    lendingRecordId: request.lendingRecordId || request.lendingListRecordId || request.LendingRecordId,
    studentName: request.studentName || request.borrowingStudentName || request.BorrowingStudentName || "",
    bookTitle: request.bookTitle || request.BookTitle || "",
    requestDate: request.requestDate || request.createdAtUtc || request.createdAt || request.createdAtUTC,
    expectedReturnDate: request.expectedReturnDate || request.expirationDateUtc || request.expirationDate,
    returnDate: request.returnDate || request.expirationDateUtc || request.expirationDate,
    isOverdue: Boolean(request.isOverdue),
    status: request.status || mappedState,
    state: stateValue ?? mappedState,
  };
};

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

const buildQuery = (params) => {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => query.append(key, v));
    } else if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  return query.toString();
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

  const headers = { ...options.headers, "ngrok-skip-browser-warning": "69420" };

  if (accessToken && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  if (options.body) {
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
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
            // Retry the original request that triggered the refresh
            return apiRequest(path, options);
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

  /** ✅ POST /identity/users/send-email-confirmation?email={email} */
  sendEmailConfirmation: (email) =>
    apiRequest(`/identity/users/send-email-confirmation?email=${encodeURIComponent(email)}`, {
      method: "POST",
      skipAuth: true,
    }),

  /** POST /identity/confirm-email?email={email}&token={token} */
  confirmEmail: (email, token) =>
    apiRequest(`/identity/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, {
      method: "POST",
      skipAuth: true,
    }),

  /** POST /identity/users/send-reset-password?email={email} */
  requestPasswordReset: (email) =>
    apiRequest(`/identity/users/send-reset-password?email=${encodeURIComponent(email)}`, {
      method: "POST",
      skipAuth: true,
    }),

  /** POST /identity/reset-password */
  resetPassword: ({ email, token, newPassword }) =>
    apiRequest("/identity/reset-password", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        email: email,              // ✅ lowercase
        encodedToken: token,       // ✅ camelCase (مش Token!)
        newPassword: newPassword   // ✅ camelCase
      }),
    }),

  /** POST /identity/users/me/change-password */
  changePassword: ({ currentPassword, oldPassword, newPassword }) =>
    apiRequest("/identity/users/me/change-password", {
      method: "POST",
      body: JSON.stringify({
        oldPassword: oldPassword || currentPassword,
        newPassword,
      }),
    }),
};

// ─── 2. STUDENTS ─────────────────────────────────────────────────────────────
export const studentsApi = {
  /** POST /students — Register new student (multipart/form-data) */
  create: async (formData) => {
    const res = await apiRequest("/students", {
      method: "POST",
      skipAuth: true,
      body: formData
    });
    return normalizeStudent(res);
  },

  /** PATCH /students/{studentId} — Update student profile (multipart/form-data) */
  update: async (studentId, formData) => {
    const res = await apiRequest(`/students/${studentId}`, {
      method: "PATCH",
      body: formData
    });
    return normalizeStudent(res || {});
  },
  
  /** GET /students/me — Current student profile */
  getMe: async () => {
    const res = await apiRequest("/students/me");
    return normalizeStudent(res);
  },
  
  /** GET /students/{studentId} — Student by ID */
  getById: async (studentId) => {
    const res = await apiRequest(`/students/${studentId}`);
    return normalizeStudent(res);
  },
  
  /** GET /students — All students (Admin only) */
  getAll: async (params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/students?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeStudent) : [];
    return {
      ...res,
      items,
      data: items,
    };
  },

  /** PATCH /students/{studentId} — Update student profile (multipart/form-data) */
  updateRaw: (studentId, formData) =>
    apiRequest(`/students/${studentId}`, {
      method: "PATCH",
      body: formData
    }),

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
  create: async (formData) => {
    const res = await apiRequest("/books", {
      method: "POST",
      body: formData
    });
    return normalizeBook(res);
  },

  /** GET /books — Paginated list of books */
  getAll: async (params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/books?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeBook) : [];
    return {
      ...res,
      items,
      data: items,
    };
  },

  /** GET /books/{bookId} — Book by ID */
  getById: async (bookId) => {
    const res = await apiRequest(`/books/${bookId}`);
    return normalizeBook(res);
  },

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

  /** PATCH /books/{bookId}/available — Make book available (Admin only) */
  makeAvailable: (bookId) =>
    apiRequest(`/books/${bookId}/available`, { method: "PATCH" }),

  /** PATCH /books/{bookId}/approve — Approve book (Admin only) [alias for backward compat] */
  approve: (bookId) =>
    apiRequest(`/books/${bookId}/available`, { method: "PATCH" }),

  /** PATCH /books/{bookId}/reject — Reject book (Admin only) */
  reject: (bookId) =>
    apiRequest(`/books/${bookId}/reject`, { method: "PATCH" }),
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
    const query = buildQuery(params);
    return apiRequest(`/books/${bookId}/copies?${query}`);
  },

  /** GET /students/{studentId}/books/copies — Copies by student ID */
  getByStudentId: (studentId, params = {}) => {
    const query = buildQuery(params);
    return apiRequest(`/students/${studentId}/books/copies?${query}`);
  },

  /** GET /books/copies — All copies (paginated) */
  getAll: (params = {}) => {
    const query = buildQuery(params);
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
  getAll: async (params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/lendinglist?${query}`);
    const items = Array.isArray(res?.items)
      ? res.items.map((item) => ({
          ...item,
          id: item.id || item.Id,
          bookTitle: item.bookTitle || item.title || item.Title || "",
          studentName: item.studentName || item.ownerName || item.OwnerName || "",
        }))
      : [];
    return {
      ...res,
      items,
      data: items,
    };
  },

  /** GET /lendinglist/{lendingListRecordId} — Record by ID */
  getById: (lendingListRecordId) =>
    apiRequest(`/lendinglist/${lendingListRecordId}`),
};

// ─── 6. BORROWING REQUESTS ───────────────────────────────────────────────────
export const borrowingApi = {
  /** GET /borrowingrequests — Paginated list of requests */
  getAll: async (params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/borrowingrequests?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeBorrowingRequest) : [];
    return {
      ...res,
      items,
      data: items,
    };
  },

  /** GET /borrowingrequests/{borrowingRequestId} — Request by ID */
  getById: async (borrowingRequestId) => {
    const res = await apiRequest(`/borrowingrequests/${borrowingRequestId}`);
    return normalizeBorrowingRequest(res);
  },

  /** POST /lendinglist/{lendingListRecordId}/request — Create borrowing request */
  create: (lendingListRecordId) =>
    apiRequest(`/lendinglist/${lendingListRecordId}/request`, {
      method: "POST",
    }),

  /** PATCH /borrowingrequests/{id}/accept */
  accept: (id) => apiRequest(`/borrowingrequests/${id}/accept`, { method: "PATCH" }),

  /** PATCH /borrowingrequests/{id}/approve [alias for backward compat] */
  approve: (id) => apiRequest(`/borrowingrequests/${id}/accept`, { method: "PATCH" }),

  /** PATCH /borrowingrequests/{id}/reject */
  reject: (id) => apiRequest(`/borrowingrequests/${id}/reject`, { method: "PATCH" }),

  /** PATCH /borrowingrequests/{id}/cancel */
  cancel: (id) => apiRequest(`/borrowingrequests/${id}/cancel`, { method: "PATCH" }),
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
