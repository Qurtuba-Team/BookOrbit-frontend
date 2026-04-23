import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Mail, Shield, User } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { tokenStore } from "../../utils/constants";

const LoginForm = ({ onForgotPassword, onUnconfirmed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, mockLogin } = useAuth();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const loginEmailRef = useRef(null);

  useEffect(() => {
    if (loginEmailRef.current) {
      setTimeout(() => loginEmailRef.current.focus(), 100);
    }
  }, []);

  const validateEmail = (email) => {
    const universityEmailRegex = /^[^\s@]+@(std\.mans\.edu\.eg|mans\.edu\.eg|VIP\.admin|bookorbit\.com)$/;
    return universityEmailRegex.test(email);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((p) => ({ ...p, [name]: value }));
    
    if (name === "email") {
      if (!value) {
        setErrors(p => ({ ...p, loginEmail: "البريد الإلكتروني مطلوب" }));
      } else if (!validateEmail(value)) {
        setErrors(p => ({ ...p, loginEmail: "يجب استخدام البريد الجامعي الصحيح" }));
      } else {
        setErrors(p => {
          const newE = { ...p };
          delete newE.loginEmail;
          return newE;
        });
      }
    } else if (name === "password") {
      if (!value) {
        setErrors(p => ({ ...p, loginPassword: "كلمة المرور مطلوبة" }));
      } else {
        setErrors(p => {
          const newE = { ...p };
          delete newE.loginPassword;
          return newE;
        });
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    const newErrors = {};
    if (!loginData.email) {
      newErrors.loginEmail = "البريد الإلكتروني مطلوب";
    } else if (!validateEmail(loginData.email)) {
      newErrors.loginEmail = "البريد الجامعي غير صحيح";
    }
    
    if (!loginData.password) newErrors.loginPassword = "كلمة المرور مطلوبة";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const loginResult = await login(
        loginData.email.trim(),
        loginData.password.trim(),
        rememberMe,
      );

      if (!loginResult.success) {
        setLoginError(loginResult.error || "فشل تسجيل الدخول");
        toast.error(loginResult.error || "فشل تسجيل الدخول");
        setIsLoading(false);
        return;
      }

      if (loginResult.requiresEmailConfirmation) {
        setLoginError("يجب تأكيد بريدك الجامعي أولاً ⚠️");
        setIsLoading(false);
        const shakeForm = () => {
          const formElement = document.getElementById("login-form-container");
          if (formElement) {
            formElement.classList.add("animate-shake");
            setTimeout(() => formElement.classList.remove("animate-shake"), 500);
          }
        };
        shakeForm();

        setTimeout(() => {
          onUnconfirmed(loginData.email.trim());
        }, 1500);
        return;
      }

      toast.success(
        `مرحباً بك مجدداً، ${loginResult.user?.fullName || loginResult.user?.name || "أهلاً بك"}! 🎉`,
      );

      const from = location.state?.from?.pathname || "/app";
      navigate(from, { replace: true });
    } catch (err) {
      setIsLoading(false);
      let errorMsg = err?.message || err?.detail || "حدث خطأ غير متوقع";
      if (err.status === 400 || err.status === 401) {
        errorMsg = "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      } else if (err.status === 429) {
        errorMsg = "محاولات كثيرة جداً! يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.";
      }
      setLoginError(errorMsg);
      toast.error(errorMsg);
      tokenStore.clear();
    }
  };

  // ✅ دخول وهمي (Mock) لتخطي الباك إند ورؤية الفرونت إند مباشرة
  const handleQuickLogin = (role) => {
    setIsLoading(true);
    setTimeout(() => {
      const result = mockLogin(role);
      if (result.success) {
        toast.success(`تم الدخول (Mock ${role === 'admin' ? 'Admin' : 'Student'}) بنجاح ⚡`);
        if (role === 'admin') {
          navigate("/admin/students", { replace: true });
        } else {
          navigate("/app", { replace: true });
        }
      }
      setIsLoading(false);
    }, 500);
  };

  const getInputClass = (name) =>
    `w-full px-4 py-3.5 bg-white dark:bg-dark-surface border-2 ${
      errors[name]
        ? "border-red-500/50 focus:ring-red-500/10 focus:border-red-500 animate-shake"
        : "border-library-primary/5 dark:border-white/[0.05] focus:border-library-accent focus:ring-0 shadow-sm"
    } rounded-xl focus:outline-none dark:text-white transition-all text-sm font-medium placeholder:text-gray-300`;

  return (
    <>
      <h2 className="text-2xl font-black text-library-primary dark:text-white mb-1 tracking-tight">
        مرحباً بعودتك.
      </h2>
      <p className="text-library-primary/40 dark:text-gray-400 mb-6 text-[11px] font-bold">
        سجل دخولك لمتابعة كتبك المستعارة أو لإضافة مراجع جديدة.
      </p>
      <form id="login-form-container" onSubmit={handleLoginSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-black text-library-primary/60 dark:text-gray-300 mb-2 mr-1">
            البريد الجامعي
          </label>
          <input
            ref={loginEmailRef}
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleLoginChange}
            className={getInputClass("loginEmail")}
            placeholder="student@std.mans.edu.eg"
            dir="ltr"
            required
            disabled={isLoading}
          />
          {errors.loginEmail && (
            <p className="text-red-500 text-[10px] font-bold mt-2 mr-1">
              {errors.loginEmail}
            </p>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center mb-2 px-1">
            <button
              type="button"
              onClick={() => onForgotPassword(loginData.email)}
              className="text-[11px] font-black text-library-accent hover:opacity-80 transition-opacity disabled:opacity-50"
              disabled={isLoading}
            >
              نسيت كلمة المرور؟
            </button>
            <label className="block text-[11px] font-black text-library-primary/60 dark:text-gray-300">
              كلمة المرور
            </label>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              className={`${getInputClass("loginPassword")} pl-12`}
              required
              dir="ltr"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-library-primary/30 dark:text-library-paper/30 hover:text-library-primary transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.loginPassword && (
            <p className="text-red-500 text-[10px] font-bold mt-2 mr-1">
              {errors.loginPassword}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-1">
          <label
            htmlFor="remember"
            className="text-[11px] font-black text-library-primary/60 dark:text-gray-300 cursor-pointer select-none"
          >
            تذكرني
          </label>
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-library-accent rounded-md cursor-pointer"
          />
        </div>

        <div className="space-y-2 mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-library-primary dark:bg-white text-white dark:text-library-primary font-black py-3 rounded-xl shadow-lg shadow-library-primary/10 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>تسجيل الدخول</span>
                <ArrowRight size={16} className="rotate-180" />
              </>
            )}
          </button>

          {/* أزرار الدخول السريع للمطورين */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin")}
              disabled={isLoading}
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-black py-3 rounded-xl hover:bg-amber-500/20 transition-all text-[10px] flex items-center justify-center gap-2"
            >
              <Shield size={14} />
              <span>دخول سريع (أدمن)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("student")}
              disabled={isLoading}
              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-black py-3 rounded-xl hover:bg-emerald-500/20 transition-all text-[10px] flex items-center justify-center gap-2"
            >
              <User size={14} />
              <span>دخول سريع (طالب)</span>
            </button>
          </div>
        </div>
      </form>

      {loginError && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-3"
        >
          <div className="text-red-500 bg-red-500/10 p-2 rounded-lg">
            <Mail size={16} />
          </div>
          <p className="text-red-600 dark:text-red-400 text-[11px] font-black leading-relaxed">
            {loginError}
          </p>
        </motion.div>
      )}
    </>
  );
};

export default LoginForm;
