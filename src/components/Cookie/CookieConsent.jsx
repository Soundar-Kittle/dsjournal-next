"use client";
import { useEffect, useState } from "react";

const CONSENT_KEY = "cookie_consent";

export const getCookieConsent = () => {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(CONSENT_KEY);
  if (value === "accepted" || value === "declined") return value;
  return null;
};

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log("🍪 CookieConsent mounted");
    const consent = getCookieConsent();

    // If user has NOT decided earlier → show after 2s
    if (!consent) {
      const timer = setTimeout(() => {
        console.log("🎯 Showing cookie modal");
        setVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 transform -translate-x-1/2 left-1/2 z-[9999] flex justify-center max-md:w-full text-sm max-sm:text-xs">
      <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-4 max-w-xl w-[95%] sm:w-auto flex flex-col sm:flex-row items-center gap-3">
        <p className="text-gray-700 text-center sm:text-left flex-1">
          🍪 We use cookies to enhance your experience. Read our{" "}
          <a
            href="/cookies-privacy-policy"
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            Cookies Privacy Policy
          </a>
          .
        </p>
        <div className="flex gap-2">
          <button
            onClick={declineCookies}
            className="cursor-pointer px-3 py-1 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  );
}
