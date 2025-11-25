// "use client";
// import { useSortable } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { GripVertical } from "lucide-react";

// export function SortableTitleRow({ id, children }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.7 : 1,
//   };

//   return (
//     <tr ref={setNodeRef} style={style} className="bg-gray-100 font-semibold">
//       <td
//         className="w-6 text-gray-400 cursor-grab"
//         {...attributes}
//         {...listeners}
//       >
//         <GripVertical size={16} />
//       </td>
//       {children}
//     </tr>
//   );
// }

// export function SortableMemberRow({ id, cells }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     opacity: isDragging ? 0.7 : 1,
//   };

//   return (
//     <tr ref={setNodeRef} style={style}>
//       <td
//         className="w-6 text-gray-400 cursor-grab"
//         {...attributes}
//         {...listeners}
//       >
//         <GripVertical size={16} />
//       </td>
//       {cells}
//     </tr>
//   );
// }

"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function SortableTitleRow({ id, children }) {
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
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex bg-gray-100 font-semibold items-center"
    >
      {/* Drag handle */}
      <div
        className="w-6 text-gray-400 cursor-grab flex items-center justify-center"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>

      {/* Title cell */}
      <div className="flex-1 border p-2">{children}</div>
    </div>
  );
}

export function SortableMemberRow({ id, cells }) {
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
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center"
    >
      {/* Drag handle */}
      <div
        className="w-6 text-gray-400 cursor-grab flex items-center justify-center"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>

      {/* Cells (member_name + actions) */}
      {cells}
    </div>
  );
}
