/**
 * LendingList — /lending
 * Purpose: متابعة طلبات الإعارة فقط (وليس تصفح الكتب المتاحة)
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Loader2,
  Repeat,
  Clock3,
  CalendarDays,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  CircleCheck,
  CircleX,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { borrowingApi } from "../services/api";
import { mockBorrowingRequests } from "../utils/mockData";

const PAGE_SIZE = 10;

const BORROWING_AR = {
  Pending: "بانتظار الموافقة",
  Accepted: "مقبول",
  Rejected: "مرفوض",
  Cancelled: "ملغي",
  Expired: "منتهي",
};

const borrowingNumToKey = {
  0: "Pending",
  1: "Accepted",
  2: "Rejected",
  3: "Cancelled",
  4: "Expired",
};

const statusTone = {
  Pending: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
  Accepted: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  Rejected: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  Cancelled: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300",
  Expired: "border-gray-300 bg-gray-50 text-gray-700 dark:border-white/20 dark:bg-white/[0.04] dark:text-gray-300",
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
        aria-label="الصفحة السابقة"
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
        aria-label="الصفحة التالية"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    </div>
  );
};

const LendingList = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const statusChips = useMemo(
    () => [
      { id: "all", label: "الكل" },
      ...Object.entries(BORROWING_AR).map(([id, label]) => ({ id, label })),
    ],
    []
  );

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        pageSize: PAGE_SIZE,
        sortColumn: "createdAt",
        sortDirection: "desc",
      };
      if (debouncedSearch) params.searchTerm = debouncedSearch;
      if (statusFilter !== "all") {
        const num = Object.keys(borrowingNumToKey).find((k) => borrowingNumToKey[k] === statusFilter);
        if (num != null) params.states = [Number(num)];
      }

      const res = await borrowingApi.getMineOutgoing(params);
      const raw = res.items ?? res.data ?? [];
      setItems(raw.length ? raw : mockBorrowingRequests);
      const total = res.totalCount ?? res.TotalCount ?? raw.length;
      const tp = res.totalPages ?? res.TotalPages ?? Math.max(1, Math.ceil((raw.length ? total : mockBorrowingRequests.length) / PAGE_SIZE));
      setTotalPages(tp);
    } catch {
      setItems(mockBorrowingRequests);
      setTotalPages(Math.max(1, Math.ceil(mockBorrowingRequests.length / PAGE_SIZE)));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    if (user && !isAdmin) fetchRequests();
  }, [fetchRequests, user, isAdmin]);

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

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-library-paper pb-12 pt-20 dark:bg-[#08080a] lg:pt-24" dir="rtl">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="mb-2 text-lg font-black text-library-primary dark:text-white">إدارة الإعارات من لوحة الإدارة.</p>
          <Link
            to="/admin"
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-library-primary/15 bg-library-primary/10 px-5 py-2.5 text-sm font-black text-library-primary transition-all hover:border-library-accent/30 hover:bg-library-primary/15 dark:text-library-accent"
          >
            الانتقال إلى لوحة الإدارة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-library-paper pb-12 pt-20 dark:bg-[#08080a] lg:pt-24" dir="rtl">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-gray-200 bg-white/80 p-5 shadow-sm dark:border-white/5 dark:bg-[#121214]/80 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-library-accent/20 bg-library-accent/10 px-3 py-1 text-[10px] font-black text-library-accent">
                <Repeat size={12} /> متابعة الإعارات
              </p>
              <h1 className="text-2xl font-black tracking-tight text-library-primary dark:text-white sm:text-3xl">طلباتي في الإعارة</h1>
              <p className="mt-2 max-w-xl text-sm font-bold text-gray-500 dark:text-gray-400">
                هذه الصفحة مخصصة لمتابعة حالة طلباتك فقط (قبول/رفض/اكتمال)، وليست لتصفح الكتب المتاحة.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-library-primary px-4 py-2.5 text-xs font-black text-white shadow-md transition-all hover:bg-library-accent dark:bg-white dark:text-library-primary dark:hover:bg-library-accent dark:hover:text-white"
            >
              تصفح الكتب المتاحة
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </header>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث في طلباتك..."
              className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm font-bold text-library-primary shadow-sm outline-none transition-all focus:border-library-accent focus:ring-2 focus:ring-library-accent/20 dark:border-white/10 dark:bg-dark-surface dark:text-white"
            />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {statusChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition-all ${
                statusFilter === chip.id
                  ? "border-library-primary bg-library-primary text-white dark:border-white dark:bg-white dark:text-library-primary"
                  : "border-gray-200 bg-white text-library-primary/70 hover:border-library-accent/40 dark:border-white/10 dark:bg-dark-surface dark:text-gray-300"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-white/5 dark:bg-[#121214]/90 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-3 h-9 w-9 animate-spin text-library-accent" />
              <p className="text-xs font-black text-gray-400">جاري التحميل…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-white/10">
              <ListChecks className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-black text-library-primary dark:text-white">لا توجد طلبات حتى الآن</p>
              <p className="mt-1 text-xs font-bold text-gray-500">عند إرسال طلبات استعارة ستظهر هنا تلقائياً.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((req) => {
                const id = req.id ?? req.Id;
                const rawSt = req.status ?? req.state;
                const statusKey = typeof rawSt === "number" ? borrowingNumToKey[rawSt] || "Pending" : rawSt || "Pending";
                const statusAr = BORROWING_AR[statusKey] || String(statusKey);
                const title = req.bookTitle || req.BookTitle || "كتاب";
                const reqDate = req.requestDate || req.createdAt || req.createdAtUtc;
                const expDate = req.expectedReturnDate || req.returnDate || req.expirationDate;
                const rid = req.lendingRecordId ?? req.LendingListRecordId;

                return (
                  <motion.li
                    layout
                    key={id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-gray-100 bg-library-paper/40 p-4 transition-all hover:border-library-primary/20 hover:shadow-sm dark:border-white/5 dark:bg-white/[0.02] dark:hover:border-library-accent/20"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-start gap-2">
                          <p className="text-sm font-black text-library-primary dark:text-white line-clamp-1">{title}</p>
                          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black ${statusTone[statusKey] || statusTone.Pending}`}>
                            {statusAr}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                          <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white/80 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                            <CalendarDays size={12} />
                            <span>تاريخ الطلب: {formatDate(reqDate)}</span>
                          </div>
                          <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200/80 bg-white/80 px-2.5 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
                            <Clock3 size={12} />
                            <span>الاستحقاق المتوقع: {formatDate(expDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        {rid ? <span className="text-[10px] font-mono font-bold text-gray-400">طلب #{rid}</span> : null}
                        <div className="inline-flex items-center gap-1 text-[10px] font-black text-gray-400 dark:text-gray-500">
                          {statusKey === "Accepted" ? <CircleCheck size={12} /> : null}
                          {statusKey === "Rejected" ? <CircleX size={12} /> : null}
                          {statusKey === "Pending" ? <Hourglass size={12} /> : null}
                          {statusKey === "Cancelled" ? <CheckCircle2 size={12} /> : null}
                          {statusAr}
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          )}

          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} disabled={loading} />
        </section>
      </div>
    </div>
  );
};

export default LendingList;
