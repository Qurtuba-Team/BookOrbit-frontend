import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Library, Globe, Mail, MessageSquare, ArrowUp } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#080e18] pt-20 pb-8 overflow-hidden">
      {/* Subtle top gradient */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-library-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-library-accent/10 border border-library-accent/20 flex items-center justify-center">
                <Library size={16} className="text-library-accent" strokeWidth={1.5} />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Book <span className="text-library-accent">Orbit</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              أول منصة مصرية متخصصة في تبادل المراجع والكتب بين طلاب الجامعات في
              بيئة أكاديمية آمنة وموثقة.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
              روابط سريعة
            </p>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-gray-500 text-sm font-medium hover:text-library-accent transition-colors">
                الرئيسية
              </Link>
              <Link to="/login" className="text-gray-500 text-sm font-medium hover:text-library-accent transition-colors">
                تسجيل الدخول
              </Link>
              <Link to="/register" className="text-gray-500 text-sm font-medium hover:text-library-accent transition-colors">
                إنشاء حساب
              </Link>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-4">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
              تابعنا
            </p>
            <div className="flex gap-3">
              {[
                { icon: <MessageSquare size={16} />, label: "Discord" },
                { icon: <Globe size={16} />, label: "Website" },
                { icon: <Mail size={16} />, label: "Email" },
              ].map((social) => (
                <button
                  key={social.label}
                  className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-600 hover:text-library-accent hover:border-library-accent/20 hover:bg-library-accent/5 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-700 text-xs font-medium">
            © {currentYear} Tabaadol Platform. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/" className="text-gray-700 text-[11px] font-medium hover:text-library-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/" className="text-gray-700 text-[11px] font-medium hover:text-library-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll to Top */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 left-6 w-11 h-11 rounded-full bg-library-primary dark:bg-library-accent text-white dark:text-library-primary flex items-center justify-center shadow-xl z-50 hover:scale-105 active:scale-95 transition-transform"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        aria-label="Scroll to top"
      >
        <ArrowUp size={18} />
      </motion.button>
    </footer>
  );
};

export default Footer;
