export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:7240"; // من ال env او هنا الإتنبن واحد
export const API_V1 = `${API_BASE_URL}/api/v1.0`;

// دول بتوع السيرفر (ngrok) مش هتحتاجوهم بس سايبهم ليا
// export const API_BASE_URL = " https://trapeze-sprawl-moneyless.ngrok-free.dev";
// export const API_V1 = `${API_BASE_URL}/api/v1`;

// ─── Token Storage ───────────────────────────────────────────────────────────
export const tokenStore = {
  get: () => {
    const storage = localStorage.getItem("accessToken") ? localStorage : sessionStorage;
    return {
      accessToken:  storage.getItem("accessToken"),
      refreshToken: storage.getItem("refreshToken"),
      expiresOnUtc: storage.getItem("expiresOnUtc"),
    };
  },
  set: ({ accessToken, refreshToken, expiresOnUtc }, rememberMe = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("accessToken",  accessToken);
    storage.setItem("refreshToken", refreshToken);
    storage.setItem("expiresOnUtc", expiresOnUtc);
  },
  clear: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresOnUtc");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("expiresOnUtc");
  },
};
// ─── Image URL Helpers ───────────────────────────────────────────────────────
export const getStudentImageUrl = (studentId) =>
  `${API_V1}/images/students/${studentId}`;

export const getBookImageUrl = (bookId) =>
  `${API_V1}/images/books/${bookId}`;

// ─── Enum Display Labels ─────────────────────────────────────────────────────
export const STUDENT_STATE_LABELS = {
  Pending:  "بانتظار تأكيد الإيميل",
  Approved: "مؤكد (بانتظار التوثيق)",
  Active:   "نشط وموثق",
  Rejected: "مرفوض",
  Banned:   "محظور",
  UnBanned: "نشط",
};

export const BOOK_STATE_LABELS = {
  Pending: "قيد المراجعة",
  Approved: "موافق عليه",
  Rejected: "مرفوض",
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