import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, Search, Filter, ArrowUpLeft, User, LogOut, Bell, ShieldCheck } from 'lucide-react';

// --- Complex Animation Variants ---
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="min-h-screen bg-library-paper dark:bg-dark-bg transition-colors duration-300">
      
      {/* Dashboard Navbar */}
      <nav className="bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-library-primary/10 dark:border-white/10 sticky top-0 z-50">
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
                className="bg-library-paper dark:bg-black/50 border border-transparent focus:border-library-accent rounded-full pl-6 pr-10 py-2 w-80 text-sm focus:outline-none transition-all dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
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
          <div>
            <h1 className="text-3xl font-black text-library-primary dark:text-white mb-2">الأرشيف الجامعي</h1>
            <p className="text-library-primary/60 dark:text-gray-400">تصفح الكتب المتاحة، اطلب الإعارة، وقم بتوليد رموز الـ OTP الخاصة بك.</p>
          </div>
          <button className="bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-library-accent dark:hover:bg-library-accent hover:text-white transition-colors shadow-lg">
            <BookMarked size={18} /> أضف كتاباً لمكتبتك
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-dark-surface rounded-xl p-6 border border-library-primary/10 dark:border-white/5 shadow-sm">
              <h3 className="font-bold text-library-primary dark:text-white mb-4 flex items-center gap-2">
                <Filter size={18} className="text-library-accent" /> تصفية النتائج
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-library-primary/70 dark:text-gray-400 mb-2">الكلية</h4>
                  <select className="w-full bg-library-paper dark:bg-dark-bg border border-library-primary/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-library-accent dark:text-white">
                    <option>كل الكليات</option>
                    <option>هندسة</option>
                    <option>طب</option>
                    <option>حاسبات ومعلومات</option>
                  </select>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-library-primary/70 dark:text-gray-400 mb-2">حالة الكتاب</h4>
                  <div className="space-y-2">
                    {['متاح حالياً', 'تمت إعارته', 'قريباً'].map((status, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm dark:text-gray-300 cursor-pointer">
                        <input type="checkbox" className="text-library-accent focus:ring-library-accent rounded border-gray-300 bg-library-paper" />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* OTP Quick Status */}
            <div className="bg-library-primary dark:bg-[#0a1526] rounded-xl p-6 border border-library-primary/10 text-white shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-library-accent/20 blur-2xl rounded-full"></div>
              <ShieldCheck size={28} className="text-library-accent mb-4" />
              <h3 className="font-bold mb-1">عمليات معلقة</h3>
              <p className="text-library-paper/60 text-sm mb-4">لديك كتاب واحد جاهز للتسليم، يرجى توليد كود الـ OTP عند المقابلة.</p>
              <button className="w-full bg-library-accent text-library-primary font-bold py-2 rounded-md text-sm hover:bg-white transition-colors">
                عرض التفاصيل
              </button>
            </div>
          </motion.div>

          {/* Main Feed */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-3">
            
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-library-primary/10 dark:border-white/10 pb-4 overflow-x-auto no-scrollbar">
              {['الكل', 'مقررات هندسة', 'مقررات طب', 'علوم أساسية'].map((tab, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-library-primary text-white dark:bg-white dark:text-library-primary' : 'bg-transparent text-library-primary/60 dark:text-gray-400 hover:bg-library-paper dark:hover:bg-dark-surface'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Books Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'الفيزياء الجامعية', author: 'سيرواي', owner: 'محمد علي', status: 'متاح', image: 'bg-library-primary' },
                { title: 'الاقتصاد الجزئي', author: 'مانكيو', owner: 'سارة خالد', status: 'متاح', image: 'bg-[#1a2f4c]' },
                { title: 'هياكل البيانات', author: 'سيدجويك', owner: 'أحمد سامي', status: 'مستعار', image: 'bg-[#0f1d30]' },
                { title: 'علم الأدوية', author: 'ليبينكوت', owner: 'منى حسين', status: 'متاح', image: 'bg-[#253956]' },
                { title: 'التفاضل والتكامل', author: 'ستيوارت', owner: 'عمر طارق', status: 'متاح', image: 'bg-[#14253a]' },
              ].map((book, idx) => (
                <motion.div 
                  key={idx} 
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-dark-surface rounded-xl border border-library-primary/10 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className={`h-48 ${book.image} dark:brightness-75 relative p-6 flex items-end`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="relative z-10 w-full">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${book.status === 'متاح' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                          {book.status}
                        </span>
                        <BookMarked size={14} className="text-white/50" />
                      </div>
                      <h3 className="text-white font-bold text-lg leading-tight mb-1">{book.title}</h3>
                      <p className="text-library-accent text-xs">{book.author}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-sm text-library-primary/70 dark:text-gray-400">
                        <User size={14} /> <span>{book.owner}</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <span className="text-amber-500 text-xs">★</span>
                         <span className="text-xs font-bold dark:text-white">4.8</span>
                      </div>
                    </div>
                    <button 
                      disabled={book.status !== 'متاح'}
                      className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${book.status === 'متاح' ? 'bg-library-paper text-library-primary hover:bg-library-accent hover:text-white dark:bg-dark-bg dark:text-white dark:hover:bg-library-accent' : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-600 cursor-not-allowed'}`}
                    >
                      {book.status === 'متاح' ? 'اطلب الإعارة' : 'غير متاح حالياً'} 
                      {book.status === 'متاح' && <ArrowUpLeft size={16} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
