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

const emailSchema = z.object({
  email: z.string().email("올바른 이메일 주소를 입력하세요."),
});

function SignUPE() {
  const navigate = useNavigate();
  const setEmail = useAuthStore((state) => state.setEmail);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      // 이메일 형식만 검사 → 실제 중복 체크는 회원가입 시도 시 처리
      setEmail(values.email);
      toast.success("이메일이 확인되었습니다.");
      navigate("/sign-up-pw");
    } catch (error) {
      toast.error("이메일 확인 중 오류가 발생했습니다.");
    }
  };

  return (
    <Card className="w-full md:w-100 bg-transparent border-0 md:border mt-[40px] mb-[120px]">
      <CardHeader className="px-0 sm:px-6 gap-6">
        <CardTitle className="text-lg">반갑습니다. 뭐먹띠입니다!</CardTitle>
        <CardDescription>회원가입</CardDescription>
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="이메일을 입력하세요." {...field} />
                        {field.value && (
                          <Button
                            type="button"
                            variant="xbutton"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-black"
                            onClick={() => form.setValue("email", "")}
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
              <Button type="submit">다음</Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}

export default SignUPE;
