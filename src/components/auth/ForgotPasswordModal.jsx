import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, Mail, Loader2, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { identityApi } from "../../services/api";

const ForgotPasswordModal = ({
  showForgotPassword,
  setShowForgotPassword,
  initialEmail,
}) => {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(initialEmail || "");
  const [emailError, setEmailError] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const emailInputRef = useRef(null);

  useEffect(() => {
    if (showForgotPassword) {
      setForgotPasswordEmail(initialEmail || "");
      setEmailError("");
      setIsSuccess(false);
      if (initialEmail && !validateEmail(initialEmail)) {
          setEmailError("البريد الجامعي غير صحيح");
      }
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [showForgotPassword, initialEmail]);

  const validateEmail = (email) => {
    const universityEmailRegex = /^[^\s@]+@(std\.mans\.edu\.eg|mans\.edu\.eg)$/;
    return universityEmailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForgotPasswordEmail(val);
    if (!val) {
      setEmailError("البريد الجامعي مطلوب");
    } else if (!validateEmail(val)) {
      setEmailError("يجب استخدام البريد الجامعي الصحيح (@std.mans.edu.eg)");
    } else {
      setEmailError("");
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail || !validateEmail(forgotPasswordEmail)) {
      setEmailError("الرجاء إدخال بريد جامعي صحيح");
      return;
    }
    setIsSendingReset(true);
    try {
      await identityApi.requestPasswordReset(forgotPasswordEmail);
      setIsSuccess(true);
      toast.success("تم إرسال رابط إعادة التعيين بنجاح");
    } catch (err) {
      const errorMsg = err.detail || err.message || "حدث خطأ أثناء إرسال الرابط";
      toast.error(errorMsg);
      console.error("Request Reset error:", err);
    } finally {
      setIsSendingReset(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setEmailError("");
    setIsSuccess(false);
    setIsSendingReset(false);
  };

  const inputClass = (hasError) =>
    `w-full px-4 py-3 bg-white dark:bg-dark-surface border ${
      hasError 
        ? "border-red-500/50 focus:ring-red-500/30 animate-shake" 
        : "border-library-primary/10 dark:border-white/[0.08] focus:ring-library-accent/50"
    } rounded-xl focus:outline-none focus:ring-2 focus:border-library-accent shadow-sm focus:shadow-md focus:shadow-library-accent/10 dark:text-white transition-all text-sm`;

  return (
    <AnimatePresence>
      {showForgotPassword && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={resetForgotPassword}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-dark-surface rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: "rtl" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-library-accent/10 flex items-center justify-center">
                  <Lock size={20} className="text-library-accent" />
                </div>
                <h3 className="text-lg font-bold text-library-primary dark:text-white">
                  {isSuccess ? "تفقد بريدك الإلكتروني" : "إعادة تعيين كلمة المرور"}
                </h3>
              </div>
              <button
                onClick={resetForgotPassword}
                className="p-2 hover:bg-library-primary/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={20} className="text-library-primary/50 dark:text-white/50" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="request-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleRequestReset} 
                  className="space-y-5"
                >
                  <p className="text-sm text-library-primary/60 dark:text-gray-400">
                    أدخل بريدك الجامعي وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2 mr-1">
                      البريد الجامعي
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 ${emailError ? 'text-red-400' : 'text-library-primary/30'}`}
                      />
                      <input
                        ref={emailInputRef}
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={handleEmailChange}
                        className={`${inputClass(!!emailError)} pr-10`}
                        placeholder="example@std.mans.edu.eg"
                        dir="ltr"
                        required
                        disabled={isSendingReset}
                      />
                    </div>
                    {emailError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-[11px] font-bold mt-1.5 flex items-center gap-1"
                      >
                        <AlertCircle size={12} /> {emailError}
                      </motion.p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForgotPassword}
                      className="flex-1 px-4 py-3 border border-library-primary/20 dark:border-white/20 text-library-primary dark:text-white font-bold rounded-xl hover:bg-library-primary/5 dark:hover:bg-white/5 transition-colors text-sm"
                      disabled={isSendingReset}
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReset || !forgotPasswordEmail || !!emailError}
                      className="flex-1 px-4 py-3 bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSendingReset ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          إرسال الرابط
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail size={40} className="text-emerald-500 animate-bounce" />
                  </div>
                  <h4 className="text-xl font-bold text-library-primary dark:text-white mb-2"> تم الإرسال بنجاح! </h4>
                  <p className="text-sm text-library-primary/60 dark:text-gray-400 mb-8 leading-relaxed">
                    لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى: <br/>
                    <span className="font-bold text-library-primary dark:text-white">{forgotPasswordEmail}</span>
                    <br/> تفقد صندوق الوارد أو البريد المزعج (Spam).
                  </p>
                  <button
                    onClick={resetForgotPassword}
                    className="w-full py-3.5 bg-library-primary dark:bg-white text-white dark:text-library-primary font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={18} /> العودة لتسجيل الدخول
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
