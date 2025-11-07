"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function Addform({ onSaved, editMail, onCancelEdit }) {
  const { register, handleSubmit, reset, control, setValue, watch } = useForm({
    defaultValues: {
      id: null,
      journal_id: "",
      purpose: "editor",
      email: "",
      smtp_host: "",
      smtp_port: "",
      smtp_user: "",
      smtp_pass: "",
      secure: false,
      is_active: true,
    },
  });

  const [journals, setJournals] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Load journals
  useEffect(() => {
    axios
      .get("/api/journals")
      .then((res) => setJournals(res.data.journals || []))
      .catch(() => toast.error("Failed to load journals"));
  }, []);

   // 🟢 Prefill when editing
  useEffect(() => {
    if (editMail) {
      Object.entries(editMail).forEach(([k, v]) => setValue(k, v));
      setValue("secure", !!editMail.secure);
      setValue("is_active", !!editMail.is_active);
    } else {
      reset();
    }
  }, [editMail]);

  // Submit form
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      secure: data.secure ? 1 : 0,
      is_active: data.is_active ? 1 : 0,
    };
    try {
      if (payload.id) {
        await axios.patch("/api/journals-mail", payload);
        toast.success("Mail configuration updated");
      } else {
        await axios.post("/api/journals-mail", payload);
        toast.success("Mail configuration added");
      }
      reset();
      onSaved?.();
      onCancelEdit?.();
    } catch {
      toast.error("Failed to save mail configuration");
    }
  };
 // 🟠 Reset / Clear form handler
  const handleReset = () => {
    reset();
    onCancelEdit?.();
    toast.info("Form cleared");
  };


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 bg-white p-6 rounded-lg shadow"
    >
      <div className="md:col-span-2 text-lg font-semibold">
          {editMail ? "Edit Mail Configuration" : "Add Mail Configuration"}
      </div>

      <div>
        <Label>Journal</Label>
        <select
          {...register("journal_id", { required: true })}
          className="w-full border rounded px-2 py-2"
        >
          <option value="">Select Journal</option>
          {journals.map((j) => (
            <option key={j.id} value={j.id}>
              {j.journal_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label>Purpose</Label>
        <select
          {...register("purpose")}
          className="w-full border rounded px-2 py-2"
        >
          <option value="editor">Editor</option>
          <option value="author">Author</option>
          <option value="paper_submission">Paper Submission</option>
          <option value="notification">Notification</option>
        </select>
      </div>

      <div>
        <Label>Email</Label>
        <Input {...register("email", { required: true })} type="email" />
      </div>

      <div>
        <Label>SMTP Host</Label>
        <Input {...register("smtp_host")} />
      </div>

      <div>
        <Label>SMTP Port</Label>
        <Input {...register("smtp_port")} type="number" placeholder="587" />
      </div>

      <div>
        <Label>SMTP User</Label>
        <Input {...register("smtp_user")} />
      </div>

      <div className="relative">
        <Label>SMTP Password</Label>
        <input
          type={showPassword ? "text" : "password"}
          {...register("smtp_pass")}
          className="w-full border rounded px-3 py-2 pr-10"
          placeholder="Enter SMTP Password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      <div className="flex items-center gap-2 mt-6">
        <Controller
          name="secure"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              className="w-4 h-4 accent-green-600"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <Label className="text-sm">Secure (SSL)</Label>
      </div>

      <div className="flex items-center gap-2 mt-6">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              className="w-4 h-4 accent-green-600"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
        <Label className="text-sm">Active</Label>
      </div>

 <div className="md:col-span-2 text-right mt-2">
        <Button type="submit">
          {editMail ? "Update Configuration" : "Save Configuration"}
        </Button>
        {editMail && (
          <Button
            type="button"
            variant="secondary"
            className="ml-2"
            onClick={() => {
              reset();
              onCancelEdit();
            }}
          >
            Cancel Edit
          </Button>
        )}
        {/* ✅ Reset Button */}
        <Button
          type="button"
          variant="secondary"
          className="ml-2"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
      
    </form>
  );
}
