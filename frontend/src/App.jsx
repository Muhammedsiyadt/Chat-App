import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import RequestPage from "./pages/RequestPage";
import AdminRequestList from "./pages/AdminRequestList";
import AdminLogin from "./pages/AdminLogin";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, authAdmin, checkAuthAdmin } = useAuthStore();
  const { theme } = useThemeStore();

  console.log({ authAdmin });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    checkAuthAdmin();
  }, []);
  


  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
    

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        {/* ADMIN ROUTES WITH PROTUCTION */}
        <Route path="/admin" element={authAdmin ? <AdminRequestList /> : <Navigate to="/admin-login" />} />
        <Route path="/admin-login" element={!authAdmin ? <AdminLogin /> : <Navigate to="/admin" />} />
        
        {/* ADMIN ROUTES WITH PROTUCTION */}

        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/request" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />

        <Route path="/request" element={!authUser ? <RequestPage /> : <Navigate to="/login" />} />

      </Routes>

      <Toaster />
    </div>
  );
};
export default App;
