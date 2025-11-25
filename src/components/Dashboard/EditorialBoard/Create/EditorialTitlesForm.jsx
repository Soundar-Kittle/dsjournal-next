// components/editorial/EditorialForms.jsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { toast } from "sonner";

export function EditorialTitlesForm() {
  const { register, handleSubmit, reset, setValue, control, watch } = useForm({
    defaultValues: {
      title: "",
      is_active: false,
    },
  });

  const [titles, setTitles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTitles = async () => {
    const res = await axios.get("/api/editorial-titles", {
      params: {
        page: pageIndex + 1,
        limit: pageSize,
      },
    });
    const data = res.data.titles;
    setTitles(data);
    setTotalCount(res.data.total);

    // ⭐ Only refill form if editing and NOT after saving
    if (editingId !== null) {
      const found = data.find((d) => d.id === editingId);
      if (found) {
        setValue("title", found.title);
        setValue("is_active", found.status === 1);
      }
    }
  };

  useEffect(() => {
    fetchTitles();
  }, [editingId, pageIndex, pageSize]);

  const onSubmit = async (data) => {
    if (!data.title.trim()) return;

    const formData = {
      title: data.title,
      status: data.is_active ? 1 : 0,
    };

    try {
      if (editingId) {
        await axios.patch(`/api/editorial-titles`, {
          id: editingId,
          ...formData,
        });
        toast.success("Title updated successfully");
      } else {
        await axios.post("/api/editorial-titles", formData);
        toast.success("Title added successfully");

        fetchTitles();
      }

      // ⭐ IMPORTANT — clear editing BEFORE reset & fetch
      setEditingId(() => null);

      // ⭐ Hard reset
      reset({
        title: "",
        is_active: false,
      });
    } catch (err) {
      console.error("Failed to submit:", err);
      toast.error("Failed to submit data");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setValue("title", row.title);
    setValue("is_active", row.status === 1);
  };

  const handleDelete = async (id, title) => {
    await axios.delete(`/api/editorial-titles?id=${id}`);
    toast.success(`Successfully Delete the ${title}`);
    fetchTitles();
  };

  const handleToggleActive = async (id, value) => {
    try {
      await axios.patch(`/api/editorial-titles`, { id, status: value ? 1 : 0 });
      if (editingId === id) {
        setValue("is_active", value);
      }
      fetchTitles();
      toast.success(`Switched ${value ? "on" : "off"} successfully`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update switch status");
    }
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: "Active",
      cell: ({ row }) => (
        <Switch
          className="cursor-pointer"
          checked={row.original.status === 1}
          onCheckedChange={(val) => handleToggleActive(row.original.id, val)}
        />
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            className="cursor-pointer"
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            className="cursor-pointer"
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.original.id, row.original.title)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: titles,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
    state: {
      globalFilter,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    manualPagination: true,
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4 border rounded space-y-4">
      <h2 className="text-lg font-semibold">Titles page</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Label>Title Name</Label>
        <Input
          {...register("title", { required: true })}
          placeholder="Enter Title"
        />

        <div className="flex items-center gap-2">
          <Label>Active</Label>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Switch
                checked={field.value}
                className="cursor-pointer"
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <Button type="submit">{editingId ? "Update" : "Add"} Title</Button>
      </form>

      <div className="pt-4">
        <Input
          placeholder="Search titles..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="mb-4"
        />
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border p-2 text-left">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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

        <div className="flex justify-between items-center pt-4">
          <span className="flex items-center justify-between mt-4">
            <Label>Records per page:</Label>
            <select
              className="border rounded px-2 py-1"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </span>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>

          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
