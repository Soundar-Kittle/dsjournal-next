"use client";
import { createColumnHelper } from "@tanstack/react-table";
import { Button, DataTable, Input } from "@/components/ui";

import { AddBanner } from "./AddBanner";
import { banners } from "@/services";
import { linkOptions } from "@/@data/data";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const ManageBanner = () => {
  const columnHelper = createColumnHelper();
  const columnsConfig = [
    {
      header: "Banner Information",
      columns: [
        columnHelper.accessor("image", {
          header: "Photo",
          cell: (info) => (
            <div className="h-12 w-12 rounded-md overflow-hidden relative">
              <Image
                src={info.getValue() || "/logo.png"}
                alt="banner"
                fill
                style={{ objectFit: "cover" }}
                sizes="100px"
                priority
              />
            </div>
          ),
          className: "table-name",
        }),
        columnHelper.accessor("title", {
          header: "Title",
          cell: (info) => (
            <p className="line-clamp-3" title={info.getValue()}>
              {info.getValue() || "N/A"}
            </p>
          ),
        }),
        columnHelper.accessor("button_link", {
          header: "Button Link",
          cell: (info) => {
            const value = info.getValue();
            if (!value) return "N/A";

            const match = linkOptions.find((opt) => opt.value === value);

            if (!match) return value;

            if (match.type === "link") {
              return (
                <Link
                  href={`/${value}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  View
                </Link>
              );
            }
            return <span className="text-gray-500">{match.label}</span>;
          },
        }),
        columnHelper.accessor("button_name", {
          header: "Button Name",
        }),
        columnHelper.accessor("description", {
          header: "Description",
          cell: (info) => (
            <p className="line-clamp-3" title={info.getValue()}>
              {info.getValue() || "N/A"}
            </p>
          ),
        }),
        columnHelper.accessor("alignment", {
          header: "Alignment",
          cell: (info) => ["Center", "Left", "Right"][info.getValue()] || "N/A",
        }),
        columnHelper.accessor("status", {
          header: "Status",
          cell: (info) => (info.getValue() ? "Active" : "Inactive"),
        }),
      ],
    },
  ];

  const [columns, setColumns] = useState([
    { value: "image", label: "Photo", visible: true },
    { value: "title", label: "Title", visible: true },
    { value: "button_link", label: "Button Link", visible: true },
    { value: "button_name", label: "Button Name", visible: true },
    { value: "description", label: "Description", visible: true },
    { value: "alignment", label: "Alignment", visible: false },
    { value: "status", label: "Status", visible: true },
  ]);

  const { control, watch, reset } = useForm();
  const filterSearch = watch("search");

  return (
    <>
      <div className="mb-3 rounded-lg shadow-md overflow-hidden p-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
          <Controller
            control={control}
            name="search"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                label="Search"
                onValueChange={field.onChange}
                placeholder="Search: title, description"
              />
            )}
          />
          <div className="flex justify-end">
            <Button
              type="reset"
              className="mt-4"
              onClick={() =>
                reset({
                  search: "",
                })
              }
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        fetchData={banners.getPaginated}
        columnsConfig={columnsConfig}
        columns={columns}
        setColumns={setColumns}
        title="Banners"
        onDelete={banners.delete}
        AddComponent={AddBanner}
        addButtonText="Add Banner"
        EditComponent={AddBanner}
        filters={{
          search: filterSearch ?? "",
        }}
      />
    </>
  );
};

export default ManageBanner;
