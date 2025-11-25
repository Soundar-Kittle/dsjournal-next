"use client";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { SortableItem } from "./SortableItem";
import axios from "axios";
import { toast } from "sonner";

export default function BlockDnd({ journalId, initial, children }) {
  const [items, setItems] = useState(initial);
  const sensors = useSensors(useSensor(PointerSensor));

  async function onDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const old = items.findIndex((i) => i.id === active.id);
    const nev = items.findIndex((i) => i.id === over.id);
    const newArr = arrayMove(items, old, nev);
    setItems(newArr);

    // persist to DB
    try {
      await axios.patch("/api/journal-editorial-titles", {
        journal_id: journalId,
        order: newArr.map((i) => i.id),
      });
      toast.success("Order saved");
    } catch {
      toast.error("Failed to save order");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        {items.map((blk) => (
          <SortableItem key={blk.id} id={blk.id}>
            {children(blk)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
