"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";

/** board  = [{ title:{id,title}, people:[…] }, … ]  */
export default function BoardClient({ journalId, board }) {
  const [blocks, setBlocks] = useState(board);

  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.title.id === active.id);
    const newIndex = blocks.findIndex((b) => b.title.id === over.id);
    const newArr = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(newArr); // optimistic UI

    try {
      await axios.patch("/api/journal-editorial-titles", {
        journal_id: journalId,
        order: newArr.map((b) => b.title.id),
      });
      toast.success("Order saved");
    } catch (err) {
      toast.error("Failed to save order");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.title.id)}
        strategy={verticalListSortingStrategy}
      >
        {blocks.map((block) => (
          <SortableItem key={block.title.id} id={block.title.id}>
            <Section block={block} />
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

/* -------- presentation of one block ---------- */
function Section({ block }) {
  return (
    <section className="space-y-4 mb-8">
      <h2 className="inline-block bg-lime-600 text-white px-3 py-1 rounded cursor-grab select-none">
        {block.title.title}
      </h2>

      {block.people.map((p) => (
        <article key={p.id} className="space-y-1">
          <h3 className="font-semibold">{p.name}</h3>
          {p.department && <p className="text-sm">{p.department},</p>}
          {p.university && <p className="text-sm">{p.university}</p>}
          {p.country && (
            <p className="text-sm">
              {p.state && `${p.state}, `} {p.country}.
            </p>
          )}
          {p.email && (
            <p className="text-sm">
              <a
                href={`mailto:${p.email}`}
                className="text-blue-600 underline"
              >
                {p.email}
              </a>
            </p>
          )}
          {p.profile_link && (
            <p className="text-sm">
              <a
                href={p.profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Profile Link
              </a>
            </p>
          )}
          {p.has_address === 1 && p.address_lines && (
            <div
              className="prose prose-sm"
              dangerouslySetInnerHTML={{ __html: p.address_lines }}
            />
          )}
        </article>
      ))}
    </section>
  );
}
