import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
import Home          from './pages/Home';
import AuthPage      from './pages/AuthPage';
import Dashboard     from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import BookDetail    from './pages/BookDetail';
import MyCopies      from './pages/MyCopies';
import LendingList   from './pages/LendingList';
import AdminStudents from './pages/AdminStudents';
import AdminBooks    from './pages/AdminBooks';
import ConfirmEmail  from './pages/ConfirmEmail';

// Effects
import Preloader from './components/effects/Preloader';
import Aurora    from './components/effects/Aurora';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';

// ── Guards ───────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// Admin guard — to be wired with real role from API later
const AdminRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// ── Routes ───────────────────────────────────────────────────────────────────
function AppRoutes() {
  const [loading, setLoading] = useState(true);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <Preloader key="loader" onComplete={() => setLoading(false)} />
      ) : (
        <div key="content" className="relative">
          <Aurora />
          <div className="App">
            <Routes>
              {/* ── Public ── */}
              <Route path="/"               element={<Home />} />
              <Route path="/login"          element={<AuthPage />} />
              <Route path="/register"       element={<AuthPage />} />
              <Route path="/confirm-email"  element={<ConfirmEmail />} />

              {/* ── Student (protected) ── */}
              {/* Main entry point after login */}
              <Route path="/app"      element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/profile"  element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
              
              {/* Book routing handles the catalog in Dashboard and specific details here */}
              <Route path="/catalog/:bookId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
              <Route path="/my-copies" element={<ProtectedRoute><MyCopies /></ProtectedRoute>} />
              <Route path="/lending"   element={<ProtectedRoute><LendingList /></ProtectedRoute>} />

              {/* ── Admin (protected) ── */}
              <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
              <Route path="/admin/books"    element={<AdminRoute><AdminBooks /></AdminRoute>} />

              {/* ── Legacy / team routes (untouched) ── */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/books"     element={<Dashboard />} />

              {/* ── Fallback ── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
