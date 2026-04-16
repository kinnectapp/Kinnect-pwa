import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useAuth from "@/api/auth";
import { toast } from "sonner";
import { handleApiError } from "@/api/serviceUtils";
import { Loader2 } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { useForgotPasswordMutation } = useAuth();
  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    forgotPassword(
      { email: values.email },
      {
        onSuccess: () => {
          sessionStorage.setItem("forgotPasswordEmail", values.email);
          toast.success("OTP sent. Check your email.");
          navigate("/auth/forgot-password/verify");
        },
        onError: (error: any) => {
          toast.error(handleApiError(error));
        },
      },
    );
  };

  return (
    <AuthLayout
      title="Forgotten Password?"
      description="Provide your registered email address below to recover your password."
    >
      <form className="flex  flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[14px] font-[500] text-[#1C1C1C]">
              Email Address
            </Label>
            <Input
              type="email"
              placeholder="example@kinnect.com"
              className={`h-11 border-[#E4E4F0] text-[14px] [-webkit-text-size-adjust:100%] ${errors.email ? "border-red-500" : ""}`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Recovering..." : "Recover Password"}
          </Button>
        </div>
      </form>
      <div className="flex-1 flex justify-center items-end">
        <p className="text-center text-[13px] text-[#6C6C80]">
          Remember now?{" "}
          <Link to="/auth/login" className="font-medium text-[#7D1BCB]">
            Back To Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
