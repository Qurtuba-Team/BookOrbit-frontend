import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, Search, Filter, ArrowUpLeft, User, LogOut, Bell, ShieldCheck, Moon, Sun } from 'lucide-react';

// --- Complex Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const BookCard3D = ({ book }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="relative flex flex-col items-center group h-full"
    >
      {/* 3D Book Container */}
      <div className="relative w-[130px] h-[190px] [perspective:1200px] z-10 mb-[-25px] mt-2">
        <motion.div 
          className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-500 ease-out [transform:rotateY(30deg)_rotateX(5deg)] group-hover:[transform:rotateY(0deg)_rotateX(0deg)] cursor-pointer drop-shadow-2xl"
        >
          {/* Back Cover */}
          <div className={`absolute inset-0 ${book.color || 'bg-library-primary'} rounded-l-md [transform:translateZ(-12px)] overflow-hidden border-l border-black/20`}></div>

          {/* Left Pages (Thickness - Left edge) */}
          <div className="absolute inset-y-[3px] left-[1px] w-[24px] bg-[#f5f5f5] [transform:translateX(-12px)_rotateY(-90deg)] flex flex-col justify-evenly overflow-hidden border-y border-gray-300 shadow-inner">
             {Array.from({length: 25}).map((_, i) => <div key={`l-${i}`} className="h-[1px] bg-[#e0e0e0] w-full" />)}
          </div>
          
          {/* Top Pages (Thickness - Top edge) */}
          <div className="absolute top-[1px] left-[2px] right-0 h-[24px] bg-[#f5f5f5] [transform:translateY(-12px)_rotateX(90deg)] flex justify-evenly overflow-hidden border-r border-gray-300 shadow-inner">
             {Array.from({length: 30}).map((_, i) => <div key={`t-${i}`} className="w-[1px] bg-[#e0e0e0] h-full" />)}
          </div>
          
           {/* Bottom Pages (Thickness - Bottom edge) */}
          <div className="absolute bottom-[1px] left-[2px] right-0 h-[24px] bg-[#e5e5e5] [transform:translateY(12px)_rotateX(-90deg)] flex justify-evenly overflow-hidden border-r border-gray-300">
             {Array.from({length: 30}).map((_, i) => <div key={`b-${i}`} className="w-[1px] bg-[#d0d0d0] h-full" />)}
          </div>

          {/* Spine (Right edge) */}
          <div className={`absolute inset-y-0 right-0 w-[24px] ${book.color || 'bg-library-primary'} [transform:translateX(12px)_rotateY(90deg)] rounded-r-sm overflow-hidden shadow-[inset_2px_0_5px_rgba(0,0,0,0.3)]`}></div>

          {/* Front Cover */}
          <div className="absolute inset-0 bg-white rounded-r-md rounded-l-sm overflow-hidden [transform:translateZ(12px)] shadow-[-5px_5px_15px_rgba(0,0,0,0.2)] border-l-2 border-black/10">
            {book.image && !book.image.startsWith('bg-') ? (
               <img src={book.image} alt={book.title} className="w-full h-full object-cover" />
            ) : (
               <div className={`w-full h-full ${book.color || book.image || 'bg-library-primary'} flex flex-col items-center justify-center p-3 text-center`}>
                 <h3 className="text-white font-bold text-sm mb-1 leading-tight">{book.title}</h3>
                 <p className="text-white/80 text-[10px]">{book.author}</p>
               </div>
            )}
            
            {/* Status Badge on Cover */}
            <div className="absolute top-2 right-2 z-20">
               <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md backdrop-blur-md ${book.status === 'متاح' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {book.status}
                </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Card Info Container */}
      <div className="w-full bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl rounded-2xl pt-10 pb-5 px-5 border border-library-primary/10 dark:border-white/10 shadow-lg transition-all relative z-0 flex flex-col items-center flex-grow">
         <h3 className="font-bold text-library-primary dark:text-white text-center text-base leading-tight mb-1 line-clamp-1 w-full">{book.title}</h3>
         <p className="text-library-accent text-xs mb-3 text-center line-clamp-1 w-full">{book.author}</p>
         
         <div className="w-full mt-auto">
           <div className="w-full h-px bg-library-primary/5 dark:bg-white/5 mb-3"></div>
           
           <div className="flex justify-between items-center w-full mb-4">
              <div className="flex items-center gap-1.5 text-xs text-library-primary/70 dark:text-gray-400">
                <User size={12} /> <span className="truncate max-w-[80px]">{book.owner}</span>
              </div>
              <div className="flex items-center gap-1">
                 <span className="text-amber-500 text-[10px]">★</span>
                 <span className="text-xs font-bold dark:text-white">4.8</span>
              </div>
            </div>
            
            <button 
              disabled={book.status !== 'متاح'}
              className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${book.status === 'متاح' ? 'bg-library-paper/50 text-library-primary border border-library-primary/20 hover:bg-library-accent hover:border-transparent hover:text-white dark:bg-dark-bg/50 dark:text-white dark:border-white/20 dark:hover:bg-library-accent shadow-sm hover:shadow-md' : 'bg-gray-100/50 text-gray-400 dark:bg-white/5 dark:text-gray-600 cursor-not-allowed'}`}
            >
              {book.status === 'متاح' ? 'اطلب الإعارة' : 'غير متاح حالياً'} 
              {book.status === 'متاح' && <ArrowUpLeft size={16} />}
            </button>
         </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('الكل');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const booksData = [
    { title: 'الفيزياء الجامعية', author: 'سيرواي', owner: 'محمد علي', status: 'متاح', color: 'bg-blue-800', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80' },
    { title: 'الاقتصاد الجزئي', author: 'مانكيو', owner: 'سارة خالد', status: 'متاح', color: 'bg-green-800', image: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&q=80' },
    { title: 'هياكل البيانات', author: 'سيدجويك', owner: 'أحمد سامي', status: 'مستعار', color: 'bg-gray-800', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80' },
    { title: 'علم الأدوية', author: 'ليبينكوت', owner: 'منى حسين', status: 'متاح', color: 'bg-red-800', image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80' },
    { title: 'التفاضل والتكامل', author: 'ستيوارت', owner: 'عمر طارق', status: 'متاح', color: 'bg-purple-800', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&q=80' },
    { title: 'الذكاء الاصطناعي', author: 'راسل ونورفيج', owner: 'يوسف أحمد', status: 'متاح', color: 'bg-teal-800', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80' }
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-300">
      
      {/* 3D Library Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <motion.div 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-[-5%] bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
          }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/85 dark:bg-[#050B14]/90 backdrop-blur-[8px] transition-colors duration-300"></div>
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/10 dark:to-black/40"></div>
      </div>
      
      {/* Dashboard Navbar */}
      <nav className="bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl border-b border-library-primary/10 dark:border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-library-primary dark:text-library-paper">
                تبادل<span className="text-library-accent">.</span>
              </span>
            </Link>
            <div className="hidden md:flex relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-library-primary/40 dark:text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن كتاب، مادة، أو مؤلف..." 
                className="bg-white/50 dark:bg-black/30 border border-library-primary/10 dark:border-white/10 focus:border-library-accent rounded-full pl-6 pr-10 py-2 w-80 text-sm focus:outline-none transition-all dark:text-white backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-library-primary dark:text-gray-300 hover:text-library-accent transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="relative p-2 text-library-primary dark:text-gray-300 hover:text-library-accent transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-dark-surface"></span>
            </button>
            <div className="h-8 w-px bg-library-primary/20 dark:bg-white/20 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-library-primary dark:text-white leading-none">أحمد سامي</p>
                <p className="text-xs text-library-primary/60 dark:text-gray-400 mt-1">هندسة حاسبات</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-library-primary dark:bg-gray-800 flex items-center justify-center text-library-accent border-2 border-transparent group-hover:border-library-accent transition-all">
                <User size={20} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        
        {/* Welcome Section */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="bg-white/40 dark:bg-dark-surface/40 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-sm">
            <h1 className="text-3xl font-black text-library-primary dark:text-white mb-2 drop-shadow-sm">الأرشيف الجامعي</h1>
            <p className="text-library-primary/80 dark:text-gray-300 font-medium">تصفح الكتب المتاحة، اطلب الإعارة، وقم بتوليد رموز الـ OTP الخاصة بك.</p>
          </div>
          <Link to="/addbook" className="bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold px-6 py-4 rounded-xl flex items-center gap-2 hover:bg-library-accent dark:hover:bg-library-accent hover:text-white transition-all shadow-lg hover:shadow-library-accent/30 hover:-translate-y-1">
            <BookMarked size={20} /> أضف كتاباً لمكتبتك
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-1 space-y-6">
            <div className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-xl rounded-2xl p-6 border border-library-primary/10 dark:border-white/5 shadow-lg">
              <h3 className="font-bold text-library-primary dark:text-white mb-4 flex items-center gap-2">
                <Filter size={18} className="text-library-accent" /> تصفية النتائج
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-library-primary/70 dark:text-gray-400 mb-2">الكلية</h4>
                  <select className="w-full bg-white/50 dark:bg-dark-bg/50 border border-library-primary/10 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-library-accent dark:text-white backdrop-blur-sm transition-all">
                    <option>كل الكليات</option>
                    <option>هندسة</option>
                    <option>طب</option>
                    <option>حاسبات ومعلومات</option>
                  </select>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-library-primary/70 dark:text-gray-400 mb-3">حالة الكتاب</h4>
                  <div className="space-y-3">
                    {['متاح حالياً', 'تمت إعارته', 'قريباً'].map((status, i) => (
                      <label key={i} className="flex items-center gap-3 text-sm dark:text-gray-300 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded bg-white/50 dark:bg-dark-bg/50 checked:bg-library-accent checked:border-library-accent transition-all cursor-pointer" />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-medium group-hover:text-library-accent transition-colors">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Quick Status */}
            <div className="bg-library-primary dark:bg-[#0a1526]/90 backdrop-blur-xl rounded-2xl p-6 border border-library-primary/10 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-library-accent/20 blur-3xl rounded-full group-hover:bg-library-accent/30 transition-all"></div>
              <ShieldCheck size={32} className="text-library-accent mb-4 relative z-10" />
              <h3 className="font-bold text-lg mb-2 relative z-10">عمليات معلقة</h3>
              <p className="text-library-paper/70 text-sm mb-5 relative z-10 leading-relaxed">لديك كتاب واحد جاهز للتسليم، يرجى توليد كود الـ OTP عند المقابلة.</p>
              <button className="w-full bg-library-accent text-library-primary font-bold py-2.5 rounded-xl text-sm hover:bg-white transition-all relative z-10 shadow-lg hover:shadow-white/20">
                عرض التفاصيل
              </button>
            </div>
          </motion.div>

          {/* Main Feed */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-3">
            
            {/* Tabs */}
            <div className="flex gap-3 mb-8 pb-4 overflow-x-auto no-scrollbar mask-fade-edges">
              {['الكل', 'مقررات هندسة', 'مقررات طب', 'علوم أساسية'].map((tab, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all backdrop-blur-md shadow-sm ${activeTab === tab ? 'bg-library-primary text-white dark:bg-white dark:text-library-primary scale-105' : 'bg-white/60 text-library-primary/70 dark:bg-dark-surface/60 dark:text-gray-300 hover:bg-white dark:hover:bg-dark-surface'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Books Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {booksData.map((book, idx) => (
                <BookCard3D key={idx} book={book} />
              ))}
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

