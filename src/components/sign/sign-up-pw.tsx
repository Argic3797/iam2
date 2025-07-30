import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { X } from "lucide-react";

// 이메일 마스킹 함수
const maskEmail = (email: string): string => {
  const atIndex = email.indexOf("@");
  if (atIndex === -1) return email;

  const localPart = email.substring(0, atIndex);
  const domainPart = email.substring(atIndex);

  if (localPart.length <= 5) {
    return email;
  }

  const visiblePart = localPart.substring(0, 5);
  return `${visiblePart}***${domainPart}`;
};

const passwordSchema = z
  .object({
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
    confirmPassword: z.string().min(8, "비밀번호를 다시 입력해주세요."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

function SignUPP() {
  const navigate = useNavigate();
  const email = useAuthStore((state) => state.email);
  const signUp = useAuthStore((state) => state.signUp);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!email) {
      toast.error("이메일 정보가 없습니다. 다시 시도해주세요.");
      navigate("/sign-up-email");
      return;
    }

    const { error } = await signUp(email, values.password);
    if (error) {
      toast.error(`회원가입 실패: ${error}`);
      return;
    }

    toast.success("회원가입이 완료되었습니다.");
    navigate("/sign-in");
  };

  return (
    <Card className="w-full md:w-100 bg-transparent md:bg-accent/25 border-0 md:border mt-[40px] mb-[120px]">
      <CardHeader className="px-0 sm:px-6 gap-6">
        <CardTitle className="text-lg">비밀번호를 설정해주세요.</CardTitle>
        <CardDescription>
          {email ? maskEmail(email) : "회원가입"}
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4 px-0 sm:px-6">
        <div className="flex flex-col items-center min-h-[400px] py-8">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-[350px] flex flex-col gap-4"
            >
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="비밀번호 입력"
                          {...field}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="xbutton"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                            onClick={() => form.setValue("password", "")}
                          >
                            <X className={"icon"} />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="비밀번호 재입력"
                          {...field}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="xbutton"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                            onClick={() => form.setValue("confirmPassword", "")}
                          >
                            <X className={"icon"} />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">회원가입</Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}

export default SignUPP;
