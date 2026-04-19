import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { 
  Upload, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  X, 
  User, 
  Save
} from 'lucide-react';

const AddBook = () => {
  const navigate = useNavigate();
  const [coverPreview, setCoverPreview] = useState(null);
  const [introFile, setIntroFile] = useState(null);
  const [introPreview, setIntroPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
  });

  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processCoverFile(file);
    }
  };

  const processCoverFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
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

  const handleIntroUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIntroFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIntroPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setIntroPreview(null);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (
      formData.title.trim() && 
      formData.author.trim() && 
      formData.description.trim() && 
      coverPreview && 
      introFile
    ) {
      console.log('Submitting...', { formData, coverPreview, introFile });
      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      alert("الرجاء ملء جميع البيانات وإرفاق صور الغلاف والمقدمة.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <>
      {/* Navbar Integration */}
      <Navbar />

      <div dir="rtl" className="min-h-screen bg-[#F3F9F5] dark:bg-gray-900 pt-32 pb-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden border border-green-50 dark:border-gray-700 transition-colors duration-300"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-green-700 to-green-500 dark:from-green-800 dark:to-green-600 px-8 py-10 text-white relative overflow-hidden transition-colors duration-300">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white opacity-10">
                <BookOpen size={200} />
              </div>
              <div className="relative z-10">
                <h1 className="text-3xl font-extrabold mb-3 flex items-center gap-3">
                  <BookOpen size={32} className="text-green-100" />
                  إضافة كتاب جديد
                </h1>
                <p className="text-green-50 opacity-90 text-lg font-medium">
                  قم بتعبئة بيانات الكتاب لعرضه في منصة الاستعارة
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 lg:p-12">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-12 gap-12"
              >
                
                {/* Image Upload Area */}
                <motion.div variants={itemVariants} className="lg:col-span-4 flex flex-col gap-6">
                  <div className="font-semibold text-gray-700 dark:text-gray-200 text-lg mb-1 flex items-center gap-2 transition-colors duration-300">
                    <ImageIcon size={20} className="text-green-600 dark:text-green-400" />
                    غلاف الكتاب ومقدمته
                  </div>
                  
                  <div 
                    className={`relative w-full h-[480px] rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ease-in-out overflow-hidden
                      ${isDragging ? 'border-2 border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
                      ${!coverPreview && !isDragging ? 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/30 hover:bg-green-50 dark:hover:bg-gray-700/60 hover:border-green-400 dark:hover:border-green-500 cursor-pointer' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !coverPreview && fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleCoverUpload}
                    />

                    <AnimatePresence>
                      {coverPreview ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full h-full flex flex-col items-center justify-center relative"
                        >
                          {/* 3D Book Container */}
                          <div className="relative w-[180px] h-[260px] [perspective:1500px] group mt-[-40px] z-10">
                            <motion.div 
                              animate={{ y: [-8, 8, -8] }}
                              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                              className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-700 ease-out [transform:rotateY(35deg)] cursor-pointer"
                            >
                              {/* Back Cover */}
                              <div className="absolute inset-0 bg-green-900 rounded-l-xl shadow-2xl [transform:translateZ(-20px)] border-l-2 border-green-950/50 overflow-hidden">
                                  <img src={coverPreview} className="w-full h-full object-cover opacity-60 blur-[1px]" alt="back cover" />
                              </div>

                              {/* Left Pages (Thickness - Left edge) */}
                              <div className="absolute top-[4px] bottom-[4px] left-[2px] w-[36px] bg-[#f5f5f5] [transform:translateX(-18px)_rotateY(-90deg)] flex flex-col justify-evenly overflow-hidden border-y border-gray-300 shadow-inner">
                                  {Array.from({length: 30}).map((_, i) => <div key={`l-${i}`} className="h-[1px] bg-[#e0e0e0] w-full" />)}
                              </div>

                              {/* Top Pages (Thickness - Top edge) */}
                              <div className="absolute top-[2px] left-[4px] right-0 h-[36px] bg-[#f5f5f5] [transform:translateY(-18px)_rotateX(90deg)] flex justify-evenly overflow-hidden border-r border-gray-300 shadow-inner">
                                  {Array.from({length: 40}).map((_, i) => <div key={`t-${i}`} className="w-[1px] bg-[#e0e0e0] h-full" />)}
                              </div>

                              {/* Bottom Pages (Thickness - Bottom edge) */}
                              <div className="absolute bottom-[2px] left-[4px] right-0 h-[36px] bg-[#e5e5e5] [transform:translateY(18px)_rotateX(-90deg)] flex justify-evenly overflow-hidden border-r border-gray-300">
                                  {Array.from({length: 40}).map((_, i) => <div key={`b-${i}`} className="w-[1px] bg-[#d0d0d0] h-full" />)}
                              </div>

                              {/* Spine (Right edge) */}
                              <div className="absolute inset-y-0 right-0 w-[40px] bg-green-800 [transform:translateX(20px)_rotateY(90deg)] rounded-r-md overflow-hidden shadow-[inset_4px_0_10px_rgba(0,0,0,0.4)]">
                                  <img src={coverPreview} className="w-full h-full object-cover opacity-85" alt="spine" />
                              </div>

                              {/* Intro Page (Inner) */}
                              <div className="absolute inset-[4px] bg-white rounded-l-md [transform:translateZ(-19px)] shadow-inner flex items-center justify-center p-2 overflow-hidden">
                                  {introPreview ? (
                                      <img src={introPreview} className="w-full h-full object-cover shadow-sm" alt="intro page" />
                                  ) : (
                                      <div className="text-center text-gray-400 p-2 border-2 border-dashed border-gray-200 rounded w-full h-full flex flex-col items-center justify-center bg-gray-50/50">
                                        <p className="text-sm font-bold text-gray-400">صفحة المقدمة</p>
                                        <p className="text-[10px] mt-2 text-gray-300">ارفع ملف المقدمة لعرضه هنا</p>
                                        <p className="text-[10px] mt-1 text-green-500 font-semibold">(لفتح الكتاب)</p>
                                      </div>
                                  )}
                              </div>

                              {/* Front Cover */}
                              <div className={`absolute inset-0 [transform-origin:right_center] transition-transform duration-1000 ease-in-out [transform-style:preserve-3d] [transform:translateZ(20px)] ${introPreview ? 'group-hover:[transform:translateZ(20px)_rotateY(180deg)]' : ''}`}>
                                  {/* Front of Cover */}
                                  <div className="absolute inset-0 bg-green-600 rounded-l-xl overflow-hidden [backface-visibility:hidden] shadow-[-5px_5px_15px_rgba(0,0,0,0.3)]">
                                     <img src={coverPreview} className="w-full h-full object-cover" alt="front cover" />
                                  </div>
                                  {/* Back of Front Cover */}
                                  <div className="absolute inset-0 bg-green-800 rounded-r-xl overflow-hidden [transform:rotateY(180deg)] [backface-visibility:hidden] border-l border-green-900/50">
                                     <img src={coverPreview} className="w-full h-full object-cover opacity-90 [transform:scaleX(-1)]" alt="inner cover reflection" />
                                     <div className="absolute inset-0 bg-black/10"></div>
                                  </div>
                              </div>
                            </motion.div>

                            {/* Floating Shadow */}
                            <motion.div 
                              animate={{ scale: [0.85, 1, 0.85], opacity: [0.2, 0.5, 0.2] }}
                              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                              className="absolute -bottom-16 left-0 right-0 h-6 bg-black blur-[16px] rounded-[100%]"
                            ></motion.div>
                          </div>

                          {/* X button below the model */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                             <button 
                               type="button" 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setCoverPreview(null);
                                 if (fileInputRef.current) fileInputRef.current.value = '';
                               }} 
                               className="bg-white/95 dark:bg-gray-800/95 hover:bg-red-500 dark:hover:bg-red-600 text-red-500 hover:text-white border border-red-100 dark:border-red-900 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold shadow-md hover:shadow-lg"
                             >
                                <X size={18} /> إلغاء الغلاف
                             </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex flex-col items-center justify-center p-6 text-center h-full w-full"
                        >
                          <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4 transition-colors duration-300">
                            <Upload size={32} className="text-green-600 dark:text-green-400" />
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 font-medium mb-2 transition-colors duration-300">اضغط للرفع أو اسحب الصورة هنا</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">يدعم PNG, JPG, JPEG</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Form Details Area */}
                <motion.div variants={itemVariants} className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-300">
                        <BookOpen size={18} className="text-green-600 dark:text-green-400" />
                        اسم الكتاب
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="أدخل اسم الكتاب..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        required
                      />
                    </motion.div>

                    {/* Author */}
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-300">
                        <User size={18} className="text-green-600 dark:text-green-400" />
                        اسم المؤلف
                      </label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        placeholder="أدخل اسم المؤلف..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        required
                      />
                    </motion.div>
                  </div>

                  {/* Intro Page File */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-300">
                      <Upload size={18} className="text-green-600 dark:text-green-400" />
                      صفحة مقدمة الكتاب
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        id="introPage"
                        onChange={handleIntroUpload}
                        className="hidden"
                      />
                      <label 
                        htmlFor="introPage"
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-green-400 dark:hover:border-green-500 bg-gray-50 dark:bg-gray-700/50 hover:bg-green-50 dark:hover:bg-gray-700 transition-all text-gray-800 dark:text-gray-100"
                      >
                        <span className="text-gray-500 dark:text-gray-400 truncate mr-2 text-sm transition-colors duration-300">
                          {introFile ? introFile.name : 'اختر ملف (صورة أو PDF)...'}
                        </span>
                        <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shrink-0 transition-colors duration-300">
                          <Upload size={16} /> رفع
                        </div>
                      </label>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2 transition-colors duration-300">
                      <FileText size={18} className="text-green-600 dark:text-green-400" />
                      نبذة مختصرة
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="اكتب وصفاً موجزاً عن الكتاب ومحتواه..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 dark:bg-gray-700/50 focus:bg-white dark:focus:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                      required
                    ></textarea>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="pt-4 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white font-bold py-4 px-10 rounded-xl shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] dark:shadow-[0_4px_14px_0_rgba(34,197,94,0.3)] transition-all flex items-center gap-2 text-lg w-full md:w-auto justify-center"
                    >
                      <Save size={20} />
                      إضافة الكتاب
                    </motion.button>
                  </motion.div>
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
