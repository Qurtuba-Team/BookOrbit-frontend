import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Search,
  Loader2,
  RefreshCcw,
  Clock3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  User,
  Shield,
  BookX,
  CheckCircle2,
  AlertTriangle,
  ArrowDownToLine,
  Hash
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import Aurora from "../components/effects/Aurora";
import { useAuth } from "../context/AuthContext";
import { borrowingTransactionsApi } from "../services/api";
import { BORROWING_TRANSACTION_STATE_LABELS, getLabel } from "../utils/constants";

const PAGE_SIZE = 10;

// Removed local TRANSACTIONS_AR in favor of central constants

const transactionNumToKey = {
  0: "Borrowed",
  1: "Returned",
  2: "Overdue",
  3: "Lost",
};

const statusTone = {
  Borrowed: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300",
  Returned: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Overdue: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  Lost: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
};

const formatDate = (v) => {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
};

const PaginationBar = ({ page, totalPages, onChange, disabled }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-6">
      <button
        type="button"
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-library-primary transition-all hover:border-library-accent/40 disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface dark:text-white"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      <span className="min-w-[100px] text-center text-xs font-black text-library-primary/70 dark:text-gray-400">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={disabled || page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-library-primary transition-all hover:border-library-accent/40 disabled:opacity-40 dark:border-dark-border dark:bg-dark-surface dark:text-white"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
};

const TransactionCard = ({ tx, isProcessing, onReturn, onLost, isAdminView }) => {
  const id = tx.id ?? tx.Id;
  const rawSt = tx.status ?? tx.state;
  const statusKey = typeof rawSt === "number" ? transactionNumToKey[rawSt] || "Borrowed" : rawSt || "Borrowed";
  const statusAr = getLabel(BORROWING_TRANSACTION_STATE_LABELS, statusKey);
  const title = tx.bookTitle || tx.BookTitle || "كتاب غير معروف";
  
  const borrowerName = tx.borrowerStudentName || tx.studentName || tx.borrowerName || "مستعير";
  const lenderName = tx.lenderStudentName || tx.ownerName || "المالك";
  
  const expDate = tx.expectedReturnDate || tx.ExpectedReturnDate;
  const actDate = tx.actualReturnDate || tx.ActualReturnDate;
  
  const processing = isProcessing === id;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex flex-col md:flex-row gap-5 md:items-center justify-between rounded-2xl border border-library-primary/10 bg-white/80 p-5 transition-all duration-300 hover:border-library-accent/30 hover:shadow-lg hover:shadow-library-primary/5 hover:-translate-y-0.5 dark:border-white/10 dark:bg-dark-surface/80 dark:hover:border-library-accent/30"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-start gap-2">
          <p className="text-sm font-black text-library-primary dark:text-white truncate">{title}</p>
          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-black ${statusTone[statusKey] || statusTone.Borrowed}`}>
            {statusAr}
          </span>
          <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-mono font-bold text-gray-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 flex items-center gap-1">
            <Hash size={10} /> {id}
          </span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2">
          {isAdminView && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white/80 px-2 py-1 dark:border-white/10 dark:bg-white/[0.03]">
              <User size={12} className="text-amber-500" />
              <span>المالك: <strong className="text-library-primary dark:text-white font-black">{lenderName}</strong></span>
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200/80 bg-white/80 px-2 py-1 dark:border-white/10 dark:bg-white/[0.03]">
            <User size={12} className="text-library-accent" />
            <span>المستعير: <strong className="text-library-primary dark:text-white font-black">{borrowerName}</strong></span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 max-w-md">
          <div className="flex items-center gap-1.5 rounded-lg border border-library-primary/5 bg-library-primary/[0.02] px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
            <Clock3 size={14} className="opacity-60" />
            <span>الإرجاع المتوقع: {formatDate(expDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-library-primary/5 bg-library-primary/[0.02] px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
            <CalendarDays size={14} className="opacity-60" />
            <span>تاريخ الإرجاع الفعلي: {formatDate(actDate)}</span>
          </div>
        </div>
      </div>
      
      {/* الإجراءات - للطالب المستعير فقط */}
      {!isAdminView && (statusKey === "Borrowed" || statusKey === "Overdue") && (
        <div className="flex flex-wrap items-center gap-2.5 md:justify-end shrink-0 pt-4 border-t border-library-primary/10 dark:border-white/10 md:border-0 md:pt-0">
          <button
            type="button"
            disabled={processing}
            onClick={() => onReturn(id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-sm transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
          >
            {processing ? <Loader2 size={14} className="animate-spin" /> : <ArrowDownToLine size={14} />}
            إرجاع الكتاب
          </button>
          
          <button
            type="button"
            disabled={processing}
            onClick={() => onLost(id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black text-rose-700 transition-all hover:bg-rose-100 hover:border-rose-300 active:scale-95 disabled:opacity-50 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/20"
          >
            {processing ? <Loader2 size={14} className="animate-spin" /> : <BookX size={14} />}
            الإبلاغ كفقدان
          </button>
        </div>
      )}
    </motion.li>
  );
};

const BorrowingTransactions = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Admin states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState([]);
  
  // Student states
  const [searchId, setSearchId] = useState("");
  const [studentTx, setStudentTx] = useState(null);
  
  // Shared states
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchAdminTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await borrowingTransactionsApi.getAll({
        page,
        pageSize: PAGE_SIZE,
        sortColumn: "createdAt",
        sortDirection: "desc",
      });
      const raw = res.items ?? res.data ?? [];
      setItems(raw);
      const total = res.totalCount ?? res.TotalCount ?? raw.length;
      const tp = res.totalPages ?? res.TotalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
      setTotalPages(tp);
    } catch (err) {
      toast.error(err?.message || "فشل تحميل معاملات الاستعارة");
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    if (isAdmin) fetchAdminTransactions();
    else setLoading(false);
  }, [fetchAdminTransactions, isAdmin]);

  const handleStudentSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchId.trim()) {
      toast.error("يرجى إدخال رقم المعاملة للبحث");
      return;
    }
    
    setLoading(true);
    setStudentTx(null);
    try {
      const res = await borrowingTransactionsApi.getById(searchId.trim());
      if (res) {
        setStudentTx(res);
      } else {
        toast.error("لم يتم العثور على معاملة بهذا الرقم، أو لا تملك صلاحية الوصول لها.");
      }
    } catch (err) {
      setStudentTx(null);
      toast.error(err?.message || "لم يتم العثور على المعاملة");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, actionFn, successMsg) => {
    setProcessingId(id);
    const t = toast.loading("جاري التنفيذ...");
    try {
      await actionFn(id);
      toast.success(successMsg, { id: t });
      
      if (isAdmin) {
        await fetchAdminTransactions();
      } else {
        await handleStudentSearch(); // Refresh the searched item
      }
    } catch (err) {
      toast.error(err?.message || "حدث خطأ أثناء التنفيذ", { id: t });
    } finally {
      setProcessingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-library-paper dark:bg-[#08080a]" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="h-9 w-9 animate-spin text-library-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-library-paper dark:bg-[#08080a] text-library-primary dark:text-library-paper transition-colors duration-500 overflow-hidden" dir="rtl">
      <Navbar />

      <main className="relative z-10 pt-20 lg:pt-24 pb-12">
        <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
          <Aurora />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <header className="mb-8 rounded-3xl bg-white/70 dark:bg-[#121214]/70 border border-library-primary/10 dark:border-white/10 p-5 sm:p-8 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-widest">
                  {isAdmin ? <Shield size={12} /> : <RefreshCcw size={12} />}
                  {isAdmin ? "إدارة المعاملات" : "متابعة معاملاتي"}
                </div>
                <h1 className="text-2xl font-black tracking-tight text-library-primary dark:text-white sm:text-3xl mb-2">
                  معاملات الاستعارة (Transactions)
                </h1>
                <p className="max-w-xl text-sm font-medium text-library-primary/60 dark:text-gray-400 leading-relaxed">
                  {isAdmin 
                    ? "بصفتك مديراً للنظام، يمكنك تصفح ومراقبة جميع المعاملات الجارية والمنتهية بين الطلاب."
                    : "هنا يمكنك متابعة المعاملات التي قمت باستعارتها. أدخل رقم المعاملة لإرجاع الكتاب أو التبليغ عن فقدانه."}
                </p>
              </motion.div>
            </div>
          </header>

          <section className="rounded-3xl border border-library-primary/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-[#121214]/70 sm:p-8 backdrop-blur-md">
            {isAdmin ? (
              // ADMIN VIEW
              <>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="mb-3 h-9 w-9 animate-spin text-library-accent" />
                    <p className="text-xs font-black text-gray-400">جاري التحميل…</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-library-primary/20 py-20 text-center dark:border-white/10 bg-white/40 dark:bg-white/[0.02]">
                    <div className="mx-auto w-16 h-16 bg-library-primary/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <ListChecks className="h-8 w-8 text-library-primary/30 dark:text-gray-500" />
                    </div>
                    <p className="text-base font-black text-library-primary dark:text-white">لا توجد معاملات استعارة حالياً</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {items.map((tx) => (
                      <TransactionCard 
                        key={tx.id || tx.Id} 
                        tx={tx} 
                        isProcessing={processingId}
                        isAdminView={true}
                        onReturn={() => {}}
                        onLost={() => {}}
                      />
                    ))}
                  </ul>
                )}
                <PaginationBar page={page} totalPages={totalPages} onChange={setPage} disabled={loading} />
              </>
            ) : (
              // STUDENT VIEW
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleStudentSearch} className="mb-8">
                  <label className="block text-sm font-black text-library-primary dark:text-white mb-2">
                    البحث عن معاملة:
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Hash className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        placeholder="أدخل رقم المعاملة (مثال: 12345)"
                        className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 pl-4 pr-12 text-sm font-bold text-library-primary shadow-sm outline-none transition-all focus:border-library-accent focus:ring-2 focus:ring-library-accent/20 dark:border-white/10 dark:bg-dark-surface dark:text-white"
                        dir="ltr"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center rounded-2xl bg-library-primary px-6 py-3.5 text-sm font-black text-white shadow-md transition-all hover:bg-library-accent active:scale-95 disabled:opacity-50"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    </button>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 border border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/10 text-amber-700 dark:text-amber-200/80">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">
                      يتم توليد رقم المعاملة وإرساله إليك بعد أن يقوم صاحب الكتاب بقبول طلبك وتأكيد تسليمه إياك. يمكنك إرجاع الكتاب لاحقاً من هنا بإدخال هذا الرقم.
                    </p>
                  </div>
                </form>

                <AnimatePresence mode="wait">
                  {studentTx && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <h3 className="text-lg font-black text-library-primary dark:text-white mb-4">نتيجة البحث:</h3>
                      <ul className="space-y-3">
                        <TransactionCard 
                          tx={studentTx} 
                          isProcessing={processingId}
                          isAdminView={false}
                          onReturn={(id) => handleAction(id, borrowingTransactionsApi.markReturned, "تم تسجيل إرجاع الكتاب بنجاح")}
                          onLost={(id) => handleAction(id, borrowingTransactionsApi.markLost, "تم الإبلاغ عن فقدان الكتاب")}
                        />
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default BorrowingTransactions;
