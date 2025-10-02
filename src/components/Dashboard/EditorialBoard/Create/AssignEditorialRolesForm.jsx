  // "use client";

  // import { useForm } from "react-hook-form";
  // import { Input } from "@/components/ui/input";
  // import { Label } from "@/components/ui/label";
  // import { Button } from "@/components/ui/button";
  // import { useEffect } from "react";
  // import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  // import axios from "axios";
  // import { toast } from "sonner";

  // export function AssignEditorialRolesForm() {
  //   const { register, handleSubmit, reset, watch } = useForm();
  //   const queryClient = useQueryClient();
  //   const journalId = watch("journal_id");

  //   // ✅ Queries
  //   const { data: journals = [] } = useQuery({
  //     queryKey: ["journals"],
  //     queryFn: async () => {
  //       const res = await axios.get("/api/journals");
  //       return res.data.journals;
  //     },
  //   });

  //   const { data: members = [] } = useQuery({
  //     queryKey: ["editorial-members"],
  //     queryFn: async () => {
  //       const res = await axios.get("/api/editorial-members");
  //       return res.data.members;
  //     },
  //   });

  //   const { data: titles = [] } = useQuery({
  //     queryKey: ["editorial-titles"],
  //     queryFn: async () => {
  //       const res = await axios.get("/api/editorial-titles");
  //       return res.data.titles;
  //     },
  //   });

  //   const {
  //     data: roles = [],
  //     refetch: refetchRoles,
  //     isLoading: rolesLoading,
  //   } = useQuery({
  //     queryKey: ["journal-editorial-roles", journalId],
  //     queryFn: async () => {
  //       if (!journalId) return [];
  //       const res = await axios.get(`/api/journal-editorial-roles?journalId=${journalId}`);
  //       return res.data.roles;
  //     },
  //     enabled: !!journalId,
  //   });

  //   // ✅ Mutations
  //   const assignMutation = useMutation({
  //     mutationFn: (data) => {
  //     if (data.id) {
  //       return axios.patch("/api/journal-editorial-roles", data); // use PATCH for editing
  //     }
  //     return axios.post("/api/journal-editorial-roles", data); // use POST for new
  //   },
  //     onSuccess: (_, data) => {
  //       toast.success("Role assigned");
  //       reset({ ...data, member_id: "", title_id: "" });
  //       queryClient.invalidateQueries(["journal-editorial-roles", data.journal_id]);
  //     },
  //     onError: () => toast.error("Failed to assign role"),
  //   });

  //   const deleteMutation = useMutation({
  //     mutationFn: (id) => axios.delete(`/api/journal-editorial-roles?id=${id}`),
  //     onSuccess: () => {
  //       toast.success("Role deleted");
  //       queryClient.invalidateQueries(["journal-editorial-roles", journalId]);
  //     },
  //     onError: () => toast.error("Failed to delete role"),
  //   });

  //   // ✅ Submit
  //   const onSubmit = (data) => assignMutation.mutate(data);

  //   return (
  //     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded">
  //       {/* Journal Dropdown */}
  //       <Label>Select Journal</Label>
  //       <select
  //         {...register("journal_id", { required: true })}
  //         className="border p-2 rounded w-full"
  //       >
  //         <option value="">Choose Journal</option>
  //         {journals.map((j) => (
  //           <option key={j.id} value={j.id}>
  //             {j.journal_name}
  //           </option>
  //         ))}
  //       </select>

  //       {/* Member Dropdown */}
  //       <Label>Select Member</Label>
  //       <select
  //         {...register("member_id", { required: true })}
  //         className="border p-2 rounded w-full"
  //       >
  //         <option value="">Choose Member</option>
  //         {members.map((m) => (
  //           <option key={m.id} value={m.id}>
  //             {m.name}
  //           </option>
  //         ))}
  //       </select>

  //       {/* Title Dropdown */}
  //       <Label>Select Title</Label>
  //       <select
  //         {...register("title_id", { required: true })}
  //         className="border p-2 rounded w-full"
  //       >
  //         <option value="">Choose Title</option>
  //         {titles.map((t) => (
  //           <option key={t.id} value={t.id}>
  //             {t.title}
  //           </option>
  //         ))}
  //       </select>

  //       <Button type="submit" disabled={assignMutation.isPending}>
  //         {assignMutation.isPending ? "Assigning..." : "Assign Role"}
  //       </Button>

  //       {/* Assigned Roles List */}
  //       <ul className="list-disc pl-5 pt-4">
  //         {rolesLoading ? (
  //           <li>Loading roles...</li>
  //         ) : (
  //           roles.map((r) => (
  //             <li key={r.id} className="flex justify-between items-center">
  //               <span>
  //                 {r.title_name} – {r.member_name}
  //               </span>
  //               <Button
  //                 variant="destructive"
  //                 size="sm"
  //                 onClick={() => deleteMutation.mutate(r.id)}
  //               >
  //                 Delete
  //               </Button>
  //             </li>
  //           ))
  //         )}
  //       </ul>
  //     </form>
  //   );
  // }


"use client";

import { useForm, useWatch } from "react-hook-form";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AssignEditorialRolesForm() {
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const queryClient = useQueryClient();
  const journalId = useWatch({ control, name: "journal_id" });

  const [editingId, setEditingId] = useState(null);

  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/journals");
        return res.data.journals;
      } catch (error) {
        toast.error("Failed to load journals");
        return [];
      }
    },
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ["editorial-members"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/editorial-members");
        return res.data.members;
      } catch (error) {
        toast.error("Failed to load members");
        return [];
      }
    },
  });

  const { data: titles = [] } = useQuery({
    queryKey: ["editorial-titles"],
    queryFn: async () => {
      try {
        const res = await axios.get("/api/editorial-titles");
        return res.data.titles;
      } catch (error) {
        toast.error("Failed to load titles");
        return [];
      }
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["journal-editorial-roles", journalId],
    queryFn: async () => {
      if (!journalId) return [];
      try {
        const res = await axios.get(`/api/journal-editorial-roles?journalId=${journalId}`);
        return res.data.roles;
      } catch (error) {
        toast.error("Failed to load roles");
        return [];
      }
    },
    enabled: !!journalId,
  });

  const deferredRoles = useDeferredValue(roles);

  const assignMutation = useMutation({
    mutationFn: (data) => {
      if (data.id) {
        return axios.patch("/api/journal-editorial-roles", data);
      }
      return axios.post("/api/journal-editorial-roles", data);
    },
    onSuccess: (_, data) => {
      toast.success("Role assigned");
      reset({ ...data, member_id: "", title_id: "" });
      queryClient.invalidateQueries(["journal-editorial-roles", data.journal_id]);
      setEditingId(null);
    },
    onError: () => toast.error("Failed to assign role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/journal-editorial-roles?id=${id}`),
    onSuccess: () => {
      toast.success("Role deleted");
      queryClient.invalidateQueries(["journal-editorial-roles", journalId]);
    },
    onError: () => toast.error("Failed to delete role"),
  });

  const availableMembers = useMemo(() => {
    const assignedIds = new Set(deferredRoles.map((r) => r.member_id));
    return allMembers.filter((m) => !assignedIds.has(m.id) || m.id === editingId);
  }, [allMembers, deferredRoles, editingId]);

  const columnHelper = useMemo(() => createColumnHelper(), []);

  const columns = useMemo(
    () => [
      columnHelper.accessor("title_name", {
        header: "Title",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("member_name", {
        header: "Member",
        cell: (info) => info.getValue(),
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
                const role = row.original;
                setValue("member_id", role.member_id);
                setValue("title_id", role.title_id);
                setEditingId(role.id);
              }}
            >
              ✏️
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate(row.original.id)}
            >
              🗑️
            </Button>
          </div>
        ),
      }),
    ],
    [columnHelper, deleteMutation, setValue]
  );

  const table = useReactTable({
    data: deferredRoles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    setEditingId(null);
    reset((prev) => ({ ...prev, member_id: "", title_id: "" }));
  }, [journalId, reset]);

  const onSubmit = (data) => {
    const payload = { ...data };
    if (editingId) payload.id = editingId;
    assignMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded">
      <h2 className="text-lg font-semibold">Assign Roles</h2>

      <Label>Select Journal</Label>
      <select {...register("journal_id", { required: true })} className="border p-2 rounded w-full">
        <option value="">Choose Journal</option>
        {journals.map((j) => (
          <option key={j.id} value={j.id}>{j.journal_name}</option>
        ))}
      </select>

      <Label>Select Member</Label>
      <select {...register("member_id", { required: true })} className="border p-2 rounded w-full">
        <option value="">Choose Member</option>
        {availableMembers.map((m) => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      <Label>Select Title</Label>
      <select {...register("title_id", { required: true })} className="border p-2 rounded w-full">
        <option value="">Choose Title</option>
        {titles.map((t) => (
          <option key={t.id} value={t.id}>{t.title}</option>
        ))}
      </select>

      <Button type="submit" disabled={assignMutation.isPending}>
        {assignMutation.isPending ? "Saving..." : editingId ? "Update Role" : "Assign Role"}
      </Button>

      <div className="mt-6 border rounded">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border p-2 bg-gray-100">
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
    </form>
  );
}
