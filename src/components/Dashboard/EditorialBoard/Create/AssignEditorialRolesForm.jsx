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

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

// "use client";

// import { useForm, useWatch } from "react-hook-form";
// import { useDeferredValue, useEffect, useMemo, useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { toast } from "sonner";
// import {
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
//   createColumnHelper,
// } from "@tanstack/react-table";

// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   verticalListSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import SortableRow from "@/components/Dashboard/EditorialBoard/Dnd/SortableRow";

// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";

// export function AssignEditorialRolesForm() {
//   const { register, handleSubmit, reset, setValue, control } = useForm();
//   const queryClient = useQueryClient();
//   const journalId = useWatch({ control, name: "journal_id" });
//   const [groupByTitle, setGroupByTitle] = useState(false); // toggle scope

//   const [editingId, setEditingId] = useState(null);

//   const { data: journals = [] } = useQuery({
//     queryKey: ["journals"],
//     queryFn: async () => {
//       try {
//         const res = await axios.get("/api/journals");
//         return res.data.journals;
//       } catch (error) {
//         toast.error("Failed to load journals");
//         return [];
//       }
//     },
//   });

//   const { data: allMembers = [] } = useQuery({
//     queryKey: ["editorial-members"],
//     queryFn: async () => {
//       try {
//         const res = await axios.get("/api/editorial-members");
//         return res.data.members;
//       } catch (error) {
//         toast.error("Failed to load members");
//         return [];
//       }
//     },
//   });

//   const { data: titles = [] } = useQuery({
//     queryKey: ["editorial-titles"],
//     queryFn: async () => {
//       try {
//         const res = await axios.get("/api/editorial-titles");
//         return res.data.titles;
//       } catch (error) {
//         toast.error("Failed to load titles");
//         return [];
//       }
//     },
//   });

//   const { data: roles = [] } = useQuery({
//     queryKey: ["journal-editorial-roles", journalId],
//     queryFn: async () => {
//       if (!journalId) return [];
//       try {
//         const res = await axios.get(
//           `/api/journal-editorial-roles?journalId=${journalId}`
//         );
//         return res.data.roles;
//       } catch (error) {
//         toast.error("Failed to load roles");
//         return [];
//       }
//     },
//     enabled: !!journalId,
//   });

//   const deferredRoles = useDeferredValue(roles);

//   const assignMutation = useMutation({
//     mutationFn: (data) => {
//       if (data.id) {
//         return axios.patch("/api/journal-editorial-roles", data);
//       }
//       return axios.post("/api/journal-editorial-roles", data);
//     },
//     onSuccess: (_, data) => {
//       toast.success("Role assigned");
//       reset({ ...data, member_id: "", title_id: "" });
//       queryClient.invalidateQueries([
//         "journal-editorial-roles",
//         data.journal_id,
//       ]);
//       setEditingId(null);
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

//   const availableMembers = useMemo(() => {
//     const assignedIds = new Set(deferredRoles.map((r) => r.member_id));
//     return allMembers.filter(
//       (m) => !assignedIds.has(m.id) || m.id === editingId
//     );
//   }, [allMembers, deferredRoles, editingId]);

//   const columnHelper = useMemo(() => createColumnHelper(), []);

//   const columns = useMemo(
//     () => [
//       columnHelper.accessor("title_name", {
//         header: "Title",
//         cell: (info) => info.getValue(),
//       }),
//       columnHelper.accessor("member_name", {
//         header: "Member",
//         cell: (info) => info.getValue(),
//       }),
//       columnHelper.display({
//         id: "actions",
//         header: "Actions",
//         cell: ({ row }) => (
//           <div className="space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => {
//                 const role = row.original;
//                 setValue("member_id", role.member_id);
//                 setValue("title_id", role.title_id);
//                 setEditingId(role.id);
//               }}
//             >
//               ✏️
//             </Button>
//             <Button
//               variant="destructive"
//               size="sm"
//               onClick={() => deleteMutation.mutate(row.original.id)}
//             >
//               🗑️
//             </Button>
//           </div>
//         ),
//       }),
//     ],
//     [columnHelper, deleteMutation, setValue]
//   );

//   // sort data for display
//   const sortedForUI = useMemo(() => {
//     if (!Array.isArray(deferredRoles)) return [];
//     if (!groupByTitle) {
//       // Global: by sort_order then id
//       return [...deferredRoles].sort(
//         (a, b) => a.sort_order - b.sort_order || a.id - b.id
//       );
//     }
//     // Grouped: by title_id asc, then title_sort_order asc, then id
//     return [...deferredRoles].sort(
//       (a, b) =>
//         a.title_id - b.title_id ||
//         a.title_sort_order - b.title_sort_order ||
//         a.id - b.id
//     );
//   }, [deferredRoles, groupByTitle]);

//   const table = useReactTable({
//     data: deferredRoles,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//   });

//   useEffect(() => {
//     setEditingId(null);
//     reset((prev) => ({ ...prev, member_id: "", title_id: "" }));
//   }, [journalId, reset]);

//   const onSubmit = (data) => {
//     const payload = { ...data };
//     if (editingId) payload.id = editingId;
//     assignMutation.mutate(payload);
//   };

//   const sensors = useSensors(useSensor(PointerSensor));
//   const ids = sortedForUI.map((r) => r.id);

//   const handleDragEnd = async (e) => {
//     const { active, over } = e;
//     if (!over || active.id === over.id) return;

//     const oldIndex = ids.findIndex((id) => id === active.id);
//     const newIndex = ids.findIndex((id) => id === over.id);
//     const newOrderIds = arrayMove(ids, oldIndex, newIndex);

//     // If grouped, block cross-title move
//     if (groupByTitle) {
//       const from = sortedForUI.find((r) => r.id === active.id);
//       const to = sortedForUI.find((r) => r.id === over.id);
//       if (!from || !to) return;
//       if (from.title_id !== to.title_id) {
//         toast.error("Drag within the same title group only");
//         return;
//       }

//       // Filter only this title group in the new order
//       const titleId = from.title_id;
//       const groupIds = newOrderIds.filter(
//         (id) => sortedForUI.find((r) => r.id === id)?.title_id === titleId
//       );

//       try {
//         await axios.put("/api/journal-editorial-roles", {
//           journal_id: Number(journalId),
//           scope: "title",
//           title_id: titleId,
//           orderedIds: groupIds,
//         });
//         toast.success("Title order updated");
//         queryClient.invalidateQueries({
//           queryKey: ["journal-editorial-roles", journalId],
//         });
//       } catch {
//         toast.error("Failed to update title order");
//       }
//     } else {
//       // Global reorder for all records shown
//       try {
//         await axios.put("/api/journal-editorial-roles", {
//           journal_id: Number(journalId),
//           scope: "global",
//           orderedIds: newOrderIds,
//         });
//         toast.success("Order updated");
//         queryClient.invalidateQueries({
//           queryKey: ["journal-editorial-roles", journalId],
//         });
//       } catch {
//         toast.error("Failed to update order");
//       }
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="space-y-4 p-4 border rounded"
//     >
//       <h2 className="text-lg font-semibold">Assign Roles</h2>

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

//       <Label>Select Member</Label>
//       <select
//         {...register("member_id", { required: true })}
//         className="border p-2 rounded w-full"
//       >
//         <option value="">Choose Member</option>
//         {availableMembers.map((m) => (
//           <option key={m.id} value={m.id}>
//             {m.name}
//           </option>
//         ))}
//       </select>

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
//         {assignMutation.isPending
//           ? "Saving..."
//           : editingId
//           ? "Update Role"
//           : "Assign Role"}
//       </Button>

//       <div className="flex items-center gap-3">
//         <input
//           id="groupByTitle"
//           type="checkbox"
//           className="h-4 w-4"
//           checked={groupByTitle}
//           onChange={(e) => setGroupByTitle(e.target.checked)}
//           disabled={!journalId}
//         />
//         <Label htmlFor="groupByTitle">
//           Group & reorder within Title (updates <code>title_sort_order</code>)
//         </Label>
//       </div>

//       <div className="mt-6 border rounded overflow-x-auto">
//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCenter}
//           onDragEnd={handleDragEnd}
//         >
//           <table className="w-full">
//             <thead>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <tr key={headerGroup.id}>
//                   <th className="w-6"></th>
//                   {headerGroup.headers.map((header) => (
//                     <th key={header.id} className="border p-2 bg-gray-100">
//                       {flexRender(
//                         header.column.columnDef.header,
//                         header.getContext()
//                       )}
//                     </th>
//                   ))}
//                 </tr>
//               ))}
//             </thead>
//             <SortableContext items={ids} strategy={verticalListSortingStrategy}>
//               <tbody>
//                 {table.getRowModel().rows.map((row) => (
//                   // <tr key={row.id}>
//                   //   {row.getVisibleCells().map((cell) => (
//                   //     <td key={cell.id} className="border p-2">
//                   //       {flexRender(
//                   //         cell.column.columnDef.cell,
//                   //         cell.getContext()
//                   //       )}
//                   //     </td>
//                   //   ))}
//                   // </tr>
//                   <SortableRow
//                     key={row.original.id}
//                     id={row.original.id}
//                     cells={row.getVisibleCells().map((cell) => (
//                       <td key={cell.id} className="border p-2">
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </td>
//                     ))}
//                   />
//                 ))}
//               </tbody>
//             </SortableContext>
//           </table>
//         </DndContext>
//       </div>
//     </form>
//   );
// }

//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
//////////////////////////////////////////
"use client";

import { useForm, useWatch } from "react-hook-form";
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SortableMemberRow, SortableTitleRow } from "../Dnd/SortableRow";

export function AssignEditorialRolesForm() {
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const queryClient = useQueryClient();
  const journalId = useWatch({ control, name: "journal_id" });

  const [editingId, setEditingId] = useState(null);

  /* ─── Queries ───────────────────────────────────────────────── */
  const { data: journals = [] } = useQuery({
    queryKey: ["journals"],
    queryFn: async () => {
      const res = await axios.get("/api/journals");
      return res.data.journals ?? [];
    },
  });

  const { data: allMembers = [] } = useQuery({
    queryKey: ["editorial-members"],
    queryFn: async () => {
      const res = await axios.get("/api/editorial-members");
      return res.data.members ?? [];
    },
  });

  const { data: titles = [] } = useQuery({
    queryKey: ["editorial-titles"],
    queryFn: async () => {
      const res = await axios.get("/api/editorial-titles");
      return res.data.titles ?? [];
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["journal-editorial-roles", journalId],
    queryFn: async () => {
      if (!journalId) return [];
      const res = await axios.get(
        `/api/journal-editorial-roles?journalId=${journalId}`
      );
      return res.data.roles ?? [];
    },
    enabled: !!journalId,
  });

  /* ─── Mutations ─────────────────────────────────────────────── */
  const assignMutation = useMutation({
    mutationFn: (data) =>
      data.id
        ? axios.patch("/api/journal-editorial-roles", data)
        : axios.post("/api/journal-editorial-roles", data),
    onSuccess: (_, data) => {
      toast.success(data?.id ? "Role updated" : "Role assigned");
      reset({ ...data, member_id: "", title_id: "" });
      queryClient.invalidateQueries([
        "journal-editorial-roles",
        data.journal_id ?? journalId,
      ]);
      setEditingId(null);
    },
    onError: () => toast.error("Failed to save role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axios.delete(`/api/journal-editorial-roles?id=${id}`),
    onSuccess: () => {
      toast.success("Role deleted");
      queryClient.invalidateQueries(["journal-editorial-roles", journalId]);
    },
    onError: () => toast.error("Failed to delete role"),
  });

  /* ─── Derived Data ──────────────────────────────────────────── */
  const availableMembers = useMemo(() => {
    const assignedIds = new Set(roles.map((r) => r.member_id));
    return allMembers.filter(
      (m) => !assignedIds.has(m.id) || m.id === editingId
    );
  }, [allMembers, roles, editingId]);

  // Group roles by title_id
  const grouped = useMemo(() => {
    const map = new Map();
    roles.forEach((r) => {
      if (!map.has(r.title_id)) {
        map.set(r.title_id, {
          title_id: r.title_id,
          title_name: r.title_name,
          title_sort_order: r.title_sort_order,
          members: [],
        });
      }
      map.get(r.title_id).members.push(r);
    });

    return [...map.values()].sort(
      (a, b) => a.title_sort_order - b.title_sort_order
    );
  }, [roles]);

  const columnHelper = createColumnHelper();

  const memberColumns = [
    {
      id: "member_name",
      header: "Member",
      cell: ({ row }) => row.original.member_name,
    },
    {
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
    },
  ];

  /* ─── Form Submit ───────────────────────────────────────────── */
  const onSubmit = (data) => {
    const payload = { ...data };
    if (editingId) payload.id = editingId;
    assignMutation.mutate(payload);
  };

  /* ─── DnD Setup ─────────────────────────────────────────────── */
  const sensors = useSensors(useSensor(PointerSensor));

  const handleTitleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = grouped.map((t) => t.title_id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const newOrder = arrayMove(ids, oldIndex, newIndex);

    try {
      await axios.put("/api/journal-editorial-roles", {
        journal_id: Number(journalId),
        scope: "global",
        orderedIds: newOrder.flatMap((tid) =>
          grouped.find((g) => g.title_id === tid).members.map((m) => m.id)
        ),
      });
      toast.success("Titles reordered");
      queryClient.invalidateQueries(["journal-editorial-roles", journalId]);
    } catch {
      toast.error("Failed to reorder titles");
    }
  };

  const handleMemberDragEnd = async (title_id, members, { active, over }) => {
    if (!over || active.id === over.id) return;
    const ids = members.map((m) => m.id);
    const oldIndex = ids.indexOf(active.id);
    const newIndex = ids.indexOf(over.id);
    const newOrder = arrayMove(ids, oldIndex, newIndex);

    try {
      await axios.put("/api/journal-editorial-roles", {
        journal_id: Number(journalId),
        scope: "title",
        title_id,
        orderedIds: newOrder,
      });
      toast.success("Members reordered");
      queryClient.invalidateQueries(["journal-editorial-roles", journalId]);
    } catch {
      toast.error("Failed to reorder members");
    }
  };

  /* ─── Render ────────────────────────────────────────────────── */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 border rounded"
    >
      <h2 className="text-lg font-semibold">Assign Roles</h2>

      <Label>Select Journal</Label>
      <select
        {...register("journal_id", { required: true })}
        className="border p-2 rounded w-full"
      >
        <option value="">Choose Journal</option>
        {journals.map((j) => (
          <option key={j.id} value={j.id}>
            {j.journal_name}
          </option>
        ))}
      </select>

      <Label>Select Member</Label>
      <select
        {...register("member_id", { required: true })}
        className="border p-2 rounded w-full"
      >
        <option value="">Choose Member</option>
        {availableMembers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <Label>Select Title</Label>
      <select
        {...register("title_id", { required: true })}
        className="border p-2 rounded w-full"
      >
        <option value="">Choose Title</option>
        {titles.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>

      <Button type="submit" disabled={assignMutation.isPending}>
        {assignMutation.isPending
          ? "Saving..."
          : editingId
          ? "Update Role"
          : "Assign Role"}
      </Button>

      {/* ─── Table with Title + Member Groups ─── */}
      {/* <div className="mt-6 border rounded overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTitleDragEnd}
        >
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-6"></th>
                <th className="border p-2 bg-gray-100">Title / Member</th>
                <th className="border p-2 bg-gray-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              <SortableContext
                items={grouped.map((g) => g.title_id)}
                strategy={verticalListSortingStrategy}
              >
                {grouped.map((group) => (
                  <React.Fragment key={`title-group-${group.title_id}`}>
                    <SortableTitleRow id={group.title_id}>
                      <td
                        colSpan={2}
                        className="border p-2 font-bold bg-gray-200"
                      >
                        {group.title_name} (Order: {group.title_sort_order})
                      </td>
                    </SortableTitleRow>


                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) =>
                        handleMemberDragEnd(group.title_id, group.members, e)
                      }
                    >

                      <SortableContext
                        items={group.members.map((m) => m.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {group.members
                          .sort((a, b) => a.sort_order - b.sort_order)
                          .map((member) => (
                            <SortableMemberRow
                              key={`member-${member.id}`}
                              id={member.id}
                              cells={memberColumns.map((col, j) => (
                                <td key={j} className="border p-2">
                                  {col.cell({ row: { original: member } })}
                                </td>
                              ))}
                            />
                          ))}
                      </SortableContext>
                    </DndContext>
                  </React.Fragment>
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>
      </div> */}

      <div className="mt-6 border rounded overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleTitleDragEnd}
        >
          <SortableContext
            items={grouped.map((g) => g.title_id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="w-full">
              {/* <div className="grid grid-cols-3 bg-gray-100 font-semibold"> */}
              <div className="flex bg-gray-100 font-semibold">
                <div className="w-6"></div>
                <div className="flex-1 border p-2">Title / Member</div>
                <div className="flex-1 border p-2">Actions</div>
              </div>

              {grouped.map((group) => (
                <React.Fragment key={`title-group-${group.title_id}`}>
                  {/* Title Row */}
                  <SortableTitleRow id={group.title_id}>
                    <div className="col-span-2 border p-2 font-bold bg-gray-200 w-full">
                      {group.title_name}
                    </div>
                  </SortableTitleRow>

                  {/* Members inside Title */}
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) =>
                      handleMemberDragEnd(group.title_id, group.members, e)
                    }
                  >
                    <SortableContext
                      items={group.members.map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {group.members
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((member) => (
                          <SortableMemberRow
                            key={`member-${member.id}`}
                            id={member.id}
                            cells={memberColumns.map((col, j) => (
                              <div key={j} className="flex-1 border p-2">
                                {col.cell({ row: { original: member } })}
                              </div>
                            ))}
                          />
                        ))}
                    </SortableContext>
                  </DndContext>
                </React.Fragment>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </form>
  );
}
