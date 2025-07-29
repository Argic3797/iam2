import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";

const emailSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요."),
});

function ResetPWRQ() {
  const resetPassword = useAuthStore((s) => s.resetPassword);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    if (cooldown > 0) {
      toast.error(`잠시 후 다시 시도해주세요. (${cooldown}초)`);
      return;
    }
    const { error } = await resetPassword(values.email);
    if (error) {
      toast.error(`메일 전송 실패: ${error}`);
    } else {
      toast.success("비밀번호 재설정 메일이 발송되었습니다.");
      setCooldown(60); // 60초 쿨다운
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-start p-4 gap-4">
      <div className="flex flex-col items-center justify-center h-screen">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-[300px] flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="가입한 이메일 입력"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              재설정 메일 보내기
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default ResetPWRQ;
