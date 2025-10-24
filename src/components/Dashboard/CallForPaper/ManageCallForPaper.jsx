"use client";

import { createColumnHelper } from "@tanstack/react-table";
import { Button, DataTable, Input } from "@/components/ui";
import { AddCallForPaper } from "./AddCallForPaper";
import { callForPaper } from "@/services";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import moment from "moment";

const ManageCallForPaper = () => {
  const columnHelper = createColumnHelper();

  /* ------------------ TABLE CONFIG ------------------ */
  const columnsConfig = [
    {
      header: "Call for Paper Information",
      columns: [
        columnHelper.accessor("id", {
          header: "ID",
          cell: (info) => info.getValue(),
          size: 50,
        }),
        columnHelper.accessor("is_common", {
          header: "Type",
          cell: (info) =>
            info.getValue() ? (
              <span className="text-green-600 font-semibold">Common</span>
            ) : (
              <span className="text-blue-600 font-semibold">
                Journal Specific
              </span>
            ),
        }),
        columnHelper.accessor("journal_name", {
          header: "Journal",
          cell: (info) => info.getValue() || "—",
        }),
        columnHelper.accessor("date_mode", {
          header: "Mode",
          cell: (info) =>
            info.getValue() === "manual" ? (
              <span className="text-orange-600 font-semibold">Manual</span>
            ) : (
              <span className="text-purple-600 font-semibold">Auto</span>
            ),
        }),
        columnHelper.accessor("manual_date", {
          header: "Manual Date",
          cell: (info) =>
            info.getValue()
              ? moment(info.getValue()).format("DD-MM-YYYY")
              : "—",
        }),
        columnHelper.accessor("start_date", {
          header: "Start Date",
          cell: (info) =>
            info.getValue()
              ? moment(info.getValue()).format("DD-MM-YYYY")
              : "—",
        }),
        columnHelper.accessor("end_date", {
          header: "End Date",
          cell: (info) =>
            info.getValue()
              ? moment(info.getValue()).format("DD-MM-YYYY")
              : "—",
        }),
        columnHelper.accessor("permit_dates", {
          header: "Permit (Days)",
          cell: (info) => info.getValue() || "—",
        }),
        columnHelper.accessor("is_active", {
          header: "Status",
          cell: (info) =>
            info.getValue() ? (
              <span className="text-green-600 font-semibold">Active</span>
            ) : (
              <span className="text-red-600 font-semibold">Inactive</span>
            ),
        }),
        columnHelper.accessor("created_at", {
          header: "Created On",
          cell: (info) => info.getValue() || "—",
        }),
      ],
    },
  ];

  const [columns, setColumns] = useState([
    { value: "id", label: "ID", visible: true },
    { value: "is_common", label: "Type", visible: true },
    { value: "journal_name", label: "Journal", visible: true },
    { value: "date_mode", label: "Mode", visible: true },
    { value: "manual_date", label: "Manual Date", visible: true },
    { value: "start_date", label: "Start Date", visible: true },
    { value: "end_date", label: "End Date", visible: true },
    { value: "permit_dates", label: "Permit (Days)", visible: true },
    { value: "is_active", label: "Status", visible: true },
    { value: "created_at", label: "Created On", visible: false },
  ]);

  /* ------------------ SEARCH FILTER ------------------ */
  const { control, watch, reset } = useForm();
  const filterSearch = watch("search");

  return (
    <>
      {/* 🔍 Filter Section */}
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
                placeholder="Search: mode, journal name"
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

      {/* 📋 Data Table */}
      <DataTable
        fetchData={callForPaper.getPaginated}
        columnsConfig={columnsConfig}
        columns={columns}
        setColumns={setColumns}
        title="Call For Paper"
        onDelete={callForPaper.delete}
        AddComponent={AddCallForPaper}
        EditComponent={AddCallForPaper}
        addButtonText="Add Call for Paper"
        filters={{
          search: filterSearch ?? "",
        }}
      />
    </>
  );
};

export default ManageCallForPaper;
