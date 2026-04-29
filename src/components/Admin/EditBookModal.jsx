import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, User, Building, Hash, Loader2 } from 'lucide-react';
import { booksApi } from '../../services/api';
import toast from 'react-hot-toast';

export const EditBookModal = ({ isOpen, onClose, book, onBookUpdated }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    publisher: book?.publisher || '',
    category: book?.category || ''
  });

  // Re-initialize when book changes
  React.useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || book.authorName || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        category: book.category || ''
      });
    }
  }, [book]);

  if (!isOpen || !book) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('عنوان الكتاب مطلوب');
      return;
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('جاري تحديث بيانات الكتاب...');
    
    try {
      // Backend update endpoint currently supports title (+ optional cover image) via multipart/form-data.
      const payload = new FormData();
      payload.append("title", formData.title.trim());
      await booksApi.update(book.id, payload);
      toast.success('تم تحديث بيانات الكتاب بنجاح!', { id: loadingToast });
      onBookUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('فشل تحديث بيانات الكتاب. ' + (error.message || ''), { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isSubmitting ? onClose : undefined} />
        
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white dark:bg-[#0c0c0e] w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl relative z-10 border border-white/10 flex flex-col max-h-[90vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-library-primary to-library-primary/80 px-6 py-5 text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                <BookOpen size={20} className="text-library-accent" />
              </div>
              <div>
                <h2 className="font-black text-lg">تعديل بيانات الكتاب</h2>
                <p className="text-[10px] text-white/70 font-bold">تعديل معلومات الكتالوج الأساسية</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <form id="edit-book-form" onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-library-primary dark:text-white flex items-center gap-1.5">
                  <BookOpen size={12} className="text-library-accent" />
                  عنوان الكتاب <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="أدخل عنوان الكتاب كاملاً"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-library-accent/20 focus:border-library-accent transition-all dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-library-primary dark:text-white flex items-center gap-1.5">
                    <User size={12} className="text-library-accent" />
                    اسم المؤلف
                  </label>
                  <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-library-primary dark:text-white">
                    {formData.author || "—"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-library-primary dark:text-white flex items-center gap-1.5">
                    <Hash size={12} className="text-library-accent" />
                    التصنيف (القسم)
                  </label>
                  <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-library-primary dark:text-white">
                    {formData.category || "—"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-library-primary dark:text-white flex items-center gap-1.5">
                    <Building size={12} className="text-library-accent" />
                    دار النشر
                  </label>
                  <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-library-primary dark:text-white">
                    {formData.publisher || "—"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-library-primary dark:text-white flex items-center gap-1.5">
                    <Hash size={12} className="text-library-accent" />
                    الرقم الدولي (ISBN)
                  </label>
                  <div className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-library-primary dark:text-white">
                    {formData.isbn || "—"}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  حسب عقد الـ API الحالي، التعديل المتاح هنا هو عنوان الكتاب فقط.
                </p>
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all disabled:opacity-50"
            >
              إلغاء التعديل
            </button>
            <button
              type="submit"
              form="edit-book-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-black bg-library-primary text-white hover:bg-library-primary/90 hover:shadow-lg hover:shadow-library-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التعديلات'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
