import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, 
  Sun, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Search, 
  Bell 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const OrbitIcon = ({ className = "w-9 h-9" }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="20" cy="20" r="8" fill="url(#navOrbitGrad)" />
    <ellipse
      cx="20"
      cy="20"
      rx="18"
      ry="7"
      stroke="url(#navOrbitRing)"
      strokeWidth="1.5"
      fill="none"
      className="orbit-ring-svg"
    />
    <ellipse
      cx="20"
      cy="20"
      rx="14"
      ry="12"
      stroke="url(#navOrbitRing2)"
      strokeWidth="0.8"
      fill="none"
      transform="rotate(60 20 20)"
      className="orbit-ring-svg-2"
    />
    <circle
      cx="36"
      cy="18"
      r="2"
      fill="var(--color-accent)"
      className="orbit-dot"
    />
    <defs>
      <radialGradient id="navOrbitGrad" cx="50%" cy="40%">
        <stop offset="0%" stopColor="var(--color-accent)" />
        <stop offset="100%" stopColor="var(--color-primary)" />
      </radialGradient>
      <linearGradient id="navOrbitRing" x1="0" y1="0" x2="40" y2="0">
        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.6" />
        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.1" />
      </linearGradient>
      <linearGradient id="navOrbitRing2" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
        <stop
          offset="100%"
          stopColor="var(--color-primary)"
          stopOpacity="0.3"
        />
      </linearGradient>
    </defs>
  </svg>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  // Try to find the best display name
  const displayName = user?.fullName || user?.Name || user?.name || user?.userName || user?.email?.split('@')[0] || "المستخدم";
  // Try to find the best major/role display
  const displayRole = user?.major || (user?.role?.toLowerCase() === 'admin' ? 'إدارة النظام' : 'طالب جامعي');

  const isDashboard = location.pathname.startsWith('/app') || 
                      location.pathname.startsWith('/dashboard') || 
                      location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/addbook');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full z-50 transition-all duration-700 ease-in-out ${
          scrolled 
            ? "glass-card py-3 shadow-2xl border-b border-library-primary/10 dark:border-white/10" 
            : isDashboard 
              ? "bg-white/40 dark:bg-dark-bg/40 backdrop-blur-md py-4 border-b border-library-primary/5 dark:border-white/5" 
              : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center">
            
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-3 group relative z-50">
                <motion.div 
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <OrbitIcon />
                </motion.div>
                <span className="font-extrabold text-2xl tracking-tighter text-library-primary dark:text-library-paper transition-colors">
                  Book<span className="text-library-accent">Orbit</span>
                </span>
              </Link>

              <AnimatePresence>
                {isDashboard && isLoggedIn && user?.role?.toLowerCase() !== 'admin' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: 'auto' }}
                    exit={{ opacity: 0, x: -20, width: 0 }}
                    className="hidden lg:flex relative group ml-2"
                  >
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-library-primary/30 dark:text-gray-500 group-focus-within:text-library-accent transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="ابحث عن كتاب، مؤلف، أو تخصص..." 
                      className="bg-library-primary/[0.03] dark:bg-black/40 border border-library-primary/5 dark:border-white/5 focus:border-library-accent/50 rounded-2xl pl-6 pr-12 py-2.5 w-[350px] text-sm focus:outline-none transition-all dark:text-white backdrop-blur-xl focus:shadow-xl focus:shadow-library-accent/5"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 lg:gap-6">
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleDarkMode}
                className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-white/5 text-library-primary/70 dark:text-library-paper/60 hover:text-library-accent transition-all border border-library-primary/5 dark:border-white/5"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isDarkMode ? "sun" : "moon"}
                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>

              {isLoggedIn ? (
                <div className="flex items-center gap-3 lg:gap-6">
                  {isDashboard && user?.role?.toLowerCase() !== 'admin' && (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      className="relative w-11 h-11 rounded-2xl flex items-center justify-center bg-white/50 dark:bg-white/5 text-library-primary/70 dark:text-gray-400 hover:text-library-accent transition-all border border-library-primary/5 dark:border-white/5"
                    >
                      <Bell size={20} />
                      <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg animate-pulse"></span>
                    </motion.button>
                  )}

                  <div className="flex items-center gap-4 group cursor-pointer pl-2">
                    <div className="text-left hidden xl:block">
                      <p className="text-sm font-black text-library-primary dark:text-white leading-none group-hover:text-library-accent transition-colors">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-library-primary/40 dark:text-gray-500 mt-1.5 font-black tracking-widest uppercase flex items-center gap-2">
                         {displayRole}
                         {isLoggedIn && user?.role?.toLowerCase() !== 'admin' && (
                           <span className={`w-1.5 h-1.5 rounded-full ${
                             user.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 
                             user.status === 'approved' ? 'bg-blue-500' : 
                             'bg-amber-500'
                           }`} title={
                             user.status === 'active' ? 'موثق' : 
                             user.status === 'approved' ? 'بانتظار التوثيق' : 
                             'بانتظار تأكيد الإيميل'
                           } />
                         )}
                      </p>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.05, borderColor: 'var(--color-accent)' }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-library-primary/5 to-library-accent/5 dark:from-white/10 dark:to-white/5 p-[2px] border-2 border-transparent transition-all overflow-hidden shadow-xl"
                    >
                      <div className="w-full h-full rounded-xl bg-white dark:bg-dark-bg flex items-center justify-center text-library-accent overflow-hidden">
                        {user?.image ? (
                          <img src={user.image} alt="profile" className="w-full h-full object-cover" />
                        ) : (
                          <User size={22} />
                        )}
                      </div>
                    </motion.div>

                    {user?.role?.toLowerCase() === 'admin' && !location.pathname.startsWith('/admin') && (
                      <Link 
                        to="/admin"
                        className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-library-accent/10 text-library-accent border border-library-accent/20 text-xs font-black hover:bg-library-accent/20 transition-all"
                      >
                         لوحة الإدارة
                      </Link>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                      onClick={logout}
                      className="hidden sm:flex items-center justify-center w-11 h-11 rounded-2xl bg-red-500/5 text-red-500 transition-all border border-red-500/10"
                      title="تسجيل الخروج"
                    >
                      <LogOut size={18} />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-6">
                  <Link
                    to="/login"
                    className="text-sm font-black text-library-primary/60 dark:text-library-paper/60 hover:text-library-accent transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    className="bg-library-primary dark:bg-white text-white dark:text-library-primary px-8 py-3 rounded-2xl text-sm font-black transition-all hover:shadow-2xl hover:shadow-library-accent/30 hover:-translate-y-1 active:scale-95"
                  >
                    ابدأ رحلتك
                  </Link>
                </div>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-11 h-11 rounded-2xl flex items-center justify-center bg-library-primary/5 dark:bg-white/5 text-library-primary dark:text-library-paper relative z-[60]"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? "close" : "menu"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                  >
                    {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-[55] bg-library-paper dark:bg-dark-bg flex flex-col pt-32 px-10 lg:hidden overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-library-accent/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
            
            <div className="flex flex-col gap-8 relative z-10">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-5 mb-8 p-6 rounded-3xl bg-library-primary/[0.03] dark:bg-white/[0.03] border border-library-primary/5">
                    <div className="w-16 h-16 rounded-2xl bg-library-primary flex items-center justify-center text-library-accent shadow-lg">
                      <User size={32} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-library-primary dark:text-white leading-none mb-2">{displayName}</p>
                      <p className="text-sm text-library-accent font-bold tracking-widest uppercase">{displayRole}</p>
                    </div>
                  </div>
                  <Link to="/app" className="text-3xl font-black text-library-primary dark:text-white flex items-center gap-4 group">
                     <span className="w-2 h-2 rounded-full bg-library-accent group-hover:scale-150 transition-transform"></span> لوحة التحكم
                  </Link>
                  {user?.role?.toLowerCase() === 'admin' && (
                    <Link to="/admin" className="text-3xl font-black text-library-primary dark:text-white flex items-center gap-4 group">
                       <span className="w-2 h-2 rounded-full bg-amber-500"></span> لوحة الإدارة
                    </Link>
                  )}
                  <Link to="/profile" className="text-3xl font-black text-library-primary dark:text-white flex items-center gap-4 group">
                     <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700"></span> حسابي
                  </Link>
                  <button onClick={logout} className="text-3xl font-black text-red-500 flex items-center gap-4 mt-8">
                    <LogOut size={28} /> تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-5xl font-black text-library-primary dark:text-white">تسجيل الدخول</Link>
                  <Link to="/register" className="text-5xl font-black text-library-accent">إنشاء حساب</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
