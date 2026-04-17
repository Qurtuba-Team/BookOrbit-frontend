import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, BookOpen, Lock, UserPlus } from "lucide-react";

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");

  // ── Login State ──
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "", phone: "", email: "", password: "", agreeToTerms: false,
  });

  const handleLoginChange = (e) =>
    setLoginData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterData((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => e.preventDefault();

  const switchMode = () => {
    const next = !isLogin;
    setIsLogin(next);
    window.history.replaceState(null, "", next ? "/login" : "/register");
  };

  const inputClass =
    "w-full px-4 py-3.5 bg-white dark:bg-dark-surface border border-library-primary/10 dark:border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-library-accent/30 focus:border-library-accent/40 dark:text-white transition-all text-sm";

  return (
    /* Force LTR on the outer shell so left/right positioning is predictable */
    <div className="min-h-screen relative overflow-hidden bg-library-paper dark:bg-dark-bg" style={{ direction: "ltr" }}>

      {/* ══════ FORM LAYERS (behind the panel) ══════ */}
      <div className="flex min-h-screen">
        {/* LEFT half → Register form (visible when panel slides right) */}
        <div className="hidden lg:flex w-1/2 items-center justify-center px-12" style={{ direction: "rtl" }}>
          <div className="max-w-md w-full">
            <Link to="/" className="text-library-primary/60 dark:text-library-paper/60 hover:text-library-accent flex items-center gap-2 mb-10 w-fit text-sm font-bold">
              <ArrowRight size={16} /> العودة للأرشيف
            </Link>
            <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">توثيق طالب جديد.</h2>
            <p className="text-library-primary/50 dark:text-gray-400 mb-8 text-sm font-medium">عملية التوثيق تتم يدوياً لضمان بيئة جامعية آمنة.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">الاسم الرباعي</label>
                <input type="text" name="name" value={registerData.name} onChange={handleRegisterChange} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">البريد الجامعي</label>
                  <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} className={inputClass} dir="ltr" placeholder="name@student.edu.eg" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">رقم الهاتف</label>
                  <input type="tel" name="phone" value={registerData.phone} onChange={handleRegisterChange} className={inputClass} dir="ltr" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">الرقم السري</label>
                <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} className={inputClass} required />
              </div>
              <div className="flex items-start gap-3 pt-1">
                <input type="checkbox" id="terms" name="agreeToTerms" checked={registerData.agreeToTerms} onChange={handleRegisterChange} className="mt-1 w-4 h-4 accent-library-accent" required />
                <label htmlFor="terms" className="text-xs text-library-primary/50 dark:text-gray-400 leading-relaxed">
                  أقر بصحة بياناتي وأوافق على <span className="font-bold text-library-accent">ميثاق شرف المنصة</span>، وأتعهد بالمحافظة على الكتب المعارة لي.
                </label>
              </div>
              <button type="submit" className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm">
                إرسال طلب التوثيق
              </button>
            </form>
            <p className="mt-8 text-center text-library-primary/40 dark:text-gray-500 text-sm">
              لديك حساب موثق؟ <button onClick={switchMode} className="font-bold text-library-accent hover:underline">تسجيل الدخول</button>
            </p>
          </div>
        </div>

        {/* RIGHT half → Login form (visible when panel is on left) */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 sm:px-12 lg:px-12" style={{ direction: "rtl" }}>
          <div className="max-w-md w-full">
            <Link to="/" className="text-library-primary/60 dark:text-library-paper/60 hover:text-library-accent flex items-center gap-2 mb-10 w-fit text-sm font-bold">
              <ArrowRight size={16} /> العودة للأرشيف
            </Link>

            {/* Mobile-only tabs (no panel on mobile) */}
            <div className="lg:hidden relative flex bg-library-primary/[0.04] dark:bg-white/[0.04] rounded-xl p-1 mb-8">
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-library-primary dark:bg-white shadow-lg"
                layout
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                style={{ width: "calc(50% - 4px)", left: isLogin ? "4px" : "calc(50%)" }}
              />
              <button onClick={() => { setIsLogin(true); window.history.replaceState(null, "", "/login"); }}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${isLogin ? "text-library-paper dark:text-library-primary" : "text-library-primary/50 dark:text-library-paper/50"}`}>
                تسجيل الدخول
              </button>
              <button onClick={() => { setIsLogin(false); window.history.replaceState(null, "", "/register"); }}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${!isLogin ? "text-library-paper dark:text-library-primary" : "text-library-primary/50 dark:text-library-paper/50"}`}>
                حساب جديد
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div key="login-mobile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
                  <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">مرحباً بعودتك.</h2>
                  <p className="text-library-primary/50 dark:text-gray-400 mb-8 text-sm font-medium">سجل دخولك لمتابعة كتبك المستعارة أو لإضافة مراجع جديدة.</p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">البريد الجامعي</label>
                      <input type="email" name="email" value={loginData.email} onChange={handleLoginChange} className={inputClass} placeholder="student@university.edu" dir="ltr" required />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300">كلمة المرور</label>
                        <button type="button" className="text-xs font-bold text-library-accent">نسيت الرمز؟</button>
                      </div>
                      <input type="password" name="password" value={loginData.password} onChange={handleLoginChange} className={inputClass} placeholder="••••••••" required />
                    </div>
                    <button type="submit" className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm">
                      دخول للأرشيف
                    </button>
                  </form>
                  <p className="mt-8 text-center text-library-primary/40 dark:text-gray-500 text-sm">
                    طالب جديد؟ <button onClick={switchMode} className="font-bold text-library-accent hover:underline">وثق حسابك الآن</button>
                  </p>
                </motion.div>
              ) : (
                /* Mobile register form */
                <motion.div key="register-mobile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }} className="lg:hidden">
                  <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">توثيق طالب جديد.</h2>
                  <p className="text-library-primary/50 dark:text-gray-400 mb-8 text-sm font-medium">عملية التوثيق تتم يدوياً لضمان بيئة جامعية آمنة.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">الاسم الرباعي</label>
                      <input type="text" name="name" value={registerData.name} onChange={handleRegisterChange} className={inputClass} required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">البريد الجامعي</label>
                      <input type="email" name="email" value={registerData.email} onChange={handleRegisterChange} className={inputClass} dir="ltr" placeholder="name@student.edu.eg" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">رقم الهاتف</label>
                      <input type="tel" name="phone" value={registerData.phone} onChange={handleRegisterChange} className={inputClass} dir="ltr" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">الرقم السري</label>
                      <input type="password" name="password" value={registerData.password} onChange={handleRegisterChange} className={inputClass} required />
                    </div>
                    <button type="submit" className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm">
                      إرسال طلب التوثيق
                    </button>
                  </form>
                  <p className="mt-8 text-center text-library-primary/40 dark:text-gray-500 text-sm">
                    لديك حساب؟ <button onClick={switchMode} className="font-bold text-library-accent hover:underline">تسجيل الدخول</button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ══════ SLIDING BLUE PANEL (Desktop only) ══════ */}
      <motion.div
        className="hidden lg:flex absolute top-0 bottom-0 w-1/2 bg-library-primary dark:bg-[#060a12] z-20 items-center justify-center p-12 overflow-hidden"
        initial={false}
        animate={{ left: isLogin ? "0%" : "50%" }}
        transition={{ type: "spring", stiffness: 180, damping: 26, mass: 0.9 }}
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-texture opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-library-accent/[0.05] rounded-full blur-[100px]" />

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div key="panel-login" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, delay: 0.15 }}
              className="relative z-10 max-w-sm text-center" style={{ direction: "rtl" }}>
              <div className="w-14 h-14 rounded-2xl bg-library-accent/10 border border-library-accent/20 flex items-center justify-center mx-auto mb-7">
                <BookOpen size={24} className="text-library-accent" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-black text-library-paper mb-4 leading-relaxed">"المكتبة هي المستشفى<br />الوحيد للروح."</h2>
              <div className="w-10 h-0.5 bg-library-accent/30 mx-auto mb-4 rounded-full" />
              <p className="text-library-paper/35 font-medium text-sm leading-relaxed max-w-xs mx-auto mb-10">
                شارك في بناء أكبر مكتبة جامعية تعاونية في مصر. آلاف الكتب والمراجع في انتظارك.
              </p>
              <button onClick={switchMode} className="inline-flex items-center gap-2 px-7 py-3 border border-library-paper/15 text-library-paper rounded-full text-sm font-bold hover:bg-library-paper/10 transition-all">
                <UserPlus size={15} /> أنشئ حساب جديد
              </button>
            </motion.div>
          ) : (
            <motion.div key="panel-register" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, delay: 0.15 }}
              className="relative z-10 max-w-sm text-center" style={{ direction: "rtl" }}>
              <div className="w-14 h-14 rounded-2xl bg-library-accent/10 border border-library-accent/20 flex items-center justify-center mx-auto mb-7">
                <Shield size={24} className="text-library-accent" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-black text-library-paper mb-4 leading-relaxed">بناء مجتمع<br />جامعي موثوق.</h2>
              <div className="w-10 h-0.5 bg-library-accent/30 mx-auto mb-4 rounded-full" />
              <p className="text-library-paper/35 font-medium text-sm leading-relaxed max-w-xs mx-auto mb-10">
                تتم مراجعة البطاقات الجامعية لكل طالب مسجل لضمان بيئة أكاديمية خالية من الغرباء.
              </p>
              <button onClick={switchMode} className="inline-flex items-center gap-2 px-7 py-3 border border-library-paper/15 text-library-paper rounded-full text-sm font-bold hover:bg-library-paper/10 transition-all">
                <Lock size={15} /> لدي حساب بالفعل
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;
