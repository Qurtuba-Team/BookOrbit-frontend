import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

// --- Magnetic Button Component ---
const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.3); // Strength of magnetic pull
    y.set(middleY * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'glass-card py-4 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md shadow-lg' : 'bg-transparent py-6'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative z-50">
            <span className="font-extrabold text-2xl tracking-tight text-library-primary dark:text-library-paper">
              تبادل<span className="text-library-accent">.</span>
            </span>
          </Link>
          
          {/* Desktop Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={toggleDarkMode} className="p-2 text-library-primary dark:text-library-paper hover:text-library-accent transition-colors">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="hidden sm:flex items-center gap-6">
              <Link to="/login" className="text-sm font-bold text-library-primary dark:text-library-paper hover:text-library-accent transition-colors">
                تسجيل الدخول
              </Link>
              
              <Link to="/register">
                <MagneticButton className="bg-library-primary dark:bg-white text-library-paper dark:text-library-primary px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg">
                  ابدأ رحلتك
                </MagneticButton>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-library-primary dark:text-library-paper z-50"
            >
              <div className="w-6 h-5 relative flex flex-col justify-between">
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`w-full h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
              </div>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <motion.div 
        initial={false}
        animate={mobileMenuOpen ? { x: 0, opacity: 1 } : { x: '100%', opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 h-screen bg-white dark:bg-dark-bg z-40 flex flex-col items-center justify-center p-8 md:hidden"
      >
        <div className="flex flex-col gap-8 text-center">
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-library-primary dark:text-white">تسجيل الدخول</Link>
          <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-black text-library-primary dark:text-white">إنشاء حساب</Link>
          <div className="h-px w-12 bg-library-accent mx-auto"></div>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-library-primary/40 dark:text-gray-500">الرئيسية</Link>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
