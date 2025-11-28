"use client";

import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";
import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Pencil, Trash2, PlusCircle, Search, Loader2 } from "lucide-react";
import TiptapEditor from "../TiptapEditor";

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
      has_address: false,
    },
  });

  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const hasAddress = watch("has_address");

  /* ---------------- fetch members ---------------- */
  const { data = { members: [], total: 0 }, refetch, isFetching } = useQuery({
    queryKey: ["editorial-members", page, limit, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams({
        page,
        limit,
        search: searchTerm || "",
      });
      const res = await axios.get(`/api/editorial-members?${params}`);
      return res.data;
    },
  });

  /* ---------------- debounce search ---------------- */
  useEffect(() => {
    const delay = setTimeout(() => refetch(), 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

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
      has_address: data.has_address ? 1 : 0,
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
    columnHelper.accessor("designation", { header: "Designation" }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) =>
        info.getValue() === 1 ? (
          <span className="text-green-600 font-medium">Active</span>
        ) : (
          <span className="text-red-500 font-medium">Inactive</span>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const m = row.original;
              Object.keys(m).forEach((key) => setValue(key, m[key] ?? ""));
              setValue("is_active", m.status === 1);
              setValue("has_address", m.has_address === 1);
              setEditingId(m.id);
            }}
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              confirm("Delete this member?") &&
              deleteMutation.mutate(row.original.id)
            }
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data.members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages =
    limit === "All" ? 1 : Math.ceil(data.total / (limit || 1));

  /* ---------------- UI ---------------- */
  return (
    <div className="space-y-10">
      {/* ---------- Add/Edit Form ---------- */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <PlusCircle className="w-5 h-5 text-blue-600" />
          {editingId ? "Edit Editorial Member" : "Add Editorial Member"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <InputField label="Name" {...register("name", { required: true })} />
          <InputField
            label="Email"
            type="email"
            {...register("email", { required: true })}
          />
          <InputField label="Designation" {...register("designation")} />
          <InputField label="Department" {...register("department")} />
          <InputField label="University" {...register("university")} />
          <InputField label="Country" {...register("country")} />
          <InputField label="State" {...register("state")} />
          <InputField label="City" {...register("city")} />

          {/* Address toggle */}
          <div className="flex items-center space-x-3 md:col-span-3">
            <Label>Include Address?</Label>
            <Controller
              name="has_address"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          {/* Rich text address editor */}
          {hasAddress && (
            <div className="md:col-span-3">
              <Label>Address Lines</Label>
<Controller
  name="address_lines"
  control={control}
  render={({ field }) => (
    <TiptapEditor
      key={editingId || "new"} // ✅ ensures editor resets when editingId changes
      value={field.value || ""}
      onChange={(val) => field.onChange(val)}
    />
  )}
/>

            </div>
          )}

          <InputField
            className="md:col-span-2"
            label="Profile Link (URL)"
            {...register("profile_link")}
          />

          <div className="flex items-center space-x-3">
            <Label>Active</Label>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

        <div className="md:col-span-3 flex justify-end gap-3 mt-4">
             <Button
    type="button"
    variant="outline"
    onClick={() => {
      reset({
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
        has_address: false,
      });
      setEditingId(null); // ✅ exit edit mode
    }}
  >
    Reset
  </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                "Update Member"
              ) : (
                "Add Member"
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* ---------- Table Section ---------- */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-lg font-semibold">Editorial Members</h3>

          {/* 🔍 Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or university..."
              className="pl-8 pr-3 py-2 border rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="border p-2 text-left font-medium"
                    >
                      {flexRender(
                        h.column.columnDef.header,
                        h.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center text-gray-500 py-6"
                  >
                    Loading...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 border-b last:border-none"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border p-2 align-top">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center text-gray-400 py-8"
                  >
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <PaginationFooter
          limit={limit}
          setLimit={setLimit}
          page={page}
          setPage={setPage}
          total={data.total}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}

/* ---------- Helper Components ---------- */
function InputField({ label, className, ...props }) {
  return (
    <div className={className}>
      <Label className="mb-1 block text-sm font-medium">{label}</Label>
      <Input {...props} />
    </div>
  );
}

function PaginationFooter({ limit, setLimit, page, setPage, total, totalPages }) {
  return (
    <div className="flex flex-wrap justify-between items-center p-4 border-t text-sm text-gray-600 gap-2">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={limit}
          onChange={(e) => {
            const val = e.target.value === "All" ? "All" : parseInt(e.target.value);
            setLimit(val);
            setPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={50}>50</option>
          <option value="All">All</option>
        </select>
      </div>
      <div className="text-gray-500">
        Showing {Math.min(page * limit, total)} of {total} entries
      </div>
      {limit !== "All" && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
