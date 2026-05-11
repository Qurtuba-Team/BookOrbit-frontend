import React, { useState, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";

import Preloader from "./components/effects/Preloader";
import Aurora from "./components/effects/Aurora";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ChatProvider from "./context/ChatContext";

const Home = lazy(() => import("./pages/Home"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddBook = lazy(() => import("./pages/AddBook"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const MyCopies = lazy(() => import("./pages/MyCopies"));
const BorrowingIncomingRequests = lazy(() => import("./pages/BorrowingIncomingRequests"));
const BorrowingOutgoingRequests = lazy(() => import("./pages/BorrowingOutgoingRequests"));
const BorrowingTransactions = lazy(() => import("./pages/BorrowingTransactions"));
const AdminStudents = lazy(() => import("./pages/AdminStudents"));
const AdminBooks = lazy(() => import("./pages/AdminBooks"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const EmailVerified = lazy(() => import("./redirects/EmailVerified"));
const ResetPassword = lazy(() => import("./redirects/ResetPassword"));
const Notifications = lazy(() => import("./pages/Notifications"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Chat = lazy(() => import("./pages/Chat"));


const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-library-paper dark:bg-dark-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-library-accent"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { isLoggedIn, loading, user } = useAuth();
  if (loading) return null;
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/app" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const { isLoggedIn, loading, user } = useAuth();
  if (loading) return null;
  if (isLoggedIn) {
    return (
      <Navigate
        to={user?.role?.toLowerCase() === "admin" ? "/admin" : "/app"}
        replace
      />
    );
  }
  return children;
};

function AppRoutes() {
  const isRootPath = window.location.pathname === "/";
  const [loading, setLoading] = useState(
    () => isRootPath && !sessionStorage.getItem("site_loaded"),
  );

  const handlePreloaderComplete = () => {
    setLoading(false);
    sessionStorage.setItem("site_loaded", "true");
  };

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <Preloader key="loader" onComplete={handlePreloaderComplete} />
      ) : (
        <div key="content" className="relative min-h-screen">
          <Aurora />
          <div className="App relative z-10">
            <Toaster position="top-center" reverseOrder={false} />

            <Suspense fallback={
              <div className="flex items-center justify-center h-screen bg-library-paper dark:bg-dark-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-library-accent"></div>
              </div>
            }>
              <Routes>
                <Route
                  path="/"
                  element={
                    <GuestRoute>
                      <Home />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <AuthPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <AuthPage />
                    </GuestRoute>
                  }
                />
                <Route path="/confirm-email" element={<EmailVerified />} />
                <Route path="/email-verified" element={<EmailVerified />} />
                <Route path="/EmailVerified" element={<EmailVerified />} />
                <Route path="/EmailVerfied" element={<EmailVerified />} />
                <Route
                  path="/reset-password"
                  element={
                    <GuestRoute>
                      <ResetPassword />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/ResetPassword"
                  element={
                    <GuestRoute>
                      <ResetPassword />
                    </GuestRoute>
                  }
                />

                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <ChangePassword />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/catalog/:bookId"
                  element={
                    <ProtectedRoute>
                      <BookDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-copies"
                  element={
                    <ProtectedRoute>
                      <MyCopies />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lending/incoming"
                  element={
                    <ProtectedRoute>
                      <BorrowingIncomingRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lending/outgoing"
                  element={
                    <ProtectedRoute>
                      <BorrowingOutgoingRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/lending/transactions/:type"
                  element={
                    <ProtectedRoute>
                      <BorrowingTransactions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/addbook"
                  element={
                    <ProtectedRoute>
                      <AddBook />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/:studentId"
                  element={
                    <ProtectedRoute>
                      <PublicProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat/:studentId?"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <AdminRoute>
                      <AdminStudents />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/books"
                  element={
                    <AdminRoute>
                      <AdminBooks />
                    </AdminRoute>
                  }
                />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/books"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ChatProvider>
            <AppRoutes />
          </ChatProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
