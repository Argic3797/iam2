import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import SignUpPage2 from "./pages/sign-up-email";
import SignUpPage3 from "./pages/sign-up-pw";
import SignInPage1 from "./pages/sign-in";
import ResetPWRQ from "./pages/reset-pw-rq";
import ResetPW from "./pages/reset-pw";
import { Toaster } from "sonner";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";

function App() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        clearUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, clearUser]);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/sign-up-email"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <SignUpPage2 />
          }
        />
        <Route
          path="/sign-up-pw"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <SignUpPage3 />
          }
        />
        <Route
          path="/sign-in"
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <SignInPage1 />
          }
        />
        <Route path="/reset-pw-rq" element={<ResetPWRQ />} />
        <Route path="/reset-pw" element={<ResetPW />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
