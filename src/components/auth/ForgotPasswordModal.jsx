import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, X, CheckCircle2, Mail, Loader2, ShieldCheck, Key, Eye, EyeOff, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { identityApi } from "../../services/api";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const ForgotPasswordModal = ({
  showForgotPassword,
  setShowForgotPassword,
  initialEmail,
}) => {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState(initialEmail || "");
  const [emailError, setEmailError] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailInputRef = useRef(null);

  useEffect(() => {
    if (showForgotPassword) {
      setForgotPasswordEmail(initialEmail || "");
      setEmailError("");
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

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpCode[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) {
          prevInput.focus();
          const newOtp = [...otpCode];
          newOtp[index - 1] = "";
          setOtpCode(newOtp);
        }
      } else if (otpCode[index]) {
        const newOtp = [...otpCode];
        newOtp[index] = "";
        setOtpCode(newOtp);
      }
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpCode];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtpCode(newOtp);

    setTimeout(() => {
      const lastIndex = Math.min(pastedData.length, 5);
      const lastInput = document.getElementById(`otp-${lastIndex}`);
      if (lastInput) {
        lastInput.focus();
        lastInput.select();
      }
    }, 10);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail || !validateEmail(forgotPasswordEmail)) {
      setEmailError("الرجاء إدخال بريد جامعي صحيح");
      return;
    }
    setIsSendingReset(true);
    try {
      await identityApi.requestPasswordReset(forgotPasswordEmail);
      setResetStep(2);
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
    } catch (err) {
      const errorMsg = err.detail || err.message || "حدث خطأ أثناء إرسال الرمز";
      toast.error(errorMsg);
      console.error("Request OTP error:", err);
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otpCode.join("");
    if (otpString.length !== 6) {
      toast.error("الرجاء إدخال رمز التحقق كاملاً (6 أرقام)");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const result = await identityApi.verifyPasswordResetOtp({
        email: forgotPasswordEmail,
        otp: otpString,
      });
      setResetToken(result?.resetToken || result?.token || "");
      setResetStep(3);
      toast.success("تم التحقق بنجاح!");
    } catch (err) {
      const errorMsg =
        err.detail || err.message || "رمز التحقق غير صحيح أو منتهي الصلاحية";
      toast.error(errorMsg);
      console.error("Verify OTP error:", err);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    if (!validatePassword(newPassword)) {
      toast.error(
        "كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص",
      );
      return;
    }
    setIsResettingPassword(true);
    try {
      await identityApi.resetPassword({
        email: forgotPasswordEmail,
        token: resetToken,
        newPassword: newPassword,
      });
      toast.success("تم تغيير كلمة المرور بنجاح!");
      setTimeout(() => {
        resetForgotPassword();
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.detail || err.message || "حدث خطأ أثناء تغيير كلمة المرور";
      toast.error(errorMsg);
      console.error("Reset password error:", err);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setEmailError("");
    setOtpCode(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setResetStep(1);
    setResetToken("");
    setIsSendingReset(false);
    setIsVerifyingOtp(false);
    setIsResettingPassword(false);
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
            className="bg-white dark:bg-dark-surface rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ direction: "rtl" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-library-accent/10 flex items-center justify-center">
                  <Lock size={20} className="text-library-accent" />
                </div>
                <h3 className="text-lg font-bold text-library-primary dark:text-white">
                  إعادة تعيين كلمة المرور
                </h3>
              </div>
              <button
                onClick={resetForgotPassword}
                className="p-2 hover:bg-library-primary/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={20} className="text-library-primary/50 dark:text-white/50" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      resetStep >= step
                        ? "bg-library-accent text-white"
                        : "bg-library-primary/10 text-library-primary/50"
                    }`}
                  >
                    {resetStep > step ? <CheckCircle2 size={16} /> : step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-12 h-1 rounded transition-colors ${
                        resetStep > step ? "bg-library-accent" : "bg-library-primary/10"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {resetStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-sm text-library-primary/60 dark:text-gray-400 mb-4">
                  أدخل بريدك الجامعي وسنرسل لك رمز تحقق
                </p>
                <div>
                  <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">
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
                    className="flex-1 px-4 py-3 bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingReset ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        إرسال الرمز
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-sm text-library-primary/60 dark:text-gray-400 mb-4 text-center">
                  أدخل رمز التحقق المكون من 6 أرقام المرسل إلى <br/>
                  <span className="font-bold text-library-primary dark:text-white">{forgotPasswordEmail}</span>
                </p>
                <div className="flex justify-center gap-2 mb-4" dir="ltr">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handlePasteOtp}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-library-primary/20 dark:border-white/20 rounded-xl focus:outline-none focus:border-library-accent focus:ring-2 focus:ring-library-accent/30 bg-white dark:bg-dark-surface text-library-primary dark:text-white transition-all"
                    />
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="flex-1 px-4 py-3 border border-library-primary/20 dark:border-white/20 text-library-primary dark:text-white font-bold rounded-xl hover:bg-library-primary/5 dark:hover:bg-white/5 transition-colors text-sm"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpCode.join("").length !== 6}
                    className="flex-1 px-4 py-3 bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <Key size={16} />
                        تحقق
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-center text-library-primary/50 dark:text-gray-400 mt-2">
                  لم يصلك الرمز؟{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(["", "", "", "", "", ""]);
                      handleRequestOtp({ preventDefault: () => {} });
                    }}
                    className="text-library-accent font-bold hover:underline"
                  >
                    إعادة الإرسال
                  </button>
                </p>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-library-primary/60 dark:text-gray-400 mb-4 text-center">
                  أدخل كلمة المرور الجديدة
                </p>
                <div>
                  <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-library-primary/30"
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`${inputClass(false)} px-10`}
                      dir="ltr"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/60 dark:text-library-paper/60 hover:text-library-primary dark:hover:text-library-paper transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={newPassword} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-library-primary/30"
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${inputClass(newPassword !== confirmPassword && confirmPassword !== "")} px-10`}
                      dir="ltr"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/60 dark:text-library-paper/60 hover:text-library-primary dark:hover:text-library-paper transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPassword !== confirmPassword && confirmPassword !== "" && (
                    <p className="text-red-500 text-[11px] font-bold mt-1">كلمتا المرور غير متطابقتين</p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep(2)}
                    className="flex-1 px-4 py-3 border border-library-primary/20 dark:border-white/20 text-library-primary dark:text-white font-bold rounded-xl hover:bg-library-primary/5 dark:hover:bg-white/5 transition-colors text-sm"
                  >
                    رجوع
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                    className="flex-1 px-4 py-3 bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        جاري التغيير...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        تغيير كلمة المرور
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
