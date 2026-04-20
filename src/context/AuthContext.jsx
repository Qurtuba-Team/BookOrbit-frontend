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
          setUser(userData);
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
      // ✅ 1. استدعاء الـ API بمتغيرين كما هو متوقع
      const tokens = await identityApi.login(email, password);

      if (!tokens?.accessToken) {
        return {
          success: false,
          error: "لم يتم استلام توكن من الخادم",
        };
      }

      // ✅ 2. تخزين التوكن باستخدام tokenStore لكي يعمل api.js
      tokenStore.set(tokens, rememberMe);

      // ✅ 3. جلب بيانات المستخدم (ستعمل الآن لأن التوكن مخزن صح)
      const userData = await identityApi.getMe();

      if (!userData?.emailConfirmed) {
        tokenStore.clear(); // منع الدخول إذا كان الإيميل غير مؤكد
        return {
          success: true,
          user: userData,
          requiresEmailConfirmation: true,
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
