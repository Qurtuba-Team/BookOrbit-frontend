import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, BookOpen, Layers, Repeat, ArrowUpRight, Sparkles } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Aurora from '../components/effects/Aurora';
import { useAuth } from '../context/AuthContext';

// ─── ELEGANT 3D PLANETARY ORBIT ──────────────────────────────────────────────
const Clean3DOrbit = () => (
  <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
    
    <motion.div 
      animate={{ scale: [1, 1.05, 1], opacity: [0.9, 1, 0.9] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-12 h-12 bg-library-accent rounded-full z-20 shadow-[0_0_40px_var(--color-accent)]"
    />
    
    <div className="absolute inset-0" style={{ perspective: '1000px' }}>
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(65deg) rotateY(10deg)' }}>
        
        <motion.div 
          animate={{ rotateZ: 360 }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[1.5px] border-library-accent/30 rounded-full"
        >
          <div className="absolute top-0 left-1/2 w-4 h-4 bg-emerald-400 rounded-full shadow-[0_0_15px_#34d399] -translate-x-1/2 -translate-y-1/2" />
        </motion.div>

        <motion.div 
          animate={{ rotateZ: -360 }} 
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute inset-10 border border-blue-400/20 rounded-full"
        >
           <div className="absolute top-1/2 -left-2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa] -translate-y-1/2" />
        </motion.div>

        <motion.div 
          animate={{ rotateZ: 360 }} 
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute inset-20 border border-purple-400/30 border-dashed rounded-full"
        >
           <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_15px_#c084fc] -translate-x-1/2 translate-y-1/2" />
        </motion.div>

      </div>
    </div>
  </div>
);

const DashboardCard = ({ icon: Icon, title, desc, to, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="h-full"
  >
    <Link to={to} className="block h-full group">
      <div className="p-5 md:p-6 rounded-2xl bg-white/75 dark:bg-dark-surface/75 backdrop-blur-md border border-library-primary/[0.08] dark:border-white/[0.08] hover:border-library-accent/35 dark:hover:border-library-accent/35 transition-all duration-300 card-lift h-full flex flex-col relative overflow-hidden hover:shadow-xl hover:shadow-library-primary/5">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-library-accent/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex justify-between items-center mb-5 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-library-accent/10 flex items-center justify-center group-hover:bg-library-accent/20 transition-colors">
            <Icon size={22} className="text-library-accent" strokeWidth={1.5} />
          </div>
          <ArrowUpRight size={18} className="text-library-primary/20 dark:text-white/20 group-hover:text-library-accent transition-colors" />
        </div>
        <h3 className="text-lg font-black text-library-primary dark:text-library-paper mb-2 relative z-10">
          {title}
        </h3>
        <p className="text-sm text-library-primary/50 dark:text-gray-400 leading-relaxed font-medium relative z-10 mt-auto">
          {desc}
        </p>
      </div>
    </Link>
  </motion.div>
);

const StudentDashboard = () => {
  const { user } = useAuth();

  // Handle name intelligently - matching Navbar and Dashboard logic
  const rawName = user?.fullName || user?.Name || user?.name || user?.userName || user?.email?.split('@')[0] || "يا بطل";
  const firstName = rawName.split(' ')[0];

  return (
    <div className="min-h-screen bg-library-paper dark:bg-dark-bg text-library-primary dark:text-library-paper transition-colors duration-500 overflow-hidden" dir="rtl">
      <Navbar />

      <main className="relative z-10">
        
        {/* ─── HERO SECTION ─── */}
        <section className="relative w-full pt-24 pb-12 lg:pt-28 lg:pb-16 overflow-hidden border-b border-library-primary/[0.05] dark:border-white/[0.05]">
          <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
            <Aurora />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12">
              
              {/* Text Content */}
              <div className="flex-1 text-center lg:text-right">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-library-accent/10 border border-library-accent/20 text-[10px] font-bold text-library-accent mb-6 uppercase tracking-widest">
                    <Sparkles size={12} />
                    بوابة الطالب الأكاديمية
                  </div>
                  
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-library-primary dark:text-white leading-[1.2] mb-4">
                    أهلاً <span className="text-library-accent">{firstName}</span>،
                    <br />
                    جاهز تبدأ يومك الدراسي؟
                  </h1>
                  
                  <p className="text-sm md:text-base text-library-primary/60 dark:text-gray-400 font-medium max-w-lg mx-auto lg:mx-0 leading-relaxed">
                    من هنا تقدر تدير حسابك، تتصفح الكتب، وتتابع إعاراتك بسرعة من لوحة واحدة واضحة.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                    <Link to="/profile" className="px-4 py-2.5 rounded-xl bg-library-primary text-white text-xs font-black shadow-md hover:opacity-90 transition-all">
                      فتح الملف الشخصي
                    </Link>
                    <Link to="/dashboard" className="px-4 py-2.5 rounded-xl bg-white/80 dark:bg-white/10 border border-library-primary/10 text-library-primary dark:text-white text-xs font-black hover:border-library-accent/30 transition-all">
                      تصفح الأرشيف
                    </Link>
                  </div>
                </motion.div>
              </div>

              {/* Elegant 3D Orbit */}
              <div className="flex-1 flex justify-center lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                >
                  <Clean3DOrbit />
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── NAVIGATION GRID ─── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 relative">
          <div className="mb-6 bg-white/80 dark:bg-white/[0.03] rounded-2xl border border-library-primary/10 dark:border-white/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-library-primary dark:text-white">لوحة التحكم السريعة</h2>
              <p className="text-xs text-library-primary/60 dark:text-gray-400 font-bold mt-1">اختر المسار الذي تريده وابدأ في خطوة واحدة.</p>
            </div>
            <div className="px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 w-fit">
              حالة الحساب: {user?.status === "active" ? "موثق" : user?.status === "approved" ? "بانتظار التفعيل" : "قيد المراجعة"}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="الأرشيف الرقمي" desc="تصفح جميع المراجع والكتب المتاحة للاستعارة من زملائك في مختلف الكليات." icon={BookOpen} to="/dashboard" delay={0.1} />
            <DashboardCard title="الملف الشخصي" desc="قم بإدارة بياناتك الشخصية، تعديل صورتك، وتحديث معلومات التواصل." icon={User} to="/profile" delay={0.2} />
            <DashboardCard title="نسخي الخاصة" desc="أضف كتبك الخاصة للمنصة، تحكم بحالتها، واجعلها متاحة لإفادة غيرك." icon={Layers} to="/my-copies" delay={0.3} />
            <DashboardCard title="قائمة الإعارات" desc="تابع طلبات الاستعارة، المواعيد النهائية للإرجاع، والكتب التي بحوزتك." icon={Repeat} to="/lending" delay={0.4} />
          </div>
        </section>

      </main>
    </div>
  );
};

export default StudentDashboard;
