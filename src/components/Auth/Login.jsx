"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, Lock, LogIn, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { roleThemes } from "@/@data/data";
// import { SignJWT } from "jose";


const schema = yup.object({
  email: yup.string().required("Email is required").email("Invalid email"),
  password: yup.string().required("Password is required"),
});

export default function Login({ role = "default" }) {
  const router = useRouter();
  const theme = roleThemes[role] || roleThemes.default;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, role }),
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Login failed");
        return;
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful");

      router.push(`/${role}/dashboard`);
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <div
      className={`relative w-full min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden ${theme.bg}`}
    >
      {/* Card */}
      <div className="relative z-20 w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-white/20">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          {role.charAt(0).toUpperCase() + role.slice(1)} Login
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email"
            placeholder="you@example.com"
            error={errors.email?.message}
            leftElement={<Mail className={`h-4 w-4 ${theme.accent}`} />}
            {...register("email")}
          />
          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            leftElement={<Lock className={`h-4 w-4 ${theme.accent}`} />}
            {...register("password")}
            showPasswordToggle
          />

          <div className="flex justify-end text-sm">
            <Link
              href="/forgot-password"
              className={`${theme.accent} hover:underline`}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`cursor-pointer disabled:cursor-not-allowed w-full py-2 px-4 text-sm font-semibold rounded-md
               text-white transition inline-flex items-center justify-center gap-2 ${theme.button}
               duration-300 ease-in-out`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              href={`/${role}/register`}
              className={`${theme.accent} hover:underline font-semibold`}
            >
              Register
            </Link>
          </div>
          <Link
            href="/"
            className={`flex justify-center items-center gap-2 text-sm ${theme.accent} hover:underline`}
          >
            <Home className="h-4 w-4" /> Back to Home
          </Link>
        </form>
      </div>
    </div>
  );
}
