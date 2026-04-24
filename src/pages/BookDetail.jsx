import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, User, Building, Hash, CopyPlus, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { booksApi, bookCopiesApi } from "../services/api";
import Navbar from "../components/common/Navbar";
import toast from "react-hot-toast";

const BOOK_COPY_CONDITIONS = {
  0: "جديد (New)",
  1: "جيد جداً (Very Good)",
  2: "مقبول (Acceptable)",
  3: "قديم/مهترئ (Worn)"
};

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isAddCopyModalOpen, setIsAddCopyModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState("");
  const [isAddingCopy, setIsAddingCopy] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await booksApi.getById(bookId);
        setBook(data);
      } catch (err) {
        setError("تعذر تحميل تفاصيل الكتاب. قد يكون الكتاب غير موجود.");
        toast.error("فشل تحميل بيانات الكتاب");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [bookId]);

  const handleAddCopySubmit = async () => {
    if (selectedCondition === "") {
      toast.error("يرجى اختيار حالة النسخة");
      return;
    }
    
    setIsAddingCopy(true);
    const toastId = toast.loading("جاري إضافة نسختك...");
    try {
      await bookCopiesApi.create(bookId, Number(selectedCondition));
      toast.success("تم تسجيل نسختك بنجاح! يمكن للطلاب الآخرين استعارتها الآن.", { id: toastId });
      setIsAddCopyModalOpen(false);
      // Optionally reload book data if it includes a copy count
      const updatedData = await booksApi.getById(bookId);
      setBook(updatedData);
    } catch (err) {
      toast.error("فشل إضافة النسخة. تأكد من أنك لم تضف نسخة مسبقاً، أو حاول لاحقاً.", { id: toastId });
    } finally {
      setIsAddingCopy(false);
    }
  };

  const renderAddCopyModal = () => {
    if (!isAddCopyModalOpen) return null;
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isAddingCopy && setIsAddCopyModalOpen(false)} />
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-[#0c0c0e] w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10 p-6"
          dir="rtl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-library-primary/10 flex items-center justify-center text-library-primary dark:text-white">
              <CopyPlus size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-library-primary dark:text-white">إضافة نسخة لهذا الكتاب</h3>
              <p className="text-[10px] text-gray-500 font-bold">حدد حالة النسخة التي تود مشاركتها.</p>
            </div>
          </div>
          
          <div className="mb-6 space-y-2">
            <label className="text-xs font-black text-library-primary dark:text-white">حالة الكتاب</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-library-accent/20 focus:border-library-accent transition-all dark:text-white"
            >
              <option value="" disabled>اختر الحالة...</option>
              {Object.entries(BOOK_COPY_CONDITIONS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => setIsAddCopyModalOpen(false)}
              disabled={isAddingCopy}
              className="px-4 py-2 rounded-lg text-xs font-black text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
            >
              إلغاء
            </button>
            <button 
              onClick={handleAddCopySubmit}
              disabled={isAddingCopy}
              className="px-4 py-2 rounded-lg text-xs font-black bg-library-primary text-white hover:bg-library-primary/90 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isAddingCopy ? <Loader2 size={14} className="animate-spin" /> : "تأكيد الإضافة"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-library-paper dark:bg-dark-bg pt-24 pb-12 flex items-center justify-center">
        <Navbar />
        <Loader2 className="animate-spin text-library-accent" size={40} />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-library-paper dark:bg-dark-bg pt-24 pb-12 flex flex-col items-center justify-center px-4 text-center">
        <Navbar />
        <AlertCircle size={60} className="text-gray-400 mb-4" />
        <h2 className="text-xl font-black text-library-primary dark:text-white mb-2">{error || "كتاب غير موجود"}</h2>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-2 bg-library-primary text-white rounded-lg font-bold hover:bg-library-primary/90 transition-all"
        >
          العودة للكتالوج
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-library-paper dark:bg-dark-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300" dir="rtl">
      <Navbar />
      
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-library-primary dark:hover:text-white mb-8 font-bold text-sm transition-colors"
        >
          <ArrowRight size={16} /> العودة للخلف
        </button>

        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-xl flex flex-col md:flex-row">
          
          {/* Cover Side */}
          <div className="w-full md:w-1/3 bg-gray-50 dark:bg-black/20 p-8 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-library-accent/5 to-transparent"></div>
            <div className="relative w-48 h-72 shadow-2xl rounded-r-xl rounded-l-sm overflow-hidden border-l border-white/20">
               {book.bookCoverImageUrl ? (
                 <img src={book.bookCoverImageUrl} alt={book.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full bg-library-primary flex items-center justify-center text-center p-4">
                   <span className="text-white font-bold">{book.title}</span>
                 </div>
               )}
            </div>
          </div>

          {/* Details Side */}
          <div className="w-full md:w-2/3 p-8 lg:p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-black text-library-primary dark:text-white leading-tight">
                  {book.title}
                </h1>
                <span className="shrink-0 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20">
                  {book.copiesCount || 0} نسخة متاحة
                </span>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 mb-8 text-sm">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <User size={16} className="text-library-accent" />
                  <span className="font-bold">{book.author || book.authorName}</span>
                </div>
                {book.category && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <BookOpen size={16} className="text-library-accent" />
                    <span className="font-bold">{book.category}</span>
                  </div>
                )}
                {book.publisher && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Building size={16} className="text-library-accent" />
                    <span className="font-bold">{book.publisher}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Hash size={16} className="text-library-accent" />
                    <span className="font-bold uppercase tracking-wider">{book.isbn}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-white/10">
              <h3 className="font-black text-library-primary dark:text-white mb-3">هل تمتلك نسخة من هذا الكتاب؟</h3>
              <p className="text-xs text-gray-500 font-bold mb-4 leading-relaxed max-w-lg">
                بدلاً من إضافة الكتاب كعنصر جديد في الكتالوج، يمكنك إرفاق نسختك مباشرةً هنا ليتسنى لزملائك استعارتها منك.
              </p>
              
              <button 
                onClick={() => setIsAddCopyModalOpen(true)}
                className="bg-library-primary text-white hover:bg-library-primary/90 px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg hover:-translate-y-1"
              >
                <CopyPlus size={18} />
                أضف نسختك من هذا الكتاب
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {renderAddCopyModal()}
      </AnimatePresence>
    </div>
  );
};

export default BookDetail;
