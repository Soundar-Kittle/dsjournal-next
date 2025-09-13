// JournalsGrid.jsx
"use client";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";

function SortableCard({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
    cursor: "grab",
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function JournalsGrid({
  visible = [],
  journals = [],
  setJournals,
  search = "",
  setSavingOrder = () => { },
  onEdit = () => { },
  onDelete = () => { },
}) {
  // items MUST be strings
  const items = (visible || []).map((j) => String(j.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const onDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    if (search.trim()) {
      alert("Clear the search box to reorder.");
      return;
    }

    const oldIndex = items.indexOf(String(active.id));
    const newIndex = items.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const next = arrayMove(journals, oldIndex, newIndex);
    const prev = journals;
    setJournals(next);

    setSavingOrder(true);
    try {
      const res = await fetch("/api/journals/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: next.map((j) => j.id) }),
      });
      const data = await res.json();
      if (!data.success && !data.ok) throw new Error(data.message || "Failed to save order");
    } catch (e) {
      setJournals(prev);
      alert(e.message);
    } finally {
      setSavingOrder(false);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {visible.map((journal) => (
            <SortableCard key={journal.id} id={String(journal.id)}>
              <div className="relative rounded border shadow p-2 bg-white">
                <div className="relative">
                  <img
                    src={journal.cover_image ? `/${journal.cover_image}` : "/placeholder.svg"}
                    alt={journal.journal_name}
                    className="h-64 w-full object-cover rounded"
                    draggable={false}
                    onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); onEdit(journal); }}
                      title="Edit"
                    >
                      ✏️
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); onDelete(journal.id); }}
                      title="Delete"
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <Link href={`/admin/dashboard/journals/${journal.short_name || journal.id}`}>
                    <p className="text-sm font-semibold hover:underline">
                      {journal.journal_name}
                    </p>
                  </Link>
                  <p className="text-xs text-gray-500">
                    {journal.short_name || "—"}
                  </p>
                </div>
              </div>
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
