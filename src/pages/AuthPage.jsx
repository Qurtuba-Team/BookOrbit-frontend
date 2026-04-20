import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, Shield, CheckCircle2, UserPlus, Lock } from "lucide-react";

import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isWaitingConfirmation, setIsWaitingConfirmation] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const switchMode = () => {
    const next = !isLogin;
    setIsLogin(next);
    setIsWaitingConfirmation(false);
    window.history.replaceState(null, "", next ? "/login" : "/register");
  };

  const handleForgotPassword = (email) => {
    setForgotPasswordEmail(email);
    setShowForgotPassword(true);
  };

  const handleRegisterSuccess = (email) => {
    setConfirmedEmail(email);
    setIsWaitingConfirmation(true);
  };

  const ConfirmationScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="text-center py-4"
    >
      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 size={32} className="text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold text-library-primary dark:text-white mb-2">
        تحقق من بريدك الجامعي
      </h3>
      <p className="text-library-primary/60 dark:text-gray-400 text-sm leading-relaxed mb-4">
        أرسلنا رابط التفعيل إلى <br />
        <span className="font-semibold text-library-primary dark:text-white break-all">
          {confirmedEmail}
        </span>
        <br />
        <span className="text-[10px] opacity-70 mt-1 block">
          💡 لم تصلك الرسالة؟ تحقق من مجلد Spam
        </span>
      </p>
      <button
        onClick={() => {
          setIsWaitingConfirmation(false);
          setIsLogin(true);
        }}
        className="text-library-accent font-bold hover:underline text-sm flex items-center justify-center gap-1 mx-auto"
      >
        <ArrowRight size={14} /> العودة لتسجيل الدخول
      </button>
    </motion.div>
  );

  return (
    <div
      className="min-h-screen relative overflow-hidden bg-library-paper dark:bg-dark-bg"
      style={{ direction: "ltr" }}
    >
      <ForgotPasswordModal
        showForgotPassword={showForgotPassword}
        setShowForgotPassword={setShowForgotPassword}
        initialEmail={forgotPasswordEmail}
      />

      <div className="flex min-h-screen">
        {/* LEFT half → Register form (Desktop Only) */}
        <div
          className="hidden lg:flex w-1/2 bg-library-primary dark:bg-dark-surface p-12 text-white flex-col justify-center relative overflow-hidden"
          style={{ direction: "rtl" }}
        >
          {/* Abstract background shapes */}
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/[0.02] rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-library-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-library-primary-light/5 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-md mx-auto w-full">
            <Link
              to="/"
              className="text-white/60 hover:text-white flex items-center gap-2 mb-8 w-fit text-sm font-bold transition-colors"
            >
              <ArrowRight size={16} /> العودة للأرشيف
            </Link>

            <AnimatePresence mode="wait">
              {isWaitingConfirmation ? (
                <ConfirmationScreen key="confirmation-desktop" />
              ) : (
                <motion.div
                  key="register-form-desktop"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <RegisterForm switchMode={switchMode} onSuccess={handleRegisterSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT half → Login form (Desktop) & Switcher (Mobile) */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center px-8 sm:px-12 lg:px-12 py-12 lg:py-0"
          style={{ direction: "rtl" }}
        >
          <div className="max-w-md w-full">
            <Link
              to="/"
              className="text-library-primary/60 dark:text-library-paper/60 hover:text-library-accent flex items-center gap-2 mb-10 w-fit text-sm font-bold lg:hidden"
            >
              <ArrowRight size={16} /> العودة للأرشيف
            </Link>

            {/* Mobile Tabs */}
            <div className="lg:hidden relative flex bg-library-primary/[0.04] dark:bg-white/[0.04] rounded-xl p-1 mb-8">
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-library-primary shadow-lg"
                animate={{
                  left: isLogin ? "calc(50% - 4px)" : "4px",
                  width: "calc(50% - 4px)",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => {
                  setIsLogin(true);
                  window.history.replaceState(null, "", "/login");
                }}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${
                  isLogin
                    ? "text-library-primary dark:text-white"
                    : "text-library-primary/70 dark:text-library-paper/70"
                }`}
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  window.history.replaceState(null, "", "/register");
                }}
                className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-lg transition-colors ${
                  !isLogin
                    ? "text-library-primary dark:text-white"
                    : "text-library-primary/70 dark:text-library-paper/70"
                }`}
              >
                حساب جديد
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-mobile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <LoginForm onForgotPassword={handleForgotPassword} />
                </motion.div>
              ) : (
                <motion.div
                  key="register-mobile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="lg:hidden"
                >
                  {isWaitingConfirmation ? (
                    <ConfirmationScreen />
                  ) : (
                    <RegisterForm switchMode={null} onSuccess={handleRegisterSuccess} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Desktop Sliding Overlay */}
      <motion.div
        className="hidden lg:flex absolute top-0 bottom-0 w-1/2 bg-library-primary dark:bg-[#060a12] z-20 items-center justify-center p-12 overflow-hidden"
        initial={false}
        animate={{ left: isLogin ? "0%" : "50%" }}
        transition={{ type: "spring", stiffness: 180, damping: 26, mass: 0.9 }}
      >
        <div className="absolute inset-0 bg-texture opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-library-accent/[0.05] rounded-full blur-[100px]" />

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="panel-login"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="relative z-10 max-w-sm text-center"
              style={{ direction: "rtl" }}
            >
              <div className="w-14 h-14 rounded-2xl bg-library-accent/10 border border-library-accent/20 flex items-center justify-center mx-auto mb-7">
                <BookOpen
                  size={24}
                  className="text-library-accent"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-3xl font-black text-library-paper mb-4 leading-relaxed">
                "المكتبة هي المستشفى
                <br />
                الوحيد للروح."
              </h2>
              <div className="w-10 h-0.5 bg-library-accent/30 mx-auto mb-4 rounded-full" />
              <p className="text-library-paper/35 font-medium text-sm leading-relaxed max-w-xs mx-auto mb-10">
                شارك في بناء أكبر مكتبة جامعية تعاونية في مصر. آلاف الكتب
                والمراجع في انتظارك.
              </p>
              <button
                onClick={switchMode}
                className="inline-flex items-center gap-2 px-7 py-3 border border-library-paper/15 text-library-paper rounded-full text-sm font-bold hover:bg-library-paper/10 transition-all"
              >
                <UserPlus size={15} /> أنشئ حساب جديد
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="panel-register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="relative z-10 max-w-sm text-center"
              style={{ direction: "rtl" }}
            >
              <div className="w-14 h-14 rounded-2xl bg-library-accent/10 border border-library-accent/20 flex items-center justify-center mx-auto mb-7">
                <Shield
                  size={24}
                  className="text-library-accent"
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-3xl font-black text-library-paper mb-4 leading-relaxed">
                بناء مجتمع
                <br />
                جامعي موثوق.
              </h2>
              <div className="w-10 h-0.5 bg-library-accent/30 mx-auto mb-4 rounded-full" />
              <p className="text-library-paper/35 font-medium text-sm leading-relaxed max-w-xs mx-auto mb-10">
                تتم مراجعة البطاقات الجامعية لكل طالب مسجل لضمان بيئة أكاديمية
                خالية من الغرباء.
              </p>
              <button
                onClick={switchMode}
                className="inline-flex items-center gap-2 px-7 py-3 border border-library-paper/15 text-library-paper rounded-full text-sm font-bold hover:bg-library-paper/10 transition-all"
              >
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
