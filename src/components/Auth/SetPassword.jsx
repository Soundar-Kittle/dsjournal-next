"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

const schema = yup.object({
  newPassword: yup
    .string()
    .required("Password is required")
    .min(8, "Min 8 characters"),
  confirmPassword: yup
    .string()
    .required("Confirm your password")
    .oneOf([yup.ref("newPassword")], "Passwords do not match"),
});

export default function SetPassword() {
  const router = useRouter();

  // Read values from localStorage
  const email =
    typeof window !== "undefined" ? localStorage.getItem("resetEmail") : null;
  const resetToken =
    typeof window !== "undefined" ? localStorage.getItem("resetToken") : null;

  // 🔥 Check only once on mount if tokens are missing
  useEffect(() => {
    if (!email || !resetToken) {
      toast.error("Reset token missing. Restart the flow.");
      router.replace("/forgot-password");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only once

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reset_token: resetToken,
          new_password: values.newPassword,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || "Reset failed");
        return;
      }

      toast.success("Password updated! Please login");

      // clear reset data
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetToken");

      // ✅ Navigate to role-specific login
      if (data.role === "admin") {
        router.push("/admin/login");
      } else if (data.role === "author") {
        router.push("/author/login");
      } else {
        router.push("/login"); // fallback
      }
    } catch (err) {
      toast.error(err?.message || "Server error");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8 bg-primary">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-center mb-2">
          Set New Password
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Enter a strong new password for <b>{email}</b>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <Input
            type="password"
            label="New Password"
            placeholder="••••••••"
            error={errors.newPassword?.message}
            leftElement={<Lock className="h-4 w-4 text-primary" />}
            {...register("newPassword")}
            showPasswordToggle
          />

          {/* Confirm Password */}
          <Input
            type="password"
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            leftElement={<Lock className="h-4 w-4 text-primary" />}
            {...register("confirmPassword")}
            showPasswordToggle
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer disabled:cursor-not-allowed w-full py-2 px-4 text-sm font-semibold rounded-md text-white bg-primary hover:bg-primary/90 transition inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              <>Update Password</>
            )}
          </button>

          {/* Back Home */}
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
