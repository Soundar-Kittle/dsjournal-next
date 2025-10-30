"use client";
import React, { useState, useEffect } from "react";

export default function ActionMenu({ onEdit, onDelete, onApprove, showApprove }) {
  const [open, setOpen] = useState(false);

  // auto-close on outside click
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".action-menu")) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div className="relative inline-block text-left action-menu">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-1 hover:bg-gray-100"
        title="Actions"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-700"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1 text-sm">
            <button
              onClick={() => {
                onEdit?.();
                setOpen(false);
              }}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              ✏️ Edit
            </button>

            {showApprove && (
              <button
                onClick={() => {
                  onApprove?.();
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-green-700 hover:bg-green-50"
              >
                ✅ Approve
              </button>
            )}

            <button
              onClick={() => {
                onDelete?.();
                setOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
            >
              🗑 Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
