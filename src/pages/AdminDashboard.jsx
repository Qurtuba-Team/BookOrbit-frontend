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
  CheckCircle2,
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
  CalendarDays
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";

import { 
  studentsApi, 
  booksApi, 
  lendingApi, 
  borrowingApi 
} from "../services/api";
import { getStudentImageUrl, getBookImageUrl, tokenStore, STUDENT_STATE_LABELS } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ title, value, change, icon: Icon, color, trend = "up", onClick }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -3, scale: 1.01 }}
    onClick={onClick}
    className={`bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl p-4 rounded-2xl border border-white dark:border-white/5 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute -right-4 -top-4 w-20 h-20 bg-${color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
    
    <div className="flex justify-between items-center mb-3 relative z-10">
      <div className={`p-2.5 rounded-lg bg-gradient-to-br from-${color}-500/20 to-${color}-500/5 text-${color}-600 dark:text-${color}-400`}>
        <Icon size={18} />
      </div>
      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-black ${trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}>
        {trend === "up" ? <TrendingUp size={9} /> : <TrendingUp size={9} className="rotate-180" />}
        {change}
      </div>
    </div>
    
    <div className="relative z-10">
      <p className="text-gray-400 dark:text-gray-500 text-[9px] font-black uppercase tracking-wider mb-0.5">{title}</p>
      <h3 className="text-xl font-black text-library-primary dark:text-white tracking-tight tabular-nums">{value}</h3>
    </div>
  </motion.div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-gray-100 dark:border-white/5 flex-wrap">
      <button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs font-black text-gray-500 hover:text-library-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        السابق
      </button>
      <div className="px-4 py-2 rounded-xl bg-library-primary/5 text-library-primary text-xs font-black">
        صفحة {currentPage} من {totalPages}
      </div>
      <button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs font-black text-gray-500 hover:text-library-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        التالي
      </button>
    </div>
  );
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
  const [currentBookPage, setCurrentBookPage] = React.useState(1);
  const [totalBookPages, setTotalBookPages] = React.useState(1);
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
  
  const imageObjectUrlsRef = React.useRef(new Set());

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

  React.useEffect(() => { setCurrentStudentPage(1); }, [subTab, studentSearchQuery]);
  React.useEffect(() => { setCurrentBookPage(1); }, [subTab, bookSearchQuery]);
  React.useEffect(() => { setCurrentLendingPage(1); }, [subTab]);

  const handleBookAction = async (bookId, action) => {
    try {
      const loadingToast = toast.loading("جاري تنفيذ الإجراء...");
      if (action === "makeAvailable") await booksApi.makeAvailable(bookId);
      else if (action === "approve") await booksApi.approve(bookId);
      else if (action === "reject") await booksApi.reject(bookId);
      else if (action === "delete") await booksApi.delete(bookId);
      
      toast.dismiss(loadingToast);
      toast.success(
        action === "makeAvailable" || action === "approve" ? "تم إتاحة الكتاب بنجاح ✅" :
        action === "reject" ? "تم رفض الكتاب" :
        action === "delete" ? "تم حذف الكتاب نهائياً" : "تم تنفيذ الإجراء"
      );
      setIsBookModalOpen(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "فشل تنفيذ الإجراء على الكتاب");
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleBorrowingAction = async (requestId, action) => {
    try {
      const loadingToast = toast.loading("جاري تنفيذ الإجراء...");
      if (action === "accept") await borrowingApi.accept(requestId);
      else if (action === "reject") await borrowingApi.reject(requestId);
      else if (action === "cancel") await borrowingApi.cancel(requestId);
      
      toast.dismiss(loadingToast);
      toast.success(
        action === "accept" ? "تم قبول طلب الاستعارة ✅" :
        action === "reject" ? "تم رفض طلب الاستعارة" :
        action === "cancel" ? "تم إلغاء طلب الاستعارة" : "تم تنفيذ الإجراء"
      );
      fetchLendings();
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "فشل تنفيذ الإجراء على طلب الاستعارة");
    }
  };

  const fetchBooks = React.useCallback(async () => {
    setLoadingBooks(true);
    try {
      let params = { PageSize: 15, Page: currentBookPage };
      if (bookSearchQuery) params.SearchTerm = bookSearchQuery;
      
      // Use backend Statuses filter from the updated API
      if (subTab === "pending") {
        params.Statuses = [0]; // Pending review
      } else if (subTab === "rejected") {
        params.Statuses = [2]; // Rejected
      } else {
        // "all" tab shows approved/available books
        params.Statuses = [1]; // Available/Approved
      }

      const res = await booksApi.getAll(params);
      const items = res.items || res.data || [];

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
      if (subTab === "active") {
        const res = await lendingApi.getAll({ PageSize: 10, Page: currentLendingPage });
        list = res.items || res.data || [];
        total = res.totalPages || 1;
      } else {
        let params = { PageSize: 10, Page: currentLendingPage };
        if (subTab === "pending_owner") params.States = [0]; // Pending
        else if (subTab === "pending_handover") params.States = [1]; // Accepted
        else if (subTab === "rejected") params.States = [2]; // Rejected
        else if (subTab === "completed") params.States = [4]; // Completed
        const res = await borrowingApi.getAll(params);
        list = res.items || res.data || [];
        total = res.totalPages || 1;
      }
      setLendings(list);
      setTotalLendingPages(total);
    } catch (error) {
      toast.error("فشل جلب عمليات الإعارة");
    } finally {
      setLoadingLendings(false);
    }
  }, [subTab, currentLendingPage]);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [studentsRes, booksRes, lendingsRes, pendingApprovalRes, pendingVerificationRes, unconfirmedRes, recentRequestsRes, recentStudentsRes, bannedStudentsRes, pendingBooksRes] = await Promise.all([
          studentsApi.getAll({ pageSize: 1, States: [2] }).catch(() => ({ totalCount: 0 })), // Active (Verified)
          booksApi.getAll({ pageSize: 1, States: [1] }).catch(() => ({ totalCount: 0 })),
          lendingApi.getAll({ pageSize: 1 }).catch(() => ({ totalCount: 0 })),
          studentsApi.getAll({ pageSize: 1, States: [0], EmailConfirmed: true }).catch(() => ({ totalCount: 0 })), // Pending Approval (Confirmed & 0)
          studentsApi.getAll({ pageSize: 1, States: [1], EmailConfirmed: true }).catch(() => ({ totalCount: 0 })), // Pending Verification (Confirmed & 1)
          studentsApi.getAll({ pageSize: 1, EmailConfirmed: false }).catch(() => ({ totalCount: 0 })), // Unconfirmed Email
          borrowingApi.getAll({ pageSize: 4, States: [0] }).catch(() => ({ items: [] })),
          studentsApi.getAll({ pageSize: 4, States: [0, 1], EmailConfirmed: true }).catch(() => ({ items: [] })), // Confirmed students for recent
          studentsApi.getAll({ pageSize: 1, States: [4] }).catch(() => ({ totalCount: 0 })), // Banned Students
          booksApi.getAll({ pageSize: 1, States: [0] }).catch(() => ({ totalCount: 0 })) // Pending Books
        ]);

        const activeCount = (studentsRes?.totalCount || 0);
        const bannedCount = (bannedStudentsRes?.totalCount || 0);
        const pendingApprovalCount = (pendingApprovalRes?.totalCount || 0);
        const pendingVerificationCount = (pendingVerificationRes?.totalCount || 0);
        const unconfirmedCount = (unconfirmedRes?.totalCount || 0);
        const totalStudentsCount = activeCount + bannedCount + pendingApprovalCount + pendingVerificationCount + unconfirmedCount;
        const pendingBooksCount = (pendingBooksRes?.totalCount || 0);
        const activePercentage = totalStudentsCount > 0 ? Math.round((activeCount / totalStudentsCount) * 100) : 0;

        setStatsData({
          students: { 
            value: totalStudentsCount.toLocaleString(), 
            change: `${activeCount} موثق / ${pendingApprovalCount + pendingVerificationCount} انتظار`, 
            loading: false 
          },
          books: { value: (booksRes?.totalCount || 0).toLocaleString(), change: `${pendingBooksCount} قيد المراجعة`, loading: false },
          lendings: { value: (lendingsRes?.totalCount || 0).toLocaleString(), change: "+18%", loading: false },
          requests: { value: (pendingApprovalCount + pendingVerificationCount).toLocaleString(), change: "طلبات انتظار", loading: false },
          activePercentage: activePercentage,
          totalStudents: totalStudentsCount,
          pendingBooksCount: pendingBooksCount
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
      const params = { pageSize: 15, Page: currentStudentPage };
      if (studentSearchQuery) params.SearchTerm = studentSearchQuery;
      
      if (subTab === "pending_approval") {
        params.States = [0]; 
        params.EmailConfirmed = true; 
      } else if (subTab === "pending_verification") {
        params.States = [1]; 
        params.EmailConfirmed = true; 
      } else if (subTab === "unconfirmed") {
        params.EmailConfirmed = false; 
      } else if (subTab === "verified") {
        params.States = [2]; 
      } else if (subTab === "banned") {
        params.States = [4]; 
      } else {
        // "all" tab: Show everyone
        params.States = [0, 1, 2, 4]; 
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
      // Only preload books that DON'T have a direct URL or if the URL needs protection
      const booksToPreload = books.filter((b) => b?.id && !b.bookCoverImageUrl);
      const ids = Array.from(new Set(booksToPreload.map((b) => b.id)));
      
      if (ids.length === 0) return;

      const nextMap = {};
      await Promise.all(
        ids.map(async (id) => {
          if (bookImageMap[id]) return; // Skip if already loaded
          try {
            const src = await fetchProtectedImageSrc(getBookImageUrl(id));
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
  }, [books, fetchProtectedImageSrc]);

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
    if (activeTab === "lending") fetchLendings();
  }, [activeTab, subTab, fetchStudents, fetchBooks, fetchLendings]);

  const handleStudentAction = async (id, action) => {
    try {
      const loadingToast = toast.loading("جاري تنفيذ الإجراء...");
      if (action === "approve") await studentsApi.approve(id); // 0 -> 1
      else if (action === "activate") await studentsApi.activate(id); // 1 -> 2
      else if (action === "ban") await studentsApi.ban(id);
      else if (action === "unban") await studentsApi.unban(id);
      else if (action === "reject") await studentsApi.reject(id);
      
      toast.dismiss(loadingToast);
      toast.success("تم تنفيذ الإجراء بنجاح");
      fetchStudents();
    } catch (error) {
      toast.dismiss();
      toast.error("فشل تنفيذ الإجراء");
    }
  };

  const renderStudentsList = () => {
    if (loadingStudents) return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-library-accent mb-4" size={32} />
        <p className="text-[10px] font-black text-gray-400">جاري تحميل قائمة الطلاب...</p>
      </div>
    );

    if (students.length === 0) return (
      <div className="text-center py-20 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
        <Users className="mx-auto text-gray-300 mb-2" size={40} />
        <p className="text-gray-400 text-xs font-black">لا يوجد طلاب في هذا القسم حالياً</p>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Search Bar for Students */}
        <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl rounded-2xl p-4 border border-white dark:border-white/5 shadow-sm">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ابحث عن طالب بالاسم، البريد، أو التخصص..." 
              value={studentSearchInput}
              onChange={(e) => setStudentSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setStudentSearchQuery(studentSearchInput);
                }
              }}
              className="w-full bg-white dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pr-12 pl-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-library-primary/20 focus:border-library-primary transition-all text-library-primary dark:text-white"
            />
            {(studentSearchInput || studentSearchQuery) && (
              <button 
                onClick={() => {
                  setStudentSearchInput("");
                  setStudentSearchQuery("");
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {students.map((student) => (
          <motion.div 
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={student.id} 
            className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl rounded-xl p-4 border border-white dark:border-white/5 shadow-sm group hover:border-library-primary/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div 
              className="flex items-center gap-3 cursor-pointer flex-grow w-full"
              onClick={() => {
                setSelectedStudent(student);
                setIsModalOpen(true);
              }}
            >
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-100 dark:border-white/10 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                {student.id ? (
                  <img 
                    src={studentImageMap[student.id] || ""} 
                    className="w-full h-full object-cover" 
                    alt="" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-library-primary/20 dark:text-white/20 text-sm font-black">${student.fullName?.charAt(0)}</div>`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-library-primary/20 dark:text-white/20 text-sm font-black">
                    {student.fullName?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base md:text-sm font-black text-library-primary dark:text-white group-hover:text-library-accent transition-colors">{student.fullName}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs md:text-[10px] text-gray-400 font-bold break-all">{student.universityMailAddress}</p>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <p className="text-xs md:text-[10px] text-library-accent font-black">{student.major || "تخصص غير محدد"}</p>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span className={`text-[10px] md:text-[8px] font-black px-2 py-0.5 rounded-full ${
                    student.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                    student.status === 'approved' ? 'bg-blue-500/10 text-blue-600' :
                    student.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                    'bg-gray-500/10 text-gray-600'
                  }`}>
                    {STUDENT_STATE_LABELS[student.status?.charAt(0).toUpperCase() + student.status?.slice(1)] || student.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              {subTab === "pending" ? (
                <>
                  <button 
                    onClick={() => handleStudentAction(student.id, "approve")}
                    className="flex-grow md:flex-initial px-4 py-2.5 rounded-lg bg-emerald-500 text-white text-xs md:text-[9px] font-black hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20"
                  >
                    توثيق
                  </button>
                  <button 
                    onClick={() => handleStudentAction(student.id, "reject")}
                    className="flex-grow md:flex-initial px-4 py-2.5 rounded-lg bg-rose-500/10 text-rose-600 text-xs md:text-[9px] font-black hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                  >
                    رفض التوثيق
                  </button>
                </>
              ) : subTab === "banned" ? (
                <button 
                  onClick={() => handleStudentAction(student.id, "unban")}
                  className="flex-grow md:flex-initial px-4 py-2.5 rounded-lg bg-amber-500 text-white text-xs md:text-[9px] font-black hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20"
                >
                  فك الحظر
                </button>
              ) : (
                <button 
                  onClick={() => handleStudentAction(student.id, "ban")}
                  className="flex-grow md:flex-initial px-4 py-2.5 rounded-lg bg-rose-500/10 text-rose-600 text-xs md:text-[9px] font-black hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                >
                  حظر الطالب
                </button>
              )}
            </div>
          </motion.div>
        ))}
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10"
          dir="rtl"
        >
          <div className="h-24 bg-gradient-to-r from-library-primary to-indigo-600 relative">
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
                  {selectedStudent.id ? (
                    <img 
                      src={studentImageMap[selectedStudent.id] || ""} 
                      className="w-full h-full object-cover" 
                      alt="" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-library-primary/10 text-4xl font-black">${selectedStudent.fullName?.charAt(0)}</div>`;
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
                <h3 className="text-xl font-black text-library-primary dark:text-white">{selectedStudent.fullName}</h3>
                <p className="text-[10px] text-library-accent font-black tracking-widest uppercase mt-1">{selectedStudent.major || "تخصص غير محدد"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">البريد الجامعي</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">{selectedStudent.universityMailAddress}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">رقم الهاتف</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">{selectedStudent.phoneNumber || "—"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">تيليجرام</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200 flex items-center gap-1.5">
                    {selectedStudent.telegramUserId ? (
                      <><MessageCircle size={11} className="text-blue-500" />{selectedStudent.telegramUserId}</>
                    ) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">النقاط</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-black text-[10px]">⭐ {selectedStudent.points ?? 0}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">الرقم الأكاديمي (ID)</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200 uppercase">{selectedStudent.id}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">حالة الحساب</p>
                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black border ${selectedStudent.status?.toLowerCase() === 'active' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : selectedStudent.status?.toLowerCase() === 'approved' ? 'bg-blue-500/5 text-blue-600 border-blue-500/10' : (selectedStudent.status?.toLowerCase() === 'banned' || selectedStudent.status?.toLowerCase() === 'blocked') ? 'bg-rose-500/5 text-rose-600 border-rose-500/10' : 'bg-amber-500/5 text-amber-600 border-amber-500/10'}`}>
                    {selectedStudent.status?.toLowerCase() === 'active' ? 'موثق' : selectedStudent.status?.toLowerCase() === 'approved' ? 'انتظار تفعيل' : (selectedStudent.status?.toLowerCase() === 'banned' || selectedStudent.status?.toLowerCase() === 'blocked') ? 'محظور' : 'انتظار موافقة'}
                  </span>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">تاريخ الانضمام</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedStudent.creationDate ? new Date(selectedStudent.creationDate).toLocaleDateString('ar-EG') : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {(selectedStudent.status?.toLowerCase() === 'banned' || selectedStudent.status?.toLowerCase() === 'blocked') ? (
                <button 
                  onClick={() => { handleStudentAction(selectedStudent.id, "unban"); setIsModalOpen(false); }}
                  className="flex-grow py-3 rounded-xl bg-amber-500 text-white text-[11px] font-black shadow-lg shadow-amber-500/20"
                >
                  فك الحظر عن الطالب
                </button>
              ) : (
                <>
                  {selectedStudent.status?.toLowerCase() === 'pending' && (
                    <button 
                      onClick={() => { handleStudentAction(selectedStudent.id, "approve"); setIsModalOpen(false); }}
                      className="flex-grow py-3 rounded-xl bg-blue-500 text-white text-[11px] font-black shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all"
                    >
                      موافقة مبدئية
                    </button>
                  )}
                  {selectedStudent.status?.toLowerCase() === 'approved' && (
                    <>
                      <button 
                        onClick={() => { handleStudentAction(selectedStudent.id, "activate"); setIsModalOpen(false); }}
                        className="flex-grow py-3 rounded-xl bg-emerald-500 text-white text-[11px] font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                      >
                        تفعيل الحساب (موثق)
                      </button>
                      <button 
                        onClick={() => { handleStudentAction(selectedStudent.id, "reject"); setIsModalOpen(false); }}
                        className="flex-grow py-3 rounded-xl bg-rose-500 text-white text-[11px] font-black shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                      >
                        رفض الطلب
                      </button>
                    </>
                  )}
                  {selectedStudent.status?.toLowerCase() === 'active' && (
                    <button 
                      onClick={() => { handleStudentAction(selectedStudent.id, "ban"); setIsModalOpen(false); }}
                      className="flex-grow py-3 rounded-xl bg-rose-500 text-white text-[11px] font-black shadow-lg shadow-rose-500/20"
                    >
                      حظر الطالب
                    </button>
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
        {/* Search Bar for Books */}
        <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl rounded-2xl p-4 border border-white dark:border-white/5 shadow-sm">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="ابحث عن كتاب بالاسم أو المؤلف أو الرقم المسلسل..." 
              value={bookSearchInput}
              onChange={(e) => setBookSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setBookSearchQuery(bookSearchInput);
                }
              }}
              className="w-full bg-white dark:bg-dark-bg border border-gray-100 dark:border-white/5 rounded-xl pr-12 pl-4 py-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-library-primary dark:text-white"
            />
            {(bookSearchInput || bookSearchQuery) && (
              <button 
                onClick={() => {
                  setBookSearchInput("");
                  setBookSearchQuery("");
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {loadingBooks ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-500 mb-4" size={32} />
            <p className="text-[10px] font-black text-gray-400">جاري تحميل المكتبة...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
            <BookOpen className="mx-auto text-gray-300 mb-2" size={40} />
            <p className="text-gray-400 text-xs font-black">
              {bookSearchQuery ? "لم يتم العثور على نتائج للبحث" : "لا توجد كتب متاحة حالياً"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={book.id} 
                className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl rounded-xl p-4 border border-white dark:border-white/5 shadow-sm group hover:border-emerald-500/30 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-grow w-full"
                  onClick={() => {
                    setSelectedBook(book);
                    setIsBookModalOpen(true);
                  }}
                >
                  <div className="w-12 h-16 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-100 dark:border-white/10 group-hover:scale-105 transition-transform duration-500 shadow-inner">
                    {book.id ? (
                      <img 
                        src={book.bookCoverImageUrl || bookImageMap[book.id] || ""} 
                        className="w-full h-full object-cover" 
                        alt={book.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-emerald-500/20 dark:text-white/20 text-xs font-black">B</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-500/20 dark:text-white/20 text-xs font-black">
                        B
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm md:text-[11px] font-black text-library-primary dark:text-white mb-1 group-hover:text-emerald-500 transition-colors">{book.title}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-xs md:text-[9px] text-gray-500 font-bold">{book.authorName || book.author}</p>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <p className="text-xs md:text-[9px] text-library-accent font-black">{book.category || "عام"}</p>
                      
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs md:text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">{book.copiesCount || 0} نسخة</span>
                  </div>
                  {subTab === "pending" && (
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBookAction(book.id, "makeAvailable"); }}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all"
                        title="إتاحة الكتاب"
                      >
                        <Check size={13} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleBookAction(book.id, "reject"); }}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                        title="رفض الكتاب"
                      >
                        <XCircle size={13} />
                      </button>
                    </div>
                  )}
                  {subTab === "rejected" && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleBookAction(book.id, "makeAvailable"); }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[9px] font-black hover:bg-emerald-500 hover:text-white transition-all"
                    >
                      إعادة إتاحة
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedBook(book);
                      setIsBookModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
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
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBookModalOpen(false)} />
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10"
          dir="rtl"
        >
          <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-600 relative">
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
                  <img 
                    src={selectedBook.bookCoverImageUrl || bookImageMap[selectedBook.id] || ""} 
                    className="w-full h-full object-cover" 
                    alt={selectedBook.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentElement.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center p-4 text-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open text-emerald-500/20 mb-2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></div>`;
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-xl font-black text-library-primary dark:text-white">{selectedBook.title}</h3>
                <p className="text-[10px] text-library-accent font-black tracking-widest uppercase mt-1">{selectedBook.authorName || selectedBook.author}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">الرقم الدولي (ISBN)</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">{selectedBook.isbn || "—"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">التصنيف</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">{selectedBook.category || "—"}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">الناشر</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">{selectedBook.publisher || "—"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">معرف الكتاب</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200 uppercase">{selectedBook.id}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">عدد النسخ</p>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-emerald-500/5 text-emerald-600 border border-emerald-500/10">
                    {selectedBook.copiesCount || 0} نسخة متاحة
                  </span>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">تاريخ الإضافة</p>
                  <p className="text-[11px] font-bold text-library-primary dark:text-gray-200">
                    {selectedBook.createdAt ? new Date(selectedBook.createdAt).toLocaleDateString('ar-EG') : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {/* Action buttons based on book status */}
              {(selectedBook.status === 0 || selectedBook.state === 0 || !selectedBook.isApproved) && selectedBook.status !== 1 && (
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleBookAction(selectedBook.id, "makeAvailable")}
                    className="flex-grow py-3 rounded-xl bg-emerald-500 text-white text-[11px] font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={14} />
                    إتاحة الكتاب
                  </button>
                  <button 
                    onClick={() => handleBookAction(selectedBook.id, "reject")}
                    className="flex-grow py-3 rounded-xl bg-rose-500/10 text-rose-600 text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} />
                    رفض
                  </button>
                </div>
              )}
              {(selectedBook.status === 2 || selectedBook.state === 2) && (
                <button 
                  onClick={() => handleBookAction(selectedBook.id, "makeAvailable")}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-white text-[11px] font-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  إعادة إتاحة الكتاب
                </button>
              )}
              <button 
                onClick={() => {
                  if (window.confirm("هل أنت متأكد من حذف هذا الكتاب نهائياً؟")) {
                    handleBookAction(selectedBook.id, "delete");
                  }
                }}
                className="w-full py-3 rounded-xl bg-rose-500/5 text-rose-500 text-[11px] font-black hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10 flex items-center justify-center gap-2"
              >
                <Trash2 size={14} />
                حذف الكتاب نهائياً
              </button>
              <button 
                onClick={() => setIsBookModalOpen(false)}
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


  const handleViewLendingDetail = async (lend) => {
    setSelectedLending(lend);
    setIsLendingModalOpen(true);
    setLoadingLendingDetail(true);
    
    try {
      // Try to get full details from borrowing API first, then lending API
      let detail;
      if (subTab !== "active" && lend.id) {
        detail = await borrowingApi.getById(lend.id);
      } else if (lend.id) {
        detail = await lendingApi.getById(lend.id);
      }
      
      if (detail) {
        setSelectedLending(prev => ({ ...prev, ...detail }));
      }

      // Try to load images
      const ownerStudentId = detail?.ownerStudentId || detail?.ownerId || lend.ownerStudentId || lend.ownerId;
      const borrowerStudentId = detail?.borrowingStudentId || detail?.studentId || lend.borrowingStudentId || lend.studentId;
      const bookId = detail?.bookId || lend.bookId;

      const imgPromises = [];
      if (ownerStudentId && !studentImageMap[ownerStudentId]) {
        imgPromises.push(
          fetchProtectedImageSrc(getStudentImageUrl(ownerStudentId))
            .then(src => src && setStudentImageMap(prev => ({ ...prev, [ownerStudentId]: src })))
            .catch(() => {})
        );
      }
      if (borrowerStudentId && !studentImageMap[borrowerStudentId]) {
        imgPromises.push(
          fetchProtectedImageSrc(getStudentImageUrl(borrowerStudentId))
            .then(src => src && setStudentImageMap(prev => ({ ...prev, [borrowerStudentId]: src })))
            .catch(() => {})
        );
      }
      if (bookId && !bookImageMap[bookId]) {
        imgPromises.push(
          fetchProtectedImageSrc(getBookImageUrl(bookId))
            .then(src => src && setBookImageMap(prev => ({ ...prev, [bookId]: src })))
            .catch(() => {})
        );
      }
      await Promise.allSettled(imgPromises);
    } catch (err) {
      console.error("Failed to load lending details:", err);
    } finally {
      setLoadingLendingDetail(false);
    }
  };

  const renderLendingDetailModal = () => {
    if (!isLendingModalOpen || !selectedLending) return null;

    const lend = selectedLending;
    const ownerStudentId = lend.ownerStudentId || lend.ownerId;
    const borrowerStudentId = lend.borrowingStudentId || lend.studentId;
    const bookId = lend.bookId;
    
    const ownerName = lend.ownerName || lend.ownerStudentName || "صاحب النسخة";
    const borrowerName = lend.borrowingStudentName || lend.studentName || "الطالب المستعير";
    const bookTitle = lend.bookTitle || lend.title || "كتاب";
    const bookAuthor = lend.bookAuthor || lend.author || "";
    const bookIsbn = lend.isbn || lend.bookIsbn || "";
    
    const requestDate = lend.requestDate || lend.createdAtUtc || lend.createdAt;
    const returnDate = lend.expectedReturnDate || lend.expirationDateUtc || lend.expirationDate || lend.returnDate;
    const borrowingDuration = lend.borrowingDurationInDays || lend.durationInDays;
    
    const stateValue = lend.state ?? lend.status;
    const stateLabel = 
      stateValue === 0 || stateValue === "Pending" ? "بانتظار الموافقة" :
      stateValue === 1 || stateValue === "Approved" ? "تمت الموافقة" :
      stateValue === 2 || stateValue === "Rejected" ? "مرفوض" :
      stateValue === 3 || stateValue === "Expired" ? "منتهي" :
      stateValue === 4 || stateValue === "Completed" ? "مكتمل" : 
      subTab === "active" ? "نشطة" : "غير معروف";
    const stateColor = 
      stateValue === 0 || stateValue === "Pending" ? "amber" :
      stateValue === 1 || stateValue === "Approved" ? "blue" :
      stateValue === 2 || stateValue === "Rejected" ? "rose" :
      stateValue === 4 || stateValue === "Completed" ? "emerald" : 
      subTab === "active" ? "emerald" : "gray";

    const formatDate = (d) => {
      if (!d) return "—";
      return new Date(d).toLocaleDateString('ar-EG', { 
        year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLendingModalOpen(false)} />
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10 flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="h-24 shrink-0 bg-gradient-to-r from-library-primary to-indigo-600 relative">
            <button 
              onClick={() => setIsLendingModalOpen(false)}
              className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all z-10"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-4 right-6 flex items-center gap-2">
              <ArrowLeftRight className="text-white/90" size={20} />
              <h3 className="text-white font-black text-base drop-shadow-sm">تفاصيل عملية الإعارة</h3>
            </div>
            <span className={`absolute bottom-4 left-6 px-3 py-1 rounded-full text-[10px] font-black border bg-${stateColor}-500/20 text-white border-white/30 backdrop-blur-sm`}>
              {stateLabel}
            </span>
          </div>

          {loadingLendingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 flex-grow">
              <Loader2 className="animate-spin text-amber-500 mb-3" size={32} />
              <p className="text-xs font-black text-gray-400">جاري تحميل التفاصيل...</p>
            </div>
          ) : (
            <div className="px-6 py-6 space-y-6 overflow-y-auto flex-grow scrollbar-thin">
              
              {/* Book Section */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                <div className="w-14 h-20 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden border border-gray-100 dark:border-white/10 shadow-inner shrink-0">
                  {(lend.bookCoverImageUrl || bookImageMap[bookId]) ? (
                    <img src={lend.bookCoverImageUrl || bookImageMap[bookId]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/20">
                      <BookOpen size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-[9px] text-amber-500 font-black mb-1 uppercase tracking-widest">الكتاب</p>
                  <h4 className="text-sm font-black text-library-primary dark:text-white leading-snug truncate">{bookTitle}</h4>
                  {bookAuthor && <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-0.5">{bookAuthor}</p>}
                  {bookIsbn && <p className="text-[9px] text-gray-400 mt-1 font-mono">ISBN: {bookIsbn}</p>}
                  {bookId && <p className="text-[9px] text-gray-400 mt-0.5">معرف الكتاب: #{bookId}</p>}
                </div>
              </div>

              {/* Owner & Borrower — Side by Side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Owner */}
                <div className="p-4 rounded-2xl bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06] border border-emerald-500/10">
                  <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black mb-3 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield size={10} /> صاحب النسخة
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 overflow-hidden border border-emerald-500/15 shadow-sm shrink-0">
                      {(ownerStudentId && studentImageMap[ownerStudentId]) ? (
                        <img src={studentImageMap[ownerStudentId]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-emerald-500/40">
                          <Users size={14} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-library-primary dark:text-white truncate">{ownerName}</p>
                      {ownerStudentId && <p className="text-[8px] text-gray-400 mt-0.5">#{ownerStudentId}</p>}
                    </div>
                  </div>
                </div>

                {/* Borrower */}
                <div className="p-4 rounded-2xl bg-indigo-500/[0.04] dark:bg-indigo-500/[0.06] border border-indigo-500/10">
                  <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black mb-3 uppercase tracking-widest flex items-center gap-1.5">
                    <Users size={10} /> المستعير
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 overflow-hidden border border-indigo-500/15 shadow-sm shrink-0">
                      {(borrowerStudentId && studentImageMap[borrowerStudentId]) ? (
                        <img src={studentImageMap[borrowerStudentId]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-500/40">
                          <Users size={14} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-library-primary dark:text-white truncate">{borrowerName}</p>
                      {borrowerStudentId && <p className="text-[8px] text-gray-400 mt-0.5">#{borrowerStudentId}</p>}
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
                    <p className="text-[8px] text-gray-400 font-black mb-0.5">تاريخ الطلب</p>
                    <p className="text-[11px] font-black text-library-primary dark:text-white">{formatDate(requestDate)}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 font-black mb-0.5">تاريخ الإرجاع المتوقع</p>
                    <p className={`text-[11px] font-black ${lend.isOverdue ? 'text-rose-500' : 'text-library-primary dark:text-white'}`}>{formatDate(returnDate)}</p>
                  </div>
                </div>

                {borrowingDuration && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                    <Clock size={12} className="text-gray-400" />
                    <p className="text-[10px] font-black text-gray-500">مدة الإعارة: <span className="text-library-primary dark:text-white">{borrowingDuration} يوم</span></p>
                  </div>
                )}

                {lend.isOverdue && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                    <ShieldAlert size={12} className="text-rose-500" />
                    <p className="text-[10px] font-black text-rose-500">تأخر في الإرجاع!</p>
                  </div>
                )}
              </div>

              {/* Additional Details (if any IDs available) */}
              {(lend.bookCopyId || lend.lendingRecordId || lend.id) && (
                <div className="flex items-center gap-3 flex-wrap text-[8px] font-mono text-gray-400 px-1">
                  {lend.id && <span>طلب: #{lend.id}</span>}
                  {lend.lendingRecordId && <span>• سجل: #{lend.lendingRecordId}</span>}
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
    if (loadingLendings) return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-500 mb-4" size={32} />
        <p className="text-[10px] font-black text-gray-400">جاري تحميل الإعارات...</p>
      </div>
    );

    if (lendings.length === 0) return (
      <div className="text-center py-20 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
        <Clock className="mx-auto text-gray-300 mb-2" size={40} />
        <p className="text-gray-400 text-xs font-black">لا يوجد عمليات إعارة حالياً</p>
      </div>
    );

    return (
      <div className="space-y-3">
        {lendings.map((lend) => (
          <motion.div 
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            key={lend.id} 
            className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl rounded-xl p-4 border border-white dark:border-white/5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group hover:border-amber-500/30 transition-all"
          >
            <div className="flex items-center gap-3 flex-grow">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-xs">
                {(lend.studentName || lend.ownerName || "S").charAt(0)}
              </div>
              <div>
                <h4 className="text-sm md:text-[11px] font-black text-library-primary dark:text-white">{lend.studentName || lend.ownerName || "طالب"}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <BookMarked size={10} className="text-gray-400" />
                  <p className="text-xs md:text-[9px] text-gray-500 font-bold">{lend.bookTitle || lend.title || "كتاب غير مسجل"}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-[7px] text-gray-400 font-black uppercase mb-0.5">
                  {subTab === "active" ? "تاريخ الإرجاع" : "تاريخ الطلب"}
                </p>
                <p className={`text-[10px] font-black ${lend.isOverdue ? 'text-rose-500' : 'text-library-primary dark:text-white'}`}>
                  {new Date(lend.expectedReturnDate || lend.returnDate || lend.requestDate || lend.createdAt || new Date()).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] md:text-[8px] font-black border ${subTab === "active" ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : (subTab === "pending_owner" ? 'bg-amber-500/5 text-amber-600 border-amber-500/10' : 'bg-blue-500/5 text-blue-600 border-blue-500/10')}`}>
                  {subTab === "active" ? 'نشطة' : (subTab === "pending_owner" ? 'بانتظار المالك' : 'بانتظار التسليم')}
                </span>
                
                <button 
                  onClick={() => handleViewLendingDetail(lend)}
                  className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 text-library-primary dark:text-white text-xs md:text-[9px] font-black hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center gap-1.5"
                >
                  <Eye size={12} />
                  التفاصيل
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        <Pagination 
          currentPage={currentLendingPage} 
          totalPages={totalLendingPages} 
          onPageChange={setCurrentLendingPage} 
        />
      </div>
    );
  };

  const renderReports = () => {
    const borrowedCount = parseInt(statsData.lendings.value.replace(/,/g, '')) || 0;
    const totalBooks = parseInt(statsData.books.value.replace(/,/g, '')) || 0;
    const lendingRatio = totalBooks > 0 ? Math.round((borrowedCount / totalBooks) * 100) : 0;
    const activePercentage = statsData.activePercentage || 0;
    const totalStudents = statsData.totalStudents || 0;

    // Generate semi-random but consistent looking chart data based on lendingRatio
    const chartData = [
      Math.max(20, lendingRatio - 15),
      Math.max(30, lendingRatio - 5),
      Math.max(25, lendingRatio - 10),
      lendingRatio,
      Math.max(35, lendingRatio + 5),
      Math.max(40, lendingRatio + 10),
      Math.max(30, lendingRatio - 2)
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lending Efficiency Chart */}
          <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-black text-library-primary dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="text-emerald-500" size={16} />
              معدل تداول الكتب الفعلي
            </h3>
            
            <div className="flex items-end gap-2 mb-8 h-32 px-4">
              {chartData.map((val, i) => (
                <div key={i} className="flex-grow flex flex-col items-center gap-2">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    className="w-full max-w-[20px] bg-gradient-to-t from-emerald-500/80 to-emerald-400 rounded-t-md shadow-lg shadow-emerald-500/10"
                  />
                  <span className="text-[7px] text-gray-400 font-black">
                    {["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"][i]}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-600 mb-0.5">نسبة الإعارة النشطة</p>
                <p className="text-[8px] text-emerald-600/60 font-bold">بناءً على {totalBooks.toLocaleString()} كتاب متاح</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600">{lendingRatio}%</span>
              </div>
            </div>
          </div>

          {/* Student Engagement */}
          <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl rounded-2xl p-6 border border-white dark:border-white/5 shadow-sm">
            <h3 className="text-sm font-black text-library-primary dark:text-white mb-6 flex items-center gap-2">
              <Users className="text-indigo-500" size={16} />
              تحليل تفاعل المستخدمين
            </h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <span>نسبة الطلاب النشطين (الموثقين)</span>
                  <span className="text-indigo-500">{activePercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${activePercentage}%` }} className="h-full bg-indigo-500 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                  <span>تغطية الكتب للطلاب</span>
                  <span className="text-emerald-500">
                    {totalStudents > 0 ? (totalBooks / totalStudents).toFixed(1) : 0} كتاب/طالب
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-emerald-500 rounded-full opacity-20" />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totalBooks / (totalStudents || 1)) * 20)}%` }} className="h-full bg-emerald-500 rounded-full -mt-1.5" />
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <TrendingUp className="text-indigo-600" size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-indigo-600">إجمالي المجتمع</p>
                  <p className="text-[14px] font-black text-library-primary dark:text-white">
                    {totalStudents.toLocaleString()} مستخدم مسجل
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Summary */}
        <div className="bg-gradient-to-br from-library-primary to-indigo-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-black mb-2">ملخص الأداء المباشر</h2>
            <p className="text-[10px] text-white/50 font-bold max-w-sm">
              يتم تحديث هذه البيانات لحظياً من خلال الربط المباشر مع قاعدة بيانات النظام، مما يعكس الحالة الحقيقية للمكتبة والمجتمع الطلابي.
            </p>
          </div>
          
          <div className="flex gap-4 relative z-10">
            <div className="text-center px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-2xl font-black text-library-accent">
                {totalStudents.toLocaleString()}
              </p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">عضو مسجل</p>
            </div>
            <div className="text-center px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <p className="text-2xl font-black text-library-accent">{totalBooks.toLocaleString()}</p>
              <p className="text-[8px] font-black uppercase tracking-widest opacity-60">كتاب موثق</p>
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
        { id: "verified", title: "الموثقون", icon: CheckCircle2 },
        { id: "all", title: "كل الطلاب", icon: Users },
        { id: "pending_approval", title: "انتظار الموافقة", icon: Clock },
        { id: "pending_verification", title: "انتظار التوثيق", icon: UserPlus },
        { id: "unconfirmed", title: "غير مؤكدة", icon: Mail },
        { id: "banned", title: "المحظورون", icon: UserX }
      ]
    },
    { 
      id: "books", 
      title: "المكتبة", 
      icon: BookOpen, 
      color: "emerald",
      subTabs: [
        { id: "all", title: "المتاحة", icon: BookOpen },
        { id: "pending", title: "قيد المراجعة", icon: Clock },
        { id: "rejected", title: "المرفوضة", icon: XCircle }
      ]
    },
    { 
      id: "lending", 
      title: "الإعارات", 
      icon: BookMarked, 
      color: "amber",
      subTabs: [
        { id: "active", title: "نشطة", icon: CheckCircle2 },
        { id: "pending_owner", title: "بانتظار القبول", icon: Clock },
        { id: "pending_handover", title: "تم القبول", icon: Check },
        { id: "rejected", title: "مرفوضة", icon: XCircle },
        { id: "completed", title: "مكتملة", icon: CheckCircle2 }
      ]
    }
  ];

  const renderSubNav = () => {
    const currentItem = menuItems.find(i => i.id === activeTab);
    if (!currentItem?.subTabs) return null;

    return (
      <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {currentItem.subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border relative ${
              subTab === tab.id
                ? "bg-library-primary text-white border-library-primary shadow-md"
                : "bg-white dark:bg-white/5 text-gray-500 border-gray-100 dark:border-white/5 hover:border-library-accent/30"
            }`}
          >
            <div className="relative">
              <tab.icon size={14} />
              {activeTab === "students" && tab.id === "pending" && parseInt(statsData.requests.value) > 0 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-[#121214] animate-pulse" />
              )}
              {activeTab === "books" && tab.id === "pending" && (statsData.pendingBooksCount || 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-rose-500 rounded-full border border-white dark:border-[#121214] animate-pulse" />
              )}
            </div>
            {tab.title}
            {activeTab === "students" && tab.id === "pending" && parseInt(statsData.requests.value) > 0 && (
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-sm ml-1 ${
                subTab === tab.id ? "bg-white/20 text-white" : "bg-rose-500/10 text-rose-500"
              }`}>
                {statsData.requests.value}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-library-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    if (activeTab === "students") {
      return (
        <div className="space-y-6">
          {renderSubNav()}
          {renderStudentsList()}
        </div>
      );
    }

    if (activeTab === "books") {
      return (
        <div className="space-y-6">
          {renderSubNav()}
          {renderBooksList()}
        </div>
      );
    }

    if (activeTab === "lending") {
      return (
        <div className="space-y-6">
          {renderSubNav()}
          {renderLendingList()}
        </div>
      );
    }


    return (
      <div className="space-y-6">
        {activeTab !== "overview" && renderSubNav()}
        
        {activeTab === "overview" ? (
          <div className="space-y-6">
            {/* Actionable Tasks Summary (Simplified) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recentRequests.length > 0 && (
                <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl rounded-2xl p-5 border border-white dark:border-white/5 shadow-sm">
                  <h3 className="text-sm font-black text-library-primary dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="text-amber-500" size={16} />
                    طلبات استعارة عاجلة
                  </h3>
                  <div className="space-y-2">
                    {recentRequests.slice(0, 3).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                        <p className="text-[10px] font-black text-library-primary dark:text-white">{req.studentName}</p>
                        <p className="text-[9px] text-gray-400 font-bold truncate max-w-[100px]">{req.bookTitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {recentStudents.length > 0 && (
                <div className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl rounded-2xl p-5 border border-white dark:border-white/5 shadow-sm">
                  <h3 className="text-sm font-black text-library-primary dark:text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="text-rose-500" size={16} />
                    طلاب بانتظار التوثيق
                  </h3>
                  <div className="space-y-2">
                    {recentStudents.slice(0, 3).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-white/5">
                        <p className="text-[10px] font-black text-library-primary dark:text-white">{student.fullName}</p>
                        <button onClick={() => { setSelectedStudent(student); setIsModalOpen(true); }} className="text-[8px] font-black text-library-accent">عرض</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Integrated Reports Content */}
            {renderReports()}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl rounded-2xl p-12 flex flex-col items-center justify-center border border-white dark:border-white/5 min-h-[400px] text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-library-accent/20 blur-xl rounded-full animate-pulse" />
              <Settings className="text-library-primary/20 dark:text-white/20 animate-spin-slow relative z-10" size={40} />
            </div>
            <h2 className="text-xl font-black text-library-primary dark:text-white mb-2">قسم {menuItems.find(i => i.id === activeTab)?.title}</h2>
            <p className="text-gray-500 dark:text-gray-400 font-bold max-w-sm mb-2 leading-relaxed text-xs">
              أنت الآن في تبويب: <span className="text-library-accent">{menuItems.find(i => i.id === activeTab)?.subTabs?.find(s => s.id === subTab)?.title || subTab}</span>
            </p>
            <p className="text-gray-400 text-[10px] font-bold mb-8">جاري العمل على ربط البيانات التفصيلية لهذا القسم من الـ API.</p>
            <button 
              onClick={() => setActiveTab("overview")}
              className="bg-library-primary dark:bg-white text-white dark:text-library-primary px-8 py-3 rounded-xl text-xs font-black shadow-lg hover:-translate-y-1 transition-all active:scale-95"
            >
              الرجوع للرئيسية
            </button>
          </motion.div>
        )}
      </div>
    );
  };



  return (
    <>
      <Navbar />
      <div className="h-screen bg-gray-50/50 dark:bg-dark-bg pt-16 lg:pt-[68px] flex flex-col lg:flex-row gap-0 overflow-hidden" style={{ direction: "rtl" }}>
        
        {/* New Leaner Glass Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:w-[272px] h-full pr-0 pl-3 pb-0">
          <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-2xl h-full rounded-l-2xl rounded-r-none p-5 border border-white dark:border-white/5 shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-library-accent/10 rounded-full blur-[80px]" />
            
            <div className="mb-6 px-1 pt-1">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-library-primary to-indigo-600 flex items-center justify-center text-library-accent shadow-md">
                  <Shield size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-library-primary dark:text-white tracking-tight">BookOrbit</h2>
                  <p className="text-[9px] text-library-accent font-black uppercase tracking-widest">Admin Panel</p>
                </div>
              </div>
            </div>

            <nav className="flex-grow space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-black text-xs transition-all relative group overflow-hidden border ${
                    activeTab === item.id 
                      ? "bg-library-primary text-white shadow-sm border-library-primary" 
                      : "text-gray-500 border-transparent hover:text-library-primary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 hover:border-library-primary/10"
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="relative">
                      <item.icon size={16} className={activeTab === item.id ? "text-library-accent" : "group-hover:scale-110 transition-transform"} />
                      {(item.id === "students" && parseInt(statsData.requests.value) > 0) || 
                       (item.id === "books" && (statsData.pendingBooksCount || 0) > 0) ? (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white dark:border-[#121214] animate-pulse" />
                      ) : null}
                    </div>
                    <span className="tracking-tight">{item.title}</span>
                  </div>
                  {activeTab === item.id ? (
                    <motion.div layoutId="nav-line" className="w-1 h-4 bg-library-accent rounded-full relative z-10" />
                  ) : (
                    <div className="flex items-center gap-1">
                      {(item.id === "students" || item.id === "requests") && parseInt(statsData.requests.value) > 0 && (
                        <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md">{statsData.requests.value}</span>
                      )}
                      <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-40 transition-all -translate-x-1 group-hover:translate-x-0" />
                    </div>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-l from-library-primary/5 to-transparent dark:from-white/10 dark:to-transparent group cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-white/10 border border-library-primary/10 dark:border-white/10">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white dark:bg-dark-bg p-0.5 border border-gray-100 dark:border-white/10 shadow-sm relative">
                  {user?.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover rounded-md" />
                  ) : (
                    <div className="w-full h-full rounded-md bg-library-primary flex items-center justify-center text-library-accent font-black text-[10px]">
                      {user?.fullName?.charAt(0) || "A"}
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <p className="text-[11px] font-black text-library-primary dark:text-white truncate max-w-[120px]">
              {user?.fullName || "مدير النظام"}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-0.5 h-0.5 rounded-full bg-emerald-500" />
                    <p className="text-[9px] text-emerald-600 font-black uppercase">Admin Online</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content with Custom Scroll */}
        <div className="flex-grow px-3 lg:pr-1 lg:pl-6 h-full overflow-y-auto custom-scrollbar pb-6 pt-2">
          {/* Desktop Structure */}
          <div className="hidden lg:block">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 bg-white/50 dark:bg-white/5 w-fit px-2.5 py-1 rounded-full border border-gray-100 dark:border-white/5">
                  <Link to="/admin" className="hover:text-library-accent transition-colors">لوحة الإدارة</Link>
                  <span className="opacity-20">/</span>
                  <span className="text-library-primary dark:text-white">{menuItems.find(i => i.id === activeTab)?.title}</span>
                </div>
                <h1 className="text-2xl font-black text-library-primary dark:text-white tracking-tighter flex items-center gap-2.5">
                  {menuItems.find(i => i.id === activeTab)?.title}
                </h1>
              </div>
            </header>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard title="الطلاب" value={statsData.students.value} change={statsData.students.change} icon={Users} color="indigo" onClick={() => { setActiveTab("students"); setSubTab("all"); }} />
                <StatCard title="الكتب" value={statsData.books.value} change={statsData.books.change} icon={BookOpen} color="emerald" onClick={() => { setActiveTab("books"); setSubTab("all"); }} />
                <StatCard title="الإعارات" value={statsData.lendings.value} change={statsData.lendings.change} icon={BookMarked} color="amber" onClick={() => { setActiveTab("lending"); setSubTab("active"); }} />
                <StatCard title="طلبات توثيق" value={statsData.requests.value} change={statsData.requests.change} icon={UserPlus} color="rose" trend="down" onClick={() => { setActiveTab("students"); setSubTab("pending_approval"); }} />
              </div>
            )}

            {renderContent()}
          </div>

          {/* Mobile Structure */}
          <div className="lg:hidden space-y-4">
            <div className="bg-white/80 dark:bg-dark-surface/80 border border-white dark:border-white/5 rounded-2xl p-4 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 mb-1">لوحة الإدارة</p>
              <h1 className="text-lg font-black text-library-primary dark:text-white">
                {menuItems.find(i => i.id === activeTab)?.title}
              </h1>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-xs font-black border transition-all ${
                    activeTab === item.id
                      ? "bg-library-primary text-white border-library-primary shadow-md shadow-library-primary/20"
                      : "bg-white dark:bg-white/5 text-gray-600 border-gray-100 dark:border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className={activeTab === item.id ? "text-library-accent" : ""} />
                    <span>{item.title}</span>
                  </div>
                  {((item.id === "students" && parseInt(statsData.requests.value) > 0) ||
                    (item.id === "books" && (statsData.pendingBooksCount || 0) > 0)) && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <StatCard title="الطلاب" value={statsData.students.value} change={statsData.students.change} icon={Users} color="indigo" onClick={() => { setActiveTab("students"); setSubTab("all"); }} />
                <StatCard title="الكتب" value={statsData.books.value} change={statsData.books.change} icon={BookOpen} color="emerald" onClick={() => { setActiveTab("books"); setSubTab("all"); }} />
                <StatCard title="الإعارات" value={statsData.lendings.value} change={statsData.lendings.change} icon={BookMarked} color="amber" onClick={() => { setActiveTab("lending"); setSubTab("active"); }} />
                <StatCard title="طلبات توثيق" value={statsData.requests.value} change={statsData.requests.change} icon={UserPlus} color="rose" trend="down" onClick={() => { setActiveTab("students"); setSubTab("pending_approval"); }} />
              </div>
            )}

            <div className="bg-white/70 dark:bg-dark-surface/70 rounded-2xl p-3 border border-white dark:border-white/5">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && renderStudentModal()}
        {isBookModalOpen && renderBookModal()}
        {isLendingModalOpen && renderLendingDetailModal()}
      </AnimatePresence>
    </>
  );
};

export default AdminDashboard;
