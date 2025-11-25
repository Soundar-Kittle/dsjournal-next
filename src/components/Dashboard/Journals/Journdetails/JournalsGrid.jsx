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
import { SquarePen, Trash } from "lucide-react";
import { Switch } from "@/components/ui";

function SortableCard({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      if (!data.success && !data.ok)
        throw new Error(data.message || "Failed to save order");
    } catch (e) {
      setJournals(prev);
      alert(e.message);
    } finally {
      setSavingOrder(false);
    }
  };

  /* ---------------------- Toggle Active/Inactive ---------------------- */
  const toggleActive = async (journal) => {
    try {
      const newStatus = !journal.is_active;

      const res = await fetch("/api/journals/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journal_id: journal.id,
          is_active: newStatus,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to update");

      // Update UI instantly
      setJournals((prev) =>
        prev.map((j) =>
          j.id === journal.id ? { ...j, is_active: newStatus } : j
        )
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((journal) => {
            const imageSrc = journal?.cover_image?.startsWith("/")
              ? journal.cover_image.slice(1)
              : journal?.cover_image;
            return (
              <SortableCard key={journal.id} id={String(journal.id)}>
                <div className="relative rounded border shadow p-2 bg-white">
                  <div className="relative">
                    <img
                      src={imageSrc ? `/${imageSrc}` : "/logo.png"}
                      alt={journal?.journal_name}
                      className="h-64 w-full object-cover rounded"
                      draggable={false}
                      onError={(e) => {
                        e.currentTarget.src = "/logo.png";
                      }}
                    />
                    <div className="absolute top-0 flex items-center justify-between w-full px-2 bg-white/10 backdrop-blur-md py-2 shadow-lg">
                      <div
                        className={`w-12 h-8 bg-white/30  rounded-md flex items-center justify-center`}
                      >
                        <Switch
                          checked={journal.is_active}
                          className="cursor-pointer"
                          onCheckedChange={() => toggleActive(journal)}
                        />
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(journal);
                          }}
                          title="Edit"
                        >
                          <SquarePen />
                        </Button>
                        <Button
                          className="h-8 w-8 p-0"
                          variant="outline"
                          onClick={() => onDelete(journal.id)}
                          disabled={journal.article_count > 0} // 🔒 disable delete if articles exist
                          title={
                            journal.article_count > 0
                              ? `Cannot delete — ${journal.article_count} article(s) linked`
                              : "Delete journal"
                          }
                        >
                          <Trash/>  
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <Link
                      href={`/admin/dashboard/journals/${journal?.short_name || journal.id
                        }`}
                    >
                      <p className="text-sm font-semibold hover:underline">
                        {journal?.journal_name}
                      </p>
                    </Link>
                    <p className="text-xs text-gray-500">
                      {journal?.short_name || "—"}
                    </p>
                  </div>
                </div>
              </SortableCard>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
