// components/ui/ConfirmDialog.jsx
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
} from "@/components/ui";
import { Button } from "@/components/ui";

export default function ConfirmDialog({
	open,
	onConfirm,
	onCancel,
	title = "Are you sure?",
	description = "",
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	isLoading = false, // ← NEW
}) {
	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent className="max-w-sm">
				<DialogTitle>{title}</DialogTitle>

				{description && (
					<DialogDescription className="mb-4 text-sm text-gray-600">
						{description}
					</DialogDescription>
				)}

				<div className="flex justify-end gap-2">
					<Button variant="outline" onClick={onCancel} disabled={isLoading}>
						{cancelLabel}
					</Button>

					<Button onClick={onConfirm} disabled={isLoading}>
						{isLoading ? "Please wait…" : confirmLabel}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
