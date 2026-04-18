// ─── BookOrbit API Configuration ────────────────────────────────────────────
export const API_BASE_URL = "https://localhost:7240";
export const API_V1 = `${API_BASE_URL}/api/v1`;

// ─── Token Storage ───────────────────────────────────────────────────────────
export const tokenStore = {
  get: () => ({
    accessToken:  localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
    expiresOnUtc: localStorage.getItem("expiresOnUtc"),
  }),
  set: ({ accessToken, refreshToken, expiresOnUtc }) => {
    localStorage.setItem("accessToken",  accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("expiresOnUtc", expiresOnUtc);
  },
  clear: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresOnUtc");
  },
};

// ─── Image URL Helpers ───────────────────────────────────────────────────────
export const getStudentImageUrl = (studentId) =>
  `${API_V1}/images/students/${studentId}`;

export const getBookImageUrl = (bookId) =>
  `${API_V1}/images/books/${bookId}`;

// ─── Enum Display Labels ─────────────────────────────────────────────────────
export const STUDENT_STATE_LABELS = {
  Pending:  "قيد المراجعة",
  Approved: "موافق عليه",
  Active:   "نشط",
  Rejected: "مرفوض",
  Banned:   "محظور",
  UnBanned: "تم رفع الحظر",
};

export const BOOK_COPY_CONDITION_LABELS = {
  New:        "جديد",
  LikeNew:    "كالجديد",
  Acceptable: "مقبول",
  Poor:       "متهالك",
};

export const BOOK_COPY_STATE_LABELS = {
  Available:  "متاح",
  Borrowed:   "مستعار",
  Reserved:   "محجوز",
  Lost:       "مفقود",
  Damaged:    "تالف",
  UnAvilable: "غير متاح",
};

export const LENDING_STATE_LABELS = {
  Available: "متاح",
  Reserved:  "محجوز",
  Borrowed:  "مستعار",
  Expired:   "منتهي",
  Closed:    "مغلق",
};

export const BOOK_CATEGORY_LABELS = {
  Fiction:                  "خيال",
  Nonfiction:               "غير خيالي",
  Mystery:                  "غموض",
  Thriller:                 "إثارة",
  Romance:                  "رومانسية",
  ScienceFiction:           "خيال علمي",
  Fantasy:                  "فانتازيا",
  Horror:                   "رعب",
  HistoricalFiction:        "تاريخي",
  Biography:                "سيرة ذاتية",
  Autobiography:            "سيرة شخصية",
  SelfHelp:                 "تطوير ذات",
  Business:                 "أعمال",
  Science:                  "علوم",
  Philosophy:               "فلسفة",
  Psychology:               "علم نفس",
  ReligionAndSpirituality:  "دين وروحانيات",
  Travel:                   "سفر",
  Cooking:                  "طبخ",
  ChildrenBooks:            "كتب أطفال",
};

// ─── Core API Client ─────────────────────────────────────────────────────────
async function apiRequest(path, options = {}) {
  const { accessToken } = tokenStore.get();
  const headers = { ...options.headers };

  if (accessToken && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Don't set Content-Type for FormData — browser handles it
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_V1}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "خطأ غير متوقع" }));
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  }

  // No content responses (204)
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
  approve:  (id) => apiRequest(`/students/${id}/approve`,  { method: "PATCH" }),
  /** PATCH /students/{id}/activate */
  activate: (id) => apiRequest(`/students/${id}/activate`, { method: "PATCH" }),
  /** PATCH /students/{id}/ban */
  ban:      (id) => apiRequest(`/students/${id}/ban`,      { method: "PATCH" }),
  /** PATCH /students/{id}/unban */
  unban:    (id) => apiRequest(`/students/${id}/unban`,    { method: "PATCH" }),
  /** PATCH /students/{id}/reject */
  reject:   (id) => apiRequest(`/students/${id}/reject`,   { method: "PATCH" }),
  /** PATCH /students/{id}/pend */
  pend:     (id) => apiRequest(`/students/${id}/pend`,     { method: "PATCH" }),
};

// ─── 3. BOOKS ────────────────────────────────────────────────────────────────
export const booksApi = {
  /** POST /books — Create book (Admin, multipart/form-data) */
  create: (formData) =>
    apiRequest("/books", { method: "POST", body: formData }),

  /** GET /books — Paginated book list */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books?${query}`);
  },

  /** GET /books/{id} */
  getById: (bookId) => apiRequest(`/books/${bookId}`),

  /** PATCH /books/{id} — Update book (Admin, JSON) */
  update: (bookId, data) =>
    apiRequest(`/books/${bookId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  /** DELETE /books/{id} */
  delete: (bookId) => apiRequest(`/books/${bookId}`, { method: "DELETE" }),
};

// ─── 4. BOOK COPIES ──────────────────────────────────────────────────────────
export const bookCopiesApi = {
  /** POST /students/{studentId}/books/copies — Student creates a copy */
  create: (studentId, bookId, condition) =>
    apiRequest(`/students/${studentId}/books/copies`, {
      method: "POST",
      body: JSON.stringify({ bookId, condition }),
    }),

  /** GET /books/copies — All copies (Admin) */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books/copies?${query}`);
  },

  /** GET /books/copies/{id} */
  getById: (bookCopyId) => apiRequest(`/books/copies/${bookCopyId}`),

  /** GET /books/{bookId}/copies — Copies for a specific book */
  getByBook: (bookId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/books/${bookId}/copies?${query}`);
  },

  /** GET /students/{studentId}/books/copies — Copies owned by a student */
  getByStudent: (studentId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/students/${studentId}/books/copies?${query}`);
  },

  /** PATCH /books/copies/{id} — Update copy (Admin) */
  update: (bookCopyId, condition) =>
    apiRequest(`/books/copies/${bookCopyId}`, {
      method: "PATCH",
      body: JSON.stringify({ condition }),
    }),

  /** POST /students/{studentId}/books/copies/{copyId}/list — List for lending */
  listForLending: (studentId, bookCopyId, borrowingDurationInDays) =>
    apiRequest(
      `/students/${studentId}/books/copies/${bookCopyId}/list?borrowingDurationInDays=${borrowingDurationInDays}`,
      { method: "POST" }
    ),
};

// ─── 5. LENDING LIST ─────────────────────────────────────────────────────────
export const lendingApi = {
  /** GET /lendinglist — All lending records */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/lendinglist?${query}`);
  },

  /** GET /lendinglist/{id} */
  getById: (recordId) => apiRequest(`/lendinglist/${recordId}`),
};
