"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function JournalMailForm() {
  const { register, handleSubmit, reset, control, setValue } = useForm({
    defaultValues: {
      journal_id: "",
      purpose: "editor",
      email: "",
      smtp_host: "",
      smtp_port: "",
      smtp_user: "",
      smtp_pass: "",
      is_active: true,
    },
  });

  const [journals, setJournals] = useState([]);

  const fetchJournals = async () => {
    try {
      const res = await axios.get("/api/journals");
      setJournals(Array.isArray(res.data.journals) ? res.data.journals : []);
    } catch (err) {
      console.error("Failed to load journals", err);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      is_active: data.is_active ? 1 : 0,
    };

    try {
      await axios.post("/api/journals-mail", payload);
      toast.success("Mail configuration added");
      reset();
    } catch (err) {
      console.error("Error saving mail configuration", err);
      toast.error("Failed to save mail configuration");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl p-4">
      <div className="md:col-span-2 text-lg font-semibold">Journal Mail Configuration</div>

      <div>
        <Label>Journal</Label>
        <select {...register("journal_id", { required: true })} className="w-full border rounded px-2 py-1">
          <option value="">Select Journal</option>
          {journals.map((j) => (
            <option key={j.id} value={j.id}>{j.journal_name}</option>
          ))}
        </select>
      </div>

      <div>
        <Label>Purpose</Label>
        <select {...register("purpose", { required: true })} className="w-full border rounded px-2 py-1">
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
        <Input type="number" {...register("smtp_port")} />
      </div>

      <div>
        <Label>SMTP User</Label>
        <Input {...register("smtp_user")} />
      </div>

      <div>
        <Label>SMTP Password</Label>
        <Input type="password" {...register("smtp_pass")} />
      </div>

      <div className="flex items-center gap-2">
        <Label>Active</Label>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <input type="checkbox" className="w-5 h-5" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
          )}
        />
      </div>

      <div className="md:col-span-2 text-right">
        <Button type="submit">Save Mail Configuration</Button>
      </div>
    </form>
  );
}
