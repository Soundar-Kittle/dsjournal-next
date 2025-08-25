// "use client";

// import React, { useState, useEffect } from "react";
// import Addform from "@/components/Dashboard/Journals/Journdetails/Addform";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogTrigger,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogClose,
// } from "@/components/ui/dialog";
// import Link from "next/link";

// const page = () => {
//   const [open, setOpen] = useState(false);
//   const [journals, setJournals] = useState([]);
//   const [editData, setEditData] = useState(null);
//   const [search, setSearch] = useState("");


//   const handleEdit = (journal) => {
//     setEditData(journal);
//     setOpen(true);
//   };

//   const handleDelete = async (id) => {
//     if (confirm("Are you sure you want to delete this journal?")) {
//       const res = await fetch(`/api/journals?id=${id}`, {
//         method: "DELETE",
//       });

//       const result = await res.json(); // <== This line expects valid JSON

//       if (result.success) {
//         setJournals((prev) => prev.filter((j) => j.id !== id));
//       } else {
//         alert(result.error || "Delete failed");
//       }
//     }
//   };

//   const fetchJournals = async () => {
//     const res = await fetch("/api/journals");
//     const data = await res.json();
//     if (data.success) setJournals(data.journals);
//   };

//   useEffect(() => {
//     fetchJournals();
//   }, []);


//   return (
//     <div className="p-4">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-semibold">Journal Page</h1>
//         <Dialog open={open} onOpenChange={setOpen}>
//           <DialogTrigger asChild>
//             <Button onClick={() => setOpen(true)}>+ Add Journal</Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
//             <DialogHeader>
//               <DialogTitle>Add New Journal</DialogTitle>
//             </DialogHeader>
//             <Addform
//               editData={editData}
//               onSuccess={() => {
//                 setOpen(false);
//                 setEditData(null);
//                 fetchJournals(); // ✅ invalidate and refresh list
//                 // optionally refetch journals
//               }}
//             />
//             <DialogClose asChild>
//               <Button variant="outline" className="mt-4">Close</Button>
//             </DialogClose>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <div className="mb-4">
//         <input
//           type="text"
//           placeholder="Search journal name or short name..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2"
//         />
//       </div>

//       {/* Optionally list journals here */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {journals
//           .filter(j =>
//             j.journal_name.toLowerCase().includes(search.toLowerCase()) ||
//             j.short_name.toLowerCase().includes(search.toLowerCase())
//           )
//           .map((journal) => (
//             <div key={journal.id} className="relative rounded border shadow p-2">
//               <div className="relative">
//                 <img
//                   src={`/${journal.cover_image}`}
//                   alt={journal.journal_name}
//                   className="h-64 w-full object-cover rounded"
//                 />

//                 {/* Buttons on top-right */}
//                 <div className="absolute top-2 right-2 flex gap-1">
//                   <Button
//                     size="icon"
//                     variant="outline"
//                     className="h-8 w-8 p-0"
//                     onClick={() => handleEdit(journal)}
//                     title="Edit"
//                   >
//                     ✏️
//                   </Button>
//                   <Button
//                     size="icon"
//                     variant="destructive"
//                     className="h-8 w-8 p-0"
//                     onClick={() => handleDelete(journal.id)}
//                     title="Delete"
//                   >
//                     🗑️
//                   </Button>
//                 </div>
//               </div>

//               <div className="mt-3 text-center">
//                 <Link href={`/dashboard/journals/${journal.short_name}`}><p className="text-sm font-semibold">{journal.journal_name}</p></Link>
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default page;


"use client";

import React, { useState, useEffect, useMemo } from "react";
import Addform from "@/components/Dashboard/Journals/Journdetails/Addform";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";


// ⬇️ import the grid component (adjust path if you place it elsewhere)
import JournalsGrid from "@/components/Dashboard/Journals/Journdetails/JournalsGrid";

export default function Page() {
  const [open, setOpen] = useState(false);
  const [journals, setJournals] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  // ------- data -------
  const fetchJournals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/journals", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setJournals(Array.isArray(data.journals) ? data.journals : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  // ------- CRUD actions -------
  const handleEdit = (journal) => {
    setEditData(journal);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this journal?")) return;
    const res = await fetch(`/api/journals?id=${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) {
      setJournals((prev) => prev.filter((j) => j.id !== id));
    } else {
      alert(result.error || "Delete failed");
    }
  };

  // ------- filter -------
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return journals;
    return journals.filter(
      (j) =>
        (j.journal_name || "").toLowerCase().includes(q) ||
        (j.short_name || "").toLowerCase().includes(q)
    );
  }, [journals, search]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-xl font-semibold">
          Journal Page {savingOrder && <span className="text-sm text-gray-500">— saving order…</span>}
        </h1>

        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditData(null); }}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditData(null);
                setOpen(true);
              }}
            >
              + Add Journal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>{editData ? "Edit Journal" : "Add New Journal"}</DialogTitle>
            </DialogHeader>
            <Addform
              editData={editData}
              onSuccess={() => {
                setOpen(false);
                setEditData(null);
                fetchJournals();
              }}
            />
            <DialogClose asChild>
              <Button variant="outline" className="mt-4">Close</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search journal name or short name.."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 border border-gray-300 rounded px-3 py-2"
        />
        <div className="mt-1 text-xs text-gray-500">
          Drag cards to reorder (disabled while searching).
        </div>
      </div>

      {/* Grid + DnD */}
      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : (
        <>
          {/* NOTE: you currently block reordering while searching (good). */}
          <JournalsGrid
            visible={visible}
            journals={journals}
            setJournals={setJournals}
            search={search}
            setSavingOrder={setSavingOrder}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
