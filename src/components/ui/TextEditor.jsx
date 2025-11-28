import React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const TextEditorClient = dynamic(() => import("./TextEditorClient"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-200 rounded-md p-3 text-gray-400 text-sm bg-gray-50">
      Loading editor…
    </div>
  ),
});

export function TextEditor({
  value = "",
  onChange,
  placeholder,
  label,
  error,
  isRequired,
  id: propId,
}) {
  const uniqueId = React.useId();
  const id = propId || `input-${uniqueId}`;
  const errorId = `${id}-error`;

  return (
    <>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            isRequired &&
              "after:text-destructive after:content-['*'] after:ml-0.5"
          )}
        >
          {label}
        </label>
      )}
      <div
        className={`my-1 ${error ? "border border-destructive" : ""} shadow-xs`}
      >
        <TextEditorClient
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>

      {error && (
        <p id={errorId} className={cn("text-xs font-medium text-destructive")}>
          {error}
        </p>
      )}
    </>
  );
}
