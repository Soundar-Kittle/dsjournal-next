"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { Button, Switch, TextEditor } from "@/components/ui";

/* ---------------- ✅ Validation ---------------- */
const schema = yup.object({
  content: yup.string().nullable(),
  is_active: yup.boolean().default(true),
});

/* ---------------- ✅ Component ---------------- */
export default function AddJournalPage({
  journal_id,
  page_title,
  data,
  page_id,
}) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      content: data?.content || "",
      is_active: data?.is_active === 1 ? true : false,
    },
  });

  useEffect(() => {
    reset({
      content: data?.content || "",
      is_active: data?.is_active === 1 ? true : false,
    });
  }, [data?.content, reset]);

  /* ✅ Submit handler */
  const onSubmit = async (data) => {
    try {
      const isEdit = Boolean(page_id);
      const payload = {
        id: page_id,
        journal_id,
        page_title,
        content: data.content || "",
        is_active: data.is_active ? 1 : 0,
      };

      console.log("Payload to send:", payload);

      const res = await fetch("/api/journal-pages", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.message || "Save failed");

      toast.success(
        isEdit
          ? "Journal Page Updated Successfully"
          : "Journal Page Created Successfully"
      );
    } catch (error) {
      console.error("❌ Journal Page Save Error:", error);
      toast.error(error.message || "Error saving journal page");
    }
  };

  /* ✅ UI */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full bg-white p-6 rounded-xl shadow-sm border space-y-6 relative"
    >
      <div className="flex items-center space-x-3">
        <label className="text-sm font-medium text-gray-700">Active</label>
        <Controller
          control={control}
          name="is_active"
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
          )}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Page Content ({page_title.replaceAll("_", " ")})
        </label>

        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <TextEditor
              value={field.value}
              onChange={(html) => field.onChange(html)}
              placeholder={`Write content for "${page_title}"...`}
            />
          )}
        />
        {errors.content && (
          <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
        )}
      </div>

      <div className="text-right">
        <Button type="submit">{page_id ? "Update Page" : "Save Page"}</Button>
      </div>
    </form>
  );
}
