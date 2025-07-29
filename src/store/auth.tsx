import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  email: string;
  password: string;
  isAuthenticated: boolean;

  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setUser: (user: User) => void;
  clearUser: () => void;

  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      email: "",
      password: "",
      isAuthenticated: false,

      setEmail: (email) => set({ email }),
      setPassword: (password) => set({ password }),

      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () =>
        set({ user: null, email: "", password: "", isAuthenticated: false }),

      // 회원가입 (이메일 인증 제거)
      signUp: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) return { error: error.message };
          if (data.user) set({ user: data.user, isAuthenticated: true });
          return { error: null };
        } catch (err: any) {
          return { error: err.message || "알 수 없는 오류" };
        }
      },

      // 로그인
      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) return { error: error.message };
          if (data.user) set({ user: data.user, isAuthenticated: true });
          return { error: null };
        } catch (err: any) {
          return { error: err.message || "알 수 없는 오류" };
        }
      },

      // 비밀번호 재설정
      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: "http://localhost:5173/reset-pw",
          });
          if (error) return { error: error.message };
          return { error: null };
        } catch (err: any) {
          return { error: err.message || "알 수 없는 오류" };
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
