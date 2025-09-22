"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Button, DataTable, Input } from "@/components/ui";

import { AddMeta } from "./AddMeta";
import { metas, useSitemaps } from "@/services";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

const ManageMeta = () => {
  const columnHelper = createColumnHelper();
  const { data: sitemaps } = useSitemaps();
  const columnsConfig = [
    {
      header: "Meta Information",
      columns: [
        columnHelper.accessor("reference_type", { header: "Reference Type" }),
        columnHelper.accessor("reference_id", {
          header: "Reference Page",
          cell: (info) =>
            sitemaps?.rows.find((s) => s.value === info.getValue())?.label || "N/A",
        }),
      ],
    },
  ];

  const [columns, setColumns] = useState([
    { value: "reference_type", label: "Reference Type", visible: true },
    { value: "reference_id", label: "Reference Page", visible: true },
  ]);

  const { control, watch, reset } = useForm();
  const filterSearch = watch("search");

  return (
    <>
      <div className="mb-3 rounded-lg shadow-md overflow-hidden p-4 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            control={control}
            name="search"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                label="Search"
                onValueChange={field.onChange}
                placeholder="Search: Type, Page"
              />
            )}
          />
          <div className="flex justify-end">
            <Button
              type="reset"
              className="mt-4"
              onClick={() => reset({ search: "" })}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        fetchData={metas.getPaginated}
        columnsConfig={columnsConfig}
        columns={columns}
        setColumns={setColumns}
        title="Meta Tags"
        onDelete={metas.delete}
        AddComponent={AddMeta}
        addButtonText="Add Meta"
        EditComponent={AddMeta}
        filters={{ search: filterSearch ?? "" }}
      />
    </>
  );
};

export default ManageMeta;
