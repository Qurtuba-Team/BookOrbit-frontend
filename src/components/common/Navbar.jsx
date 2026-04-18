import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Menu, X } from "lucide-react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    // Load dark mode preference
    const storedMode = localStorage.getItem("isDark");
    if (storedMode === "true") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    document.documentElement.classList.toggle("dark", newMode);
    setIsDark(newMode);
    localStorage.setItem("isDark", String(newMode));
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "glass-card py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group relative z-50">
              <div className="w-9 h-9 rounded-lg bg-library-primary dark:bg-library-accent flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span className="text-white dark:text-library-primary font-black text-sm">BO</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-library-primary dark:text-library-paper">
                Book<span className="text-library-accent"> Orbit</span>
              </span>
            </Link>

            {/* Desktop Actions */}
            <div className="flex items-center gap-3 sm:gap-5">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-library-primary/60 dark:text-library-paper/60 hover:text-library-accent dark:hover:text-library-accent transition-colors"
                aria-label="Toggle dark mode"
              >
                <motion.div
                  key={isDark ? "sun" : "moon"}
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </motion.div>
              </button>

              {/* Desktop Nav Links */}
              <div className="hidden sm:flex items-center gap-5">
                <Link
                  to="/login"
                  className="text-sm font-bold text-library-primary/70 dark:text-library-paper/70 hover:text-library-accent dark:hover:text-library-accent transition-colors"
                >
                  تسجيل الدخول
                </Link>

                <Link
                  to="/register"
                  className="bg-library-primary dark:bg-library-paper text-library-paper dark:text-library-primary px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:shadow-lg hover:shadow-library-accent/20 hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  ابدأ رحلتك
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center text-library-primary dark:text-library-paper z-[60]"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? "close" : "menu"}
                    initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-library-paper/98 dark:bg-dark-bg/98 backdrop-blur-xl flex flex-col items-center justify-center sm:hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col gap-8 text-center"
            >
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl font-black text-library-primary dark:text-white hover:text-library-accent transition-colors"
              >
                تسجيل الدخول
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-3xl font-black text-library-primary dark:text-white hover:text-library-accent transition-colors"
              >
                إنشاء حساب
              </Link>
              <div className="w-12 h-0.5 bg-library-accent/30 mx-auto rounded-full" />
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-library-primary/30 dark:text-gray-600"
              >
                الرئيسية
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
