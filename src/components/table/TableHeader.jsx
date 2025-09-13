import React from "react";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";

const TableHeader = ({ table }) => (
	<thead className="bg-primary/2">
		{table.getHeaderGroups().map((headerGroup) => (
			<tr key={headerGroup.id}>
				{headerGroup.headers.map((header) => {
					const isSortable = header.column.getCanSort();
					const isSorted = header.column.getIsSorted();
					const thClass = header.column.columnDef.meta?.thClass ?? "text-left";

					return (
						<th
							key={header.id}
							colSpan={header.colSpan}
							style={{ position: "relative", width: `${header.getSize()}px` }}
							className={`px-3 py-3.5 text-xs text-primary font-medium uppercase text-nowrap tracking-wider ${thClass} ${
								isSortable ? "cursor-pointer select-none" : ""
							}`}
						>
							{header.isPlaceholder ? null : (
								<div
									onClick={
										isSortable
											? header.column.getToggleSortingHandler()
											: undefined
									}
									className="group flex items-start"
								>
									<span>
										{flexRender(
											header.column.columnDef.header,
											header.getContext()
										)}
									</span>
									{isSortable && (
										<span className="ml-2 inline-flex justify-center items-center ">
											{isSorted ? (
												isSorted === "asc" ? (
													<ChevronUp size={16} className="text-primary" />
												) : (
													<ChevronDown size={16} className="text-primary" />
												)
											) : (
												<ArrowUpDown
													size={16}
													className="text-primary group-hover:text-gray-400"
												/>
											)}
										</span>
									)}
								</div>
							)}
							<div
								onMouseDown={(e) => header.getResizeHandler()(e)}
								onTouchStart={(e) => header.getResizeHandler()(e)}
								className={`absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-blue-300 ${
									header.column.getIsResizing() ? "bg-blue-500 w-0.5" : ""
								}`}
							/>
						</th>
					);
				})}
			</tr>
		))}
	</thead>
);

export default TableHeader;
