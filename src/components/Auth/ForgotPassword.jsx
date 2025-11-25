"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const schema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email"),
});

export default function ForgotPassword() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Request failed");
        return;
      }
      toast.success("OTP sent to your email");
      localStorage.setItem("resetEmail", values.email);
      router.push("/verify-otp");
    } catch (err) {
      toast.error(err.message || "Server error");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8 bg-primary">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Enter your email to receive a 6-digit OTP
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            placeholder="you@example.com"
            error={errors.email?.message}
            leftElement={<Mail className="h-4 w-4 text-primary" />}
            {...register("email")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer disabled:cursor-not-allowed w-full py-2 px-4 text-sm font-semibold rounded-md text-white bg-primary hover:bg-primary/90 transition inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" /> Send OTP
              </>
            )}
          </button>

          <Link
            href="/"
            className="flex justify-center items-center gap-2 text-sm text-primary hover:underline"
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </form>
      </div>
    </div>
  );
}
