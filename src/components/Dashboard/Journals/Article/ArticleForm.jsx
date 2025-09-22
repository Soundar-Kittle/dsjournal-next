// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useMemo, useState, useEffect, useRef, Fragment } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getFilteredRowModel,
//   flexRender,
// } from "@tanstack/react-table";
// import { Dialog, Transition } from "@headlessui/react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// // adjust this import to where your CKEditor wrapper lives
// import CKEditorField from "./CKEditorField";

// function safeParseArray(input) {
//   try {
//     const parsed = typeof input === "string" ? JSON.parse(input) : input;
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// export default function ArchivesPage() {
//   const searchParams = useSearchParams();
//   const jid = searchParams.get("jid");
//   const router = useRouter();
//   const queryClient = useQueryClient();
//   const [isViewOpen, setIsViewOpen] = useState(false);
// const [viewRow, setViewRow] = useState(null);

//   // ----- ADD FORM STATE -----
//   const [form, setForm] = useState({
//     article_status: "",
//     journal_id: jid || "",
//     volume_id: "",
//     issue_id: "",
//     month_id: "",
//     article_id: "",
//     doi: "",
//     article_title: "",
//     authors: "",
//     abstract: "",
//     keywords: "",
//     page_from: "",
//     page_to: "",
//     references: "",
//     received: "",
//     revised: "",
//     accepted: "",
//     published: "",
//   });

//   const fileInputRef = useRef(null);
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState("");

//   const MONTH_MAP = {
//   january: "Jan", february: "Feb", march: "Mar", april: "Apr",
//   may: "May", june: "Jun", july: "Jul", august: "Aug",
//   september: "Sep", october: "Oct", november: "Nov", december: "Dec",
// };

//   // ----- FILTERS -----
//   const [filters, setFilters] = useState({
//     title: "",
//     author: "",
//     volume: "",
//     issue: "",
//     year: "",
//     journal_id: "",
//     article_id: "",
//   });

//   const [journals, setJournals] = useState([]);
//   const [volumesMeta, setVolumesMeta] = useState([]);
//   const [issuesMeta, setIssuesMeta] = useState([]);
//   const [months, setMonths] = useState([]);

  

//   // ----- EDIT MODAL STATE -----
//   const [isEditOpen, setIsEditOpen] = useState(false);
//   const [editRow, setEditRow] = useState(null);
//   const editFileRef = useRef(null);
//   const [editFile, setEditFile] = useState(null);
//   const [editFileName, setEditFileName] = useState("");
//   const [editForm, setEditForm] = useState({
//     id: "",
//     article_status: "",
//     journal_id: jid || "",
//     volume_id: "",
//     issue_id: "",
//     month_id: "",
//     article_id: "",
//     doi: "",
//     article_title: "",
//     authors: "",
//     abstract: "",
//     keywords: "",
//     page_from: "",
//     page_to: "",
//     references: "",
//     received: "",
//     revised: "",
//     accepted: "",
//     published: "",
//   });

//   // ----- ARTICLES -----
//   const { data: articles = [] } = useQuery({
//     queryKey: ["articles", jid],
//     queryFn: async () => {
//       const res = await fetch(`/api/articles?journal_id=${jid}`);
//       const data = await res.json();
//       if (!data.success || !Array.isArray(data.articles)) return [];
//       return data.articles.map((a) => ({
//         ...a,
//         title: a.article_title || "",
//         authors: safeParseArray(a.authors),
//         key_words: safeParseArray(a.keywords),
//         volume: String(a.volume_id ?? ""),
//         issue: String(a.issue_id ?? ""),
//         year: a.published ? new Date(a.published).getFullYear().toString() : "",
//         article_file_path: a.pdf_path || "",
//         received_date: a.received || "",
//         revised_date: a.revised || "",
//         accepted_date: a.accepted || "",
//         published_date: a.published || "",
//       }));
//     },
//     enabled: !!jid,
//   });

//   const years = useMemo(
//     () => Array.from(new Set(articles.map((a) => a.year))).filter(Boolean),
//     [articles]
//   );

//   // ----- METADATA (volumes, issues, months) -----
//   useEffect(() => {
//     const fetchMetaData = async () => {
//       if (!jid) return;

//       const volumeUrl = filters.year
//         ? `/api/volume?journal_id=${jid}&year=${filters.year}`
//         : `/api/volume?journal_id=${jid}`;

//       const [volumesRes, issuesRes, monthsRes] = await Promise.all([
//         fetch(volumeUrl),
//         fetch(`/api/issues?journal_id=${jid}`),
//         fetch(`/api/month-groups?journal_id=${jid}`), // adjust if your route differs
//       ]);

//       const [volumesData, issuesData, monthsData] = await Promise.all([
//         volumesRes.json(),
//         issuesRes.json(),
//         monthsRes.json(),
//       ]);

//       if (volumesData?.success) setVolumesMeta(volumesData.volumes);
//       if (issuesData?.success) setIssuesMeta(issuesData.issues);
//       if (monthsData?.success) setMonths(monthsData.months || monthsData.data || []);
//     };
//     fetchMetaData();
//   }, [jid, filters.year]);

//   // ----- JOURNALS -----
//   useEffect(() => {
//     const fetchJournals = async () => {
//       const res = await fetch(`/api/journals?id=${jid}`);
//       const data = await res.json();
//       if (data.success) setJournals(data.journals);
//     };
//     fetchJournals();
//   }, [jid]);

//   function openViewModal(row) {
//   setViewRow(row);
//   setIsViewOpen(true);
// }
// function closeViewModal() {
//   setIsViewOpen(false);
//   setViewRow(null);
// }

// function formatDate(dateString) {
//   if (!dateString) return "—";
//   const date = new Date(dateString);
//   if (isNaN(date)) return "—";
//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }

// function shortMonth(name) {
//   if (!name) return "";
//   return MONTH_MAP[String(name).toLowerCase()] || name.slice(0, 3);
// }

// function formatMonthLabel(m) {
//   if (!m) return "";
//   const from = shortMonth(m.from_month);
//   const to = m.to_month ? shortMonth(m.to_month) : "";
//   return to && to !== from ? `${from}–${to}` : from;
// }

// const monthById = useMemo(() => {
//   const map = {};
//   months.forEach(m => { map[String(m.id)] = m; });
//   return map;
// }, [months]);

// function getMonthLabelById(id) {
//   return formatMonthLabel(monthById[String(id)]);
// }


//   const getJournalName = (id) => {
//     const journal = journals.find((j) => j.id === Number(id));
//     return journal?.journal_name || "Journal Name";
//   };

//   const getVolumeName = (id) => {
//     const v = volumesMeta.find((vv) => vv.id === Number(id));
//     return v?.volume_number ?? v?.volume_label ?? id;
//   };

//   const getIssueName = (id) => {
//     const i = issuesMeta.find((ii) => ii.id === Number(id));
//     return i?.issue_number ?? i?.issue_label ?? id;
//   };

//   const filteredArticles = useMemo(() => {
//     return articles.filter((a) => {
//       return (
//         (a.title || "")
//           .toLowerCase()
//           .includes((filters.title || "").toLowerCase()) &&
//         (a.authors || [])
//           .join(", ")
//           .toLowerCase()
//           .includes((filters.author || "").toLowerCase()) &&
//         (filters.volume ? a.volume === filters.volume : true) &&
//         (filters.issue ? a.issue === filters.issue : true) &&
//         (filters.year ? a.year === filters.year : true) &&
//         (filters.journal_id
//           ? String(a.journal_id) === filters.journal_id
//           : true) &&
//         (filters.article_id
//           ? String(a.article_id).includes(filters.article_id)
//           : true)
//       );
//     });
//   }, [articles, filters]);

//   // ----- TABLE -----
//   const columns = useMemo(() => {
//     return [
//       { header: "Article ID", accessorKey: "article_id" },
//       {
//         header: "Journal Name",
//         accessorKey: "journal_id",
//         cell: (info) => getJournalName(info.getValue()),
//       },
//       { header: "Title", accessorKey: "title" },
//       {
//         header: "Authors",
//         accessorKey: "authors",
//         cell: (info) => (info.getValue() || []).join(", "),
//       },
//       {
//         header: "Keywords",
//         accessorKey: "key_words",
//         cell: (info) => (info.getValue() || []).join(", "),
//       },
//       {
//         header: "Volume",
//         accessorKey: "volume",
//         cell: (info) => getVolumeName(info.getValue()),
//       },
//       {
//         header: "Issue",
//         accessorKey: "issue",
//         cell: (info) => getIssueName(info.getValue()),
//       },
//       { header: "Year", accessorKey: "year" },
//       { header: "DOI", accessorKey: "doi" },
//       {
//         header: "Actions",
//   cell: ({ row }) => (
//     <div className="space-x-2">
//       <button
//         onClick={() => openViewModal(row.original)}
//         className="text-blue-600 underline"
//       >
//         View
//       </button>
//       <button
//         onClick={() => openEditModal(row.original)}
//         className="text-emerald-700 underline"
//       >
//         Edit
//       </button>
//       <button
//         onClick={() => handleDelete(row.original.article_id)}
//         className="text-red-600 underline"
//       >
//         Delete
//       </button>
//     </div>
//   ),
//       },
//     ];
//   }, [jid, journals, volumesMeta, issuesMeta]);

//   const table = useReactTable({
//     data: filteredArticles,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//   });

//   // ----- EDIT MODAL HANDLERS -----
//   function openEditModal(row) {
//     setEditRow(row);
//     setEditForm({
//       id: row.id, // numeric id used in your earlier Edit route
//       article_status: row.article_status || "",
//       journal_id: String(row.journal_id ?? jid ?? ""),
//       volume_id: String(row.volume_id ?? row.volume ?? ""),
//       issue_id: String(row.issue_id ?? row.issue ?? ""),
//       month_id: String(row.month_id ?? ""),
//       article_id: row.article_id || "",
//       doi: row.doi || "",
//       article_title: row.article_title || row.title || "",
//       authors: (row.authors || []).join(", "),
//       abstract: row.abstract || "",
//       keywords: (row.key_words || []).join(", "),
//       page_from: String(row.page_from ?? ""),
//       page_to: String(row.page_to ?? ""),
//       references: row.references || "",
//       received: row.received_date || row.received || "",
//       revised: row.revised_date || row.revised || "",
//       accepted: row.accepted_date || row.accepted || "",
//       published: row.published_date || row.published || "",
//     });
//     setEditFile(null);
//     setEditFileName("");
//     setIsEditOpen(true);
//   }

//   function closeEditModal() {
//     setIsEditOpen(false);
//     setEditRow(null);
//   }

//   async function handleEditSubmit() {
//     try {
//       const fd = new FormData();
//       // convert comma strings to what your API expects; keeping strings here
//       Object.entries(editForm).forEach(([k, v]) => fd.append(k, String(v ?? "")));
//       if (editFile) fd.append("pdf", editFile);

//       // If your API expects article_id instead of numeric id, switch below
//       const res = await fetch(`/api/articles/${encodeURIComponent(editForm.id)}`, {
//         method: "PATCH",
//         body: fd,
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.success) {
//         throw new Error(data?.message || "Failed to update article");
//       }

//       await queryClient.invalidateQueries({ queryKey: ["articles", jid] });
//       closeEditModal();
//       alert("Article updated successfully");
//     } catch (err) {
//       console.error(err);
//       alert("Update failed");
//     }
//   }

//   // ----- DELETE -----
//   async function handleDelete(articleId) {
//     const confirmed = window.confirm(
//       "Are you sure you want to delete this article?"
//     );
//     if (!confirmed) return;

//     try {
//       const res = await fetch(`/api/articles/${encodeURIComponent(articleId)}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) throw new Error("Delete failed");
//       await queryClient.invalidateQueries({ queryKey: ["articles", jid] });
//       alert("Deleted successfully");
//     } catch (err) {
//       console.error(err);
//       alert("Failed to delete article");
//     }
//   }

//   // ----- ADD SUBMIT -----
//   async function handleSubmit() {
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([k, v]) => fd.append(k, String(v ?? "")));
//       if (file) fd.append("pdf", file);

//       const res = await fetch("/api/articles", {
//         method: "POST",
//         body: fd,
//       });
//       const data = await res.json();
//       if (!res.ok || !data?.success) {
//         throw new Error(data?.message || "Failed to submit article");
//       }

//       setForm((prev) => ({
//         ...prev,
//         article_id: "",
//         doi: "",
//         article_title: "",
//         authors: "",
//         abstract: "",
//         keywords: "",
//         page_from: "",
//         page_to: "",
//         references: "",
//         received: "",
//         revised: "",
//         accepted: "",
//         published: "",
//       }));
//       setFile(null);
//       setFileName("");
//       await queryClient.invalidateQueries({ queryKey: ["articles", jid] });
//       alert("Article submitted successfully");
//     } catch (err) {
//       console.error(err);
//       alert("Submit failed");
//     }
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-6 space-y-8">
//       {/* ARCHIVE FILTERS */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Archive Filters</CardTitle>
//         </CardHeader>
//         <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <Input
//             placeholder="Search Title"
//             value={filters.title}
//             onChange={(e) => setFilters({ ...filters, title: e.target.value })}
//           />
//           <Input
//             placeholder="Search Author"
//             value={filters.author}
//             onChange={(e) => setFilters({ ...filters, author: e.target.value })}
//           />
//           <select
//             value={filters.year}
//             onChange={(e) =>
//               setFilters({ ...filters, year: e.target.value || "" })
//             }
//             className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//           >
//             <option value="">All Years</option>
//             {years.map((y) => (
//               <option key={y} value={y}>
//                 {y}
//               </option>
//             ))}
//           </select>

//           <select
//             value={filters.volume}
//             onChange={(e) =>
//               setFilters({ ...filters, volume: e.target.value || "" })
//             }
//             className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//           >
//             <option value="">All Volumes</option>
//             {volumesMeta.map((v) => (
//               <option key={v.id} value={String(v.id)}>
//                 {getVolumeName(v.id)}
//               </option>
//             ))}
//           </select>

//           <select
//             value={filters.issue}
//             onChange={(e) =>
//               setFilters({ ...filters, issue: e.target.value || "" })
//             }
//             className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//           >
//             <option value="">All Issues</option>
//             {issuesMeta.map((i) => (
//               <option key={i.id} value={String(i.id)}>
//                 {getIssueName(i.id)}
//               </option>
//             ))}
//           </select>

//           <Input
//             placeholder="Article ID"
//             value={filters.article_id}
//             onChange={(e) =>
//               setFilters({ ...filters, article_id: e.target.value })
//             }
//           />
//         </CardContent>
//       </Card>

//       {/* TABLE */}
//       <div className="overflow-x-auto border rounded-lg">
//         <table className="min-w-full text-sm">
//           <thead className="bg-gray-50">
//             {table.getHeaderGroups().map((hg) => (
//               <tr key={hg.id}>
//                 {hg.headers.map((header) => (
//                   <th key={header.id} className="text-left p-3 font-semibold">
//                     {header.isPlaceholder
//                       ? null
//                       : flexRender(
//                           header.column.columnDef.header,
//                           header.getContext()
//                         )}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.map((row) => (
//               <tr key={row.id} className="border-t">
//                 {row.getVisibleCells().map((cell) => (
//                   <td key={cell.id} className="p-3 align-top">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//             {table.getRowModel().rows.length === 0 && (
//               <tr>
//                 <td className="p-4 text-center text-gray-500" colSpan={9}>
//                   No articles found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

 
//       {/* EDIT MODAL */}
//       <Transition appear show={isEditOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-50" onClose={closeEditModal}>
//           <Transition.Child
//             as={Fragment}
//             enter="ease-out duration-150"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-100"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <div className="fixed inset-0 bg-black/40" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-start justify-center p-4">
//               <Transition.Child
//                 as={Fragment}
//                 enter="ease-out duration-200"
//                 enterFrom="opacity-0 translate-y-3"
//                 enterTo="opacity-100 translate-y-0"
//                 leave="ease-in duration-150"
//                 leaveFrom="opacity-100 translate-y-0"
//                 leaveTo="opacity-0 translate-y-3"
//               >
//                 <Dialog.Panel className="w-full max-w-3xl transform rounded-xl bg-white p-0 text-left align-middle shadow-xl transition-all">
//                   <Card className="border-0">
//                     <CardHeader>
//                       <CardTitle>Edit Article — {editForm.article_id || ""}</CardTitle>
//                     </CardHeader>
//                     <CardContent className="space-y-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <select
//                           value={editForm.journal_id}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, journal_id: e.target.value })
//                           }
//                           className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//                           disabled={!!jid}
//                         >
//                           <option value="">Select Journal</option>
//                           {journals.map((j) => (
//                             <option key={j.id} value={j.id}>
//                               {j.journal_name}
//                             </option>
//                           ))}
//                         </select>

//                         <select
//                           value={editForm.volume_id}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, volume_id: e.target.value })
//                           }
//                           className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//                         >
//                           <option value="">Select Volume</option>
//                           {volumesMeta.map((v) => (
//                             <option key={v.id} value={v.id}>
//                               {getVolumeName(v.id)}
//                             </option>
//                           ))}
//                         </select>

//                         <select
//                           value={editForm.issue_id}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, issue_id: e.target.value })
//                           }
//                           className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//                         >
//                           <option value="">Select Issue</option>
//                           {issuesMeta.map((i) => (
//                             <option key={i.id} value={i.id}>
//                               {getIssueName(i.id)}
//                             </option>
//                           ))}
//                         </select>

//                <select
//   value={form.month_id}
//   onChange={(e) => setForm({ ...form, month_id: e.target.value })}
//   className="border rounded-md p-2 w-full focus:outline-none focus:ring"
// >
//   <option value="">Select Month</option>
//   {months.map((m) => (
//     <option key={m.id} value={m.id}>
//       {formatMonthLabel(m)}
//     </option>
//   ))}
// </select>
//                       </div>

//                       <div className="space-y-3">
//                         <Input
//                           placeholder="Article ID"
//                           value={editForm.article_id}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, article_id: e.target.value })
//                           }
//                         />
//                         <Input
//                           placeholder="DOI"
//                           value={editForm.doi}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, doi: e.target.value })
//                           }
//                         />
//                         <Input
//                           placeholder="Title"
//                           value={editForm.article_title}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, article_title: e.target.value })
//                           }
//                         />
//                         <Input
//                           placeholder="Authors (comma separated)"
//                           value={editForm.authors}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, authors: e.target.value })
//                           }
//                         />
//                         <Textarea
//                           placeholder="Abstract"
//                           value={editForm.abstract}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, abstract: e.target.value })
//                           }
//                         />
//                         <Input
//                           placeholder="Keywords (comma separated)"
//                           value={editForm.keywords}
//                           onChange={(e) =>
//                             setEditForm({ ...editForm, keywords: e.target.value })
//                           }
//                         />

//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                           <div>
//                             <label className="block text-sm font-medium">Page From</label>
//                             <input
//                               type="number"
//                               value={editForm.page_from}
//                               onChange={(e) =>
//                                 setEditForm({ ...editForm, page_from: e.target.value })
//                               }
//                               className="border p-2 w-full rounded-md"
//                               required
//                             />
//                           </div>

//                           <div>
//                             <label className="block text-sm font-medium">Page To</label>
//                             <input
//                               type="number"
//                               value={editForm.page_to}
//                               onChange={(e) =>
//                                 setEditForm({ ...editForm, page_to: e.target.value })
//                               }
//                               className="border p-2 w-full rounded-md"
//                               required
//                             />
//                           </div>
//                         </div>

//                         <CKEditorField
//                           value={editForm.references}
//                           onChange={(data) =>
//                             setEditForm({ ...editForm, references: data })
//                           }
//                           placeholder="Enter references here..."
//                         />

//                         {/* Dates */}
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                           <Input
//                             type="date"
//                             placeholder="Received"
//                             value={editForm.received}
//                             onChange={(e) =>
//                               setEditForm({ ...editForm, received: e.target.value })
//                             }
//                           />
//                           <Input
//                             type="date"
//                             placeholder="Revised"
//                             value={editForm.revised}
//                             onChange={(e) =>
//                               setEditForm({ ...editForm, revised: e.target.value })
//                             }
//                           />
//                           <Input
//                             type="date"
//                             placeholder="Accepted"
//                             value={editForm.accepted}
//                             onChange={(e) =>
//                               setEditForm({ ...editForm, accepted: e.target.value })
//                             }
//                           />
//                           <Input
//                             type="date"
//                             placeholder="Published"
//                             value={editForm.published}
//                             onChange={(e) =>
//                               setEditForm({ ...editForm, published: e.target.value })
//                             }
//                           />
//                         </div>

//                         {/* File Upload (edit) */}
//                         <input
//                           ref={editFileRef}
//                           type="file"
//                           accept="application/pdf"
//                           style={{ display: "none" }}
//                           onChange={(e) => {
//                             const selectedFile = e.target.files?.[0] || null;
//                             setEditFile(selectedFile);
//                             setEditFileName(selectedFile ? selectedFile.name : "");
//                           }}
//                         />

//                         <div className="flex items-center gap-3">
//                           <Button
//                             variant="outline"
//                             type="button"
//                             onClick={() => editFileRef.current?.click()}
//                           >
//                             {editFileName ? "Change PDF" : "Upload PDF"}
//                           </Button>
//                           {editFileName && (
//                             <span className="text-sm text-gray-500">{editFileName}</span>
//                           )}
//                         </div>

//                         <div className="flex justify-end gap-3 pt-2">
//                           <Button variant="outline" type="button" onClick={closeEditModal}>
//                             Cancel
//                           </Button>
//                           <Button onClick={handleEditSubmit}>Save Changes</Button>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>

// {/* VIEW MODAL */}
// <Transition appear show={isViewOpen} as={Fragment}>
//   <Dialog as="div" className="relative z-50" onClose={closeViewModal}>
//     <Transition.Child as={Fragment} enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
//       <div className="fixed inset-0 bg-black/40" />
//     </Transition.Child>

//     <div className="fixed inset-0 overflow-y-auto">
//       <div className="flex min-h-full items-start justify-center p-4">
//         <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 translate-y-3" enterTo="opacity-100 translate-y-0" leave="ease-in duration-150" leaveFrom="opacity-100 translate-y-0" leaveTo="opacity-0 translate-y-3">
//           <Dialog.Panel className="w-full max-w-4xl transform rounded-xl bg-white text-left align-middle shadow-xl transition-all">
//             <Card className="border-0">
//               <CardHeader className="pb-0">
//                 {/* Top meta bar */}
//                 <div className="text-xs text-gray-500 flex flex-wrap gap-2 leading-5">
//                   <span className="font-medium">Research Article</span>
//                   <span>•</span>
//                   <span>Open Access</span>
//                   {viewRow?.article_file_path && (
//                     <>
//                       <span>•</span>
//                       <a
//                         href={viewRow.article_file_path}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="underline"
//                       >
//                         Download Full Text
//                       </a>
//                     </>
//                   )}
//                 </div>

//                 {/* Title */}
//                 <CardTitle className="text-2xl md:text-3xl mt-2">
//                   {viewRow?.article_title || viewRow?.title || "Article"}
//                 </CardTitle>

//                 {/* Author */}
//                 <div className="mt-1 text-sm text-gray-700">
//                   {(viewRow?.authors || []).join(", ") || "—"}
//                 </div>

//                 {/* Volume / Issue / Year / DOI */}
//                 <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-2">
//                   {viewRow?.volume && (
//                     <span>
//                       Volume {getVolumeName(viewRow.volume)}
//                     </span>
//                   )}
//                   {viewRow?.issue && (
//                     <>
//                       <span>|</span>
//                       <span>Issue {getIssueName(viewRow.issue)}</span>
//                     </>
//                   )}
//                   {viewRow?.year && (
//                     <>
//                       <span>|</span>
//                       <span>Year {viewRow.year}</span>
//                     </>
//                   )}
//                   {viewRow?.article_id && (
//                     <>
//                       <span>|</span>
//                       <span>Article id: {viewRow.article_id}</span>
//                     </>
//                   )}
//                   {viewRow?.doi && (
//                     <>
//                       <span>|</span>
//                       <span>
//                         DOI:&nbsp;
//                         <a
//                           className="underline"
//                           href={`https://doi.org/${viewRow.doi}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                         >
//                           {viewRow.doi}
//                         </a>
//                       </span>
//                     </>
//                   )}
//                 </div>

//                 {/* Dates strip */}
//                 <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-gray-700">
//                   <div className="flex items-center gap-2 bg-gray-50 border rounded px-2 py-1">
//                     <span className="font-semibold">Received</span>
//                    <span className="ml-auto">{formatDate(viewRow?.revised_date)}</span>
//                   </div>
//                   <div className="flex items-center gap-2 bg-gray-50 border rounded px-2 py-1">
//                     <span className="font-semibold">Revised</span>
//                     <span className="ml-auto">{formatDate(viewRow?.revised_date) || "—"}</span>
//                   </div>
//                   <div className="flex items-center gap-2 bg-gray-50 border rounded px-2 py-1">
//                     <span className="font-semibold">Accepted</span>
//                     <span className="ml-auto">{formatDate(viewRow?.accepted_date) || "—"}</span>
//                   </div>
//                   <div className="flex items-center gap-2 bg-gray-50 border rounded px-2 py-1">
//                     <span className="font-semibold">Published</span>
//                     <span className="ml-auto">{formatDate(viewRow?.published_date) || "—"}</span>
//                   </div>
//                 </div>
//               </CardHeader>

//               <CardContent className="pt-6 space-y-6">
//                 {/* Citations (optional short citation line) */}
//                 {(viewRow?.short_citation || viewRow?.citation) && (
//                   <section>
//                     <h4 className="font-semibold mb-2">Citations</h4>
//                     <p className="text-sm leading-6 text-gray-800">
//                       {viewRow.short_citation || viewRow.citation}
//                     </p>
//                   </section>
//                 )}

//                 {/* Abstract */}
//                 {viewRow?.abstract && (
//                   <section>
//                     <h4 className="font-semibold mb-2">Abstract</h4>
//                     <p className="text-sm leading-6 text-gray-800 whitespace-pre-wrap">
//                       {viewRow.abstract}
//                     </p>
//                   </section>
//                 )}

//                 {/* Keywords */}
//                 {(viewRow?.key_words?.length || 0) > 0 && (
//                   <section>
//                     <h4 className="font-semibold mb-2">Keywords</h4>
//                     <p className="text-sm text-gray-800">
//                       {(viewRow.key_words || []).join(", ")}
//                     </p>
//                   </section>
//                 )}

//                 {/* References */}
//                 <section>
//                   <h4 className="font-semibold mb-3">References</h4>

//                   {/* If you store references as HTML from CKEditor */}
//                   {viewRow?.references && typeof viewRow.references === "string" ? (
//                     <div
//                       className="prose prose-sm max-w-none"
//                       dangerouslySetInnerHTML={{ __html: viewRow.references }}
//                     />
//                   ) : null}

//                   {/* If you store references as an array of items (fallback) */}
//                   {Array.isArray(viewRow?.references) && (
//                     <ol className="list-decimal pl-5 space-y-2 text-sm">
//                       {viewRow.references.map((ref, i) => (
//                         <li key={i} className="leading-6">
//                           <div>{ref.text || ref}</div>
//                           <div className="mt-1 flex flex-wrap gap-3 text-xs">
//                             {ref.crossref && (
//                               <a className="underline text-blue-600" href={ref.crossref} target="_blank" rel="noreferrer">
//                                 Crossref
//                               </a>
//                             )}
//                             {ref.scholar && (
//                               <a className="underline text-blue-600" href={ref.scholar} target="_blank" rel="noreferrer">
//                                 Google Scholar
//                               </a>
//                             )}
//                             {ref.publisher && (
//                               <a className="underline text-blue-600" href={ref.publisher} target="_blank" rel="noreferrer">
//                                 Publisher Link
//                               </a>
//                             )}
//                           </div>
//                         </li>
//                       ))}
//                     </ol>
//                   )}
//                 </section>

//                 {/* Footer actions */}
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
//                   <div className="text-xs text-gray-500">
//                     Journal: {getJournalName(viewRow?.journal_id)}
//                   </div>
//                   <div className="flex gap-3">
//                     {viewRow?.article_file_path ? (
//                       <>
//                         <a
//                           href={viewRow.article_file_path}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="underline text-blue-600"
//                         >
//                           Open PDF
//                         </a>
//                         <a
//                           href={viewRow.article_file_path}
//                           download
//                           className="underline text-emerald-700"
//                         >
//                           Download PDF
//                         </a>
//                       </>
//                     ) : (
//                       <span className="text-gray-400 text-sm">No PDF uploaded</span>
//                     )}
//                     <Button variant="outline" onClick={closeViewModal}>
//                       Close
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </Dialog.Panel>
//         </Transition.Child>
//       </div>
//     </div>
//   </Dialog>
// </Transition>

//     </div>
//   );
// }

"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import CKEditorField from "./CKEditorField";

export default function ArticleForm({
  form = {},
  setForm,
  onSubmit,                 // parent should submit with FormData (includes references)
  submitting = false,
  submitLabel = "Submit",
  journals = [],
  volumesMeta = [],
  issuesMeta = [],
  months = [],
  disabledJournal = false,
  onFileSelect,            // (file: File | null) => void
  selectedFile,            // File | null
}) {
  const handleChange = useCallback(
    (key) => (e) => {
      const value = e.target.value;
      setForm?.({ [key]: value });
    },
    [setForm]
  );

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    onFileSelect?.(file);
  };

  return (
    <div className="space-y-4">
      {/* ARTICLE STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-medium">Article Status</label>
          <select
            value={String(form.article_status || "unpublished")}
            onChange={(e) => setForm?.({ article_status: e.target.value })}
            disabled={submitting}
            className="border rounded-md p-2 w-full focus:outline-none focus:ring"
          >
            <option value="unpublished">Unpublished</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {/* JOURNAL / VOLUME / ISSUE / MONTHS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* JOURNAL */}
        <select
          value={String(form.journal_id || "")}
          onChange={handleChange("journal_id")}
          disabled={disabledJournal}
          className="border rounded-md p-2 w-full focus:outline-none focus:ring"
        >
          <option value="">Select Journal</option>
          {journals.map((j) => (
            <option key={j.id} value={String(j.id)}>
              {j.journal_name}
            </option>
          ))}
        </select>

        {/* VOLUME */}
        <select
          value={String(form.volume_id || "")}
          onChange={handleChange("volume_id")}
          className="border rounded-md p-2 w-full focus:outline-none focus:ring"
        >
          <option value="">Select Volume</option>
          {volumesMeta.map((v) => (
            <option key={v.id} value={String(v.id)}>
              {v.volume_number ?? v.volume_label ?? v.id}
            </option>
          ))}
        </select>

        {/* ISSUE */}
        <select
          value={String(form.issue_id || "")}
          onChange={handleChange("issue_id")}
          disabled={!form.volume_id}
          className="border rounded-md p-2 w-full"
        >
          <option value="">Select Issue</option>
          {issuesMeta.map((i) => (
            <option key={i.id} value={String(i.id)}>
              {i.issue_number ?? i.issue_label ?? i.id}
            </option>
          ))}
        </select>

        {/* MONTH FROM (display only) */}
        <select
          value={String(form.month_from || "")}
          disabled
          className="border rounded-md p-2 w-full bg-gray-100 cursor-not-allowed"
        >
          <option value={String(form.month_from || "")}>
            {form.month_from || "From Month"}
          </option>
        </select>

        {/* MONTH TO (display only) */}
        <select
          value={String(form.month_to || "")}
          disabled
          className="border rounded-md p-2 w-full bg-gray-100 cursor-not-allowed"
        >
          <option value={String(form.month_to || "")}>
            {form.month_to || "To Month"}
          </option>
        </select>
      </div>

      {/* PDF upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Article PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={submitting}
          className="block w-full border rounded-md p-2"
        />

        {selectedFile ? (
          <div className="text-sm">
            Selected: <strong>{selectedFile.name}</strong>{" "}
            <button
              type="button"
              onClick={() => onFileSelect?.(null)}
              className="text-blue-600 underline ml-2"
              disabled={submitting}
            >
              remove
            </button>
          </div>
        ) : form.pdf_path ? (
          <div className="text-sm">
            Current file:{" "}
            <a href={form.pdf_path} target="_blank" rel="noreferrer" className="text-blue-600 underline">
              open
            </a>
          </div>
        ) : (
          <div className="text-xs text-gray-500">
            No file selected. If you submit without a file, the server will generate a fallback URL.
          </div>
        )}
      </div>

      {/* BASICS */}
      <Input placeholder="Article ID" value={form.article_id || ""} onChange={handleChange("article_id")} />
      <Input placeholder="DOI" value={form.doi || ""} onChange={handleChange("doi")} />
      <Input placeholder="Title" value={form.article_title || ""} onChange={handleChange("article_title")} />
      <Input placeholder="Authors (comma separated)" value={form.authors || ""} onChange={handleChange("authors")} />
      <Textarea value={form.abstract || ""} onChange={handleChange("abstract")} placeholder="Abstract" />
      <Input placeholder="Keywords (comma separated)" value={form.keywords || ""} onChange={handleChange("keywords")} />

      <div className="grid grid-cols-2 gap-4">
        <Input type="number" placeholder="Page From" value={form.page_from || ""} onChange={handleChange("page_from")} />
        <Input type="number" placeholder="Page To" value={form.page_to || ""} onChange={handleChange("page_to")} />
      </div>

      {/* REFERENCES (CKEditor -> HTML string) */}
      <div className="space-y-1">
        <label className="block text-sm font-medium">References</label>
        <CKEditorField
          value={form.references || ""}
          onChange={(html) => setForm?.({ references: html })}
          placeholder="Enter references here…"
        />
      </div>

      {/* DATES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Input type="date" value={form.received || ""} onChange={handleChange("received")} />
        <Input type="date" value={form.revised || ""} onChange={handleChange("revised")} />
        <Input type="date" value={form.accepted || ""} onChange={handleChange("accepted")} />
        <Input type="date" value={form.published || ""} onChange={handleChange("published")} />
      </div>

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </div>
  );
}

