// components/common/AppHeader.tsx
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";

function AppHeader() {
  // ① Zustand에서 user, clearUser 꺼내오기
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  // ② 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearUser();
      navigate("/sign-in");
    } catch (err: any) {
      console.error("로그아웃 실패:", err.message);
      alert("로그아웃 중 문제가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <header className="fixed z-10 w-full bg-amber-300 h-14 flex items-center justify-between px-6">
      {/* 왼쪽: 내 위치 또는 공백 */}
      <div className=" text-amber-300">공100000000000</div>

      {/* 중간 로고 */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl font-bold text-white">뭐먹띠</span>
      </div>

      {/* 오른쪽 버튼 */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-white mr-2">{user.email}님</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            to="/sign-in"
            className="px-3 py-1 bg-blue-500 text-white rounded"
          >
            로그인
          </Link>
        )}
        ;
        <Button size="icon">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}

export default AppHeader;
