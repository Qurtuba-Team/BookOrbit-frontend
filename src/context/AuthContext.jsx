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

  // استرجاع الجلسة عند الفتح
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

  const login = async (email, password) => {
    try {
      const tokens = await identityApi.login(email, password);
      tokenStore.set(tokens);
      const userData = await identityApi.getMe();
      setUser(userData);

      // ✅ التوجيه لصفحة محمية مع استبدال التاريخ
      // بنستخدم setTimeout صغير جداً عشان نتأكد من تحديث الـ State أولاً
      setTimeout(() => {
        navigate("/app", { replace: true });
      }, 0);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.detail ||
          err.message ||
          "حدث خطأ أثناء تسجيل الدخول",
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
        error: err.response?.data?.detail || err.message,
      };
    }
  };

  const logout = () => {
    // 1. مسح التوكنز فوراً
    tokenStore.clear();

    // 2. تصفير الحالة
    setUser(null);

    // 3. التوجيه للوجين مع استبدال التاريخ (الأهم!)
    // بنستخدم setTimeout عشان نتأكد إن المتصفح خلص عملية المسح قبل ما يغير الصفحة
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 0);
  };

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
