import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// ── Temporary bypass credentials ──────────────────────────────────────────────
const BYPASS_EMAIL    = "demo@booksorbit.com";
const BYPASS_PASSWORD = "demo1234";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    if (email === BYPASS_EMAIL && password === BYPASS_PASSWORD) {
      const mockUser = {
        id: "demo-001",
        name: "أحمد سامي",
        email: BYPASS_EMAIL,
        university: "جامعة القاهرة",
        faculty: "كلية الحاسبات",
        avatar: null,
        booksLent: 12,
        booksBorrowed: 8,
        rating: 4.8,
        isVerified: true,
      };
      setUser(mockUser);
      return { success: true };
    }
    return { success: false, error: "البريد أو كلمة المرور غير صحيحة" };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
