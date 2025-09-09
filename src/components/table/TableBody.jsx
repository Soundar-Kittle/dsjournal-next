import React from "react";
import { flexRender } from "@tanstack/react-table";
import { FileX } from "lucide-react";

const TableBody = ({ table }) => {
	if (table.getRowModel().rows.length === 0) {
		return (
			<tbody>
				<tr>
					<td
						colSpan={table.getAllLeafColumns().length}
						className="py-16 text-center text-gray-500"
					>
						<div className="flex flex-col items-center justify-center space-y-2">
							<FileX className="w-12 h-12 text-gray-300" />
							<p className="text-lg font-medium">No Data Available</p>
							<p className="text-sm text-gray-400">
								No records found to display
							</p>
						</div>
					</td>
				</tr>
			</tbody>
		);
	}

	return (
		<tbody className="divide-y divide-gray-200">
			{table.getRowModel().rows.map((row) => (
				<tr
					key={row.id}
					className="hover:bg-gray-50 transition-colors duration-150"
				>
					{row.getVisibleCells().map((cell) => {
						const cellClass = cell.column.columnDef.meta?.tdClass ?? "";
						return (
							<td
								key={cell.id}
								className={`px-3 py-2 whitespace-nowrap text-sm text-gray-700 ${cellClass}`}
							>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</td>
						);
					})}
				</tr>
			))}
		</tbody>
	);
};

export default TableBody;
