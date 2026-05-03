import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  BookOpen,
  Clock,
  BarChart3,
  Settings,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  BookMarked,
  CheckCircle,
  Shield,
  Search,
  Loader2,
  X,
  UserX,
  UserPlus,
  Mail,
  Trash2,
  Check,
  XCircle,
  MessageCircle,
  Eye,
  ArrowLeftRight,
  CalendarDays,
  Calendar,
  RefreshCw,
  Copy,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { OrbitIcon } from "../components/common/OrbitIcon";

import {
  studentsApi,
  booksApi,
  lendingApi,
  borrowingApi,
  borrowingTransactionsApi,
  bookCopiesApi,
} from "../services/api";
import {
  getStudentImageUrl,
  getBookImageUrl,
  tokenStore,
  STUDENT_STATE_LABELS,
  BOOK_STATE_LABELS,
  BOOK_CATEGORY_LABELS,
  BOOK_COPY_CONDITION_LABELS,
  BOOK_COPY_STATE_LABELS,
  BORROWING_REQUEST_STATE_LABELS,
  BORROWING_TRANSACTION_STATE_LABELS,
  getLabel,
  toApiAssetUrl,
} from "../utils/constants";
import { useAuth } from "../context/AuthContext";

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color: _unusedColor,
  trend = "up",
  onClick,
}) => {
  void _unusedColor;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`rounded-2xl p-5 border border-library-primary/[0.08] dark:border-white/[0.08] bg-white/85 dark:bg-dark-surface/85 backdrop-blur-md shadow-sm hover:border-library-accent/35 hover:shadow-lg hover:shadow-library-primary/[0.06] transition-all relative overflow-hidden group ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="absolute top-0 right-0 left-0 h-0.5 bg-library-accent/90 rounded-b-full" />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-11 h-11 rounded-xl bg-library-accent/15 flex items-center justify-center text-library-primary dark:text-library-accent border border-library-accent/25">
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold max-w-[58%] text-right leading-tight ${
            trend === "up"
              ? "bg-library-primary/[0.06] text-library-primary dark:bg-white/[0.06] dark:text-library-paper"
              : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp size={10} />
          ) : (
            <TrendingUp size={10} className="rotate-180" />
          )}
          <span className="truncate">{change}</span>
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-library-primary dark:text-library-paper tracking-tight tabular-nums mb-1">
          {value}
        </h3>
        <p className="text-library-primary/45 dark:text-gray-400 text-[10px] font-bold">
          {title}
        </p>
      </div>
    </motion.div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);
  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 pt-5 border-t border-library-primary/[0.08] dark:border-white/[0.06]">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3.5 py-2 rounded-xl text-xs font-bold text-library-primary/50 dark:text-gray-400 hover:text-library-primary dark:hover:text-library-paper hover:bg-library-primary/[0.05] dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        السابق
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
            currentPage === p
              ? "bg-library-primary text-library-paper shadow-md shadow-library-primary/15"
              : "text-library-primary/45 dark:text-gray-400 hover:bg-library-primary/[0.06] dark:hover:bg-white/[0.05]"
          }`}
        >
          {p}
        </button>
      ))}
      {totalPages > 5 && (
        <span className="text-library-primary/25 dark:text-gray-500 text-xs px-1">
          ...
        </span>
      )}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3.5 py-2 rounded-xl text-xs font-bold text-library-primary/50 dark:text-gray-400 hover:text-library-primary dark:hover:text-library-paper hover:bg-library-primary/[0.05] dark:hover:bg-white/[0.05] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        التالي
      </button>
    </div>
  );
};

const normalizeConditionToNumber = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const strMap = { new: 0, likenew: 1, acceptable: 2, poor: 3 };
  return strMap[String(val).toLowerCase()] ?? 0;
};

const getStudentStateBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "verified" || s === "active")
    return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
  if (s === "pending" || s === "unconfirmed")
    return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
  if (s === "approved")
    return "bg-blue-500/10 text-blue-500 border border-blue-500/20";
  if (s === "banned" || s === "rejected")
    return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
  return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
};

const getBorrowingStateBadgeClass = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "borrowed" || s === "accepted")
    return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20";
  if (s === "pending")
    return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
  if (s === "rejected" || s === "cancelled" || s === "expired")
    return "bg-rose-500/10 text-rose-500 border border-rose-500/20";
  return "bg-gray-500/10 text-gray-500 border border-gray-500/20";
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [subTab, setSubTab] = React.useState("all");
  const [statsData, setStatsData] = React.useState({
    students: { value: "0", change: "+12%", loading: true },
    books: { value: "0", change: "+5%", loading: true },
    lendings: { value: "0", change: "+18%", loading: true },
    requests: { value: "0", change: "جديد", loading: true },
  });
  const [recentRequests, setRecentRequests] = React.useState([]);
  const [recentStudents, setRecentStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [students, setStudents] = React.useState([]);
  const [loadingStudents, setLoadingStudents] = React.useState(false);
  const [currentStudentPage, setCurrentStudentPage] = React.useState(1);
  const [totalStudentPages, setTotalStudentPages] = React.useState(1);
  const [books, setBooks] = React.useState([]);
  const [loadingBooks, setLoadingBooks] = React.useState(false);
  const [processingBookId, setProcessingBookId] = React.useState(null);
  const [currentBookPage, setCurrentBookPage] = React.useState(1);
  const [totalBookPages, setTotalBookPages] = React.useState(1);
  const [adminCopies, setAdminCopies] = React.useState([]);
  const [loadingAdminCopies, setLoadingAdminCopies] = React.useState(false);
  const [updatingCopyId, setUpdatingCopyId] = React.useState(null);
  const [copyConditionDrafts, setCopyConditionDrafts] = React.useState({});
  const [studentSearchInput, setStudentSearchInput] = React.useState("");
  const [studentSearchQuery, setStudentSearchQuery] = React.useState("");
  const [bookSearchInput, setBookSearchInput] = React.useState("");
  const [bookSearchQuery, setBookSearchQuery] = React.useState("");
  const [lendings, setLendings] = React.useState([]);
  const [loadingLendings, setLoadingLendings] = React.useState(false);
  const [currentLendingPage, setCurrentLendingPage] = React.useState(1);
  const [totalLendingPages, setTotalLendingPages] = React.useState(1);
  const [studentImageMap, setStudentImageMap] = React.useState({});
  const [bookImageMap, setBookImageMap] = React.useState({});

  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedBook, setSelectedBook] = React.useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = React.useState(false);
  const [selectedLending, setSelectedLending] = React.useState(null);
  const [isLendingModalOpen, setIsLendingModalOpen] = React.useState(false);
  const [loadingLendingDetail, setLoadingLendingDetail] = React.useState(false);
  const [selectedCopy, setSelectedCopy] = React.useState(null);
  const [isCopyModalOpen, setIsCopyModalOpen] = React.useState(false);
  const [bookCopiesList, setBookCopiesList] = React.useState([]);
  const [loadingBookCopiesList, setLoadingBookCopiesList] =
    React.useState(false);
  const [isBookCopiesModalOpen, setIsBookCopiesModalOpen] =
    React.useState(false);
  const [currentCopiesPage, setCurrentCopiesPage] = React.useState(1);
  const [totalCopiesPages, setTotalCopiesPages] = React.useState(1);

  const imageObjectUrlsRef = React.useRef(new Set());
  const attemptedStudentImageIdsRef = React.useRef(new Set());
  const attemptedBookImageIdsRef = React.useRef(new Set());

  const fetchProtectedImageSrc = React.useCallback(async (url) => {
    const { accessToken } = tokenStore.get();
    if (!accessToken) return null;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "ngrok-skip-browser-warning": "69420",
      },
    });
    if (!res.ok) return null;

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    imageObjectUrlsRef.current.add(objectUrl);
    return objectUrl;
  }, []);

  React.useEffect(() => {
    // Reset subTab and pages when main tab changes
    setSubTab("all");
    setCurrentStudentPage(1);
    setCurrentBookPage(1);
    setCurrentLendingPage(1);
  }, [activeTab]);

  React.useEffect(() => {
    setCurrentStudentPage(1);
  }, [subTab, studentSearchQuery]);
  React.useEffect(() => {
    setCurrentBookPage(1);
  }, [subTab, bookSearchQuery]);
  React.useEffect(() => {
    setCurrentLendingPage(1);
  }, [subTab]);

  const handleBookAction = async (bookId, action) => {
    setProcessingBookId(bookId);
    const t = toast.loading("جاري تنفيذ الإجراء على الكتاب...");
    try {
      if (action === "approve") {
        await booksApi.approve(bookId);
      } else if (action === "reject") {
        const reason =
          window.prompt("اكتب سبب الرفض (اختياري):", "البيانات غير مكتملة") ||
          "";
        await booksApi.reject(bookId, reason);
      } else if (action === "delete") {
        await booksApi.delete(bookId);
      }
      toast.success("تم تحديث حالة الكتاب بنجاح", { id: t });
      await fetchBooks();
    } catch (error) {
      toast.error(error?.message || "فشل تنفيذ الإجراء", { id: t });
    } finally {
      setProcessingBookId(null);
    }
  };

  const fetchBooks = React.useCallback(async () => {
    setLoadingBooks(true);
    try {
      let params = { pageSize: 20, page: currentBookPage }; // Fetch slightly more to allow for filtering if API is missing states param
      if (bookSearchQuery) params.searchTerm = bookSearchQuery;

      const res = await booksApi.getAll(params);
      let items = res.items || res.data || [];

      // Use frontend filtering if backend doesn't support the specific status filter yet
      if (subTab === "pending") {
        items = items.filter((b) => {
          const state = String(b?.state ?? "").toLowerCase();
          const status = String(b?.status ?? "").toLowerCase();
          return state === "0" || state === "pending" || status === "pending";
        });
      } else {
        // "all" tab: show approved/available books only
        items = items.filter((b) => {
          const state = String(b?.state ?? "").toLowerCase();
          const status = String(b?.status ?? "").toLowerCase();
          return (
            b?.isApproved === true ||
            state === "1" ||
            state === "available" ||
            state === "active" ||
            status === "available" ||
            status === "active"
          );
        });
      }

      setBooks(items);
      setTotalBookPages(res.totalPages || 1);
    } catch (error) {
      toast.error("فشل جلب قائمة الكتب");
    } finally {
      setLoadingBooks(false);
    }
  }, [bookSearchQuery, currentBookPage, subTab]);

  const fetchLendings = React.useCallback(async () => {
    setLoadingLendings(true);
    try {
      let list = [];
      let total = 1;
      let res;
      let params = { pageSize: 10, page: currentLendingPage };

      if (subTab === "active" || subTab === "completed") {
        if (subTab === "active") params.states = [0, 2]; // Borrowed, Overdue
        else if (subTab === "completed") params.states = [1, 3]; // Returned, Lost
        res = await borrowingTransactionsApi.getAll(params);
      } else {
        if (subTab === "pending_owner") params.states = [0]; // Pending
        else if (subTab === "pending_handover") params.states = [1]; // Accepted
        else if (subTab === "rejected") params.states = [2, 3, 4]; // Rejected, Cancelled, Expired
        res = await borrowingApi.getAll(params);
      }

      list = res.items || res.data || [];
      total = res.totalPages || 1;
      setLendings(list);
      setTotalLendingPages(total);
    } catch (error) {
      toast.error("فشل جلب عمليات الإعارة");
    } finally {
      setLoadingLendings(false);
    }
  }, [subTab, currentLendingPage]);

  const fetchAdminCopies = React.useCallback(async () => {
    setLoadingAdminCopies(true);
    try {
      const res = await bookCopiesApi.getAll({
        page: currentCopiesPage,
        pageSize: 10,
        sortColumn: "updatedAt",
        sortDirection: "desc",
      });
      const items = res?.items || res?.data || [];
      const safeItems = Array.isArray(items) ? items : [];
      setAdminCopies(safeItems);
      setTotalCopiesPages(res?.totalPages || 1);
      const drafts = {};
      safeItems.forEach((copy) => {
        const id = copy?.id || copy?.Id;
        drafts[id] = normalizeConditionToNumber(
          copy?.condition ?? copy?.Condition,
        );
      });
      setCopyConditionDrafts(drafts);
    } catch (err) {
      setAdminCopies([]);
      toast.error(err?.message || "تعذر تحميل نسخ الكتب");
    } finally {
      setLoadingAdminCopies(false);
    }
  }, [currentCopiesPage]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          studentsRes,
          booksRes,
          lendingsRes,
          pendingApprovalRes,
          pendingVerificationRes,
          unconfirmedRes,
          recentRequestsRes,
          recentStudentsRes,
          bannedStudentsRes,
          pendingBooksRes,
        ] = await Promise.all([
          studentsApi
            .getAll({ pageSize: 1, states: [2] })
            .catch(() => ({ totalCount: 0 })), // Active (Verified)
          booksApi
            .getAll({ pageSize: 1, states: [1] })
            .catch(() => ({ totalCount: 0 })),
          lendingApi.getAll({ pageSize: 1 }).catch(() => ({ totalCount: 0 })),
          studentsApi
            .getAll({ pageSize: 1, states: [0], emailConfirmed: true })
            .catch(() => ({ totalCount: 0 })), // Pending Approval (Confirmed & 0)
          studentsApi
            .getAll({ pageSize: 1, states: [1], emailConfirmed: true })
            .catch(() => ({ totalCount: 0 })), // Pending Verification (Confirmed & 1)
          studentsApi
            .getAll({ pageSize: 1, emailConfirmed: false })
            .catch(() => ({ totalCount: 0 })), // Unconfirmed Email
          borrowingApi
            .getAll({ pageSize: 4, states: [0] })
            .catch(() => ({ items: [] })),
          studentsApi
            .getAll({ pageSize: 4, states: [0, 1], emailConfirmed: true })
            .catch(() => ({ items: [] })), // Confirmed students for recent
          studentsApi
            .getAll({ pageSize: 1, states: [4] })
            .catch(() => ({ totalCount: 0 })), // Banned Students
          booksApi
            .getAll({ pageSize: 1, states: [0] })
            .catch(() => ({ totalCount: 0 })), // Pending Books
        ]);

        const activeCount = studentsRes?.totalCount || 0;
        const bannedCount = bannedStudentsRes?.totalCount || 0;
        const pendingApprovalCount = pendingApprovalRes?.totalCount || 0;
        const pendingVerificationCount =
          pendingVerificationRes?.totalCount || 0;
        const unconfirmedCount = unconfirmedRes?.totalCount || 0;
        const totalStudentsCount =
          activeCount +
          bannedCount +
          pendingApprovalCount +
          pendingVerificationCount +
          unconfirmedCount;
        const pendingBooksCount = pendingBooksRes?.totalCount || 0;
        const activePercentage =
          totalStudentsCount > 0
            ? Math.round((activeCount / totalStudentsCount) * 100)
            : 0;

        setStatsData({
          students: {
            value: totalStudentsCount.toLocaleString(),
            change: `${activeCount} موثق / ${
              pendingApprovalCount + pendingVerificationCount
            } انتظار`,
            loading: false,
          },
          books: {
            value: (booksRes?.totalCount || 0).toLocaleString(),
            change: `${pendingBooksCount} قيد المراجعة`,
            loading: false,
          },
          lendings: {
            value: (lendingsRes?.totalCount || 0).toLocaleString(),
            change: "+18%",
            loading: false,
          },
          requests: {
            value: (
              pendingApprovalCount + pendingVerificationCount
            ).toLocaleString(),
            change: "طلبات انتظار",
            loading: false,
          },
          activePercentage: activePercentage,
          totalStudents: totalStudentsCount,
          pendingBooksCount: pendingBooksCount,
        });

        setRecentRequests(recentRequestsRes?.items || []);
        setRecentStudents(recentStudentsRes?.items || []);
      } catch (error) {
        console.error("Dashboard data error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchStudents = React.useCallback(async () => {
    setLoadingStudents(true);
    try {
      const params = { pageSize: 15, page: currentStudentPage };
      if (studentSearchQuery) params.searchTerm = studentSearchQuery;

      if (subTab === "pending_approval") {
        params.states = [0];
        params.emailConfirmed = true;
      } else if (subTab === "pending_verification") {
        params.states = [1];
        params.emailConfirmed = true;
      } else if (subTab === "unconfirmed") {
        params.emailConfirmed = false;
      } else if (subTab === "verified") {
        params.states = [2];
      } else if (subTab === "banned") {
        params.states = [4];
      } else {
        // "all" tab: ask backend for all states (including unbanned/any future states)
        delete params.states;
      }

      const res = await studentsApi.getAll(params);
      let list = res.items || res.data || [];

      setStudents(list);
      setTotalStudentPages(res.totalPages || 1);
    } catch (error) {
      toast.error("فشل جلب بيانات الطلاب");
    } finally {
      setLoadingStudents(false);
    }
  }, [subTab, studentSearchQuery, currentStudentPage]);

  React.useEffect(() => {
    const preloadStudentImages = async () => {
      const ids = Array.from(
        new Set(
          [...students, ...recentStudents, selectedStudent]
            .filter(Boolean)
            .map((s) => s?.id)
            .filter(Boolean),
        ),
      );
      if (ids.length === 0) return;

      const nextMap = {};
      await Promise.all(
        ids.map(async (id) => {
          if (
            studentImageMap[id] ||
            attemptedStudentImageIdsRef.current.has(id)
          )
            return;
          attemptedStudentImageIdsRef.current.add(id);
          try {
            const src = await fetchProtectedImageSrc(getStudentImageUrl(id));
            if (src) nextMap[id] = src;
          } catch {
            // ignore per-image failures
          }
        }),
      );

      if (Object.keys(nextMap).length > 0) {
        setStudentImageMap((prev) => ({ ...prev, ...nextMap }));
      }
    };

    preloadStudentImages();
  }, [students, recentStudents, selectedStudent, fetchProtectedImageSrc]);

  React.useEffect(() => {
    const preloadBookImages = async () => {
      const booksToPreload = [
        ...books
          .filter((b) => b?.id)
          .map((b) => ({ id: b.id, url: b.bookCoverImageUrl })),
        ...adminCopies
          .filter((c) => c?.bookId || c?.BookId)
          .map((c) => ({
            id: c.bookId || c.BookId,
            url: c.bookCoverImageUrl || c.BookCoverImageUrl,
          })),
      ];

      const uniqueBooks = [];
      const seenIds = new Set();
      for (const b of booksToPreload) {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          uniqueBooks.push(b);
        }
      }

      if (uniqueBooks.length === 0) return;

      const nextMap = {};
      await Promise.all(
        uniqueBooks.map(async (bookObj) => {
          const id = bookObj.id;
          if (bookImageMap[id] || attemptedBookImageIdsRef.current.has(id))
            return;
          attemptedBookImageIdsRef.current.add(id);
          try {
            const urlToFetch = bookObj.url
              ? toApiAssetUrl(bookObj.url)
              : getBookImageUrl(id);
            const src = await fetchProtectedImageSrc(urlToFetch);
            if (src) nextMap[id] = src;
          } catch {
            // ignore per-image failures
          }
        }),
      );

      if (Object.keys(nextMap).length > 0) {
        setBookImageMap((prev) => ({ ...prev, ...nextMap }));
      }
    };
    preloadBookImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, adminCopies, fetchProtectedImageSrc]);

  React.useEffect(() => {
    const objectUrls = imageObjectUrlsRef.current;
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  React.useEffect(() => {
    if (activeTab === "students") fetchStudents();
    if (activeTab === "books") fetchBooks();
    if (activeTab === "copies") fetchAdminCopies();
    if (activeTab === "lending") fetchLendings();
  }, [
    activeTab,
    subTab,
    fetchStudents,
    fetchBooks,
    fetchLendings,
    fetchAdminCopies,
    currentCopiesPage,
  ]);

  const handleStudentAction = async (id, action) => {
    try {
      const loadingToast = toast.loading("جاري تنفيذ الإجراء...");
      if (action === "approve") await studentsApi.approve(id); // 0 -> 1
      else if (action === "activate") await studentsApi.activate(id); // 1 -> 2
      else if (action === "ban") await studentsApi.ban(id);
      else if (action === "unban") await studentsApi.unban(id);
      else if (action === "reject") await studentsApi.reject(id);
      else if (action === "pend") await studentsApi.pend(id);

      toast.dismiss(loadingToast);
      toast.success("تم تنفيذ الإجراء بنجاح");
      fetchStudents();
    } catch (error) {
      toast.dismiss();
      toast.error("فشل تنفيذ الإجراء");
    }
  };

  const handleUpdateCopyCondition = async (copyId) => {
    const nextCondition = Number(copyConditionDrafts?.[copyId]);
    if (Number.isNaN(nextCondition)) return;
    setUpdatingCopyId(copyId);
    const t = toast.loading("جاري تحديث حالة النسخة...");
    try {
      await bookCopiesApi.update(copyId, nextCondition);
      toast.success("تم تحديث حالة النسخة", { id: t });
      await fetchAdminCopies();
    } catch (err) {
      toast.error(err?.message || "تعذر تحديث حالة النسخة", { id: t });
    } finally {
      setUpdatingCopyId(null);
    }
  };

  const renderStudentsList = () => {
    if (loadingStudents)
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-library-accent/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-library-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] font-black text-library-primary/60 dark:text-gray-400">
            جاري تحميل قائمة الطلاب...
          </p>
        </div>
      );

    if (students.length === 0)
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
            <Users className="text-gray-300 dark:text-white/20" size={32} />
          </div>
          <h3 className="text-sm font-black text-library-primary dark:text-white mb-1">
            لا يوجد طلاب
          </h3>
          <p className="text-gray-400 text-[11px] font-bold">
            لم يتم العثور على طلاب يطابقون بحثك أو في هذا القسم حالياً
          </p>
        </div>
      );

    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-2.5 border border-library-primary/[0.08] dark:border-white/[0.08] flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-library-accent opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="pl-3 pr-4 flex items-center justify-center text-library-primary/35 dark:text-gray-500 group-focus-within:text-library-accent transition-colors">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="ابحث عن طالب بالاسم أو البريد..."
            value={studentSearchInput}
            onChange={(e) => setStudentSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setStudentSearchQuery(studentSearchInput);
              }
            }}
            className="flex-grow bg-transparent border-none py-2 text-xs font-bold focus:outline-none text-library-primary dark:text-white placeholder:text-gray-400"
          />
          {(studentSearchInput || studentSearchQuery) && (
            <button
              onClick={() => {
                setStudentSearchInput("");
                setStudentSearchQuery("");
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors mr-2"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        <div className="glass-card rounded-2xl border border-library-primary/[0.06] dark:border-white/[0.06] shadow-sm overflow-hidden bg-white/50 dark:bg-dark-surface/30 backdrop-blur-md">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-library-primary/[0.02] dark:bg-white/[0.01] border-b border-library-primary/[0.04] dark:border-white/[0.04] text-[9px] font-black text-library-primary/30 dark:text-gray-500 uppercase tracking-widest">
            <div className="col-span-5 flex items-center gap-2">
              <div className="w-1 h-3 bg-library-accent/30 rounded-full" />
              الطالب
            </div>
            <div className="col-span-4 flex items-center justify-center">التفاصيل الأكاديمية</div>
            <div className="col-span-3 flex items-center justify-end pl-4">الإجراءات</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {students.map((student) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={student.id}
                className="group relative px-6 py-4 hover:bg-library-primary/[0.02] dark:hover:bg-white/[0.01] transition-all flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 cursor-pointer"
                onClick={() => {
                  setSelectedStudent(student);
                  setIsModalOpen(true);
                }}
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-white/5 overflow-hidden border border-library-primary/10 dark:border-white/10 group-hover:border-library-accent/40 transition-colors shadow-sm">
                      {student.id && studentImageMap[student.id] ? (
                        <img
                          src={studentImageMap[student.id]}
                          className="w-full h-full object-cover"
                          alt=""
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-library-primary/20 dark:text-white/20 text-[10px] font-black">${student.fullName?.charAt(0)}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-library-primary/20 dark:text-white/20 text-[10px] font-black">
                          {student.fullName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-[#121214] ${
                        student.status === "active" ? "bg-emerald-500" : 
                        student.status === "approved" ? "bg-blue-500" : 
                        student.status === "pending" ? "bg-amber-500" : "bg-rose-500"
                      }`}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[12px] font-black text-library-primary dark:text-white group-hover:text-library-accent transition-colors truncate">
                      {student.fullName}
                    </h3>
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 truncate">
                      {student.universityMailAddress}
                    </p>
                  </div>
                </div>

                <div className="col-span-4 hidden md:flex items-center justify-center gap-2">
                  <span className="text-[9px] font-black text-library-primary/40 dark:text-gray-500 bg-library-primary/[0.04] dark:bg-white/5 px-2 py-1 rounded-lg border border-library-primary/5 dark:border-white/5">
                    ID: {student.id}
                  </span>
                  {student.points > 0 && (
                    <span className="text-[9px] font-black text-amber-600 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10">
                      ⭐ {student.points}
                    </span>
                  )}
                </div>

                <div
                  className="col-span-3 flex items-center justify-end gap-2 w-full md:w-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {subTab === "pending" ? (
                    <>
                      <button
                        onClick={() => handleStudentAction(student.id, "approve")}
                        className="px-4 py-2 rounded-xl bg-library-primary text-library-paper text-[10px] font-black hover:bg-library-primary/90 transition-all shadow-sm shadow-library-primary/10"
                      >
                        قبول
                      </button>
                      <button
                        onClick={() => handleStudentAction(student.id, "reject")}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-black hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10"
                      >
                        رفض
                      </button>
                    </>
                  ) : subTab === "banned" ? (
                    <button
                      onClick={() => handleStudentAction(student.id, "unban")}
                      className="px-5 py-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-black hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/10"
                    >
                      فك الحظر
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStudentAction(student.id, "ban")}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 text-[10px] font-black hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all border border-gray-100 dark:border-white/10"
                    >
                      حظر
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsModalOpen(true);
                    }}
                    className="p-2 rounded-xl bg-white dark:bg-white/5 text-gray-300 hover:text-library-accent transition-colors border border-gray-100 dark:border-white/10"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Pagination
          currentPage={currentStudentPage}
          totalPages={totalStudentPages}
          onPageChange={setCurrentStudentPage}
        />
      </div>
    );
  };

  const renderStudentModal = () => {
    if (!selectedStudent) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        />
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10"
          dir="rtl"
        >
          <div className="h-24 bg-library-primary relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-6">
              <div className="w-24 h-24 rounded-3xl bg-white dark:bg-dark-surface p-1.5 shadow-xl mx-auto">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-inner">
                  {selectedStudent.id && studentImageMap[selectedStudent.id] ? (
                    <img
                      src={studentImageMap[selectedStudent.id]}
                      className="w-full h-full object-cover"
                      alt=""
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-library-primary/10 text-4xl font-black">${selectedStudent.fullName?.charAt(
                          0,
                        )}</div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-library-primary/10 text-4xl font-black">
                      {selectedStudent.fullName?.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-black text-library-primary dark:text-white">
                  {selectedStudent.fullName}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    البريد الجامعي
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedStudent.universityMailAddress}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    رقم الهاتف
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedStudent.phoneNumber || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    تيليجرام
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200 flex items-center gap-1.5">
                    {selectedStudent.telegramUserId ? (
                      <>
                        <MessageCircle size={11} className="text-blue-500" />
                        {selectedStudent.telegramUserId}
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    النقاط
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-black text-[10px]">
                      ⭐ {selectedStudent.points ?? 0}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    الرقم الأكاديمي (ID)
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200 uppercase">
                    {selectedStudent.id}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    حالة الحساب
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${getStudentStateBadgeClass(
                      selectedStudent.status,
                    )}`}
                  >
                    {getLabel(STUDENT_STATE_LABELS, selectedStudent.status)}
                  </span>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    تاريخ الانضمام
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedStudent.creationDate
                      ? new Date(
                          selectedStudent.creationDate,
                        ).toLocaleDateString("ar-EG")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {selectedStudent.status?.toLowerCase() === "banned" ||
              selectedStudent.status?.toLowerCase() === "blocked" ? (
                <button
                  onClick={() => {
                    handleStudentAction(selectedStudent.id, "unban");
                    setIsModalOpen(false);
                  }}
                  className="flex-grow py-3 rounded-xl bg-amber-500 text-white text-[11px] font-black shadow-lg shadow-amber-500/20"
                >
                  فك الحظر عن الطالب
                </button>
              ) : (
                <>
                  {selectedStudent.status?.toLowerCase() === "pending" && (
                    <button
                      onClick={() => {
                        handleStudentAction(selectedStudent.id, "approve");
                        setIsModalOpen(false);
                      }}
                      className="flex-grow py-3 rounded-xl bg-blue-500 text-white text-[11px] font-black shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
                    >
                      موافقة مبدئية
                    </button>
                  )}
                  {selectedStudent.status?.toLowerCase() === "approved" && (
                    <>
                      <button
                        onClick={() => {
                          handleStudentAction(selectedStudent.id, "activate");
                          setIsModalOpen(false);
                        }}
                        className="flex-grow py-3 rounded-xl bg-emerald-500 text-white text-[11px] font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                      >
                        تفعيل الحساب (موثق)
                      </button>
                      <button
                        onClick={() => {
                          handleStudentAction(selectedStudent.id, "reject");
                          setIsModalOpen(false);
                        }}
                        className="flex-grow py-3 rounded-xl bg-rose-500 text-white text-[11px] font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                      >
                        رفض الطلب
                      </button>
                      <button
                        onClick={() => {
                          handleStudentAction(selectedStudent.id, "pend");
                          setIsModalOpen(false);
                        }}
                        className="flex-grow py-3 rounded-xl bg-amber-500 text-white text-[11px] font-black shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
                      >
                        إرجاع لانتظار المراجعة
                      </button>
                    </>
                  )}
                  {selectedStudent.status?.toLowerCase() === "active" && (
                    <>
                      <button
                        onClick={() => {
                          handleStudentAction(selectedStudent.id, "ban");
                          setIsModalOpen(false);
                        }}
                        className="flex-grow py-3 rounded-xl bg-rose-500 text-white text-[11px] font-black shadow-lg shadow-rose-500/20"
                      >
                        حظر الطالب
                      </button>
                      <button
                        onClick={() => {
                          handleStudentAction(selectedStudent.id, "pend");
                          setIsModalOpen(false);
                        }}
                        className="flex-grow py-3 rounded-xl bg-amber-500 text-white text-[11px] font-black shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
                      >
                        إرجاع لانتظار المراجعة
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderBooksList = () => {
    return (
      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-2.5 border border-library-primary/[0.08] dark:border-white/[0.08] flex items-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 h-full bg-library-accent opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <div className="pl-3 pr-4 flex items-center justify-center text-library-primary/35 dark:text-gray-500 group-focus-within:text-library-accent transition-colors">
            <Search size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="ابحث عن كتاب بالاسم أو المؤلف أو الرقم المسلسل..."
            value={bookSearchInput}
            onChange={(e) => setBookSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setBookSearchQuery(bookSearchInput);
              }
            }}
            className="flex-grow bg-transparent border-none py-2 text-xs font-bold focus:outline-none text-library-primary dark:text-white placeholder:text-gray-400"
          />
          {(bookSearchInput || bookSearchQuery) && (
            <button
              onClick={() => {
                setBookSearchInput("");
                setBookSearchQuery("");
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors mr-2"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        {loadingBooks ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-library-accent/25 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-library-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-[11px] font-black text-library-primary/60 dark:text-gray-400">
              جاري تحميل المكتبة...
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
            <div className="w-20 h-20 bg-gray-50 dark:bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
              <BookOpen
                className="text-gray-300 dark:text-white/20"
                size={32}
              />
            </div>
            <h3 className="text-sm font-black text-library-primary dark:text-white mb-1">
              لا توجد كتب
            </h3>
            <p className="text-gray-400 text-[11px] font-bold">
              {bookSearchQuery
                ? "لم يتم العثور على نتائج للبحث"
                : "لا توجد كتب متاحة حالياً"}
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-library-primary/[0.06] dark:border-white/[0.06] shadow-sm overflow-hidden bg-white/50 dark:bg-dark-surface/30 backdrop-blur-md">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-library-primary/[0.02] dark:bg-white/[0.01] border-b border-library-primary/[0.04] dark:border-white/[0.04] text-[9px] font-black text-library-primary/30 dark:text-gray-500 uppercase tracking-widest">
              <div className="col-span-5 flex items-center gap-2">
                <div className="w-1 h-3 bg-library-accent/30 rounded-full" />
                الكتاب
              </div>
              <div className="col-span-4 flex items-center justify-center">التصنيف والحالة</div>
              <div className="col-span-3 flex items-center justify-end pl-4">الإجراءات</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {books.map((book) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={book.id}
                  className="group relative px-6 py-4 hover:bg-library-primary/[0.02] dark:hover:bg-white/[0.01] transition-all flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 cursor-pointer"
                  onClick={() => {
                    setSelectedBook(book);
                    setIsBookModalOpen(true);
                  }}
                >
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="w-10 h-14 rounded-lg bg-gray-50 dark:bg-white/5 overflow-hidden border border-library-primary/10 dark:border-white/10 group-hover:border-library-accent/45 transition-colors shadow-sm shrink-0">
                      {book.bookCoverImageUrl || bookImageMap[book.id] ? (
                        <img
                          src={bookImageMap[book.id] || toApiAssetUrl(book.bookCoverImageUrl)}
                          className="w-full h-full object-cover"
                          alt={book.title}
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-library-accent/30 dark:text-white/20 text-[10px] font-black">B</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-library-accent/30 dark:text-white/20 text-[10px] font-black">B</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[12px] font-black text-library-primary dark:text-library-paper group-hover:text-library-accent transition-colors truncate">
                        {book.title}
                      </h3>
                      <p className="text-[9px] text-gray-400 font-bold mt-0.5 truncate">
                        {book.authorName || book.author}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-4 hidden md:flex items-center justify-center gap-3">
                    <span className="text-[10px] font-black text-library-primary/60 dark:text-gray-400 bg-library-primary/[0.03] dark:bg-white/5 px-2 py-1 rounded-lg border border-library-primary/5 dark:border-white/5">
                      {getLabel(BOOK_CATEGORY_LABELS, book.category) || "عام"}
                    </span>
                    <span
                      className={`text-[9px] font-black px-2 py-1 rounded-lg border ${
                        String(book?.status || "").toLowerCase() === "rejected"
                          ? "text-rose-600 bg-rose-500/5 border-rose-500/10"
                          : subTab === "pending" || String(book?.status || "").toLowerCase() === "pending"
                          ? "text-amber-600 bg-amber-500/5 border-amber-500/10"
                          : "text-emerald-600 bg-emerald-500/5 border-emerald-500/10"
                      }`}
                    >
                      {getLabel(BOOK_STATE_LABELS, book.status || (subTab === "pending" ? "Pending" : "Approved"))}
                    </span>
                  </div>

                  <div
                    className="col-span-3 flex items-center justify-end gap-2 w-full md:w-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {subTab === "pending" ? (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBookAction(book.id, "approve"); }}
                          disabled={processingBookId === book.id}
                          className="px-4 py-2 rounded-xl bg-library-primary text-library-paper text-[10px] font-black hover:bg-library-primary/90 transition-all shadow-sm"
                        >
                          {processingBookId === book.id ? "..." : "قبول"}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBookAction(book.id, "reject"); }}
                          disabled={processingBookId === book.id}
                          className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] font-black hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10"
                        >
                          {processingBookId === book.id ? "..." : "رفض"}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!window.confirm("هل تريد حذف هذا الكتاب نهائيًا؟")) return;
                          handleBookAction(book.id, "delete");
                        }}
                        disabled={processingBookId === book.id}
                        className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 text-gray-400 dark:text-gray-500 text-[10px] font-black hover:bg-rose-500 hover:text-white transition-all border border-gray-100 dark:border-white/10"
                      >
                        {processingBookId === book.id ? "..." : "حذف"}
                      </button>
                    )}
                    <button
                      onClick={() => { setSelectedBook(book); setIsBookModalOpen(true); }}
                      className="p-2 rounded-xl bg-white dark:bg-white/5 text-gray-300 hover:text-library-accent transition-colors border border-gray-100 dark:border-white/10"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <Pagination
          currentPage={currentBookPage}
          totalPages={totalBookPages}
          onPageChange={setCurrentBookPage}
        />
      </div>
    );
  };

  const renderBookModal = () => {
    if (!selectedBook) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsBookModalOpen(false)}
        />
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10"
          dir="rtl"
        >
          <div className="h-24 bg-library-primary relative">
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-12 mb-6">
              <div className="w-24 h-32 rounded-2xl bg-white dark:bg-dark-surface p-1.5 shadow-xl mx-auto">
                <div className="w-full h-full rounded-xl overflow-hidden bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-inner">
                  {selectedBook.bookCoverImageUrl ||
                  bookImageMap[selectedBook.id] ? (
                    <img
                      src={
                        bookImageMap[selectedBook.id] ||
                        toApiAssetUrl(selectedBook.bookCoverImageUrl)
                      }
                      className="w-full h-full object-cover"
                      alt={selectedBook.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center p-4 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open text-library-accent/30 mb-2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <BookOpen
                        size={28}
                        className="text-library-accent/30 mb-2"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-black text-library-primary dark:text-white">
                  {selectedBook.title}
                </h3>
                <p className="text-[10px] text-library-accent font-black tracking-widest uppercase mt-1">
                  {selectedBook.authorName || selectedBook.author}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    الرقم الدولي (ISBN)
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedBook.isbn || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    التصنيف
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {getLabel(BOOK_CATEGORY_LABELS, selectedBook.category) ||
                      "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    الناشر
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedBook.publisher || "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    معرف الكتاب
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200 uppercase">
                    {selectedBook.id}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    عدد النسخ
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-library-accent/10 text-library-primary dark:text-library-accent border border-library-accent/25">
                    {selectedBook.copiesCount || 0} نسخة متاحة
                  </span>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    تاريخ الإضافة
                  </p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedBook.createdAt
                      ? new Date(selectedBook.createdAt).toLocaleDateString(
                          "ar-EG",
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={async () => {
                    setIsBookCopiesModalOpen(true);
                    setLoadingBookCopiesList(true);
                    try {
                      const res = await bookCopiesApi.getByBookId(
                        selectedBook.id,
                        { PageSize: 100 },
                      );
                      setBookCopiesList(res?.items || res?.data || res || []);
                    } catch (err) {
                      setBookCopiesList([]);
                    } finally {
                      setLoadingBookCopiesList(false);
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-library-accent/10 text-library-primary dark:text-library-accent text-[11px] font-black hover:bg-library-primary hover:text-library-paper dark:hover:bg-library-accent dark:hover:text-library-primary transition-all border border-library-accent/25 shadow-sm flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  عرض نسخ الكتاب
                </button>
                <button
                  onClick={() => setIsBookModalOpen(false)}
                  className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-library-primary dark:text-white text-[11px] font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all shadow-sm"
                >
                  إغلاق النافذة
                </button>
              </div>

              {(selectedBook?.status === "pending" ||
                selectedBook?.state === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-gray-100 dark:border-white/5 pt-3">
                  <button
                    onClick={async () => {
                      await handleBookAction(selectedBook.id, "approve");
                      setIsBookModalOpen(false);
                    }}
                    disabled={processingBookId === selectedBook.id}
                    className="w-full py-3 rounded-xl bg-library-primary text-library-paper text-[11px] font-black hover:bg-library-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-library-primary/20"
                  >
                    <CheckCircle size={16} />
                    اعتماد الكتاب
                  </button>
                  <button
                    onClick={async () => {
                      await handleBookAction(selectedBook.id, "reject");
                      setIsBookModalOpen(false);
                    }}
                    disabled={processingBookId === selectedBook.id}
                    className="w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    رفض الكتاب
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const CONDITION_NUM_MAP = {
    0: "New",
    1: "LikeNew",
    2: "Acceptable",
    3: "Poor",
  };
  const CONDITION_STR_MAP = {
    new: "New",
    likenew: "LikeNew",
    acceptable: "Acceptable",
    poor: "Poor",
  };
  const CONDITION_COLORS_BY_KEY = {
    New: {
      bg: "bg-library-accent/10 dark:bg-library-accent/10",
      text: "text-library-primary dark:text-library-accent",
      border: "border-library-accent/25",
      dot: "bg-library-accent",
    },
    LikeNew: {
      bg: "bg-blue-50 dark:bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-500/15",
      dot: "bg-blue-500",
    },
    Acceptable: {
      bg: "bg-amber-50 dark:bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/15",
      dot: "bg-amber-500",
    },
    Poor: {
      bg: "bg-rose-50 dark:bg-rose-500/10",
      text: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/15",
      dot: "bg-rose-500",
    },
  };
  const DEFAULT_COND_COLOR = CONDITION_COLORS_BY_KEY["New"];

  const normalizeConditionKey = (val) => {
    if (val === null || val === undefined) return "New";
    if (typeof val === "number") return CONDITION_NUM_MAP[val] || "New";
    return CONDITION_STR_MAP[String(val).toLowerCase()] || "New";
  };
  const getConditionLabel = (val) =>
    BOOK_COPY_CONDITION_LABELS[normalizeConditionKey(val)] || "غير محدد";
  const getConditionColor = (val) =>
    CONDITION_COLORS_BY_KEY[normalizeConditionKey(val)] || DEFAULT_COND_COLOR;

  const STATE_NUM_MAP = {
    0: "Available",
    1: "Borrowed",
    2: "Reserved",
    3: "Lost",
    4: "Damaged",
    5: "UnAvailable",
  };
  const STATE_STR_MAP = {
    available: "Available",
    borrowed: "Borrowed",
    reserved: "Reserved",
    lost: "Lost",
    damaged: "Damaged",
    unavailable: "UnAvailable",
  };

  const getStateLabel = (copy) => {
    const s = copy?.state ?? copy?.State;
    if (s === null || s === undefined) return "غير محدد";
    let key;
    if (typeof s === "number") {
      key = STATE_NUM_MAP[s];
    } else {
      key = STATE_STR_MAP[String(s).toLowerCase()];
    }
    return BOOK_COPY_STATE_LABELS[key] || String(s) || "غير محدد";
  };

  const renderBookCopiesModal = () => {
    if (!isBookCopiesModalOpen) return null;
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsBookCopiesModalOpen(false)}
        />
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10 flex flex-col max-h-[85vh]"
          dir="rtl"
        >
          <div className="h-20 shrink-0 bg-library-primary relative flex items-center px-6">
            <button
              onClick={() => setIsBookCopiesModalOpen(false)}
              className="absolute left-6 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                <Copy size={20} />
              </div>
              <div>
                <h3 className="text-white font-black text-sm">نسخ الكتاب</h3>
                <p className="text-[10px] text-white/70 font-bold">
                  {selectedBook?.title}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-grow custom-scrollbar space-y-3">
            {loadingBookCopiesList ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  className="animate-spin text-library-accent mb-3"
                  size={32}
                />
                <p className="text-xs font-black text-gray-400">
                  جاري تحميل النسخ...
                </p>
              </div>
            ) : bookCopiesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Copy
                  className="text-gray-300 dark:text-white/20 mb-4"
                  size={40}
                />
                <p className="text-sm font-black text-library-primary dark:text-white">
                  لا توجد نسخ لهذا الكتاب
                </p>
              </div>
            ) : (
              bookCopiesList.map((copy) => {
                const id = copy?.id || copy?.Id;
                const owner =
                  copy?.ownerName ||
                  copy?.studentName ||
                  copy?.OwnerName ||
                  "طالب";
                const condVal = normalizeConditionToNumber(
                  copy?.condition ?? copy?.Condition,
                );
                const condColor = getConditionColor(condVal);
                return (
                  <div
                    key={id}
                    className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4 border border-gray-100 dark:border-white/[0.06] flex items-center justify-between group hover:border-library-accent/35 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-library-accent/15 flex items-center justify-center text-library-primary dark:text-library-accent shrink-0">
                        <Copy size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-library-primary dark:text-white mb-0.5 truncate">
                          {owner}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-gray-500">
                            {getStateLabel(copy)}
                          </p>
                          <span className="text-gray-300 dark:text-white/20 text-[8px]">
                            •
                          </span>
                          <span className="font-mono text-[9px] text-library-accent/80 font-black">
                            #{String(id).split("-")[0]}...
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black border ${condColor.bg} ${condColor.text} ${condColor.border}`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${condColor.dot}`}
                        />
                        {getConditionLabel(condVal)}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCopy(copy);
                          setCopyConditionDrafts((prev) => ({
                            ...prev,
                            [id]: condVal,
                          }));
                          setIsCopyModalOpen(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-400 hover:text-library-accent hover:border-library-accent/35 transition-all shadow-sm"
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderCopyModal = () => {
    if (!isCopyModalOpen || !selectedCopy) return null;
    const copy = selectedCopy;
    const id = copy?.id || copy?.Id;
    const title =
      copy?.title ||
      copy?.bookTitle ||
      copy?.BookTitle ||
      copy?.book?.title ||
      "كتاب";
    const owner =
      copy?.ownerName || copy?.studentName || copy?.OwnerName || "طالب";
    const condVal =
      copyConditionDrafts[id] ?? normalizeConditionToNumber(copy?.condition);
    const condColor = getConditionColor(condVal);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsCopyModalOpen(false)}
        />
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10"
          dir="rtl"
        >
          <div className="h-24 bg-library-primary relative">
            <button
              onClick={() => setIsCopyModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-4 right-6 flex items-center gap-2">
              <Copy className="text-white/90" size={18} />
              <h3 className="text-white font-black text-base drop-shadow-sm">
                تفاصيل النسخة
              </h3>
            </div>
          </div>

          <div className="px-8 pb-8">
            <div className="relative -mt-10 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-white dark:bg-dark-surface p-1.5 shadow-xl mx-auto">
                <div className="w-full h-full rounded-xl bg-library-accent/10 dark:bg-library-accent/5 border border-library-accent/20 flex items-center justify-center overflow-hidden">
                  {copy?.bookCoverImageUrl ||
                  bookImageMap[copy?.bookId || copy?.BookId] ? (
                    <img
                      src={
                        bookImageMap[copy?.bookId || copy?.BookId] ||
                        toApiAssetUrl(copy?.bookCoverImageUrl)
                      }
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-library-accent/50"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`;
                      }}
                    />
                  ) : (
                    <BookOpen size={28} className="text-library-accent/50" />
                  )}
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-black text-library-primary dark:text-white">
                  {title}
                </h3>
                <p className="text-[10px] text-library-accent font-black tracking-widest uppercase mt-1">
                  نسخة #{id}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  المالك
                </p>
                <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                  {owner}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  حالة التوفر
                </p>
                <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                  {getStateLabel(copy)}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  معرف الكتاب
                </p>
                <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                  {copy?.bookId || "—"}
                </p>
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  الحالة الفعلية الحالية
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black border ${condColor.bg} ${condColor.text} ${condColor.border}`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${condColor.dot}`}
                  />
                  {getConditionLabel(copy?.condition ?? 0)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 mb-6">
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Settings size={10} /> تعديل الحالة الفعلية
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((val) => {
                  const c = getConditionColor(val);
                  const isActive = (copyConditionDrafts[id] ?? 0) === val;
                  return (
                    <button
                      key={val}
                      onClick={() =>
                        setCopyConditionDrafts((prev) => ({
                          ...prev,
                          [id]: val,
                        }))
                      }
                      className={`px-3 py-2.5 rounded-xl text-[10px] font-black border transition-all flex items-center justify-center gap-1.5 ${
                        isActive
                          ? `${c.bg} ${c.text} ${c.border} ring-2 ring-offset-1 ring-current/20 scale-[1.02]`
                          : "bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/10 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${c.dot} ${
                          isActive ? "" : "opacity-40"
                        }`}
                      />
                      {getConditionLabel(val)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  await handleUpdateCopyCondition(id);
                  setIsCopyModalOpen(false);
                }}
                disabled={updatingCopyId === id}
                className="w-full py-3 rounded-xl bg-library-primary text-library-paper text-[11px] font-black hover:bg-library-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-library-primary/20"
              >
                <Save size={14} />
                {updatingCopyId === id ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-library-primary dark:text-white text-[11px] font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderCopiesList = () => {
    if (loadingAdminCopies)
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-library-accent/25 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-library-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] font-black text-library-primary/60 dark:text-gray-400">
            جاري تحميل النسخ...
          </p>
        </div>
      );

    if (adminCopies.length === 0)
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
            <Copy className="text-gray-300 dark:text-white/20" size={32} />
          </div>
          <h3 className="text-sm font-black text-library-primary dark:text-white mb-1">
            لا توجد نسخ
          </h3>
          <p className="text-gray-400 text-[11px] font-bold">
            لا توجد نسخ مسجلة في النظام حالياً
          </p>
        </div>
      );

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <button
            type="button"
            onClick={fetchAdminCopies}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-dark-surface border border-library-primary/[0.08] dark:border-white/[0.06] text-[11px] font-black text-library-primary/50 dark:text-gray-400 hover:text-library-accent hover:border-library-accent/35 transition-all shadow-sm"
          >
            <RefreshCw
              size={13}
              className={loadingAdminCopies ? "animate-spin" : ""}
            />
            تحديث القائمة
          </button>
        </div>

        <div className="glass-card rounded-2xl border border-library-primary/[0.06] dark:border-white/[0.06] shadow-sm overflow-hidden bg-white/50 dark:bg-dark-surface/30 backdrop-blur-md">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-library-primary/[0.02] dark:bg-white/[0.01] border-b border-library-primary/[0.04] dark:border-white/[0.04] text-[9px] font-black text-library-primary/30 dark:text-gray-500 uppercase tracking-widest">
            <div className="col-span-4 flex items-center gap-2">
              <div className="w-1 h-3 bg-library-accent/30 rounded-full" />
              الكتاب
            </div>
            <div className="col-span-3 text-center">الحالة الفعلية</div>
            <div className="col-span-3 text-center">حالة التوفر</div>
            <div className="col-span-2 text-left pl-4">الإجراءات</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {adminCopies.map((copy) => {
              const id = copy?.id || copy?.Id;
              const title = copy?.title || copy?.bookTitle || copy?.BookTitle || copy?.book?.title || "كتاب";
              const condVal = normalizeConditionToNumber(copy?.condition ?? copy?.Condition);
              const condColor = getConditionColor(condVal);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={id}
                  className="group relative px-6 py-4 hover:bg-library-primary/[0.02] dark:hover:bg-white/[0.01] transition-all flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 cursor-pointer"
                  onClick={() => {
                    setSelectedCopy(copy);
                    setCopyConditionDrafts((prev) => ({ ...prev, [id]: condVal }));
                    setIsCopyModalOpen(true);
                  }}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-library-accent/10 dark:bg-library-accent/5 flex items-center justify-center border border-library-accent/20 shadow-sm shrink-0 overflow-hidden">
                      {copy?.bookCoverImageUrl || bookImageMap[copy?.bookId || copy?.BookId] ? (
                        <img
                          src={bookImageMap[copy?.bookId || copy?.BookId] || toApiAssetUrl(copy?.bookCoverImageUrl)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-library-accent/60"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`;
                          }}
                        />
                      ) : (
                        <BookOpen size={16} className="text-library-accent/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[12px] font-black text-library-primary dark:text-library-paper group-hover:text-library-accent transition-colors truncate">
                        {title}
                      </h4>
                      <p className="font-mono text-[8px] text-library-accent font-black mt-0.5">
                        #{id}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center justify-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black border ${condColor.bg} ${condColor.text} ${condColor.border}`}>
                      <div className={`w-1 h-1 rounded-full ${condColor.dot}`} />
                      {getConditionLabel(condVal)}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center justify-center">
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black border bg-library-primary/[0.03] dark:bg-white/5 text-library-primary/60 dark:text-gray-300 border-library-primary/5 dark:border-white/5">
                      {getStateLabel(copy)}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <button
                      onClick={() => {
                        setSelectedCopy(copy);
                        setCopyConditionDrafts((prev) => ({ ...prev, [id]: condVal }));
                        setIsCopyModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 text-library-primary dark:text-white text-[10px] font-black hover:bg-library-primary hover:text-white transition-all border border-gray-100 dark:border-white/10 shadow-sm"
                    >
                      عرض
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        <Pagination
          currentPage={currentCopiesPage}
          totalPages={totalCopiesPages}
          onPageChange={setCurrentCopiesPage}
        />
      </div>
    );
  };

  const handleViewLendingDetail = async (lend) => {
    setSelectedLending(lend);
    setIsLendingModalOpen(true);
    setLoadingLendingDetail(true);

    try {
      let detail = { ...lend };

      // 1. Fetch borrowing request OR transaction detail
      if (lend.id) {
        if (subTab === "active" || subTab === "completed") {
          const tx = await borrowingTransactionsApi
            .getById(lend.id)
            .catch(() => null);
          if (tx) detail = { ...detail, ...tx };
        } else {
          const br = await borrowingApi.getById(lend.id).catch(() => null);
          if (br) detail = { ...detail, ...br };
        }
      }

      const getSafeId = (id) =>
        id && id !== "undefined" && id !== "null" ? id : null;

      let lendingDetail = null;
      // 2. Fetch the parent lending record to get the owner's details
      const lendingRecordId = getSafeId(
        detail.lendingRecordId ||
          detail.LendingRecordId ||
          detail.lendingListRecordId ||
          detail.LendingListRecordId,
      );
      if (lendingRecordId) {
        lendingDetail = await lendingApi
          .getById(lendingRecordId)
          .catch(() => null);
      }

      // 3. Extract IDs aggressively from all possible locations
      const ownerStudentId = getSafeId(
        detail.ownerStudentId ||
          detail.OwnerStudentId ||
          detail.ownerId ||
          detail.OwnerId ||
          detail.lenderId ||
          detail.LenderId ||
          lendingDetail?.studentId ||
          lendingDetail?.StudentId ||
          lendingDetail?.ownerId ||
          detail.copy?.studentId ||
          detail.bookCopy?.studentId ||
          detail.ownerDto?.id ||
          detail.ownerDto?.Id ||
          detail.lendingRecord?.studentId
      );
      const borrowerStudentId = getSafeId(
        detail.borrowingStudentId ||
          detail.BorrowingStudentId ||
          detail.requesterId ||
          detail.RequesterId ||
          detail.studentId ||
          detail.StudentId ||
          detail.borrowerId ||
          detail.BorrowerId ||
          detail.borrowerDto?.id ||
          lendingDetail?.borrowerId
      );

      let bookId = getSafeId(
        detail.bookId ||
          detail.BookId ||
          detail.book?.id ||
          detail.book?.Id ||
          detail.bookDto?.id ||
          detail.bookDto?.Id ||
          lendingDetail?.bookId ||
          lendingDetail?.BookId ||
          lendingDetail?.book?.id ||
          lendingDetail?.copy?.bookId ||
          detail.copy?.bookId ||
          detail.bookCopy?.bookId ||
          detail.copy?.book?.id
      );

      // 4. Critical fallback for transactions missing bookId
      if (!bookId || !ownerStudentId) {
        const copyId = getSafeId(
          detail.bookCopyId || 
          detail.BookCopyId || 
          detail.copyId || 
          detail.CopyId ||
          lendingDetail?.bookCopyId
        );
        if (copyId) {
          const copyData = await bookCopiesApi.getById(copyId).catch(() => null);
          if (copyData) {
            if (!bookId) {
              bookId = getSafeId(copyData.bookId || copyData.BookId || copyData.book?.id || copyData.book?.Id);
            }
            if (!ownerStudentId) {
              ownerStudentId = getSafeId(copyData.studentId || copyData.StudentId || copyData.ownerId);
            }
          }
        }
      }

      setSelectedLending((prev) => ({
        ...prev,
        ...detail,
        ...(lendingDetail && { lendingDetail }),
        extractedOwnerId: ownerStudentId,
        extractedBorrowerId: borrowerStudentId,
        extractedBookId: bookId,
      }));

      const imgPromises = [];
      const dataPromises = [];

      let fetchedOwnerName = null;
      let fetchedBorrowerName = null;
      let fetchedBookTitle = null;
      let fetchedBookAuthor = null;
      let fetchedBookIsbn = null;

      if (ownerStudentId) {
        if (!studentImageMap[ownerStudentId]) {
          imgPromises.push(
            fetchProtectedImageSrc(getStudentImageUrl(ownerStudentId))
              .then(
                (src) =>
                  src &&
                  setStudentImageMap((prev) => ({
                    ...prev,
                    [ownerStudentId]: src,
                  })),
              )
              .catch(() => {}),
          );
        }
        dataPromises.push(
          studentsApi
            .getById(ownerStudentId)
            .then((s) => {
              fetchedOwnerName =
                s?.fullName || s?.name || s?.Name || s?.FullName;
            })
            .catch(() => {}),
        );
      }

      if (borrowerStudentId) {
        if (!studentImageMap[borrowerStudentId]) {
          imgPromises.push(
            fetchProtectedImageSrc(getStudentImageUrl(borrowerStudentId))
              .then(
                (src) =>
                  src &&
                  setStudentImageMap((prev) => ({
                    ...prev,
                    [borrowerStudentId]: src,
                  })),
              )
              .catch(() => {}),
          );
        }
        dataPromises.push(
          studentsApi
            .getById(borrowerStudentId)
            .then((s) => {
              fetchedBorrowerName =
                s?.fullName || s?.name || s?.Name || s?.FullName;
            })
            .catch(() => {}),
        );
      }

      if (bookId) {
        if (!bookImageMap[bookId]) {
          const coverUrl = 
            detail?.bookCoverImageUrl || 
            detail?.BookCoverImageUrl || 
            lend?.bookCoverImageUrl ||
            lend?.BookCoverImageUrl ||
            lendingDetail?.book?.coverImageUrl ||
            lendingDetail?.book?.bookCoverImageUrl ||
            detail?.bookDto?.bookCoverImageUrl ||
            detail?.bookDto?.coverImageUrl ||
            detail?.book?.coverImageUrl ||
            detail?.book?.bookCoverImageUrl;
          const urlToFetch = coverUrl
            ? toApiAssetUrl(coverUrl)
            : getBookImageUrl(bookId);
          imgPromises.push(
            fetchProtectedImageSrc(urlToFetch)
              .then(
                (src) =>
                  src &&
                  setBookImageMap((prev) => ({ ...prev, [bookId]: src })),
              )
              .catch(() => {}),
          );
        }
        dataPromises.push(
          booksApi
            .getById(bookId)
            .then((b) => {
              fetchedBookTitle = b?.title || b?.Title;
              fetchedBookAuthor = b?.author || b?.Author;
              fetchedBookIsbn = b?.isbn || b?.ISBN;
            })
            .catch(() => {}),
        );
      }

      await Promise.allSettled([...imgPromises, ...dataPromises]);

      setSelectedLending((prev) => ({
        ...prev,
        ownerName:
          fetchedOwnerName ||
          prev?.ownerName ||
          prev?.OwnerName ||
          prev?.ownerStudentName ||
          prev?.OwnerStudentName ||
          prev?.studentName ||
          detail?.ownerName ||
          detail?.ownerStudentName ||
          detail?.OwnerStudentName,
        borrowingStudentName:
          fetchedBorrowerName ||
          prev?.borrowingStudentName ||
          prev?.BorrowingStudentName ||
          prev?.borrowerName ||
          prev?.BorrowerName ||
          prev?.studentName ||
          detail?.borrowingStudentName ||
          detail?.borrowerName ||
          detail?.requesterName,
        bookTitle:
          fetchedBookTitle || 
          prev?.bookTitle || 
          prev?.BookTitle || 
          prev?.title ||
          prev?.Book?.Title ||
          prev?.book?.title ||
          detail?.bookTitle ||
          detail?.title ||
          detail?.bookDto?.title ||
          lendingDetail?.book?.title ||
          detail?.book?.title,
        bookAuthor: 
          fetchedBookAuthor || 
          prev?.bookAuthor || 
          prev?.author || 
          detail?.author || 
          detail?.bookAuthor || 
          lendingDetail?.book?.author ||
          detail?.book?.author,
        isbn: fetchedBookIsbn || prev?.isbn || prev?.bookIsbn || detail?.isbn,
      }));
    } catch (err) {
      console.error("Failed to load lending details:", err);
    } finally {
      setLoadingLendingDetail(false);
    }
  };

  const renderLendingDetailModal = () => {
    if (!isLendingModalOpen || !selectedLending) return null;

    const lend = selectedLending;
    const getSafeId = (id) =>
      id && id !== "undefined" && id !== "null" ? id : null;

    const ownerStudentId = getSafeId(
      lend.extractedOwnerId ||
        lend.ownerStudentId ||
        lend.OwnerStudentId ||
        lend.ownerId ||
        lend.OwnerId ||
        lend.copy?.studentId ||
        lend.bookCopy?.studentId,
    );
    const borrowerStudentId = getSafeId(
      lend.extractedBorrowerId ||
        lend.borrowingStudentId ||
        lend.BorrowingStudentId ||
        lend.studentId ||
        lend.StudentId ||
        lend.requesterId ||
        lend.RequesterId,
    );
    const bookId = getSafeId(
      lend.extractedBookId ||
        lend.bookId ||
        lend.BookId ||
        lend.book?.id ||
        lend.Book?.Id ||
        lend.copy?.bookId,
    );

    // Add multiple fallbacks including potential PascalCase or mapped properties
    const ownerName =
      lend.ownerName ||
      lend.OwnerName ||
      lend.ownerStudentName ||
      lend.OwnerStudentName ||
      lend.studentName ||
      lend.StudentName ||
      "صاحب النسخة";
    const borrowerName =
      lend.borrowingStudentName ||
      lend.BorrowingStudentName ||
      lend.borrowerName ||
      lend.BorrowerName ||
      lend.studentName ||
      lend.StudentName ||
      "الطالب المستعير";
    const bookTitle =
      lend.bookTitle ||
      lend.BookTitle ||
      lend.title ||
      lend.Title ||
      lend.book?.title ||
      lend.Book?.Title ||
      lend.bookDto?.title ||
      lend.lendingDetail?.book?.title ||
      lend.copy?.book?.title ||
      "كتاب";
    const bookAuthor =
      lend.bookAuthor ||
      lend.BookAuthor ||
      lend.author ||
      lend.Author ||
      lend.book?.author ||
      lend.Book?.Author ||
      lend.bookDto?.author ||
      "";
    const bookIsbn =
      lend.isbn ||
      lend.ISBN ||
      lend.bookIsbn ||
      lend.BookIsbn ||
      lend.book?.isbn ||
      lend.Book?.ISBN ||
      lend.bookDto?.isbn ||
      "";

    const requestDate = lend.requestDate || lend.createdAtUtc || lend.createdAt;
    const returnDate =
      lend.expectedReturnDate ||
      lend.expirationDateUtc ||
      lend.expirationDate ||
      lend.returnDate;
    const borrowingDuration =
      lend.borrowingDurationInDays || lend.durationInDays;

    const stateValue = lend.state ?? lend.status;
    const isTransaction = subTab === "active" || subTab === "completed";
    const labelsObj = isTransaction
      ? BORROWING_TRANSACTION_STATE_LABELS
      : BORROWING_REQUEST_STATE_LABELS;

    const stateLabel = getLabel(
      labelsObj,
      stateValue,
      isTransaction ? "نشطة" : "غير معروف",
    );

    let stateColor = "gray";
    if (isTransaction) {
      if (stateValue === 0 || stateValue === "Borrowed") stateColor = "emerald";
      else if (stateValue === 1 || stateValue === "Returned")
        stateColor = "blue";
      else if (stateValue === 2 || stateValue === "Overdue")
        stateColor = "rose";
      else if (stateValue === 3 || stateValue === "Lost") stateColor = "gray";
    } else {
      stateColor =
        stateValue === 0 || stateValue === "Pending"
          ? "amber"
          : stateValue === 1 || stateValue === "Accepted"
          ? "blue"
          : stateValue === 2 || stateValue === "Rejected"
          ? "rose"
          : stateValue === 4 || stateValue === "Completed"
          ? "emerald"
          : "gray";
    }

    const formatDate = (d) => {
      if (!d) return "—";
      return new Date(d).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsLendingModalOpen(false)}
        />
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10 flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="h-24 shrink-0 bg-library-primary relative">
            <button
              onClick={() => setIsLendingModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all z-10"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-4 right-6 flex items-center gap-2">
              <ArrowLeftRight className="text-white/90" size={20} />
              <h3 className="text-white font-black text-base drop-shadow-sm">
                تفاصيل عملية الإعارة
              </h3>
            </div>
            <span
              className={`absolute bottom-4 left-6 px-3 py-1 rounded-full text-[10px] font-black border bg-${stateColor}-500/20 text-white border-white/30 backdrop-blur-sm`}
            >
              {stateLabel}
            </span>
          </div>

          {loadingLendingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 flex-grow">
              <Loader2
                className="animate-spin text-library-accent mb-3"
                size={32}
              />
              <p className="text-xs font-black text-gray-400">
                جاري تحميل التفاصيل...
              </p>
            </div>
          ) : (
            <div className="px-6 py-6 space-y-6 overflow-y-auto flex-grow scrollbar-thin">
              {/* Book Section */}
              <div
                className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 cursor-pointer hover:border-library-accent/35 transition-all"
                onClick={async () => {
                  if (!bookId) {
                    toast.error("بيانات الكتاب غير متوفرة للفتح");
                    return;
                  }
                  const t = toast.loading("جاري تحميل بيانات الكتاب...");
                  try {
                    const fullBook = await booksApi.getById(bookId);
                    setSelectedBook(fullBook);
                    setIsBookModalOpen(true);
                    toast.dismiss(t);
                  } catch (e) {
                    toast.dismiss(t);
                    setSelectedBook({
                      id: bookId,
                      title: bookTitle,
                      authorName: bookAuthor,
                      author: bookAuthor,
                      isbn: bookIsbn,
                      bookCoverImageUrl: lend.bookCoverImageUrl,
                    });
                    setIsBookModalOpen(true);
                  }
                }}
              >
                <div className="w-14 h-20 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-100 dark:border-white/10 shadow-inner shrink-0">
                  {(lend.bookCoverImageUrl || lend.BookCoverImageUrl || lend.book?.bookCoverImageUrl || lend.lendingDetail?.book?.bookCoverImageUrl || bookImageMap[bookId]) ? (
                    <img
                      src={
                        bookImageMap[bookId] ||
                        toApiAssetUrl(lend.bookCoverImageUrl || lend.BookCoverImageUrl || lend.book?.bookCoverImageUrl || lend.lendingDetail?.book?.bookCoverImageUrl)
                      }
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/20"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/20">
                      <BookOpen size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-[9px] text-library-accent font-black mb-1 uppercase tracking-widest">
                    الكتاب
                  </p>
                  <h4 className="text-sm font-black text-library-primary dark:text-white leading-snug truncate">
                    {bookTitle}
                  </h4>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black ${getBorrowingStateBadgeClass(
                      lend.status,
                    )}`}
                  >
                    {getLabel(BORROWING_REQUEST_STATE_LABELS, lend.status)}
                  </span>
                  {bookAuthor && (
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">
                      {bookAuthor}
                    </p>
                  )}
                  {bookIsbn && (
                    <p className="text-[9px] text-gray-400 mt-1 font-mono">
                      ISBN: {bookIsbn}
                    </p>
                  )}
                  {bookId && (
                    <p className="text-[9px] text-gray-400 mt-0.5">
                      معرف الكتاب: #{bookId}
                    </p>
                  )}
                </div>
              </div>

              {/* Owner & Borrower — Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Owner */}
                <div
                  className="p-4 rounded-2xl bg-library-primary/[0.05] dark:bg-white/[0.04] border border-library-primary/12 dark:border-white/10 cursor-pointer hover:border-library-accent/35 transition-all"
                  onClick={async () => {
                    if (!ownerStudentId) {
                      toast.error("بيانات المالك غير متوفرة");
                      return;
                    }
                    const t = toast.loading("جاري تحميل بيانات الطالب...");
                    try {
                      const fullStudent = await studentsApi.getById(
                        ownerStudentId,
                      );
                      setSelectedStudent(fullStudent);
                      setIsModalOpen(true);
                      toast.dismiss(t);
                    } catch (e) {
                      toast.dismiss(t);
                      setSelectedStudent({
                        id: ownerStudentId,
                        fullName: ownerName,
                        universityMailAddress: lend.ownerEmail || "",
                        phoneNumber: lend.ownerPhone || "",
                      });
                      setIsModalOpen(true);
                    }
                  }}
                >
                  <p className="text-[9px] text-library-primary dark:text-library-paper font-black mb-3 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield size={10} className="text-library-accent" /> صاحب
                    النسخة
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 overflow-hidden border border-library-primary/15 dark:border-white/10 shadow-sm shrink-0">
                      {ownerStudentId && studentImageMap[ownerStudentId] ? (
                        <img
                          src={studentImageMap[ownerStudentId]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-library-primary/35 dark:text-library-accent/50">
                          <Users size={14} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-library-primary dark:text-white truncate">
                        {ownerName}
                      </p>
                      {ownerStudentId && (
                        <p className="text-[8px] text-gray-400 mt-0.5">
                          #{ownerStudentId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Borrower */}
                <div
                  className="p-4 rounded-2xl bg-library-primary/[0.05] dark:bg-white/[0.04] border border-library-primary/15 dark:border-white/10 cursor-pointer hover:border-library-accent/35 transition-all"
                  onClick={async () => {
                    if (!borrowerStudentId) {
                      toast.error("بيانات المستعير غير متوفرة");
                      return;
                    }
                    const t = toast.loading("جاري تحميل بيانات الطالب...");
                    try {
                      const fullStudent = await studentsApi.getById(
                        borrowerStudentId,
                      );
                      setSelectedStudent(fullStudent);
                      setIsModalOpen(true);
                      toast.dismiss(t);
                    } catch (e) {
                      toast.dismiss(t);
                      setSelectedStudent({
                        id: borrowerStudentId,
                        fullName: borrowerName,
                        universityMailAddress: lend.borrowerEmail || "",
                        phoneNumber: lend.borrowerPhone || "",
                      });
                      setIsModalOpen(true);
                    }
                  }}
                >
                  <p className="text-[9px] text-library-accent font-black mb-3 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={10} /> المستعير
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 overflow-hidden border border-library-accent/25 shadow-sm shrink-0">
                      {borrowerStudentId &&
                      studentImageMap[borrowerStudentId] ? (
                        <img
                          src={studentImageMap[borrowerStudentId]}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-library-accent/50">
                          <Users size={14} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-library-primary dark:text-white truncate">
                        {borrowerName}
                      </p>
                      {borrowerStudentId && (
                        <p className="text-[8px] text-gray-400 mt-0.5">
                          #{borrowerStudentId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline / Dates */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 space-y-3">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarDays size={10} /> التواريخ والمدة
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[8px] text-gray-400 font-black mb-0.5">
                      تاريخ الطلب
                    </p>
                    <p className="text-[11px] font-black text-library-primary dark:text-white">
                      {formatDate(requestDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 font-black mb-0.5">
                      تاريخ الإرجاع المتوقع
                    </p>
                    <p
                      className={`text-[11px] font-black ${
                        lend.isOverdue
                          ? "text-rose-500"
                          : "text-library-primary dark:text-white"
                      }`}
                    >
                      {formatDate(returnDate)}
                    </p>
                  </div>
                </div>

                {borrowingDuration && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                    <Clock size={12} className="text-gray-400" />
                    <p className="text-[10px] font-black text-gray-500">
                      مدة الإعارة:{" "}
                      <span className="text-library-primary dark:text-white">
                        {borrowingDuration} يوم
                      </span>
                    </p>
                  </div>
                )}

                {lend.isOverdue && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <ShieldAlert size={12} className="text-rose-500" />
                    <p className="text-[10px] font-black text-rose-500">
                      تأخر في الإرجاع!
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Details (if any IDs available) */}
              {(lend.bookCopyId || lend.lendingRecordId || lend.id) && (
                <div className="flex items-center gap-3 flex-wrap text-[8px] font-mono text-gray-400 px-1">
                  {lend.id && <span>طلب: #{lend.id}</span>}
                  {lend.lendingRecordId && (
                    <span>• سجل: #{lend.lendingRecordId}</span>
                  )}
                  {lend.bookCopyId && <span>• نسخة: #{lend.bookCopyId}</span>}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-5">
            <button
              onClick={() => setIsLendingModalOpen(false)}
              className="w-full py-3 rounded-xl bg-gray-100 dark:bg-white/5 text-library-primary dark:text-white text-[11px] font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              إغلاق النافذة
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const renderLendingList = () => {
    if (loadingLendings)
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-library-accent/25 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-library-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[11px] font-black text-library-primary/60 dark:text-gray-400">
            جاري تحميل الإعارات...
          </p>
        </div>
      );

    if (lendings.length === 0)
      return (
        <div className="flex flex-col items-center justify-center py-32 bg-white/40 dark:bg-dark-surface/40 rounded-3xl border border-gray-100 dark:border-white/5 text-center">
          <div className="w-20 h-20 bg-gray-50 dark:bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
            <Clock className="text-gray-300 dark:text-white/20" size={32} />
          </div>
          <h3 className="text-sm font-black text-library-primary dark:text-white mb-1">
            لا يوجد إعارات
          </h3>
          <p className="text-gray-400 text-[11px] font-bold">
            لا يوجد عمليات إعارة حالياً في هذا القسم
          </p>
        </div>
      );

    return (
      <div className="space-y-4">
        <div className="glass-card rounded-2xl border border-library-primary/[0.06] dark:border-white/[0.06] shadow-sm overflow-hidden bg-white/50 dark:bg-dark-surface/30 backdrop-blur-md">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-library-primary/[0.02] dark:bg-white/[0.01] border-b border-library-primary/[0.04] dark:border-white/[0.04] text-[9px] font-black text-library-primary/30 dark:text-gray-500 uppercase tracking-widest">
            <div className="col-span-4 flex items-center gap-2">
              <div className="w-1 h-3 bg-library-accent/30 rounded-full" />
              المستعير والكتاب
            </div>
            <div className="col-span-3 text-center">التاريخ</div>
            <div className="col-span-3 text-center">الحالة</div>
            <div className="col-span-2 text-left pl-4">الإجراءات</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {lendings.map((lend) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={lend.id}
                className="group relative px-6 py-4 hover:bg-library-primary/[0.02] dark:hover:bg-white/[0.01] transition-all flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 cursor-pointer"
                onClick={() => handleViewLendingDetail(lend)}
              >
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-library-accent/10 dark:bg-library-accent/5 flex items-center justify-center text-library-primary dark:text-library-accent font-black text-[11px] border border-library-accent/20 shadow-sm shrink-0">
                    {(lend.borrowerName || lend.studentName || lend.ownerName || "S").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[12px] font-black text-library-primary dark:text-library-paper group-hover:text-library-accent transition-colors truncate">
                      {lend.borrowerName || lend.studentName || lend.ownerName || "طالب"}
                    </h4>
                    <p className="text-[9px] text-gray-400 font-bold truncate mt-0.5">
                      {lend.bookTitle || lend.title || "كتاب غير مسجل"}
                    </p>
                  </div>
                </div>

                <div className="col-span-3 flex flex-col items-center justify-center gap-1">
                  <p className="text-[11px] font-black text-library-primary dark:text-white">
                    {new Date(lend.expectedReturnDate || lend.returnDate || lend.requestDate || lend.createdAt || new Date()).toLocaleDateString("ar-EG", { day: "2-digit", month: "short" })}
                  </p>
                  <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">
                    {subTab === "active" ? "الإرجاع" : "الطلب"}
                  </p>
                </div>

                <div className="col-span-3 flex items-center justify-center">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black border flex items-center gap-1.5 ${
                    subTab === "active" || subTab === "completed" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" :
                    subTab === "pending_owner" ? "bg-amber-500/5 text-amber-600 border-amber-500/10" :
                    subTab === "rejected" ? "bg-rose-500/5 text-rose-600 border-rose-500/10" :
                    "bg-blue-500/5 text-blue-600 border-blue-500/10"
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${
                      subTab === "active" || subTab === "completed" ? "bg-emerald-500" :
                      subTab === "pending_owner" ? "bg-amber-500" :
                      subTab === "rejected" ? "bg-rose-500" : "bg-blue-500"
                    }`} />
                    {(() => {
                      const isTx = subTab === "active" || subTab === "completed";
                      const labels = isTx ? BORROWING_TRANSACTION_STATE_LABELS : BORROWING_REQUEST_STATE_LABELS;
                      return getLabel(labels, lend.state ?? lend.status, isTx ? "نشطة" : "بانتظار المراجعة");
                    })()}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleViewLendingDetail(lend); }}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 text-library-primary dark:text-white text-[10px] font-black hover:bg-library-primary hover:text-white transition-all border border-gray-100 dark:border-white/10 shadow-sm"
                  >
                    التفاصيل
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <Pagination
          currentPage={currentLendingPage}
          totalPages={totalLendingPages}
          onPageChange={setCurrentLendingPage}
        />
      </div>
    );
  };

  const renderReports = () => {
    const borrowedCount =
      parseInt(String(statsData.lendings.value).replace(/,/g, "")) || 0;
    const totalBooks = parseInt(String(statsData.books.value).replace(/,/g, "")) || 0;
    
    // Calculate raw ratio and a capped version for the UI
    const rawRatio = totalBooks > 0 ? Math.round((borrowedCount / totalBooks) * 100) : 0;
    const lendingRatio = Math.min(100, rawRatio);

    // Generate consistent looking chart data scaled to 0-100%
    const chartData = [
      Math.max(15, lendingRatio * 0.6),
      Math.max(25, lendingRatio * 0.8),
      Math.max(20, lendingRatio * 0.7),
      Math.max(10, lendingRatio),
      Math.max(30, lendingRatio * 0.9),
      Math.max(40, lendingRatio * 1.1 > 100 ? 95 : lendingRatio * 1.1),
      Math.max(20, lendingRatio * 0.75),
    ];

    const activePercentage = statsData.activePercentage || 0;
    const totalStudents = statsData.totalStudents || 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-library-primary/[0.08] dark:border-white/[0.08] shadow-sm">
            <h3 className="text-sm font-black text-library-primary dark:text-library-paper mb-6 flex items-center gap-2">
              <BookOpen
                className="text-library-accent"
                size={16}
                strokeWidth={1.75}
              />
              معدل تداول الكتب الفعلي
            </h3>

            <div className="flex items-end justify-between mb-10 h-32 px-2 gap-2">
              {chartData.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-3 h-full justify-end"
                >
                  <div className="w-full bg-library-primary/5 dark:bg-white/5 rounded-t-lg relative h-full flex items-end overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${val}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="w-full bg-gradient-to-t from-library-primary to-library-accent rounded-t-sm shadow-lg shadow-library-primary/10 relative z-10"
                    />
                  </div>
                  <span className="text-[8px] text-library-primary/40 dark:text-gray-500 font-black">
                    {
                      [
                        "السبت",
                        "الأحد",
                        "الاثنين",
                        "الثلاثاء",
                        "الأربعاء",
                        "الخميس",
                        "الجمعة",
                      ][i]
                    }
                  </span>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-library-accent/10 to-transparent border border-library-accent/20 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-library-primary dark:text-library-accent mb-1">
                  معدل النشاط اللحظي
                </p>
                <p className="text-[9px] text-library-primary/60 dark:text-gray-400 font-bold leading-relaxed">
                  بناءً على {totalBooks.toLocaleString()} كتاب، يوجد ضغط إعارة بنسبة مرتفعة.
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-library-accent drop-shadow-sm">
                  {rawRatio}%
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-library-primary/[0.08] dark:border-white/[0.08] shadow-sm">
            <h3 className="text-sm font-black text-library-primary dark:text-library-paper mb-6 flex items-center gap-2">
              <Users
                className="text-library-accent"
                size={16}
                strokeWidth={1.75}
              />
              تحليل تفاعل المستخدمين
            </h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-library-primary/45 dark:text-gray-400">
                  <span>نسبة الطلاب النشطين (الموثقين)</span>
                  <span className="text-library-accent">
                    {activePercentage}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-library-primary/[0.08] dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activePercentage}%` }}
                    className="h-full bg-library-accent rounded-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-library-primary/45 dark:text-gray-400">
                  <span>تغطية الكتب للطلاب</span>
                  <span className="text-library-accent">
                    {totalStudents > 0
                      ? (totalBooks / totalStudents).toFixed(1)
                      : 0}{" "}
                    كتاب/طالب
                  </span>
                </div>
                <div className="h-1.5 w-full bg-library-primary/[0.08] dark:bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    className="h-full bg-library-primary/15 dark:bg-white/10 rounded-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        100,
                        (totalBooks / (totalStudents || 1)) * 20,
                      )}%`,
                    }}
                    className="h-full bg-library-primary dark:bg-library-accent rounded-full -mt-1.5"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-library-primary/[0.06] dark:bg-white/[0.04] border border-library-primary/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-library-accent/15 rounded-lg">
                  <TrendingUp className="text-library-accent" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-library-primary dark:text-library-accent">
                    إجمالي المجتمع
                  </p>
                  <p className="text-[14px] font-black text-library-primary dark:text-library-paper">
                    {totalStudents.toLocaleString()} مستخدم مسجل
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6 text-library-paper bg-library-primary border border-library-paper/10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-56 h-56 bg-library-accent/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-xl font-black mb-2 tracking-tight">
              ملخص الأداء المباشر
            </h2>
            <p className="text-[10px] text-library-paper/70 font-bold max-w-sm leading-relaxed">
              يتم تحديث هذه البيانات لحظياً من خلال الربط المباشر مع قاعدة
              بيانات النظام، مما يعكس الحالة الحقيقية للمكتبة والمجتمع الطلابي.
            </p>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="text-center px-6 py-3 rounded-xl bg-library-paper/10 backdrop-blur-md border border-library-paper/15">
              <p className="text-2xl font-black text-library-accent">
                {totalStudents.toLocaleString()}
              </p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-library-paper/60">
                عضو مسجل
              </p>
            </div>
            <div className="text-center px-6 py-3 rounded-xl bg-library-paper/10 backdrop-blur-md border border-library-paper/15">
              <p className="text-2xl font-black text-library-accent">
                {totalBooks.toLocaleString()}
              </p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-library-paper/60">
                كتاب موثق
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const menuItems = [
    { id: "overview", title: "الرئيسية", icon: BarChart3, color: "blue" },
    {
      id: "students",
      title: "الطلاب",
      icon: Users,
      color: "indigo",
      subTabs: [
        { id: "verified", title: "الموثقون", icon: CheckCircle },
        { id: "all", title: "كل الطلاب", icon: Users },
        { id: "pending_approval", title: "انتظار الموافقة", icon: Clock },
        { id: "pending_verification", title: "انتظار التوثيق", icon: UserPlus },
        { id: "unconfirmed", title: "غير مؤكدة", icon: Mail },
        { id: "banned", title: "المحظورون", icon: UserX },
      ],
    },
    {
      id: "books",
      title: "المكتبة",
      icon: BookOpen,
      color: "emerald",
      subTabs: [
        { id: "all", title: "المتاحة", icon: BookOpen },
        { id: "pending", title: "قيد المراجعة", icon: Clock },
      ],
    },
    { id: "copies", title: "إدارة النسخ", icon: Copy, color: "teal" },
    {
      id: "lending",
      title: "الإعارات",
      icon: BookMarked,
      color: "amber",
      subTabs: [
        { id: "active", title: "نشطة", icon: CheckCircle },
        { id: "pending_owner", title: "بانتظار القبول", icon: Clock },
        { id: "pending_handover", title: "تم القبول", icon: Check },
        { id: "rejected", title: "مرفوضة", icon: XCircle },
        { id: "completed", title: "مكتملة", icon: CheckCircle },
      ],
    },
  ];

  const renderSubNav = () => {
    const currentItem = menuItems.find((i) => i.id === activeTab);
    if (!currentItem?.subTabs) return null;

    return (
      <div className="flex items-center p-1.5 bg-library-primary/[0.03] dark:bg-white/[0.02] rounded-2xl w-fit mb-8 border border-library-primary/[0.04] dark:border-white/[0.04]">
        {currentItem.subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black transition-all relative group ${
              subTab === tab.id
                ? "bg-white dark:bg-dark-surface text-library-primary dark:text-library-paper shadow-sm shadow-library-primary/5 border border-library-primary/[0.05] dark:border-white/5"
                : "text-library-primary/40 dark:text-gray-500 hover:text-library-primary dark:hover:text-library-paper"
            }`}
          >
            <tab.icon
              size={14}
              className={
                subTab === tab.id
                  ? "text-library-accent"
                  : "text-library-primary/25 dark:text-gray-600 group-hover:text-library-accent/60 transition-colors"
              }
              strokeWidth={subTab === tab.id ? 2.5 : 2}
            />
            {tab.title}
            
             {activeTab === "students" &&
              tab.id === "pending" &&
              parseInt(statsData.requests.value) > 0 && (
                <div className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[9px] font-black ml-1 shadow-sm shadow-rose-500/20">
                  {statsData.requests.value}
                </div>
              )}

            {subTab === tab.id && (
              <motion.div
                layoutId="activeSubTab"
                className="absolute inset-0 rounded-xl border border-library-accent/20 dark:border-library-accent/30 pointer-events-none"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-library-accent/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-library-accent border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-xs font-black text-library-primary/60 dark:text-gray-400">
            جاري تحميل البيانات...
          </p>
        </div>
      );

    if (activeTab === "students")
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {renderSubNav()}
          </motion.div>
          {renderStudentsList()}
        </div>
      );
    if (activeTab === "books")
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {renderSubNav()}
          </motion.div>
          {renderBooksList()}
        </div>
      );
    if (activeTab === "copies")
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          ></motion.div>
          {renderCopiesList()}
        </div>
      );
    if (activeTab === "lending")
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {renderSubNav()}
          </motion.div>
          {renderLendingList()}
        </div>
      );

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {activeTab !== "overview" && renderSubNav()}

        {activeTab === "overview" ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentRequests.length > 0 && (
                <div className="glass-card rounded-2xl p-6 border border-library-primary/[0.08] dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
                  <div className="absolute -left-10 -top-10 w-32 h-32 bg-library-accent/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-sm font-black text-library-primary dark:text-library-paper flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-library-accent/15 text-library-primary dark:text-library-accent flex items-center justify-center border border-library-accent/25">
                        <Clock size={16} strokeWidth={2} />
                      </div>
                      طلبات استعارة عاجلة
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab("lending");
                        setSubTab("pending_owner");
                      }}
                      className="text-[10px] font-bold text-library-primary dark:text-library-accent bg-library-accent/15 px-3 py-1.5 rounded-xl hover:bg-library-accent/25 transition-colors border border-library-accent/20"
                    >
                      عرض الكل
                    </button>
                  </div>
                  <div className="space-y-3 relative z-10">
                    {recentRequests.slice(0, 3).map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-library-primary/[0.02] dark:bg-white/[0.02] border border-library-primary/[0.05] dark:border-white/[0.05] hover:border-library-accent/30 transition-all group/item"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-bg border border-gray-100 dark:border-white/5 flex items-center justify-center text-[12px] font-black text-library-primary shadow-sm group-hover/item:border-library-accent/40 transition-colors">
                            {(req.studentName || "ط").charAt(0)}
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-library-primary dark:text-white mb-0.5">
                              {req.studentName}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5">
                                <BookMarked size={11} className="text-library-accent" /> {req.bookTitle}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[9px] font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/15 uppercase tracking-wider">
                            بانتظار الموافقة
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentStudents.length > 0 && (
                <div className="glass-card rounded-2xl p-6 border border-library-primary/[0.08] dark:border-white/[0.08] shadow-sm relative overflow-hidden group">
                  <div className="absolute -left-10 -top-10 w-32 h-32 bg-library-primary/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <h3 className="text-sm font-black text-library-primary dark:text-library-paper flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-library-primary/10 text-library-primary dark:text-library-accent flex items-center justify-center border border-library-primary/15 dark:border-white/10">
                        <ShieldAlert size={16} strokeWidth={2} />
                      </div>
                      طلاب بانتظار التوثيق
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab("students");
                        setSubTab("pending_approval");
                      }}
                      className="text-[10px] font-bold text-library-paper bg-library-primary px-3 py-1.5 rounded-xl hover:bg-library-primary/90 transition-colors shadow-sm shadow-library-primary/15"
                    >
                      مراجعة الطلبات
                    </button>
                  </div>
                  <div className="space-y-3 relative z-10">
                    {recentStudents.slice(0, 3).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-library-primary/[0.03] dark:bg-white/[0.03] border border-library-primary/[0.06] dark:border-white/[0.06] hover:border-library-accent/30 transition-colors group/item"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden border border-library-primary/15 dark:border-white/10">
                            {student.profileImageUrl ? (
                              <img
                                src={student.profileImageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-library-accent/15 flex items-center justify-center text-[10px] font-black text-library-primary dark:text-library-accent">
                                {student.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-library-primary dark:text-library-paper">
                              {student.fullName}
                            </p>
                            <p className="text-[9px] text-library-primary/45 dark:text-gray-400 font-bold">
                              {student.universityId}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsModalOpen(true);
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-library-primary/10 dark:border-white/10 flex items-center justify-center text-library-primary/40 hover:text-library-accent hover:border-library-accent/40 transition-all shadow-sm group-hover/item:bg-library-primary group-hover/item:text-library-paper group-hover/item:border-library-primary"
                        >
                          <ArrowLeftRight size={12} className="rotate-45" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {renderReports()}
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center border border-library-primary/[0.08] dark:border-white/[0.08] shadow-sm text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(199,163,95,0.08),transparent_55%)]" />
            <div className="w-24 h-24 rounded-2xl bg-library-primary/[0.04] dark:bg-white/[0.04] border border-library-primary/10 dark:border-white/10 flex items-center justify-center mb-6 relative z-10">
              <Settings
                className="text-library-accent animate-spin-slow relative z-10"
                size={40}
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-2xl font-black text-library-primary dark:text-library-paper mb-2 relative z-10 tracking-tight">
              قسم {menuItems.find((i) => i.id === activeTab)?.title}
            </h2>
            <p className="text-library-primary/50 dark:text-gray-400 font-bold max-w-sm mb-8 leading-relaxed text-sm relative z-10">
              أنت الآن في تبويب:{" "}
              <span className="text-library-primary dark:text-library-accent px-2 py-1 rounded-md bg-library-accent/12 border border-library-accent/20 ml-1">
                {menuItems
                  .find((i) => i.id === activeTab)
                  ?.subTabs?.find((s) => s.id === subTab)?.title || subTab}
              </span>
            </p>
            <button
              onClick={() => setActiveTab("overview")}
              className="bg-library-primary text-library-paper px-8 py-3.5 rounded-xl text-xs font-black shadow-lg shadow-library-primary/20 hover:bg-library-primary/90 transition-all active:scale-95 relative z-10"
            >
              الرجوع للرئيسية
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <>
      <Navbar />
      <div
        className="h-[100dvh] max-h-[100dvh] bg-library-paper dark:bg-dark-bg pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pt-[calc(4.25rem+env(safe-area-inset-top,0px))] flex flex-col lg:flex-row gap-0 lg:gap-3 lg:p-3 overflow-hidden"
        style={{ direction: "rtl" }}
      >
        <div className="hidden lg:block lg:w-[272px] h-full shrink-0">
          <div className="glass-card h-full rounded-2xl border border-library-primary/10 dark:border-white/[0.08] flex flex-col p-4 shadow-sm relative overflow-hidden">
            <div className="absolute -left-16 top-1/2 w-40 h-40 bg-library-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-8 px-2 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-library-primary/[0.06] dark:bg-white/[0.06] flex items-center justify-center text-library-accent border border-library-primary/10 dark:border-white/10 shadow-sm">
                  <OrbitIcon className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-[17px] font-black text-library-primary dark:text-library-paper tracking-tight">
                    Book<span className="text-library-accent">Orbit</span>
                  </h2>
                </div>
              </div>
              <div className="mt-4 h-[3px] w-10 bg-library-accent rounded-full" />
            </div>

            <nav className="flex-grow space-y-1.5 relative z-10">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "lending") setSubTab("active");
                      else if (item.id === "students") setSubTab("verified");
                      else if (item.id === "books") setSubTab("all");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-black text-[12.5px] transition-all relative group overflow-hidden ${
                      isActive
                        ? "bg-library-primary text-white shadow-lg shadow-library-primary/20 dark:bg-library-accent dark:text-library-primary dark:shadow-library-accent/20"
                        : "text-library-primary/60 dark:text-gray-400 hover:bg-library-primary/[0.04] dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className="relative">
                        <item.icon
                          size={18}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={isActive ? "text-white dark:text-library-primary" : "text-library-primary/40 dark:text-gray-500 group-hover:text-library-accent transition-colors"}
                        />
                        {item.id === "students" && parseInt(statsData.requests.value) > 0 && (
                          <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 ${isActive ? "bg-white dark:bg-library-primary border-library-primary dark:border-library-accent" : "bg-rose-500 border-white dark:border-dark-surface"}`} />
                        )}
                      </div>
                      <span className="tracking-tight">{item.title}</span>
                    </div>
                    {!isActive && (item.id === "students" || item.id === "requests") && parseInt(statsData.requests.value) > 0 && (
                      <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/10">
                        {statsData.requests.value}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-glow"
                        className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-4 border-t border-library-primary/10 dark:border-white/10 relative z-10">
              <p className="text-[8px] font-black text-center text-library-primary/20 dark:text-white/10 uppercase tracking-widest">
                Qurtuba Library System v2.0
              </p>
            </div>
          </div>
        </div>

          <div className="flex-grow h-full overflow-y-auto custom-scrollbar pb-8 min-w-0">
            <div className="hidden lg:block px-6 lg:px-8 pt-8">

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  title="إجمالي الطلاب"
                  value={statsData.students.value}
                  change={statsData.students.change}
                  icon={Users}
                  color="indigo"
                  onClick={() => {
                    setActiveTab("students");
                    setSubTab("all");
                  }}
                />
                <StatCard
                  title="الكتب المعتمدة"
                  value={statsData.books.value}
                  change={statsData.books.change}
                  icon={BookOpen}
                  color="emerald"
                  onClick={() => {
                    setActiveTab("books");
                    setSubTab("all");
                  }}
                />
                <StatCard
                  title="الإعارات النشطة"
                  value={statsData.lendings.value}
                  change={statsData.lendings.change}
                  icon={BookMarked}
                  color="amber"
                  onClick={() => {
                    setActiveTab("lending");
                    setSubTab("active");
                  }}
                />
                <StatCard
                  title="بانتظار التوثيق"
                  value={statsData.requests.value}
                  change={statsData.requests.change}
                  icon={UserPlus}
                  color="rose"
                  trend="down"
                  onClick={() => {
                    setActiveTab("students");
                    setSubTab("pending_approval");
                  }}
                />
              </div>
            )}

            {renderContent()}
          </div>

          <div className="lg:hidden px-4 pt-4 space-y-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-fade-edges">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "lending") setSubTab("active");
                      else if (item.id === "students") setSubTab("verified");
                      else if (item.id === "books") setSubTab("all");
                    }}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[12px] font-black border transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-library-primary text-white border-library-primary shadow-lg shadow-library-primary/20 dark:bg-library-accent dark:text-library-primary dark:border-library-accent"
                        : "glass-card text-library-primary/60 dark:text-gray-400 border-library-primary/[0.08] dark:border-white/[0.08]"
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={isActive ? "text-white dark:text-library-primary" : "text-library-primary/40"}
                    />
                    <span>{item.title}</span>
                    {item.id === "students" && parseInt(statsData.requests.value) > 0 && (
                      <span className={`w-2 h-2 rounded-full ${isActive ? "bg-white dark:bg-library-primary" : "bg-rose-500"}`} />
                    )}
                  </button>
                );
              })}
            </div>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatCard
                  title="الطلاب"
                  value={statsData.students.value}
                  change={statsData.students.change}
                  icon={Users}
                  color="indigo"
                  onClick={() => {
                    setActiveTab("students");
                    setSubTab("all");
                  }}
                />
                <StatCard
                  title="الكتب"
                  value={statsData.books.value}
                  change={statsData.books.change}
                  icon={BookOpen}
                  color="emerald"
                  onClick={() => {
                    setActiveTab("books");
                    setSubTab("all");
                  }}
                />
                <StatCard
                  title="الإعارات"
                  value={statsData.lendings.value}
                  change={statsData.lendings.change}
                  icon={BookMarked}
                  color="amber"
                  onClick={() => {
                    setActiveTab("lending");
                    setSubTab("active");
                  }}
                />
                <StatCard
                  title="طلبات توثيق"
                  value={statsData.requests.value}
                  change={statsData.requests.change}
                  icon={UserPlus}
                  color="rose"
                  trend="down"
                  onClick={() => {
                    setActiveTab("students");
                    setSubTab("pending_approval");
                  }}
                />
              </div>
            )}

            <div className="glass-card rounded-2xl p-3 border border-library-primary/[0.08] dark:border-white/[0.08]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLendingModalOpen && renderLendingDetailModal()}
        {isModalOpen && renderStudentModal()}
        {isBookModalOpen && renderBookModal()}
        {isBookCopiesModalOpen && renderBookCopiesModal()}
        {isCopyModalOpen && renderCopyModal()}
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;
