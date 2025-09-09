"use client";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/ui";

import { AddBanner } from "./AddBanner";
import { banners } from "@/services";
import { linkOptions } from "@/@data/data";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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
                src={`${info.getValue()}`}
                alt="banner"
                fill
                sizes="100%"
                className="object-cover"
              />
            </div>
          ),
          className: "table-name",
        }),
        columnHelper.accessor("title", {
          header: "Title",
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
          cell: (info) => info.getValue()?.slice(0, 50) || "N/A",
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

  return (
    <>
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
        // filters={{
        //   search: filterSearch ?? "",
        // }}
      />
    </>
  );
};

export default ManageBanner;
