"use client";

import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import TiptapEditor from "../TiptapEditor";

// TEMP sanity test – remove after checking
import dynamic from "next/dynamic";
const TestEditor = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = (await import("@ckeditor/ckeditor5-build-classic"))
      .default;
    return () => <CKEditor editor={ClassicEditor} data="<p>Hello</p>" />;
  },
  { ssr: false }
);

export default function EditorialMembersForm() {
  /* ---------------- react-hook-form ---------------- */
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      designation: "",
      department: "",
      university: "",
      country: "",
      state: "",
      city: "",
      address_lines: "",
      profile_link: "",
      is_active: true,
      has_address: false, // 👈 NEW toggle
    },
  });

  /* ---------------- state ---------------- */
  const [editingId, setEditingId] = useState(null);

  const hasAddress = watch("has_address");

  const { data: members = [], refetch } = useQuery({
    queryKey: ["editorial-members"],
    queryFn: async () =>
      (await axios.get("/api/editorial-members?all=true")).data.members,
  });

  /* ---------------- mutations ---------------- */
  const saveMutation = useMutation({
    mutationFn: async (payload) =>
      payload.id
        ? axios.patch("/api/editorial-members", payload)
        : axios.post("/api/editorial-members", payload),
    onSuccess: () => {
      toast.success("Member saved");
      refetch();
      reset();
      setEditingId(null);
    },
    onError: () => toast.error("Failed to save member"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/editorial-members?id=${id}`),
    onSuccess: () => {
      toast.success("Member deleted");
      refetch();
    },
  });

  /* ---------------- submit handler ---------------- */
  const onSubmit = (data) => {
    const payload = {
      ...data,
      is_active: data.is_active ? 1 : 0,
      has_address: data.has_address ? 1 : 0, // 🆕
      address_lines: data.has_address ? data.address_lines : "",
    };
    if (editingId) payload.id = editingId;
    saveMutation.mutate(payload);
  };

  /* ---------------- table setup ---------------- */
  const columnHelper = createColumnHelper();

  const columns = [
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("university", { header: "University" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => (info.getValue() === 1 ? "Active" : "Inactive"),
    }),
    columnHelper.accessor("address_lines", {
      header: "Address",
      cell: (info) =>
        info.getValue() ? (
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: info.getValue() }}
          />
        ) : (
          "—"
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const m = row.original;

              // 1. scalar fields
              setValue("id", m.id ?? null);
              setValue("name", m.name ?? "");
              setValue("email", m.email ?? "");
              setValue("designation", m.designation ?? "");
              setValue("department", m.department ?? "");
              setValue("university", m.university ?? "");
              setValue("country", m.country ?? "");
              setValue("state", m.state ?? "");
              setValue("city", m.city ?? "");
              setValue("profile_link", m.profile_link ?? "");
              setValue("is_active", m.status === 1);

              // 2. address
              const hasAddr = m.has_address === 1;
              setValue("has_address", hasAddr);
              setValue("address_lines", hasAddr ? m.address_lines || "" : "");

              // 3. switch to edit mode
              setEditingId(m.id);
            }}
          >
            ✏️
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() =>
              confirm("Delete this member?") &&
              deleteMutation.mutate(row.original.id)
            }
          >
            🗑️
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-6">
      {/* ---------- Form ---------- */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl p-4 border rounded"
      >
        <div className="md:col-span-2 text-lg font-semibold">
          {editingId ? "Edit Member" : "Add Editorial Member"}
        </div>

        <div>
          <Label>Name</Label>
          <Input {...register("name", { required: true })} />
        </div>

        <div>
          <Label>Email</Label>
          <Input type="email" {...register("email", { required: true })} />
        </div>

        <div>
          <Label>Designation</Label>
          <Input {...register("designation")} />
        </div>

        <div>
          <Label>Department</Label>
          <Input {...register("department")} />
        </div>

        <div>
          <Label>University</Label>
          <Input {...register("university")} />
        </div>

        <div>
          <Label>Country</Label>
          <Input {...register("country")} />
        </div>

        <div>
          <Label>State</Label>
          <Input {...register("state")} />
        </div>

        <div>
          <Label>City</Label>
          <Input {...register("city")} />
        </div>

        {/* Address toggle stays the same */}
        <div className="flex items-center space-x-3 md:col-span-2">
          <Label>Has address lines?</Label>
          <Controller
            name="has_address"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Show CKEditor when switch is on */}
        {hasAddress && (
          <Controller
            name="address_lines"
            control={control}
            render={({ field }) => (
              <TiptapEditor value={field.value} onChange={field.onChange} />
            )}
          />
        )}
        {/* <div className="md:col-span-2">
          <Label>Address lines (comma-separated)</Label>
          <Input {...register("address_lines")} />
        </div> */}

        <div className="md:col-span-2">
          <Label>Profile link (URL)</Label>
          <Input {...register("profile_link")} />
        </div>

        <div className="flex items-center space-x-3">
          <Label>Active</Label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        <div className="md:col-span-2 text-right">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : editingId
              ? "Update Member"
              : "Add Member"}
          </Button>
        </div>
      </form>

      {/* ---------- Table ---------- */}
      <div className="max-w-6xl mx-auto border rounded">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="border p-2 bg-gray-100">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
