"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, KeyRound, Home } from "lucide-react";
import Link from "next/link";

export default function VerifyOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [email, setEmail] = useState(null);
  const timerRef = useRef(null);

  // Load email from localStorage only on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("resetEmail");
      if (!storedEmail) {
        toast.error("Email missing. Restart password reset.");
        router.replace("/forgot-password");
      } else {
        setEmail(storedEmail);
      }
    }
  }, [router]);

  // Timer countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) return;
    if (otp.length !== 6) return toast.error("Enter 6-digit OTP");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || "Invalid OTP");
      } else {
        toast.success("OTP verified!");
        localStorage.setItem("resetToken", data.reset_token);
        router.push("/set-password");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || secondsLeft !== 0) return;
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("OTP resent");
        setSecondsLeft(120);
      } else {
        toast.error(data.message || "Resend failed");
      }
    } catch {
      toast.error("Server error");
    }
  };

  // Don’t render until email is loaded
  if (!email) return null;

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8 bg-primary">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Verify OTP</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Enter the 6-digit code we sent to <b>{email}</b>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="w-full text-center tracking-[0.5em] text-2xl border border-gray-300 rounded-md py-3 mb-5"
          placeholder="______"
        />

        <button
          type="submit"
          disabled={isSubmitting || otp.length !== 6}
          className="cursor-pointer disabled:cursor-not-allowed w-full py-2 px-4 text-sm font-semibold rounded-md text-white bg-primary hover:bg-primary/90 transition inline-flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" /> Verify OTP
            </>
          )}
        </button>

        <div className="mt-4 text-center text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={secondsLeft !== 0}
            className="cursor-pointer disabled:cursor-not-allowed text-primary hover:underline disabled:opacity-40"
          >
            {secondsLeft === 0 ? "Resend OTP" : `Resend in ${secondsLeft}s`}
          </button>
        </div>

        <Link
          href="/"
          className="flex justify-center items-center gap-2 text-sm text-primary hover:underline mt-6"
        >
          <Home className="h-4 w-4" /> Back to Home
        </Link>
      </form>
    </div>
  );
}
