import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { identityApi, studentsApi } from "../services/api";
import { tokenStore } from "../utils/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dark Mode Logic
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("isDark") === "true";
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const tokens = tokenStore.get();
      if (tokens?.accessToken) {
        try {
          const userData = await identityApi.getMe();
          // التأكد من أن الإيميل مؤكد قبل اعتماد الجلسة
          if (userData && userData.emailConfirmed) {
            setUser(userData);
          } else {
            console.warn("Unconfirmed email session detected and cleared.");
            tokenStore.clear();
            setUser(null);
          }
        } catch (err) {
          console.error("Session expired or invalid", err);
          tokenStore.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password, rememberMe = true) => {
    try {
      // ✅ 1. استدعاء الـ API
      const tokens = await identityApi.login(email, password);

      if (!tokens?.accessToken) {
        return { success: false, error: "لم يتم استلام توكن من الخادم" };
      }

      // ✅ 2. تخزين مؤقت للتوكن لجلب البيانات
      tokenStore.set(tokens, rememberMe);

      // ✅ 3. جلب بيانات المستخدم والتحقق من التفعيل
      const userData = await identityApi.getMe();

      if (!userData?.emailConfirmed) {
        // 🚨 حماية: مسح التوكن فوراً إذا لم يكن الإيميل مؤكداً
        tokenStore.clear(); 
        return {
          success: true, 
          user: null, // لا نضع المستخدم في الحالة
          requiresEmailConfirmation: true,
          email: userData.email
        };
      }

      // ✅ 4. تحديث حالة المستخدم في الـ Context
      setUser(userData);

      return {
        success: true,
        user: userData,
        requiresEmailConfirmation: false,
      };
    } catch (err) {
      // ✅ 5. التنظيف الصحيح في حالة الفشل
      tokenStore.clear();

      // إذا كان الخطأ بسبب بيانات غير صالحة (400) أو غير صحيحة (401)
      if (err.status === 400 || err.status === 401) {
        const lowerMsg = (err.detail || err.message || "").toLowerCase();
        
        // التحقق مما إذا كان السيرفر يرفض الدخول بسبب عدم تأكيد الإيميل
        if (lowerMsg.includes("confirm") || lowerMsg.includes("verify") || lowerMsg.includes("تأكيد")) {
          return {
            success: true,
            requiresEmailConfirmation: true,
          };
        }

        return {
          success: false,
          error: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        };
      }

      // إذا كان الخطأ بسبب كثرة المحاولات (429)
      if (err.status === 429) {
        return {
          success: false,
          error: "محاولات كثيرة جداً! يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.",
        };
      }

      return {
        success: false,
        error: err.detail || err.message || "حدث خطأ أثناء تسجيل الدخول",
      };
    }
  };
  const register = async (formData) => {
    try {
      const response = await studentsApi.create(formData);
      return {
        success: true,
        userId: response.id,
        student: response,
      };
    } catch (err) {
      return {
        success: false,
        error: err.detail || err.message,
        status: err.status,
        errors: err.errors
      };
    }
  };
  const logout = () => {
    tokenStore.clear();
    setUser(null);
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 0);
  };

  useEffect(() => {
    const handleLogout = () => {
      tokenStore.clear();
      setUser(null);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 0);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isLoggedIn: !!user,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
