import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, LogIn, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { identityApi } from "../../services/api";

const LoginForm = ({ onForgotPassword }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [requiresConfirmationEmail, setRequiresConfirmationEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(() => {
    const saved = sessionStorage.getItem("resendCooldownTime");
    if (saved) {
      const remaining = Math.floor((parseInt(saved, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  const loginEmailRef = useRef(null);

  useEffect(() => {
    if (loginEmailRef.current) {
      setTimeout(() => loginEmailRef.current.focus(), 100);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else {
      sessionStorage.removeItem("resendCooldownTime");
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendConfirmation = async () => {
    if (resendCooldown > 0) return;
    try {
      setResendCooldown(60);
      sessionStorage.setItem("resendCooldownTime", (Date.now() + 60000).toString());
      await identityApi.sendEmailConfirmation(requiresConfirmationEmail, {
        skipAuth: true,
      });
      toast.success("✅ تم إرسال رابط تفعيل جديد لبريدك الجامعي");
    } catch (err) {
      setResendCooldown(0);
      toast.error("❌ فشل إرسال الرابط، حاول مرة أخرى لاحقاً");
    }
  };

  const validateEmail = (email) => {
    const universityEmailRegex = /^[^\s@]+@(std\.mans\.edu\.eg|mans\.edu\.eg)$/;
    return universityEmailRegex.test(email);
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((p) => ({ ...p, [name]: value }));
    
    // Real-time validation
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
    e.preventDefault();
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
        setLoginError("يجب تأكيد بريدك الجامعي أولاً");
        setRequiresConfirmationEmail(loginData.email.trim());
        setIsLoading(false);
        return;
      }

      toast.success(
        `مرحباً بك مجدداً، ${loginResult.user?.name || "أهلاً بك"}! 🎉`,
      );

      const from = location.state?.from?.pathname || "/app";
      navigate(from, { replace: true });
    } catch (err) {
      setIsLoading(false);
      const errorMsg =
        err?.message ||
        err?.detail ||
        err?.errors?.[0] ||
        "حدث خطأ غير متوقع أثناء تسجيل الدخول";

      setLoginError(errorMsg);
      toast.error(errorMsg);
      localStorage.removeItem("token");
    }
  };

  const getInputClass = (name) =>
    `w-full px-4 py-3 bg-white dark:bg-dark-surface border ${
      errors[name]
        ? "border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50 animate-shake"
        : "border-library-primary/10 dark:border-white/[0.08] focus:ring-library-accent/50 focus:border-library-accent shadow-sm focus:shadow-md focus:shadow-library-accent/10"
    } rounded-xl focus:outline-none focus:ring-2 dark:text-white transition-all text-sm`;

  return (
    <>
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
              onClick={() => onForgotPassword(loginData.email)}
              className="text-xs font-bold text-library-accent hover:underline disabled:opacity-50 disabled:no-underline"
              disabled={isLoading}
            >
              نسيت كلمة المرور؟
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              className={`${getInputClass("loginPassword")} pl-10`}
              required
              dir="ltr"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-library-primary/60 dark:text-library-paper/60 hover:text-library-primary dark:hover:text-library-paper transition-colors ease-in-out"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.loginPassword && (
            <p className="text-red-500 text-[11px] font-bold mt-1.5">
              {errors.loginPassword}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 accent-library-accent rounded"
          />
          <label
            htmlFor="remember"
            className="text-xs font-bold text-library-primary/70 dark:text-gray-300 cursor-pointer"
          >
            تذكرني
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-library-primary dark:bg-white text-library-paper dark:text-library-primary font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> جاري
              الدخول...
            </>
          ) : (
            <>
              <LogIn size={16} />
              تسجيل الدخول
            </>
          )}
        </button>
      </form>

      {/* رسالة الخطأ العام / تأكيد البريد */}
      {loginError && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl flex items-start gap-3"
        >
          <div className="text-red-500 mt-0.5">
            <Mail size={16} />
          </div>
          <div className="flex-1">
            <p className="text-red-600 dark:text-red-400 text-xs font-bold leading-relaxed">
              {loginError}
            </p>
            {requiresConfirmationEmail && (
              <button
                onClick={handleResendConfirmation}
                disabled={resendCooldown > 0}
                className="mt-2 text-[11px] font-bold text-library-primary dark:text-white bg-white dark:bg-dark-surface px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {resendCooldown > 0
                  ? `أعد المحاولة بعد ${resendCooldown} ثانية`
                  : "إعادة إرسال رابط التفعيل"}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default LoginForm;
