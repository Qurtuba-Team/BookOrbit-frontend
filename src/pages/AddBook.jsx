import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import { booksApi } from '../services/api';
import { BOOK_CATEGORY_LABELS } from '../utils/constants';
import { 
  Upload, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  X, 
  User, 
  Save,
  ArrowRight,
  Loader2,
  Barcode,
  Building
} from 'lucide-react';

const AddBook = () => {
  const navigate = useNavigate();
  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
  });

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processCoverFile(file);
    }
  };

  const processCoverFile = (file) => {
    if (file.type.startsWith('image/')) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('يرجى اختيار ملف صورة صحيح للغلاف');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processCoverFile(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.author.trim()) {
      toast.error("العنوان والمؤلف حقول مطلوبة");
      return;
    }
    
    if (!coverFile) {
      toast.error("الرجاء رفع صورة غلاف الكتاب");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('جاري إضافة الكتاب للكتالوج...');

    try {
      const data = new FormData();
      data.append('Title', formData.title.trim());
      data.append('Author', formData.author.trim());
      data.append('ISBN', formData.isbn?.trim() || "");
      data.append('Publisher', formData.publisher?.trim() || "");
      
      // Explicitly check that coverFile is a File object
      if (coverFile instanceof File || coverFile instanceof Blob) {
        data.append('CoverImage', coverFile);
      }
      
      if (formData.category) {
        const categoryIndex = Object.keys(BOOK_CATEGORY_LABELS).indexOf(formData.category);
        if (categoryIndex !== -1) {
          // Add as 'Categories' and force it to be a Number (FormData will stringify it, but ASP.NET will parse it correctly)
          // Some backends expect 'Categories' to be sent multiple times for an array
          data.append('Categories', Number(categoryIndex));
        }
      }

      await booksApi.create(data);
      
      toast.dismiss(loadingToast);
      toast.success('تمت إضافة الكتاب بنجاح إلى الكتالوج!');
      
      navigate('/app', { replace: true });
    } catch (error) {
      toast.dismiss(loadingToast);
      if (error.status === 403) {
        toast.error('عذراً، لا تمتلك الصلاحيات الكافية لإضافة كتاب. يجب أن يكون حسابك موثقاً (Active).');
      } else if (error.status === 409) {        toast.error('هذا الكتاب (أو الرقم الدولي ISBN) موجود بالفعل في الكتالوج.');
      } else if (error.data?.errors) {
        // Detailed validation errors from backend
        const firstError = Object.values(error.data.errors)[0]?.[0];
        toast.error(firstError || 'يرجى التحقق من البيانات المدخلة');
      } else {
        toast.error(error.message || 'فشل في إضافة الكتاب');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      <Navbar />

      <div dir="rtl" className="min-h-screen bg-library-paper dark:bg-dark-bg pt-32 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-library-ink dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-library-primary/40 dark:text-gray-500 hover:text-library-accent transition-all mb-6 font-bold text-xs group disabled:opacity-50"
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 border border-library-primary/10 dark:border-white/10 flex items-center justify-center group-hover:border-library-accent group-hover:bg-library-accent/5 transition-all">
              <ArrowRight size={14} />
            </div>
            <span>العودة للسابقة</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-dark-surface rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden border border-library-primary/5 dark:border-white/5 transition-colors duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-library-primary to-library-primary/80 dark:from-black dark:to-library-primary/20 px-8 py-10 text-white relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white opacity-5">
                <BookOpen size={200} />
              </div>
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-3 flex items-center gap-3">
                  <BookOpen size={32} className="text-library-accent" />
                  إضافة كتاب جديد للكتالوج
                </h1>
                <p className="text-library-paper/80 opacity-90 text-lg font-medium mb-2">قم بتعبئة بيانات الكتاب لإدراجه في الكتالوج العام للمكتبة.</p>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-sm font-bold border border-white/20 inline-block">
                  💡 إشعار: بمجرد موافقة الإدارة على إدراج الكتاب، سيتم تسجيل نسختك تلقائياً وعرضها للإعارة. إذا كان الكتاب موجوداً مسبقاً، يمكنك إضافة نسختك مباشرة من صفحة الكتاب.
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 lg:p-12">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
              >
                
                {/* 3D Book Preview Area */}
                <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
                  <div className="font-bold text-library-primary dark:text-white text-lg mb-1 flex items-center gap-2 transition-colors duration-300">
                    <ImageIcon size={20} className="text-library-accent" />
                    غلاف الكتاب
                  </div>
                  
                  <div 
                    className={`relative w-full h-[480px] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out overflow-hidden
                      ${isDragging ? 'border-2 border-library-accent bg-library-accent/5' : ''}
                      ${!coverPreview && !isDragging ? 'border-2 border-dashed border-library-primary/10 dark:border-white/10 bg-library-primary/[0.02] dark:bg-white/[0.02] hover:bg-library-accent/5 dark:hover:bg-library-accent/5 hover:border-library-accent cursor-pointer' : ''}
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onDragOver={!isSubmitting ? handleDragOver : undefined}
                    onDragLeave={!isSubmitting ? handleDragLeave : undefined}
                    onDrop={!isSubmitting ? handleDrop : undefined}
                    onClick={() => !isSubmitting && !coverPreview && fileInputRef.current?.click()}
                  >
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleCoverUpload} disabled={isSubmitting} />

                    <AnimatePresence>
                      {coverPreview ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full flex flex-col items-center justify-center relative"
                        >
                          {/* 3D Book Model */}
                          <div className="relative w-[180px] h-[260px] [perspective:1500px] mt-[-40px] z-10">
                            <motion.div 
                              animate={{ y: [-8, 8, -8] }}
                              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                              className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-out [transform:rotateY(35deg)]"
                            >
                              <div className="absolute inset-0 bg-library-primary rounded-l-xl shadow-2xl [transform:translateZ(-20px)] overflow-hidden">
                                  <img src={coverPreview} className="w-full h-full object-cover opacity-60 blur-[1px]" alt="back" />
                              </div>
                              <div className="absolute top-[4px] bottom-[4px] left-[2px] w-[36px] bg-[#f5f5f5] [transform:translateX(-18px)_rotateY(-90deg)] flex flex-col justify-evenly border-y border-gray-300">
                                  {Array.from({length: 20}).map((_, i) => <div key={i} className="h-[1px] bg-[#e0e0e0] w-full" />)}
                              </div>
                              <div className="absolute inset-y-0 right-0 w-[40px] bg-library-primary [transform:translateX(20px)_rotateY(90deg)] rounded-r-md shadow-[inset_4px_0_10px_rgba(0,0,0,0.4)]">
                                  <img src={coverPreview} className="w-full h-full object-cover opacity-85" alt="spine" />
                              </div>
                              {/* Front Cover */}
                              <div className="absolute inset-0 bg-library-primary rounded-l-xl overflow-hidden [transform:translateZ(20px)] shadow-[-5px_5px_15px_rgba(0,0,0,0.3)] border-l border-white/10">
                                 <img src={coverPreview} className="w-full h-full object-cover" alt="front" />
                                 <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                              </div>
                            </motion.div>
                            <motion.div animate={{ scale: [0.85, 1, 0.85], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -bottom-16 left-0 right-0 h-6 bg-black blur-[16px] rounded-[100%]"></motion.div>
                          </div>

                          {!isSubmitting && (
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                               <button type="button" onClick={(e) => { e.stopPropagation(); setCoverPreview(null); setCoverFile(null); }} className="bg-white dark:bg-dark-surface hover:bg-red-500 text-red-500 hover:text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-black shadow-lg">
                                  <X size={18} /> إلغاء الغلاف
                               </button>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center h-full w-full">
                          <div className="bg-library-primary/5 dark:bg-white/5 p-5 rounded-3xl mb-4 transition-colors duration-300">
                            <Upload size={32} className="text-library-accent" />
                          </div>
                          <p className="text-library-primary/60 dark:text-gray-300 font-bold mb-2 transition-colors duration-300">اضغط للرفع أو اسحب الصورة هنا</p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">يدعم PNG, JPG, JPEG</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Form Fields Area */}
                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-library-primary/60 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300 mr-1">
                        <BookOpen size={16} className="text-library-accent" /> اسم الكتاب
                      </label>
                      <input
                        type="text" name="title" value={formData.title} onChange={handleChange} disabled={isSubmitting}
                        placeholder="مثلاً: الفيزياء الجامعية..."
                        className="w-full px-5 py-4 rounded-xl border-2 border-library-primary/5 dark:border-white/[0.05] focus:border-library-accent outline-none transition-all bg-white dark:bg-dark-surface focus:shadow-xl focus:shadow-library-accent/5 text-library-ink dark:text-white placeholder-gray-300 dark:placeholder-gray-600 font-medium text-sm disabled:opacity-50"
                        required
                      />
                    </div>

                    {/* Author */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-library-primary/60 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300 mr-1">
                        <User size={16} className="text-library-accent" /> اسم المؤلف
                      </label>
                      <input
                        type="text" name="author" value={formData.author} onChange={handleChange} disabled={isSubmitting}
                        placeholder="أدخل اسم المؤلف..."
                        className="w-full px-5 py-4 rounded-xl border-2 border-library-primary/5 dark:border-white/[0.05] focus:border-library-accent outline-none transition-all bg-white dark:bg-dark-surface focus:shadow-xl focus:shadow-library-accent/5 text-library-ink dark:text-white placeholder-gray-300 dark:placeholder-gray-600 font-medium text-sm disabled:opacity-50"
                        required
                      />
                    </div>

                    {/* ISBN */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-library-primary/60 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300 mr-1">
                        <Barcode size={16} className="text-library-accent" /> رقم ISBN
                      </label>
                      <input
                        type="text" name="isbn" value={formData.isbn} onChange={handleChange} disabled={isSubmitting}
                        placeholder="978-..."
                        className="w-full px-5 py-4 rounded-xl border-2 border-library-primary/5 dark:border-white/[0.05] focus:border-library-accent outline-none transition-all bg-white dark:bg-dark-surface focus:shadow-xl focus:shadow-library-accent/5 text-library-ink dark:text-white placeholder-gray-300 dark:placeholder-gray-600 font-medium text-sm disabled:opacity-50"
                      />
                    </div>

                    {/* Publisher */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-library-primary/60 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300 mr-1">
                        <Building size={16} className="text-library-accent" /> الناشر
                      </label>
                      <input
                        type="text" name="publisher" value={formData.publisher} onChange={handleChange} disabled={isSubmitting}
                        placeholder="دار النشر..."
                        className="w-full px-5 py-4 rounded-xl border-2 border-library-primary/5 dark:border-white/[0.05] focus:border-library-accent outline-none transition-all bg-white dark:bg-dark-surface focus:shadow-xl focus:shadow-library-accent/5 text-library-ink dark:text-white placeholder-gray-300 dark:placeholder-gray-600 font-medium text-sm disabled:opacity-50"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-library-primary/60 dark:text-gray-300 flex items-center gap-2 transition-colors duration-300 mr-1">
                        <BookOpen size={16} className="text-library-accent" /> التصنيف
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        className="w-full px-5 py-4 rounded-xl border-2 border-library-primary/5 dark:border-white/[0.05] focus:border-library-accent outline-none transition-all bg-white dark:bg-dark-surface focus:shadow-xl focus:shadow-library-accent/5 text-library-ink dark:text-white font-medium text-sm disabled:opacity-50 appearance-none"
                        required
                      >
                        <option value="" disabled>اختر تصنيف الكتاب...</option>
                        {Object.entries(BOOK_CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Categories Info */}
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10">
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                      * ملاحظة: سيتم مراجعة بيانات الكتاب من قبل الإدارة قبل ظهوره بشكل عام في المكتبة. يرجى التأكد من دقة المعلومات وصورة الغلاف.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 flex justify-end">
                    <motion.button
                      whileHover={isSubmitting ? {} : { scale: 1.01, translateY: -2 }}
                      whileTap={isSubmitting ? {} : { scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-library-primary dark:bg-white text-white dark:text-library-primary font-black py-4 px-12 rounded-2xl shadow-xl shadow-library-primary/20 dark:shadow-none hover:shadow-2xl transition-all flex items-center gap-3 text-sm w-full md:w-auto justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" /> جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save size={18} /> حفظ وإضافة الكتاب
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>

              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AddBook;
