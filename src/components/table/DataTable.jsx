import React, { useState } from "react";
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import TableHeader from "./TableHeader";
import TableBody from "./TableBody";
import TablePagination from "./TablePagination";
import {
  FileSpreadsheet,
  FileBarChart2,
  FileText,
  Plus,
  X,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  LayoutList,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Separator,
} from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useApiQuery, useApiMutation } from "@/hooks";
import { queryClient } from "@/lib/queryClient";
import { LoadingDataTable } from "../ui/LoadingSkeleton";

const DataTable = ({
  tag,
  fetchData,
  columnsConfig = [],
  addButtonText = "Add Item",
  AddComponent = null,
  onDelete = false,
  onCancel = false,
  EditComponent = null,
  ViewComponent = null,
  columns,
  setColumns,
  filters,
  title,
  showPagination = true,
  dontShowColumnSelect = false,
  onPDF = false,
  onCSV = false,
  onExcel = false,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [rowIdToDelete, setRowIdToDelete] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [rowIdToCancel, setRowIdToCancel] = useState(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState([]);

  const baseParams = {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
  };

  const finalParams = {
    ...baseParams,
    ...(filters &&
      Object.keys(filters).length > 0 && {
        filters: JSON.stringify(filters),
      }),
    ...(Array.isArray(sorting) &&
      sorting.length > 0 && {
        sorting: JSON.stringify(sorting),
      }),
  };

  const { data, error, isLoading, refetch } = useApiQuery({
    key: fetchData.key,
    endpoint: fetchData.url,
    method: fetchData.method,
    queryParams: finalParams,
  });
  const defaultColumn = {
    cell: ({ getValue }) => <span>{getValue()}</span>,
    enableSorting: false,
  };

  //  Delete handlers
  const handleDeleteClick = (id) => {
    setRowIdToDelete(id);
    setShowDeleteDialog(true);
  };

  const deleteMutation = useApiMutation({
    endpoint: onDelete?.url,
    method: onDelete?.method,
    onSuccess: (data) => {
      toast.success(data.message || "Deleted successfully");
      queryClient.invalidateQueries(fetchData.key);
      setShowDeleteDialog(false);
      setRowIdToDelete(null);
    },
    onError: (err) => {
      console.error("Delete failed:", err);
      toast.error(err?.response?.data?.message || "Delete failed");
    },
  });

  const confirmDelete = () => {
    if (!rowIdToDelete) return;
    deleteMutation.mutate({ id: rowIdToDelete });
  };

  //  Cancel handlers
  const handleCancelClick = (id) => {
    setRowIdToCancel(id);
    setShowCancelDialog(true);
  };

  const cancelMutation = useApiMutation({
    endpoint: onCancel?.url,
    method: onCancel?.method,
    onSuccess: (data) => {
      toast.success(data.message || "Cancelled successfully");
      queryClient.invalidateQueries(fetchData.key);
      setShowCancelDialog(false);
      setRowIdToCancel(null);
    },
    onError: (err) => {
      console.error("Cancel failed:", err);
      toast.error(err?.response?.data?.message || "Cancel failed");
    },
  });

  const confirmCancel = () => {
    if (!rowIdToCancel) return;
    cancelMutation.mutate({ id: rowIdToCancel });
  };

  const handlePDFClick = () => {
    const visibleColumns = columns.filter((col) => col.visible);
    onPDF(tag, data.rows, visibleColumns);
  };

  const handleCSVClick = () => {
    const visibleColumns = columns.filter((col) => col.visible);
    onCSV(tag, data.rows, visibleColumns);
  };

  const handleExcelClick = () => {
    const visibleColumns = columns.filter((col) => col.visible);
    onExcel(tag, data.rows, visibleColumns);
  };

  const handleEditClick = (row) => {
    setSelectedRowData(row.original);
    setModalType("edit");
    setModalOpen(true);
  };

  const handleViewClick = (row) => {
    setSelectedRowData(row.original);
    setModalType("view");
    setModalOpen(true);
  };

  const handleAddClick = () => {
    setSelectedRowData(null);
    setModalType("add");
    setModalOpen(true);
  };

  let actionsColumn = null;
  if (onDelete || EditComponent || ViewComponent || onCancel) {
    actionsColumn = {
      header: "Actions",
      id: "actions",
      meta: { tdClass: "text-center", thClass: "text-center" },
      cell: ({ row }) => (
        <div className="flex justify-start items-start cursor-pointer">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <MoreVertical size={18} color="var(--color-primary)" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {ViewComponent && (
                <DropdownMenuItem
                  onClick={() => handleViewClick(row)}
                  className="flex items-center gap-2 !text-blue-500 hover:!bg-blue-100 focus:!bg-blue-100"
                >
                  <Eye size={16} className="text-blue-500" />
                  <span>View Details</span>
                </DropdownMenuItem>
              )}
              {EditComponent && (
                <DropdownMenuItem
                  onClick={() => handleEditClick(row)}
                  className="flex items-center gap-2 !text-yellow-500 hover:!bg-yellow-100 focus:!bg-yellow-100"
                >
                  <Pencil size={16} className="text-yellow-500" />
                  <span>Edit Item</span>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(row.original.id)}
                    className="flex items-center gap-2 !text-red-600 hover:!bg-red-100 focus:!bg-red-100"
                  >
                    <Trash2 size={16} className="text-red-600" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
              {onCancel && (
                <DropdownMenuItem
                  onClick={() => handleCancelClick(row.original.id)}
                  className="flex items-center gap-2 !text-orange-600 hover:!bg-orange-100 focus:!bg-orange-100"
                >
                  <X size={16} className="text-orange-600" />
                  <span>Cancel</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    };
  }

  const normalizeColumns = (columnsArray) => {
    return columnsArray.map((col) => ({
      ...col,
      meta: {
        ...(col.meta || {}),
        thClass: col.headerClassName || "",
        tdClass: col.cellClassName || col.className || "",
      },
    }));
  };

  const mappedColumnsConfig = columnsConfig.map((group) => ({
    ...group,
    columns: normalizeColumns(group.columns),
  }));

  if (actionsColumn) {
    mappedColumnsConfig.push({
      header: "Actions",
      columns: [actionsColumn],
    });
  }

  const table = useReactTable({
    data: data ? data.rows : [],
    columns: mappedColumnsConfig,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: data ? data.rowCount : 0,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    enableColumnResizing: true,
    enableSorting: true,
    columnResizeMode: "onChange",
    state: {
      pagination,
      sorting,
      columnVisibility: columns.reduce((acc, col) => {
        acc[col.value] = col.visible;
        return acc;
      }, {}),
    },
    defaultColumn,
  });

  const handleCheckboxChange = (e, colValue) => {
    const newColumns = columns.map((col) =>
      col.value === colValue ? { ...col, visible: e.target.checked } : col
    );
    setColumns(newColumns);
  };

  if (isLoading) {
    return <LoadingDataTable />;
  }

  if (error) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-red-100 text-red-600 rounded-full mb-4">
            <X size={24} />
          </div>
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-500 max-w-md">
            There was a problem fetching the requested data. Please try again or
            contact support.
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            onClick={() => queryClient.invalidateQueries(fetchData.key)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-primary/10 overflow-hidden">
        <div className="px-6 py-4 bg-primary/10 flex flex-col md:flex-row md:justify-between md:items-center 
        gap-4 border border-primary/25 rounded-t-lg">
          <h2 className="text-xl font-semibold text-primary">
            Manage {title}
            {data && data.rowCount > 0 && (
              <Badge className="ml-3 bg-primary/20 text-primary font-semibold">
                {data.rowCount} items
              </Badge>
            )}
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            {!dontShowColumnSelect && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1.5 border border-primary text-primary rounded-md 
                  flex items-center gap-2 hover:bg-primary hover:text-white transition duration-300 ease-in-out  cursor-pointer"
                  >
                    <LayoutList size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 max-h-64 overflow-y-auto bg-primary/10 rounded-md shadow-lg backdrop-blur-lg"
                >
                  {columns.map((col) => (
                    <div key={col.value} className="px-2 py-1.5 ">
                      <label className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={col.visible}
                          onChange={(e) => handleCheckboxChange(e, col.value)}
                          className="rounded accent-primary focus:ring-primary"
                        />
                        <span className="text-primary">{col.label}</span>
                      </label>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="p-1.5 border border-primary text-primary rounded-md 
              flex items-center gap-2 hover:bg-primary hover:text-white transition duration-300 ease-in-out
              cursor-pointer"
                    onClick={() => refetch()}
                  >
                    <RefreshCw size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Refetch</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {addButtonText && AddComponent && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="px-2 py-2 bg-primary text-white cursor-pointer rounded-md flex items-center gap-2 hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={handleAddClick}
                    >
                      <Plus size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{addButtonText}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {(onPDF || onCSV || onExcel) && (
          <div className="py-2 px-4 flex justify-end">
            <div className="flex gap-1 items-center">
              {onPDF && (
                <button
                  onClick={handlePDFClick}
                  className="p-2 rounded hover:bg-gray-100"
                  title="PDF Report"
                >
                  <FileText size="1.2rem" />
                </button>
              )}
              {onCSV && (
                <button
                  onClick={handleCSVClick}
                  className="p-2 rounded hover:bg-gray-100"
                  title="CSV Report"
                >
                  <FileBarChart2 size="1.2rem" />
                </button>
              )}
              {onExcel && (
                <button
                  onClick={handleExcelClick}
                  className="p-2 rounded hover:bg-gray-100"
                  title="Excel Report"
                >
                  <FileSpreadsheet size="1.2rem" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <TableHeader table={table} />
            <TableBody table={table} />
          </table>
        </div>

        <div className="px-6 border-t border-gray-200">
          <TablePagination table={table} showPagination={showPagination} />
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="w-full max-w-4xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl max-h-[90vh] overflow-y-auto p-4"
          showCloseButton={false}
        >
          <DialogHeader className={"text-primary bg-primary/10 p-4 rounded"}>
            <DialogTitle>
              {modalType === "edit"
                ? "Edit Item"
                : modalType === "view"
                ? "View Details"
                : `Add New ${title}`}
            </DialogTitle>
            <DialogDescription className={"sr-only"}>
              {modalType === "edit"
                ? "Edit the item details."
                : modalType === "view"
                ? "View the item details."
                : "Add a new item."}
            </DialogDescription>
          </DialogHeader>
          <div className="">
            {modalType === "edit" && EditComponent && (
              <EditComponent
                type="edit"
                editData={selectedRowData}
                onClose={() => setModalOpen(false)}
              />
            )}
            {modalType === "view" && ViewComponent && (
              <ViewComponent
                type="view"
                viewData={selectedRowData}
                onClose={() => setModalOpen(false)}
              />
            )}
            {modalType === "add" && AddComponent && (
              <AddComponent type="add" onClose={() => setModalOpen(false)} />
            )}
          </div>
          <Separator />
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700">
                Close
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          
      {/* Cancel */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cancellation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to cancel this item? This action cannot be
            undone.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700">
                Close
              </button>
            </DialogClose>
            <button
              onClick={confirmCancel}
              className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white"
            >
              Cancel Item
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { DataTable };
