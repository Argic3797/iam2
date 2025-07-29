import { useState, useEffect } from "react";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("올바른 형식의 이메일 주소를 입력해주세요."),
  password: z
    .string()
    .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." }),
});

function SignIN() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/",
      },
    });
    if (error) {
      console.error("구글 로그인 실패:", error.message);
      toast.error("구글 로그인에 실패했습니다.");
      setIsLoggingIn(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsLoggingIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.origin + "/",
      },
    });
    if (error) {
      console.error("카카오 로그인 실패:", error.message);
      toast.error("카카오 로그인에 실패했습니다.");
      setIsLoggingIn(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoggingIn(true);
    // 실제 이메일/비밀번호 로그인 요청
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      console.error("Credentials 로그인 실패:", error.message);
      toast.error(error.message);
      setIsLoggingIn(false);
      return;
    }
    // 로그인 성공시 App.tsx의 onAuthStateChange가 Zustand에 user를 세팅합니다
    navigate("/home");
  };

  return (
    <Card className="w-full max-w-[400px] border-0 sm:border sm:bg-card">
      <CardHeader className="px-0 sm:px-6">
        <CardTitle className="text-lg text-center">로그인</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 px-0 sm:px-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input placeholder="이메일을 입력하세요." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="relative">
                  <div className="flex items-center justify-between">
                    <FormLabel>비밀번호</FormLabel>
                    <Link to="/reset-pw-rq" className="text-sm underline">
                      비밀번호 찾기
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요."
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-7 right-1 bg-transparent hover:bg-transparent"
                    onClick={handleTogglePassword}
                  >
                    {showPassword ? (
                      <Eye size={16} className="text-muted-foreground" />
                    ) : (
                      <EyeOff size={16} className="text-muted-foreground" />
                    )}
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* → 중복 제거, 이 버튼 하나로 submit + loading 처리 */}
            <Button
              type="submit"
              variant="primary"
              className="w-full text-black"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "로그인 중…" : "로그인"}
            </Button>
          </form>
        </Form>

        <div className="relative my-2 gap-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-muted-foreground bg-background">OR</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="kakao"
            type="button"
            className="w-full justify-between bg-amber-400 gap-2"
            disabled={isLoggingIn}
            onClick={handleKakaoLogin}
          >
            <img
              src="/src/logo/Kakaologo.png"
              alt="Kakao logo"
              className="size-5 mr-1"
            />
            카카오 로그인
            <span> </span>
          </Button>
          <Button
            variant="google"
            type="button"
            className="w-full justify-between gap-2"
            disabled={isLoggingIn}
            onClick={handleGoogleLogin}
          >
            <img
              src="/src/logo/Googlelogo.png"
              alt="Google logo"
              className="size-5 mr-1"
            />
            구글 로그인
            <span> </span>
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="text-sm text-center">
          계정이 없으신가요?{" "}
          <Link to="/sign-up-email" className="underline ml-1">
            회원가입
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default SignIN;
