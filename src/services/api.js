import { API_BASE_URL, API_V1, tokenStore, BOOK_CATEGORY_LABELS, getBookImageUrl, getStudentImageUrl, getLabel, BORROWING_REQUEST_STATE_LABELS } from "../utils/constants";

let isRefreshing = false;
let failedQueue = [];

const toLowerSafe = (value) => String(value ?? "").toLowerCase();
const toApiAssetUrl = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
      const base = new URL(API_BASE_URL);
      return `${base.origin}${url.pathname}${url.search}${url.hash}`;
    }
    return raw;
  } catch {
    if (raw.startsWith("/")) {
      try {
        const base = new URL(API_BASE_URL);
        return `${base.origin}${raw}`;
      } catch {
        return raw;
      }
    }
    return raw;
  }
};

const studentStateMap = {
  0: "pending",   
  1: "approved",  
  2: "active",    
  3: "rejected",
  4: "banned",
  5: "unbanned",
};

const borrowingStateMap = {
  0: "Pending",
  1: "Accepted",
  2: "Rejected",
  3: "Cancelled",
  4: "Expired",
  5: "Delivered",
  6: "Returned",
};

export const normalizeStudent = (student = {}) => {
  const stateValue = student.state ?? student.State;
  
  const status = typeof stateValue === "number"
    ? studentStateMap[stateValue] || "pending"
    : toLowerSafe(stateValue || "pending");

  return {
    ...student,
    id: student.Id || student.id || student.StudentId || student.studentId,
    fullName: student.fullName || student.name || student.Name || "طالب",
    name: student.name || student.Name || student.fullName,
    universityMailAddress: student.universityMailAddress || student.UniversityMailAddress || student.email || student.Email || "",
    email: student.email || student.Email || student.universityMailAddress || student.UniversityMailAddress || "",
    phoneNumber: student.phoneNumber || student.PhoneNumber || "",
    telegramUserId: student.telegramUserId || student.TelegramUserId || "",
    personalPhotoUrl: toApiAssetUrl(student.personalPhotoUrl || student.PersonalPhotoUrl || student.image || student.Image || ""),
    points: student.points ?? student.Points ?? 0,
    lendingsCount: student.lendingsCount ?? student.LendingsCount ?? 0,
    status: status,
    state: stateValue ?? status,
    creationDate: student.creationDate || student.joinDate || student.JoinDate,
  };
};



const normalizeBook = (book = {}) => {
  try {
    const stateValue = book.state ?? book.State;
    const statusValue = String(book.status ?? book.Status ?? "").toLowerCase();
    const normalizedState = stateValue ?? statusValue;
    const isApproved = 
      stateValue === 1 || 
      stateValue === true ||
      book.isApproved === true ||
      book.IsApproved === true ||
      ["approved", "active", "verified", "available"].includes(String(stateValue ?? "").toLowerCase()) ||
      ["approved", "active", "verified", "available"].includes(statusValue);
    
      const categoryRaw = book.categories ?? book.Categories ?? book.category ?? book.Category;
      let categoryLabel = "";
      
      if (Array.isArray(categoryRaw)) {
        const uniqueMapped = new Set();
        categoryRaw.forEach(cat => {
          if (!cat) return;
          let label = "";
          if (typeof cat === 'number') {
            const labels = Object.values(BOOK_CATEGORY_LABELS);
            label = labels[cat];
          } else {
            label = getLabel(BOOK_CATEGORY_LABELS, cat);
          }
          uniqueMapped.add(label);
        });
        categoryLabel = Array.from(uniqueMapped).filter(Boolean).join('، ');
      } else if (categoryRaw !== null && categoryRaw !== undefined) {
        if (typeof categoryRaw === 'number') {
          const labels = Object.values(BOOK_CATEGORY_LABELS);
          categoryLabel = labels[categoryRaw] || categoryRaw;
        } else {
          categoryLabel = getLabel(BOOK_CATEGORY_LABELS, categoryRaw);
        }
      }

      return {
        ...book,
        id: book.Id || book.id || book.BookId || book.bookId,
        title: book.title || book.Title || "بدون عنوان",
        author: book.author || book.Author || "مؤلف مجهول",
        publisher: book.publisher || book.Publisher || "",
        isbn: book.isbn || book.ISBN || "",
        category: categoryLabel || "عام",
        copiesCount: book.copiesCount ?? book.availableCopiesCount ?? 0,
        bookCoverImageUrl: toApiAssetUrl(
          book.bookCoverImageUrl || 
          book.BookCoverImageUrl || 
          book.coverImageUrl ||
          book.CoverImageUrl ||
          ((book.Id || book.id || book.BookId || book.bookId) ? getBookImageUrl(book.Id || book.id || book.BookId || book.bookId) : "")
        ),
        state: normalizedState,
        isApproved: isApproved,
        status:
          isApproved
            ? "active"
            : (String(normalizedState ?? "").toLowerCase() === "pending" || normalizedState === 0
                ? "pending"
                : "rejected")
      };
    } catch (err) {
      console.error("Error normalizing book:", err, book);
    }
};

export const normalizeBookCopy = (row = {}) => {
  const id = row.Id ?? row.id;
  const bookId = row.BookId ?? row.bookId ?? row.book?.Id ?? row.book?.id;
  const book = row.book ?? row.Book ?? {};
  
  const lending = row.lendingRecord || row.LendingRecord || row.lendingListRecord || row.LendingListRecord || null;
  
  return {
    ...row,
    id,
    bookId,
    title: book.title || book.Title || row.bookTitle || row.BookTitle || row.title || "كتاب",
    authorName: book.author || book.Author || row.authorName || row.AuthorName || "مؤلف مجهول",
    condition: row.condition ?? row.Condition ?? 0,
    state: row.state ?? row.State,
    isOnLendingList: Boolean(row.isOnLendingList ?? row.IsOnLendingList ?? lending),
    cost: lending?.cost ?? lending?.Cost ?? row.cost ?? row.Cost ?? 0,
    borrowingDurationInDays: lending?.borrowingDurationInDays ?? lending?.BorrowingDurationInDays ?? row.borrowingDurationInDays ?? row.BorrowingDurationInDays ?? 0,
    bookCoverImageUrl: toApiAssetUrl(
      book.bookCoverImageUrl || 
      book.BookCoverImageUrl || 
      row.bookCoverImageUrl || 
      row.BookCoverImageUrl || 
      (bookId ? getBookImageUrl(bookId) : "")
    ),
  };
};

const normalizeBorrowingRequest = (request = {}) => {
  const stateValue = request.state ?? request.State;
  const mappedState = typeof stateValue === "number"
    ? borrowingStateMap[stateValue] || "Pending"
    : (stateValue || "Pending");
    
  const stateLabel = getLabel(BORROWING_REQUEST_STATE_LABELS, mappedState);

  return {
    ...request,
    id: request.Id || request.id,
    lendingRecordId: request.LendingRecordId || request.lendingRecordId || request.lendingListRecordId,
    studentName: request.studentName || request.borrowingStudentName || request.BorrowingStudentName || request.borrowerName || request.BorrowerName || request.student?.fullName || request.borrower?.fullName || "",
    studentId: request.studentId || request.borrowingStudentId || request.BorrowingStudentId || request.StudentId || request.borrowerId || request.BorrowerId || request.student?.id || "",
    lenderName: request.lenderName || request.LenderName || request.lenderStudentName || request.lenderStudentFullName || request.LenderStudentFullName || request.ownerFullName || request.OwnerFullName || request.ownerName || request.OwnerName || request.LendingStudentName || request.LenderStudentName || request.lendingStudentName || request.lenderFullName || request.owner?.fullName || request.lender?.fullName || request.lendingListRecord?.student?.fullName || "",
    lenderId: request.lenderId || request.LenderId || request.ownerId || request.OwnerId || request.lendingStudentId || request.LendingStudentId || request.lenderStudentId || request.LenderStudentId || request.owner?.id || request.lendingListRecord?.studentId || request.lendingListRecord?.student?.id || "",
    bookTitle: request.bookTitle || request.BookTitle || "",
    bookId: request.bookId || request.BookId || "",
    requestDate: request.requestDate || request.createdAtUtc || request.createdAt || request.createdAtUTC,
    expectedReturnDate: request.expectedReturnDate || request.expirationDateUtc || request.expirationDate,
    returnDate: request.returnDate || request.expirationDateUtc || request.expirationDate,
    isOverdue: Boolean(request.isOverdue),
    status: stateLabel,
    state: stateValue ?? mappedState,
  };
};

export const normalizeNotification = (n = {}) => ({
  id: n.id || n.Id,
  type: n.type || n.Type || "system",
  title: n.title || n.Title || "إشعار جديد",
  message: n.message || n.Message || n.body || n.Body || "",
  createdAt: n.createdAtUtc || n.CreatedAtUtc || n.createdAt || n.CreatedAt || new Date().toISOString(),
  isRead: n.isRead ?? n.IsRead ?? false,
  notificationId: n.notificationId || n.NotificationId || n.id || n.Id,
  metadata: n.metadata || n.Metadata || {},
});

export const normalizeChatMessage = (m = {}) => {
  const dateStr = m.createdAtUtc || m.CreatedAtUtc || m.createdAt || m.CreatedAt;
  let validDate = new Date().toISOString();

  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      validDate = parsed.toISOString();
    }
  }
  
  return {
    id: m.id || m.Id,
    content: m.content || m.Content || "",
    senderId: m.senderId || m.SenderId,
    chatGroupId: m.chatGroupId || m.ChatGroupId,
    isRead: m.isRead ?? m.IsRead ?? false,
    createdAt: validDate,
  };
};

export const normalizeChatGroup = (g = {}) => {
  const otherId = g.otherStudentId || g.OtherStudentId;
  return {
    chatGroupId: g.chatGroupId || g.ChatGroupId,
    otherStudentId: otherId,
    otherStudentName: g.otherStudentName || g.OtherStudentName || "طالب",
    otherStudentImage: otherId ? getStudentImageUrl(otherId) : null,
    createdAt: g.createdAtUtc || g.CreatedAtUtc || g.createdAt || g.CreatedAt || new Date().toISOString(),
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

const commonErrorTranslations = {
  "Email already in use": "هذا البريد الإلكتروني مستخدم بالفعل",
  "Invalid credentials": "بيانات الدخول غير صحيحة",
  "Account not found": "الحساب غير موجود",
  "Passwords do not match": "كلمات المرور غير متطابقة",
  "Unauthorized": "غير مصرح لك بالقيام بهذا الإجراء",
  "Forbidden": "ليس لديك الصلاحيات الكافية",
  "Book not found": "الكتاب غير موجود",
  "ISBN already exists": "رقم الـ ISBN موجود بالفعل",
  "Internal server error": "حدث خطأ داخلي في الخادم",
  "The Email field is required": "حقل البريد الإلكتروني مطلوب",
  "The Password field is required": "حقل كلمة المرور مطلوب",
  "Bad Request": "طلب غير صالح",
  "Not Found": "غير موجود",
  "User is already verified": "هذا المستخدم موثق بالفعل",
  "Invalid token": "رمز غير صالح أو منتهي الصلاحية",
  "otp invalid": "رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى",
  "OTP invalid": "رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى",
  "Password must have at least": "كلمة المرور يجب أن تحتوي على الأقل على حرف كبير ورقم ورمز",
  "User not found": "المستخدم غير موجود",
  "Incorrect current password": "كلمة المرور الحالية غير صحيحة",
  "Concurrency failure": "حدث خطأ في التزامن، يرجى المحاولة مرة أخرى",
  "DuplicateEmail": "البريد الإلكتروني موجود مسبقاً",
  "DuplicateUserName": "اسم المستخدم موجود مسبقاً",
};

const translateErrorMessage = (msg) => {
  if (!msg || typeof msg !== 'string') return msg;
  for (const [en, ar] of Object.entries(commonErrorTranslations)) {
    if (msg.toLowerCase().includes(en.toLowerCase())) return ar;
  }
  return msg;
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

async function apiRequest(path, options = {}) {
  let { accessToken, refreshToken: storedRefreshToken, expiresOnUtc } = tokenStore.get();

  if (accessToken && storedRefreshToken && expiresOnUtc && !options.skipAuth) {
    const expiresAt = new Date(expiresOnUtc).getTime();
    const now = new Date().getTime();
    const timeRemaining = expiresAt - now;

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
            accessToken = newTokens.accessToken; 
            processQueue(null, newTokens.accessToken);
          } else {
            throw new Error("Session expired during proactive refresh");
          }
        } catch (err) {
          processQueue(err, null);
          window.dispatchEvent(new CustomEvent("auth:logout"));
          throw err; 
        } finally {
          isRefreshing = false;
        }
      } else {
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

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  } else if (!options.body) {
    delete headers["Content-Type"];
  }

  let finalUrl = path.startsWith("http") 
    ? path 
    : `${API_V1}${path.startsWith("/") ? "" : "/"}${path}`;

  if (options.params) {
    const qs = buildQuery(options.params);
    if (qs) finalUrl += (finalUrl.includes("?") ? "&" : "?") + qs;
  }

  const response = await fetch(finalUrl, {
    ...options,
    method: (options.method || "GET").toUpperCase(),
    headers,
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorData;
    try {
      errorData = responseText ? JSON.parse(responseText) : { detail: "حدث خطأ غير متوقع" };
    } catch {
      errorData = { detail: responseText || `HTTP ${response.status}` };
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;

      const retryCount = options._retryCount || 0;
      if (retryCount < 2) { 
        await new Promise(resolve => setTimeout(resolve, waitTime * (retryCount + 1)));
        return apiRequest(path, { ...options, _retryCount: retryCount + 1 });
      }
    }

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
            const rememberMe = localStorage.getItem("refreshToken") !== null;
            tokenStore.set(newTokens, rememberMe);
            processQueue(null, newTokens.accessToken);
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

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => apiRequest(path, options))
        .catch((err) => { throw err; });
    }

    if (response.status === 401 && !options.skipAuth) {
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }

    const errorMessage = translateErrorMessage(errorData.detail || errorData.message || errorData.title || `HTTP ${response.status}`);

    const error = new Error(errorMessage);
    error.status = response.status;
    error.detail = errorData.detail;
    error.title = errorData.title;
    error.instance = errorData.instance;

    if (errorData.errors) {
      error.errors = errorData.errors;
    } else if (errorData.extensions?.errors) {
      error.errors = errorData.extensions.errors;
    }

    throw error;
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      return responseText ? JSON.parse(responseText) : null;
    } catch {
      return responseText;
    }
  } else {
    return responseText;
  }
}

export const identityApi = {
  login: (email, password) =>
    apiRequest("/identity/token", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ email, password }),
    }),

  refreshToken: (refreshToken, expiredAccessToken) =>
    apiRequest("/identity/token/refresh", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ refreshToken, expiredAccessToken }),
    }),

  
  getMe: () => apiRequest("/identity/users/me"),


  sendEmailConfirmation: (email) =>
    apiRequest(`/identity/users/send-email-confirmation?email=${encodeURIComponent(email)}`, {
      method: "POST",
      skipAuth: true,
    }),

 
  confirmEmail: (email, token) =>
    apiRequest(`/identity/confirm-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`, {
      method: "POST",
      skipAuth: true,
    }),

  
  requestPasswordReset: (email) =>
    apiRequest(`/identity/users/send-reset-password?email=${encodeURIComponent(email)}`, {
      method: "POST",
      skipAuth: true,
    }),


  resetPassword: ({ email, token, newPassword }) =>
    apiRequest("/identity/reset-password", {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({
        email: email,              
        encodedToken: token,       
        newPassword: newPassword   
      }),
    }),


  changePassword: ({ currentPassword, oldPassword, newPassword }) =>
    apiRequest("/identity/users/me/change-password", {
      method: "POST",
      body: JSON.stringify({
        oldPassword: oldPassword || currentPassword,
        newPassword,
      }),
    }),
};


export const studentsApi = {

  create: async (formData) => {
    const res = await apiRequest("/students", {
      method: "POST",
      skipAuth: true,
      body: formData
    });
    return normalizeStudent(res);
  },

 
  update: async (studentId, formData) => {
    const res = await apiRequest(`/students/${studentId}`, {
      method: "PATCH",
      body: formData
    });
    return normalizeStudent(res || {});
  },
  
  getMe: async () => {
    const res = await apiRequest("/students/me");
    return normalizeStudent(res);
  },
  
  getById: async (studentId) => {
    const res = await apiRequest(`/students/profiles/${studentId}`);
    return normalizeStudent(res);
  },
  
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

  updateRaw: (studentId, formData) =>
    apiRequest(`/students/${studentId}`, {
      method: "PATCH",
      body: formData
    }),

  approve: (studentId) =>
    apiRequest(`/students/${studentId}/approve`, { method: "PATCH" }),

  activate: (studentId) =>
    apiRequest(`/students/${studentId}/activate`, { method: "PATCH" }),

  ban: (studentId) =>
    apiRequest(`/students/${studentId}/ban`, { method: "PATCH" }),

  unban: (studentId) =>
    apiRequest(`/students/${studentId}/unban`, { method: "PATCH" }),

  reject: (studentId) =>
    apiRequest(`/students/${studentId}/reject`, { method: "PATCH" }),

  pend: (studentId) =>
    apiRequest(`/students/${studentId}/pend`, { method: "PATCH" }),
};

export const booksApi = {
  create: async (formData) => {
    const res = await apiRequest("/books", {
      method: "POST",
      body: formData
    });
    return normalizeBook(res);
  },

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

  getById: async (bookId) => {
    const res = await apiRequest(`/books/${bookId}`);
    return normalizeBook(res);
  },

  
  update: (bookId, formData) =>
    apiRequest(`/books/${bookId}`, {
      method: "PATCH",
      body: formData,
    }),

  
  delete: (bookId) =>
    apiRequest(`/books/${bookId}`, {
      method: "DELETE"
    }),

  
  approve: (bookId) =>
    apiRequest(`/books/${bookId}/available`, { method: "PATCH" }),

  
  reject: (bookId) =>
    apiRequest(`/books/${bookId}/reject`, { method: "PATCH" }),
};


export const bookCopiesApi = {
  
  create: (bookId, condition) =>
    apiRequest(`/students/me/books/${bookId}/copies`, {
      method: "POST",
      body: JSON.stringify({ condition }),
    }),

  
  getById: (bookCopyId) => apiRequest(`/books/copies/${bookCopyId}`),

  
  update: (bookCopyId, condition) =>
    apiRequest(`/books/copies/${bookCopyId}`, {
      method: "PATCH",
      body: JSON.stringify({ condition }),
    }),

  
  getByBookId: (bookId, params = {}) => {
    const query = buildQuery(params);
    return apiRequest(`/books/${bookId}/copies?${query}`);
  },

  
  getByStudentId: async (studentId, params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/students/${studentId}/books/copies?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeBookCopy) : [];
    return { ...res, items, data: items };
  },

  
  getAll: (params = {}) => {
    const query = buildQuery(params);
    return apiRequest(`/books/copies?${query}`);
  },


  listForLending: (bookCopyId, borrowingDurationInDays) =>
    apiRequest(
      `/students/me/books/copies/${bookCopyId}/list?borrowingDurationInDays=${borrowingDurationInDays}`,
      { method: "POST" }
    ),

  
  markAvailable: (bookCopyId) =>
    apiRequest(`/books/copies/${bookCopyId}/available`, { method: "PATCH" }),

  
  markUnavailable: (bookCopyId) =>
    apiRequest(`/books/copies/${bookCopyId}/unavailable`, { method: "PATCH" }),
};


export const lendingApi = {
 
  getAll: async (params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/lendinglist?${query}`);
    const items = Array.isArray(res?.items)
      ? res.items.map((item) => ({
          ...item,
          id: item.Id || item.id,
          bookTitle: item.bookTitle || item.title || item.Title || "",
          authorName: item.authorName || item.author || item.AuthorName || item.Author || "مؤلف مجهول",
          studentName: item.studentName || item.ownerName || item.OwnerName || item.StudentName || "",
          studentId: item.studentId || item.ownerId || item.OwnerId || item.StudentId || "",
          cost: item.cost ?? item.Cost ?? 0,
          borrowingDurationInDays: item.borrowingDurationInDays ?? item.BorrowingDurationInDays ?? item.duration ?? 0,
          bookCoverImageUrl: toApiAssetUrl(item.bookCoverImageUrl || item.BookCoverImageUrl || item.coverUrl || item.CoverUrl || "")
        }))
      : [];
    return {
      ...res,
      items,
      data: items,
    };
  },


  getById: (lendingListRecordId) =>
    apiRequest(`/lendinglist/${lendingListRecordId}`),


  getContactInfo: (lendingListRecordId) =>
    apiRequest(`/lendinglist/${lendingListRecordId}/contact-info`),


  close: (lendingListRecordId) =>
    apiRequest(`/lendinglist/${lendingListRecordId}/close`, {
      method: "PATCH",
    }),
};


export const borrowingApi = {

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


  getMineIncoming: async (params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/borrowingrequests/me/in?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeBorrowingRequest) : [];
    return { ...res, items, data: items };
  },

  
  getMineOutgoing: async (params = {}) => {
    const query = buildQuery(params);
    const res = await apiRequest(`/borrowingrequests/me/out?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeBorrowingRequest) : [];
    return { ...res, items, data: items };
  },

 
  getById: async (borrowingRequestId) => {
    const res = await apiRequest(`/borrowingrequests/${borrowingRequestId}`);
    return normalizeBorrowingRequest(res);
  },

 
  create: (lendingListRecordId) =>
    apiRequest(`/lendinglist/${lendingListRecordId}/request`, {
      method: "POST",
      body: JSON.stringify({}),
    }),


  accept: (id) => apiRequest(`/borrowingrequests/${id}/accept`, { method: "PATCH", body: JSON.stringify({}) }),

 
  reject: (id) => apiRequest(`/borrowingrequests/${id}/reject`, { method: "PATCH", body: JSON.stringify({}) }),

  
  cancel: (id) => apiRequest(`/borrowingrequests/${id}/cancel`, { method: "PATCH", body: JSON.stringify({}) }),

  sendDeliverOtp: (id) => apiRequest(`/borrowingrequests/${id}/otp`, { method: "POST", body: JSON.stringify({}) }),

  deliver: (id, otp) => apiRequest(`/borrowingrequests/${id}/deliver`, { 
    method: "POST", 
    body: JSON.stringify({ OtpCode: otp }) 
  }),
};

export const borrowingTransactionsApi = {
  
  getAll: (params = {}) => {
    const query = buildQuery(params);
    return apiRequest(`/borrowingtransactions?${query}`);
  },

  
  getById: (id) => apiRequest(`/borrowingtransactions/${id}`),

  return: (id, otp) => apiRequest(`/borrowingtransactions/${id}/return`, { 
    method: "PATCH", 
    body: JSON.stringify({ OtpCode: otp }) 
  }),

  sendReturnOtp: (id) => apiRequest(`/borrowingtransactions/${id}/otp`, { method: "POST", body: JSON.stringify({}) }),

  markLost: (id) =>
    apiRequest(`/borrowingtransactions/${id}/lost`, { method: "PATCH" }),

  getMeIn: (params = {}) => {
    const query = buildQuery(params);
    return apiRequest(`/borrowingtransactions/me/in?${query}`);
  },

  getMeOut: (params = {}) => {
    const query = buildQuery(params);
    return apiRequest(`/borrowingtransactions/me/out?${query}`);
  },
};

export const imagesApi = {
  getStudentImage: (studentId) =>
    apiRequest(`/images/students/${studentId}`, {
      headers: { "Accept": "application/json" },
    }),

  getBookImage: (bookId) => getBookImageUrl(bookId),
};

export const reviewsApi = {
  create: (borrowingTransactionId, reviewData) =>
    apiRequest(`/borrowingtransactions/${encodeURIComponent(borrowingTransactionId)}/review`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    }),

  getById: (borrowingReviewId) =>
    apiRequest(`/borrowingreviews/${borrowingReviewId}`),

  getByStudentId: (studentId) =>
    apiRequest(`/borrowingreviews`, { params: { ReviewedStudentId: studentId } }),
};

export const notificationsApi = {
  getAll: async (params = {}) => {
    const query = buildQuery({
      Page: 1,
      PageSize: 15,
      SortDirection: "desc",
      ...params
    });
    const res = await apiRequest(`/notifications?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeNotification) : [];
    return { ...res, items, data: items };
  },

  getById: async (notificationId) => {
    const res = await apiRequest(`/notifications/${notificationId}`);
    return normalizeNotification(res);
  },

  markAsRead: (notificationId) =>
    apiRequest(`/notifications/${notificationId}/read`, { method: "PATCH", body: JSON.stringify({}) }),

  markAllAsRead: (maxTime) => {
    const time = maxTime || new Date(Date.now() + 10000).toISOString().replace('Z', '0000+00:00');
    return apiRequest(`/notifications/read`, { 
      method: "PATCH", 
      params: { 
        maxTime: time,
        MaxTime: time 
      },
      body: JSON.stringify({ 
        maxTime: time,
        MaxTime: time 
      })
    });
  },

  delete: (notificationId) =>
    apiRequest(`/notifications/${notificationId}`, { method: "DELETE" }),
};

export const chatApi = {
  getGroups: async (params = {}) => {
    const query = buildQuery({
      Page: 1,
      PageSize: 10,
      ...params
    });
    const res = await apiRequest(`/chat/groups?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeChatGroup) : [];
    return { ...res, items, data: items };
  },

  getMessages: async (chatGroupId, params = {}) => {
    const query = buildQuery({
      Page: 1,
      PageSize: 10,
      ...params
    });
    const res = await apiRequest(`/chat/groups/${chatGroupId}/messages?${query}`);
    const items = Array.isArray(res?.items) ? res.items.map(normalizeChatMessage) : [];
    return { ...res, items, data: items };
  },

  sendMessage: (receiverId, content) =>
    apiRequest("/chat/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content }),
    }),

  markAsRead: (chatGroupId) =>
    apiRequest(`/chat/groups/${chatGroupId}/read`, {
      method: "PATCH",
      body: JSON.stringify({}),
    }),
};
