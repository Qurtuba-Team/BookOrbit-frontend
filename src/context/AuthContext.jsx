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

  // Helper to fetch full user profile (Identity + Student info)
  const fetchFullProfile = async () => {
    try {
      const identityData = await identityApi.getMe();
      
      if (identityData && identityData.emailConfirmed) {
        try {
          const studentData = await studentsApi.getMe();
          // Merge data - Supporting "Name" field from Swagger
          return {
            ...identityData,
            // Try all possible name fields from the student API
            fullName: studentData.Name || studentData.name || studentData.fullName || studentData.FullName,
            phoneNumber: studentData.PhoneNumber || studentData.phoneNumber,
            major: studentData.Major || studentData.major,
            university: studentData.University || studentData.university,
            studentId: studentData.id || studentData.Id,
            image: studentData.PersonalPhoto || studentData.image || studentData.profileImage
          };
        } catch (sErr) {
          console.warn("User is not a student or profile not found", sErr);
          // Fallback to identity name if student profile fails
          return {
            ...identityData,
            fullName: identityData.Name || identityData.name || identityData.userName
          };
        }
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch profile", err);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const tokens = tokenStore.get();
      if (tokens?.accessToken) {
        const fullUser = await fetchFullProfile();
        if (fullUser) {
          setUser(fullUser);
        } else {
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
      const tokens = await identityApi.login(email, password);

      if (!tokens?.accessToken) {
        return { success: false, error: "لم يتم استلام توكن من الخادم" };
      }

      tokenStore.set(tokens, rememberMe);

      const fullUser = await fetchFullProfile();

      if (!fullUser) {
        const identityData = await identityApi.getMe().catch(() => null);
        if (identityData && !identityData.emailConfirmed) {
          tokenStore.clear(); 
          return {
            success: true, 
            user: null,
            requiresEmailConfirmation: true,
            email: identityData.email
          };
        }
        tokenStore.clear();
        return { success: false, error: "فشل في جلب بيانات الملف الشخصي" };
      }

      setUser(fullUser);

      return {
        success: true,
        user: fullUser,
        requiresEmailConfirmation: false,
      };
    } catch (err) {
      tokenStore.clear();
      if (err.status === 400 || err.status === 401) {
        const lowerMsg = (err.detail || err.message || "").toLowerCase();
        if (lowerMsg.includes("confirm") || lowerMsg.includes("verify") || lowerMsg.includes("تأكيد")) {
          return { success: true, requiresEmailConfirmation: true };
        }
        return { success: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
      }
      if (err.status === 429) {
        return { success: false, error: "محاولات كثيرة جداً! يرجى الانتظار دقيقة." };
      }
      return { success: false, error: err.detail || err.message || "حدث خطأ أثناء تسجيل الدخول" };
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
