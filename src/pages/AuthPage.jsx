import React, { useState } from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Shield,
  BookOpen,
  Lock,
  UserPlus,
  AlertCircle,
  Camera,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { identityApi } from "../services/api";

const AuthPage = () => {
  const location = useLocation();
  const { login, register } = useAuth();

  // State Management
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [loginError, setLoginError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    telegramUserId: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingConfirmation, setIsWaitingConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Forgot Password State - OTP System
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
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

  // ملاحظة: تأكيد البريد الإلكتروني يتم عبر صفحة /confirm-email (ConfirmEmail.jsx)

  const handleLoginChange = (e) =>
    setLoginData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateEmail = (email) => {
    const universityEmailRegex = /^[^\s@]+@(std\.mans\.edu\.eg|mans\.edu\.eg)$/;
    return universityEmailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^01[0125][0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
      case "UniversityMailAddress":
        if (!value) {
          error = "البريد الجامعي مطلوب";
        } else if (!validateEmail(value)) {
          error =
            "يجب استخدام البريد الجامعي (@std.mans.edu.eg أو @mans.edu.eg)";
        }
        break;
      case "password":
      case "Password":
        if (!value) {
          error = "كلمة المرور مطلوبة";
        } else if (!validatePassword(value)) {
          error =
            "يجب أن تحتوي على 6 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز خاص";
        }
        break;
      case "name":
      case "Name":
        if (!value || value.trim().length < 4) {
          error = "الاسم يجب أن يكون 4 أحرف على الأقل";
        }
        break;
      case "phone":
      case "PhoneNumber":
        if (!value) {
          error = "رقم الهاتف مطلوب";
        } else if (!validatePhone(value)) {
          error =
            "رقم الهاتف يجب أن يكون مصرياً صحيحاً (يبدأ بـ 010 أو 011 أو 012 أو 015)";
        }
        break;
      case "confirmPassword":
        if (value !== newPassword) {
          error = "كلمتا المرور غير متطابقتين";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === "checkbox" ? checked : value;
    setRegisterData((p) => ({ ...p, [name]: finalVal }));

    if (["email", "password", "name", "phone"].includes(name)) {
      const errorKey =
        name === "email"
          ? "UniversityMailAddress"
          : name === "password"
            ? "Password"
            : name.charAt(0).toUpperCase() + name.slice(1);

      const validationError = validateField(name, finalVal);
      setErrors((p) => ({
        ...p,
        [errorKey]: validationError,
      }));

      if (validationError === "") {
        setErrors((p) => {
          const newErrors = { ...p };
          delete newErrors[errorKey];
          return newErrors;
        });
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    const newErrors = {};
    if (!loginData.email) newErrors.loginEmail = "البريد الإلكتروني مطلوب";
    if (!loginData.password) newErrors.loginPassword = "كلمة المرور مطلوبة";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(loginData.email, loginData.password);
      setIsLoading(false);

      if (result.success) {
        // التوجيه يتم داخل دالة login في AuthContext
      } else {
        const errorMsg = result.error || "فشل تسجيل الدخول";
        setLoginError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setIsLoading(false);
      const errorMsg =
        err.response?.data?.detail || "حدث خطأ غير متوقع أثناء تسجيل الدخول";
      setLoginError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    const newErrors = {};
    if (!registerData.name || registerData.name.trim().length < 4) {
      newErrors.Name = "الاسم يجب أن يكون 4 أحرف على الأقل";
    }
    if (!registerData.email || !validateEmail(registerData.email)) {
      newErrors.UniversityMailAddress = "يجب استخدام البريد الجامعي الصحيح";
    }
    if (!registerData.password || !validatePassword(registerData.password)) {
      newErrors.Password = "كلمة المرور غير صحيحة";
    }
    if (!registerData.phone || !validatePhone(registerData.phone)) {
      newErrors.PhoneNumber = "رقم الهاتف غير صحيح";
    }
    if (!registerData.agreeToTerms) {
      newErrors.agreeToTerms = "يجب الموافقة على ميثاق الشرف";
    }
    if (!photo) {
      newErrors.PersonalPhoto = "الصورة الشخصية مطلوبة";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    const formData = new FormData();
    formData.append("Name", registerData.name.trim());
    formData.append("PhoneNumber", registerData.phone.trim());
    formData.append(
      "TelegramUserId",
      registerData.telegramUserId?.trim() || "",
    );
    if (photo) {
      formData.append("PersonalPhoto", photo);
    }
    formData.append("UniversityMailAddress", registerData.email.trim());
    formData.append("Password", registerData.password.trim());

    try {
      const result = await register(formData);

      if (result.success && result.userId) {
        try {
          await identityApi.sendEmailConfirmation(result.userId);
          toast.success("تم تسجيل بياناتك بنجاح! افحص بريدك الجامعي.");
          setIsWaitingConfirmation(true);
        } catch (emailError) {
          console.error("Email error:", emailError);
          toast.success("تم التسجيل بنجاح! سيتم إرسال بريد التأكيد لاحقاً.");
          setIsWaitingConfirmation(true);
        }
      } else if (!result.success) {
        const errorMsg = result.error || "فشل التسجيل";
        setLoginError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "حدث خطأ غير متوقع";
      toast.error(errorMsg);
      console.error(err);
      if (err.response?.status === 409) {
        toast.error("هذا البريد الإلكتروني مسجل بالفعل.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Input Handler
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
      toast.error("الرجاء إدخال بريد جامعي صحيح");
      return;
    }
    setIsSendingReset(true);
    try {
      await identityApi.requestPasswordReset(forgotPasswordEmail);
      setResetStep(2);
      toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
    } catch (err) {
      const errorMsg =
        err.message || "حدث خطأ أثناء إرسال الرمز";
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
      // حفظ التوكن الراجع من السيرفر لاستخدامه في خطوة إعادة التعيين
      setResetToken(result?.resetToken || result?.token || "");
      setResetStep(3);
      toast.success("تم التحقق بنجاح!");
    } catch (err) {
      const errorMsg =
        err.message || "رمز التحقق غير صحيح أو منتهي الصلاحية";
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
        setIsLogin(true);
      }, 2000);
    } catch (err) {
      const errorMsg =
        err.message || "حدث خطأ أثناء تغيير كلمة المرور";
      toast.error(errorMsg);
      console.error("Reset password error:", err);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordEmail("");
    setOtpCode(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setResetStep(1);
    setResetToken("");
    setIsSendingReset(false);
    setIsVerifyingOtp(false);
    setIsResettingPassword(false);
  };

  const switchMode = () => {
    const next = !isLogin;
    setIsLogin(next);
    setLoginError("");
    setPhoto(null);
    setPhotoPreview(null);
    setErrors({});
    setIsWaitingConfirmation(false);
    resetForgotPassword();
    window.history.replaceState(null, "", next ? "/login" : "/register");
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("الرجاء اختيار ملف صورة صالح");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم الصورة يجب أن يكون أقل من 5MB");
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      setErrors((p) => ({ ...p, PersonalPhoto: "" }));
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white dark:bg-dark-surface border border-library-primary/10 dark:border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-library-accent/30 focus:border-library-accent/40 dark:text-white transition-all text-sm";

  const getInputClass = (name) =>
    `w-full px-4 py-3 bg-white dark:bg-dark-surface border ${
      errors[name]
        ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50 animate-shake"
        : "border-library-primary/10 dark:border-white/[0.08] focus:ring-library-accent/30 focus:border-library-accent/40"
    } rounded-xl focus:outline-none focus:ring-2 dark:text-white transition-all text-sm`;

  const isRegisterFormValid =
    registerData.name &&
    registerData.name.trim().length >= 4 &&
    registerData.phone &&
    validatePhone(registerData.phone) &&
    registerData.email &&
    validateEmail(registerData.email) &&
    registerData.password &&
    validatePassword(registerData.password) &&
    registerData.agreeToTerms &&
    photo;

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
          {registerData.email}
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
      {/* Forgot Password Modal */}
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
                  <X
                    size={20}
                    className="text-library-primary/50 dark:text-white/50"
                  />
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
                          resetStep > step
                            ? "bg-library-accent"
                            : "bg-library-primary/10"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-library-primary/30"
                      />
                      <input
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className={`${inputClass} pr-10`}
                        placeholder="id@std.mans.edu.eg"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetForgotPassword}
                      className="flex-1 px-4 py-3 border border-library-primary/20 dark:border-white/20 text-library-primary dark:text-white font-bold rounded-xl hover:bg-library-primary/5 dark:hover:bg-white/5 transition-colors text-sm"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      disabled={isSendingReset || !forgotPasswordEmail}
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
                    أدخل رمز التحقق المكون من 6 أرقام
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
                        className={`${inputClass} pr-10`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/30 hover:text-library-primary/50"
                      >
                        {showNewPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
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
                        className={`${inputClass} pr-10`}
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/30 hover:text-library-primary/50"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
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
                      disabled={
                        isResettingPassword ||
                        newPassword !== confirmPassword ||
                        !validatePassword(newPassword)
                      }
                      className="flex-1 px-4 py-3 bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold rounded-xl hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResettingPassword ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          جاري التغيير...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
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

      <div className="flex min-h-screen">
        {/* LEFT half → Register form (Desktop) */}
        <div
          className="hidden lg:flex w-1/2 items-center justify-center px-12 py-8 overflow-y-auto no-scrollbar"
          style={{ direction: "rtl" }}
        >
          <div className="max-w-md w-full">
            <Link
              to="/"
              className="text-library-primary/60 dark:text-library-paper/60 hover:text-library-accent flex items-center gap-2 mb-8 w-fit text-sm font-bold"
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
                  <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">
                    توثيق طالب جديد.
                  </h2>
                  <p className="text-library-primary/50 dark:text-gray-400 mb-6 text-sm font-medium">
                    عملية التوثيق تتم يدوياً لضمان بيئة جامعية آمنة.
                  </p>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center mb-2">
                      <label
                        className={`relative w-24 h-24 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group ${
                          errors.PersonalPhoto
                            ? "border-red-500/50 bg-red-500/5"
                            : "bg-library-primary/5 dark:bg-white/5 border-library-primary/20 dark:border-white/20 hover:border-library-accent"
                        }`}
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Camera
                              size={24}
                              className="text-library-primary/40 dark:text-gray-500 mb-1"
                            />
                            <span className="text-[10px] text-library-primary/50 dark:text-gray-400 font-bold text-center leading-tight">
                              صورة
                              <br />
                              شخصية
                            </span>
                          </>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera size={20} className="text-white" />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      {errors.PersonalPhoto && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5">
                          {errors.PersonalPhoto}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                        الاسم الرباعي
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        className={getInputClass("Name")}
                        required
                      />
                      {errors.Name && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5">
                          {errors.Name}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                          البريد الجامعي
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          className={getInputClass("UniversityMailAddress")}
                          dir="ltr"
                          placeholder="example@std.mans.edu.eg"
                          required
                        />
                        {errors.UniversityMailAddress && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5">
                            {errors.UniversityMailAddress}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                          الرقم السري
                        </label>
                        <div className="relative">
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            className={`${getInputClass("Password")} pr-10`}
                            dir="ltr"
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowRegisterPassword(!showRegisterPassword)
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/30 hover:text-library-primary/50"
                          >
                            {showRegisterPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {errors.Password && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5">
                            {errors.Password}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          className={getInputClass("PhoneNumber")}
                          dir="ltr"
                          placeholder="01012345678"
                          required
                        />
                        {errors.PhoneNumber && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5">
                            {errors.PhoneNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                          يوزر تليجرام (اختياري)
                        </label>
                        <input
                          type="text"
                          name="telegramUserId"
                          value={registerData.telegramUserId}
                          onChange={handleRegisterChange}
                          className={inputClass}
                          dir="ltr"
                          placeholder="@username"
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        name="agreeToTerms"
                        checked={registerData.agreeToTerms}
                        onChange={handleRegisterChange}
                        className="mt-1 w-4 h-4 accent-library-accent flex-shrink-0"
                        required
                      />
                      <label
                        htmlFor="terms"
                        className="text-[11px] text-library-primary/60 dark:text-gray-400 leading-relaxed"
                      >
                        أقر بصحة بياناتي وأوافق على{" "}
                        <span className="font-bold text-library-accent">
                          ميثاق شرف المنصة
                        </span>
                        ، وأتعهد بالمحافظة على الكتب المعارة لي.
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-[11px] font-bold">
                        {errors.agreeToTerms}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !isRegisterFormValid}
                      className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> جاري
                          الإرسال...
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          إرسال طلب التوثيق
                        </>
                      )}
                    </button>
                  </form>
                  <p className="mt-6 text-center text-library-primary/40 dark:text-gray-500 text-sm pb-8">
                    لديك حساب موثق؟{" "}
                    <button
                      onClick={switchMode}
                      className="font-bold text-library-accent hover:underline"
                    >
                      تسجيل الدخول
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT half → Login form */}
        <div
          className="w-full lg:w-1/2 flex items-center justify-center px-8 sm:px-12 lg:px-12"
          style={{ direction: "rtl" }}
        >
          <div className="max-w-md w-full">
            <Link
              to="/"
              className="text-library-primary/60 dark:text-library-paper/60 hover:text-library-accent flex items-center gap-2 mb-10 w-fit text-sm font-bold"
            >
              <ArrowRight size={16} /> العودة للأرشيف
            </Link>

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
                  <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">
                    مرحباً بعودتك.
                  </h2>
                  <p className="text-library-primary/50 dark:text-gray-400 mb-8 text-sm font-medium">
                    سجل دخولك لمتابعة كتبك المستعارة أو لإضافة مراجع جديدة.
                  </p>
                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-2">
                        البريد الجامعي
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className={getInputClass("loginEmail")}
                        placeholder="student@std.mans.edu.eg"
                        dir="ltr"
                        required
                      />
                      {errors.loginEmail && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5">
                          {errors.loginEmail}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300">
                          كلمة المرور
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs font-bold text-library-accent hover:underline"
                        >
                          نسيت الرمز؟
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          className={`${getInputClass("loginPassword")} pr-10`}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/30 hover:text-library-primary/50"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      {errors.loginPassword && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5">
                          {errors.loginPassword}
                        </p>
                      )}
                    </div>

                    {loginError && (
                      <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                        <AlertCircle size={14} />
                        <span>{loginError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> جاري
                          الدخول...
                        </>
                      ) : (
                        <>
                          <Lock size={16} />
                          دخول للأرشيف
                        </>
                      )}
                    </button>
                  </form>
                  <p className="mt-8 text-center text-library-primary/40 dark:text-gray-500 text-sm">
                    طالب جديد؟{" "}
                    <button
                      onClick={switchMode}
                      className="font-bold text-library-accent hover:underline"
                    >
                      وثق حسابك الآن
                    </button>
                  </p>
                </motion.div>
              ) : isWaitingConfirmation ? (
                <ConfirmationScreen key="confirmation-mobile" />
              ) : (
                <motion.div
                  key="register-mobile"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="lg:hidden"
                >
                  <h2 className="text-3xl font-black text-library-primary dark:text-white mb-2">
                    توثيق طالب جديد.
                  </h2>
                  <p className="text-library-primary/50 dark:text-gray-400 mb-6 text-sm font-medium">
                    عملية التوثيق تتم يدوياً لضمان بيئة جامعية آمنة.
                  </p>
                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="flex flex-col items-center justify-center mb-2">
                      <label
                        className={`relative w-20 h-20 rounded-full border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden group ${
                          errors.PersonalPhoto
                            ? "border-red-500/50 bg-red-500/5"
                            : "bg-library-primary/5 dark:bg-white/5 border-library-primary/20 dark:border-white/20 hover:border-library-accent"
                        }`}
                      >
                        {photoPreview ? (
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Camera
                            size={20}
                            className="text-library-primary/40 dark:text-gray-500"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                      {errors.PersonalPhoto && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5">
                          {errors.PersonalPhoto}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                        الاسم الرباعي
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        className={getInputClass("Name")}
                        required
                      />
                      {errors.Name && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5">
                          {errors.Name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                        البريد الجامعي
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className={getInputClass("UniversityMailAddress")}
                        dir="ltr"
                        placeholder="id@std.mans.edu.eg"
                        required
                      />
                      {errors.UniversityMailAddress && (
                        <p className="text-red-500 text-[11px] font-bold mt-1.5">
                          {errors.UniversityMailAddress}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                          رقم الهاتف
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={registerData.phone}
                          onChange={handleRegisterChange}
                          className={getInputClass("PhoneNumber")}
                          dir="ltr"
                          required
                        />
                        {errors.PhoneNumber && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5">
                            {errors.PhoneNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-library-primary/70 dark:text-gray-300 mb-1.5">
                          الرقم السري
                        </label>
                        <div className="relative">
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            name="password"
                            value={registerData.password}
                            onChange={handleRegisterChange}
                            className={`${getInputClass("Password")} pr-10`}
                            required
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowRegisterPassword(!showRegisterPassword)
                            }
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/30 hover:text-library-primary/50"
                          >
                            {showRegisterPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {errors.Password && (
                          <p className="text-red-500 text-[11px] font-bold mt-1.5">
                            {errors.Password}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-1">
                      <input
                        type="checkbox"
                        id="terms-mobile"
                        name="agreeToTerms"
                        checked={registerData.agreeToTerms}
                        onChange={handleRegisterChange}
                        className="mt-1 w-4 h-4 accent-library-accent flex-shrink-0"
                        required
                      />
                      <label
                        htmlFor="terms-mobile"
                        className="text-[11px] text-library-primary/60 dark:text-gray-400 leading-relaxed"
                      >
                        أوافق على ميثاق شرف المنصة
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="text-red-500 text-[11px] font-bold">
                        {errors.agreeToTerms}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || !isRegisterFormValid}
                      className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> جاري
                          الإرسال...
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} />
                          إرسال طلب التوثيق
                        </>
                      )}
                    </button>
                  </form>
                  <p className="mt-6 text-center text-library-primary/40 dark:text-gray-500 text-sm pb-8">
                    لديك حساب؟{" "}
                    <button
                      onClick={switchMode}
                      className="font-bold text-library-accent hover:underline"
                    >
                      تسجيل الدخول
                    </button>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

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
