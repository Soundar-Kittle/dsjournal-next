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

// "use client";

// import { useCallback } from "react";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import CKEditorField from "./CKEditorField";

// export default function ArticleForm({
//   form = {},
//   setForm,
//   onSubmit,                 // parent should submit with FormData (includes references)
//   submitting = false,
//   submitLabel = "Submit",
//   journals = [],
//   volumesMeta = [],
//   issuesMeta = [],
//   months = [],
//   disabledJournal = false,
//   onFileSelect,            // (file: File | null) => void
//   selectedFile,            // File | null
// }) {
//   const handleChange = useCallback(
//     (key) => (e) => {
//       const value = e.target.value;
//       setForm?.({ [key]: value });
//     },
//     [setForm]
//   );

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     onFileSelect?.(file);
//   };

//   return (
//     <div className="space-y-4">
//       {/* ARTICLE STATUS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-1">
//           <label className="block text-sm font-medium">Article Status</label>
//           <select
//             value={String(form.article_status || "unpublished")}
//             onChange={(e) => setForm?.({ article_status: e.target.value })}
//             disabled={submitting}
//             className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//           >
//             <option value="unpublished">Unpublished</option>
//             <option value="published">Published</option>
//           </select>
//         </div>
//       </div>

//       {/* JOURNAL / VOLUME / ISSUE / MONTHS */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* JOURNAL */}
//         <select
//           value={String(form.journal_id || "")}
//           onChange={handleChange("journal_id")}
//           disabled={disabledJournal}
//           className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//         >
//           <option value="">Select Journal</option>
//           {journals.map((j) => (
//             <option key={j.id} value={String(j.id)}>
//               {j.journal_name}
//             </option>
//           ))}
//         </select>

//         {/* VOLUME */}
//         <select
//           value={String(form.volume_id || "")}
//           onChange={handleChange("volume_id")}
//           className="border rounded-md p-2 w-full focus:outline-none focus:ring"
//         >
//           <option value="">Select Volume</option>
//           {volumesMeta.map((v) => (
//             <option key={v.id} value={String(v.id)}>
//               {v.volume_number ?? v.volume_label ?? v.id}
//             </option>
//           ))}
//         </select>

//         {/* ISSUE */}
//         <select
//           value={String(form.issue_id || "")}
//           onChange={handleChange("issue_id")}
//           disabled={!form.volume_id}
//           className="border rounded-md p-2 w-full"
//         >
//           <option value="">Select Issue</option>
//           {issuesMeta.map((i) => (
//             <option key={i.id} value={String(i.id)}>
//               {i.issue_number ?? i.issue_label ?? i.id}
//             </option>
//           ))}
//         </select>

//         {/* MONTH FROM (display only) */}
//         <select
//           value={String(form.month_from || "")}
//           disabled
//           className="border rounded-md p-2 w-full bg-gray-100 cursor-not-allowed"
//         >
//           <option value={String(form.month_from || "")}>
//             {form.month_from || "From Month"}
//           </option>
//         </select>

//         {/* MONTH TO (display only) */}
//         <select
//           value={String(form.month_to || "")}
//           disabled
//           className="border rounded-md p-2 w-full bg-gray-100 cursor-not-allowed"
//         >
//           <option value={String(form.month_to || "")}>
//             {form.month_to || "To Month"}
//           </option>
//         </select>
//       </div>

//       {/* PDF upload */}
//       <div className="space-y-2">
//         <label className="block text-sm font-medium">Article PDF</label>
//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={handleFileChange}
//           disabled={submitting}
//           className="block w-full border rounded-md p-2"
//         />

//         {selectedFile ? (
//           <div className="text-sm">
//             Selected: <strong>{selectedFile.name}</strong>{" "}
//             <button
//               type="button"
//               onClick={() => onFileSelect?.(null)}
//               className="text-blue-600 underline ml-2"
//               disabled={submitting}
//             >
//               remove
//             </button>
//           </div>
//         ) : form.pdf_path ? (
//           <div className="text-sm">
//             Current file:{" "}
//             <a href={form.pdf_path} target="_blank" rel="noreferrer" className="text-blue-600 underline">
//               open
//             </a>
//           </div>
//         ) : (
//           <div className="text-xs text-gray-500">
//             No file selected. If you submit without a file, the server will generate a fallback URL.
//           </div>
//         )}
//       </div>

//       {/* BASICS */}
//       <Input placeholder="Article ID" value={form.article_id || ""} onChange={handleChange("article_id")} />
//       <Input placeholder="DOI" value={form.doi || ""} onChange={handleChange("doi")} />
//       <Input placeholder="Title" value={form.article_title || ""} onChange={handleChange("article_title")} />
//       <Input placeholder="Authors (comma separated)" value={form.authors || ""} onChange={handleChange("authors")} />
//       <Textarea value={form.abstract || ""} onChange={handleChange("abstract")} placeholder="Abstract" />
//       <Input placeholder="Keywords (comma separated)" value={form.keywords || ""} onChange={handleChange("keywords")} />

//       <div className="grid grid-cols-2 gap-4">
//         <Input type="number" placeholder="Page From" value={form.page_from || ""} onChange={handleChange("page_from")} />
//         <Input type="number" placeholder="Page To" value={form.page_to || ""} onChange={handleChange("page_to")} />
//       </div>

//       {/* REFERENCES (CKEditor -> HTML string) */}
//       <div className="space-y-1">
//         <label className="block text-sm font-medium">References</label>
//         <CKEditorField
//           value={form.references || ""}
//           onChange={(html) => setForm?.({ references: html })}
//           placeholder="Enter references here…"
//         />
//       </div>

//       {/* DATES */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <Input type="date" value={form.received || ""} onChange={handleChange("received")} />
//         <Input type="date" value={form.revised || ""} onChange={handleChange("revised")} />
//         <Input type="date" value={form.accepted || ""} onChange={handleChange("accepted")} />
//         <Input type="date" value={form.published || ""} onChange={handleChange("published")} />
//       </div>

//       <div className="flex justify-end">
//         <Button onClick={onSubmit} disabled={submitting}>
//           {submitting ? "Saving..." : submitLabel}
//         </Button>
//       </div>
//     </div>
//   );
// }


// "use client";

// import { useCallback, useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
// // NOTE: removed Textarea import because we use CKEditor for abstract now
// import { Button } from "@/components/ui/button";
// import CKEditorField from "./CKEditorField";

// export default function ArticleForm({
//   form = {},
//   setForm,
//   onSubmit,
//   submitting = false,
//   submitLabel = "Submit",
//   journals = [],
//   volumesMeta = [],
//   issuesMeta = [],
//   disabledJournal = false,
//   onFileSelect,
//   selectedFile,
// }) {
//   const [step, setStep] = useState(0);

//   const handleChange = useCallback(
//     (key) => (e) => {
//       const value = e?.target?.value ?? e; // supports both input events and direct values
//       setForm?.({ [key]: value });
//     },
//     [setForm]
//   );

//   const handleFileChange = (e) => {
//     const file = e.target.files?.[0] || null;
//     onFileSelect?.(file);
//   };

//   // ---- helpers to judge "filled", incl. HTML fields from CKEditor
//   const stripHtml = (html) =>
//     (html || "")
//       .replace(/<[^>]*>/g, "")
//       .replace(/&nbsp;/g, " ")
//       .trim();

//   const isFilled = (val) => {
//     if (val === null || val === undefined) return false;
//     if (typeof val === "string") {
//       // treat CKEditor HTML as filled only if text content remains after stripping tags
//       return stripHtml(val).length > 0;
//     }
//     return String(val).trim() !== "";
//   };

//   // ---- REQUIRED FIELDS (per your spec)
//   // Step 1: article status, volume, issue, basic id + journal
//   // Step 2: abstract (editor), title, keyword, doi (file optional)
//   // Step 3: references
//   const requiredFields = {
//     0: ["article_status", "journal_id", "volume_id", "issue_id", "article_id"],
//     1: ["doi", "article_title", "authors", "abstract", "keywords"],
//     2: ["references"],
//   };

//   const fieldLabels = {
//     article_status: "Article Status",
//     journal_id: "Journal",
//     volume_id: "Volume",
//     issue_id: "Issue",
//     article_id: "Article ID",
//     doi: "DOI",
//     article_title: "Title",
//     authors: "Authors",
//     abstract: "Abstract",
//     keywords: "Keywords",
//     references: "References",
//   };

//   const isStepCompleted = (idx) => {
//     const fields = requiredFields[idx] || [];
//     return fields.every((f) => isFilled(form[f]));
//   };

//   const missingInStep = (idx) => {
//     const fields = requiredFields[idx] || [];
//     return fields.filter((f) => !isFilled(form[f]));
//   };

//   const stepLabels = ["Basic Info", "Abstract & Upload", "References"];

//   // compute invalid fields for current step (for red borders)
//   const invalidSet = useMemo(() => new Set(missingInStep(step)), [step, form]);

//   // ---- Steps
//   const steps = [
// {
//   title: "Basic Information",
//   content: (
//     <div className="space-y-6">
//       {/* Article Status + Journal + Volume + Issue + Article ID */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* Article Status */}
//         <div>
//           <label className="block text-sm font-medium">
//             Article Status <span className="text-red-500">*</span>
//           </label>
//           <select
//             value={String(form.article_status || "")}
//             onChange={(e) => setForm?.({ article_status: e.target.value })}
//             disabled={submitting}
//             className={`border rounded-md p-2 w-full ${
//               invalidSet.has("article_status") ? "border-red-500" : ""
//             }`}
//           >
//             <option value="">Select Status</option>
//             <option value="unpublished">Unpublished</option>
//             <option value="published">Published</option>
//           </select>
//         </div>

//         {/* Journal */}
//         <div>
//           <label className="block text-sm font-medium">
//             Journal <span className="text-red-500">*</span>
//           </label>
// <select
//   value={String(form.journal_id || "")}
//   onChange={handleChange("journal_id")}
//   disabled // ✅ always disabled
//   className="border rounded-md p-2 w-full bg-gray-100 cursor-not-allowed"
// >
//   <option value="">Select Journal</option>
//   {journals.map((j) => (
//     <option key={j.id} value={String(j.id)}>
//       {j.journal_name}
//     </option>
//   ))}
// </select>

//         </div>

//         {/* Volume */}
//         <div>
//           <label className="block text-sm font-medium">
//             Volume <span className="text-red-500">*</span>
//           </label>
//           <select
//             value={String(form.volume_id || "")}
//             onChange={handleChange("volume_id")}
//             className={`border rounded-md p-2 w-full ${
//               invalidSet.has("volume_id") ? "border-red-500" : ""
//             }`}
//           >
//             <option value="">Select Volume</option>
//             {volumesMeta.map((v) => (
//               <option key={v.id} value={String(v.id)}>
//                 {v.volume_number ?? v.volume_label ?? v.id}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Issue */}
//         <div>
//           <label className="block text-sm font-medium">
//             Issue <span className="text-red-500">*</span>
//           </label>
//           <select
//             value={String(form.issue_id || "")}
//             onChange={handleChange("issue_id")}
//             disabled={!form.volume_id}
//             className={`border rounded-md p-2 w-full ${
//               invalidSet.has("issue_id") ? "border-red-500" : ""
//             }`}
//           >
//             <option value="">Select Issue</option>
//             {issuesMeta.map((i) => (
//               <option key={i.id} value={String(i.id)}>
//                 {i.issue_number ?? i.issue_label ?? i.id}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Article ID */}
//         <div className="md:col-span-2">
//           <label className="block text-sm font-medium">
//             Article ID <span className="text-red-500">*</span>
//           </label>
//           <Input
//             placeholder="Article ID"
//             value={form.article_id || ""}
//             onChange={handleChange("article_id")}
//             className={invalidSet.has("article_id") ? "border-red-500" : ""}
//           />
//         </div>
//       </div>

//       {/* Page From / Page To */}
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium">Page From</label>
//           <Input
//             type="number"
//             placeholder="Page From"
//             value={form.page_from || ""}
//             onChange={handleChange("page_from")}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Page To</label>
//           <Input
//             type="number"
//             placeholder="Page To"
//             value={form.page_to || ""}
//             onChange={handleChange("page_to")}
//           />
//         </div>
//       </div>

//       {/* Dates */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         <div>
//           <label className="block text-sm font-medium">Received</label>
//           <Input
//             type="date"
//             value={form.received || ""}
//             onChange={handleChange("received")}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Revised</label>
//           <Input
//             type="date"
//             value={form.revised || ""}
//             onChange={handleChange("revised")}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Accepted</label>
//           <Input
//             type="date"
//             value={form.accepted || ""}
//             onChange={handleChange("accepted")}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">Published</label>
//           <Input
//             type="date"
//             value={form.published || ""}
//             onChange={handleChange("published")}
//           />
//         </div>
//       </div>
//     </div>
//   ),
// },
//     {
//       title: "Abstract, Title, Keywords & Upload",
//       content: (
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium">
//               DOI <span className="text-red-500">*</span>
//             </label>
//             <Input
//               placeholder="DOI"
//               value={form.doi || ""}
//               onChange={handleChange("doi")}
//               className={invalidSet.has("doi") ? "border-red-500" : ""}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">
//               Title <span className="text-red-500">*</span>
//             </label>
//             <Input
//               placeholder="Title"
//               value={form.article_title || ""}
//               onChange={handleChange("article_title")}
//               className={invalidSet.has("article_title") ? "border-red-500" : ""}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium">
//               Authors (comma separated) <span className="text-red-500">*</span>
//             </label>
//             <Input
//               placeholder="Authors"
//               value={form.authors || ""}
//               onChange={handleChange("authors")}
//               className={invalidSet.has("authors") ? "border-red-500" : ""}
//             />
//           </div>

//           {/* ✅ Abstract with CKEditor */}
//           <div>
//             <label className="block text-sm font-medium">
//               Abstract <span className="text-red-500">*</span>
//             </label>
//             <div className={invalidSet.has("abstract") ? "ring-1 ring-red-500 rounded" : ""}>
//               <CKEditorField
//                 value={form.abstract || ""}
//                 onChange={(html) => setForm?.({ abstract: html })}
//                 placeholder="Enter abstract…"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium">
//               Keywords (comma separated) <span className="text-red-500">*</span>
//             </label>
//             <Input
//               placeholder="Keywords"
//               value={form.keywords || ""}
//               onChange={handleChange("keywords")}
//               className={invalidSet.has("keywords") ? "border-red-500" : ""}
//             />
//           </div>

//           {/* PDF Upload (optional) */}
//           <div>
//             <label className="block text-sm font-medium">Article PDF (optional)</label>
//             <input
//               type="file"
//               accept="application/pdf"
//               onChange={handleFileChange}
//               disabled={submitting}
//               className="block w-full border rounded-md p-2"
//             />
//             {selectedFile ? (
//               <div className="text-sm">
//                 Selected: <strong>{selectedFile.name}</strong>{" "}
//                 <button
//                   type="button"
//                   onClick={() => onFileSelect?.(null)}
//                   className="text-blue-600 underline ml-2"
//                   disabled={submitting}
//                 >
//                   remove
//                 </button>
//               </div>
//             ) : form.pdf_path ? (
//               <div className="text-sm">
//                 Current file:{" "}
//                 <a href={form.pdf_path} target="_blank" rel="noreferrer" className="text-blue-600 underline">
//                   open
//                 </a>
//               </div>
//             ) : (
//               <div className="text-xs text-gray-500">No file selected yet.</div>
//             )}
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "References",
//       content: (
//         <div>
//           <label className="block text-sm font-medium">
//             References <span className="text-red-500">*</span>
//           </label>
//           <div className={invalidSet.has("references") ? "ring-1 ring-red-500 rounded" : ""}>
//             <CKEditorField
//               value={form.references || ""}
//               onChange={(html) => setForm?.({ references: html })}
//               placeholder="Enter references here…"
//             />
//           </div>
//         </div>
//       ),
//     },
//   ];

//   const canGoNext = isStepCompleted(step);

//   const handleNext = () => {
//     if (!canGoNext) return;
//     setStep((s) => Math.min(s + 1, steps.length - 1));
//   };

//   const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

//   return (
//     <div className="space-y-6">
//       {/* Stepper */}
// <div className="flex items-center justify-between mb-4">
//   {stepLabels.map((label, idx) => {
//     const isActive = idx === step;
//     const completed = isStepCompleted(idx);
//     const hasMissing = !completed; // mark incomplete with !

//     return (
//       <div key={idx} className="flex-1 flex items-center">
//         <div
//           className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
//             isActive
//               ? "bg-blue-600 text-white border-blue-600"
//               : completed
//               ? "bg-green-500 text-white border-green-500"
//               : "border-red-400 text-red-500"
//           }`}
//           title={
//             completed
//               ? "Completed"
//               : isActive
//               ? "In progress"
//               : "Incomplete"
//           }
//         >
//           {completed ? "✓" : hasMissing ? "!" : idx + 1}
//         </div>
//         <div className="ml-2 text-sm font-medium">{label}</div>
//         {idx < stepLabels.length - 1 && (
//           <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
//         )}
//       </div>
//     );
//   })}
// </div>


//       {/* If missing in current step, show a small helper */}
//       {!canGoNext && missingInStep(step).length > 0 && (
//         <div className="text-xs text-red-600">
//           Please complete: {missingInStep(step).map((f) => fieldLabels[f] || f).join(", ")}
//         </div>
//       )}

//       {/* Current Step */}
//       <h2 className="text-lg font-semibold">{steps[step].title}</h2>
//       <div>{steps[step].content}</div>

//       {/* Navigation */}
//       <div className="flex justify-between pt-4">
//         <Button variant="outline" disabled={step === 0} onClick={handlePrev}>
//           Previous
//         </Button>
//         {step < steps.length - 1 ? (
//           <Button onClick={handleNext} disabled={!canGoNext}>
//             Next
//           </Button>
//         ) : (
//           <Button onClick={onSubmit} disabled={submitting || !isStepCompleted(step)}>
//             {submitting ? "Saving..." : submitLabel}
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }

// ArticleForm.jsx
"use client";

import { useState, useEffect, useMemo, useRef} from "react";
import {
  useForm,
  useFormContext,
  FormProvider,
  Controller,
  useWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CKEditorField from "./CKEditorField";

export default function ArticleForm({
  // data sources
  journals = [],
  volumesMeta = [],
  issuesMeta: externalIssues = [],
  months = [], // optional: [{id: 'Jan', label:'Jan'}, ...] — if available
  fetchIssuesByVolume, // async (volumeId) => issues[]

  // file
  onFileSelect,
  selectedFile,

  // ux
  submitting = false,
  submitLabel = "Submit",
  disabledJournal = false,

  // submission
  onSubmit: onSubmitProp,

  // defaults
  defaultJournalId,
  defaultArticleStatus = "unpublished",
}) {
  // ---- RHF setup (Option B: use context if available, else self-wrap) ----
// Initialize once (and persist values through rerenders)
// Initialize once (and persist values through rerenders)
const ctx = useFormContext();
const localForm = useForm({
  defaultValues: useRef({
    article_status: defaultArticleStatus,
    journal_id: defaultJournalId ?? "",
    volume_id: "",
    issue_id: "",
    article_id: "",
    page_from: "",
    page_to: "",
    received: "",
    revised: "",
    accepted: "",
    published: "",
    month_from: "",
    month_to: "",
    doi: "",
    article_title: "",
    authors: "",
    abstract: "",
    keywords: "",
    references: "",
  }).current, // ✅ useRef ensures stable defaults across renders
  shouldUnregister: false,
  mode: "onChange",
});

const methods = ctx ?? localForm;


  const {
    register,
    control,
    setValue,
    trigger,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = methods;

  const [step, setStep] = useState(0);
  const [issuesMeta, setIssuesMeta] = useState(externalIssues || []);

  // ---- Watches (RHF is the source of truth) ----
  // Step 0
  const article_status = useWatch({ control, name: "article_status" }) ?? "";
  const journal_id = useWatch({ control, name: "journal_id" }) ?? "";
  const volume_id = useWatch({ control, name: "volume_id" }) ?? "";
  const issue_id = useWatch({ control, name: "issue_id" }) ?? "";
  const article_id = useWatch({ control, name: "article_id" }) ?? "";
  const page_from = useWatch({ control, name: "page_from" }) ?? "";
  const page_to = useWatch({ control, name: "page_to" }) ?? "";
  const received = useWatch({ control, name: "received" }) ?? "";
  const revised = useWatch({ control, name: "revised" }) ?? "";
  const accepted = useWatch({ control, name: "accepted" }) ?? "";
  const published = useWatch({ control, name: "published" }) ?? "";
  const month_from = useWatch({ control, name: "month_from" }) ?? "";
  const month_to = useWatch({ control, name: "month_to" }) ?? "";

  // Step 1
  const doi = useWatch({ control, name: "doi" }) ?? "";
  const article_title = useWatch({ control, name: "article_title" }) ?? "";
  const authors = useWatch({ control, name: "authors" }) ?? "";
  const keywords = useWatch({ control, name: "keywords" }) ?? "";

  // Step 2
  const references = useWatch({ control, name: "references" }) ?? "";

  // ✅ Default journal pre-select (robust when journals load async)
  // useEffect(() => {
  //   if (journals.length > 0 && defaultJournalId) {
  //     const current = getValues("journal_id");
  //     if (!current || current === "") {
  //       setValue("journal_id", String(defaultJournalId), {
  //         shouldDirty: false,
  //         shouldValidate: false,
  //       });
  //     }
  //   }
  // }, [journals, defaultJournalId, getValues, setValue]);
  useEffect(() => {
  if (defaultJournalId) {
    setValue("journal_id", String(defaultJournalId));
  }
  if (volumesMeta.length === 1) {
    setValue("volume_id", String(volumesMeta[0].id));
  }
}, [defaultJournalId, volumesMeta, setValue]);

  // ✅ Auto-load issues list when volume changes
  useEffect(() => {
    const loadIssues = async () => {
      if (!volume_id || !fetchIssuesByVolume) {
        setIssuesMeta([]);
        setValue("issue_id", "");
        return;
      }
      try {
        // clear current issue to avoid stale UI
        setValue("issue_id", "", { shouldDirty: true, shouldValidate: true });
        const issues = await fetchIssuesByVolume(volume_id);
        setIssuesMeta(Array.isArray(issues) ? issues : []);
      } catch (err) {
        console.error("Failed to fetch issues:", err);
        setIssuesMeta([]);
      }
    };
    loadIssues();
  }, [volume_id, fetchIssuesByVolume, setValue]);

  // ---- Helpers ----
  const stripHtml = (html) =>
    (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  const isFilled = (val) =>
    typeof val === "string" ? stripHtml(val).length > 0 : !!val;

  const requiredByStep = {
    0: ["article_status", "journal_id", "volume_id", "issue_id", "article_id"],
    1: ["doi", "article_title", "authors", "abstract", "keywords"],
    2: ["references"],
  };

  const allVals = methods.watch();
const isStepCompleted = (idx) => {
  const vals = getValues();
  return (requiredByStep[idx] || []).every((k) => isFilled(vals[k]));
};


  const canGoNext = isStepCompleted(step);

  // ---- Navigation ----
const handleNext = async () => {
  await trigger(requiredByStep[step] || []);
  const vals = getValues();

  if (!isStepCompleted(step)) {
    if (step === 0 && (!vals.journal_id || !vals.volume_id || !vals.issue_id)) {
      alert("Please select Journal, Volume, and Issue.");
      return;
    }
    if (step === 1 && (!vals.doi || !vals.article_title || !vals.authors)) {
      alert("Please complete all required fields in this step.");
      return;
    }
    if (step === 2 && !isFilled(vals.references)) {
      alert("Please add references before continuing.");
      return;
    }
  }

  setStep((s) => Math.min(s + 1, 2));
};
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  // ---- Select handlers (reset dependents) ----
  const onJournalChange = (e) => {
    const v = e.target.value ?? "";
    setValue("journal_id", String(v), { shouldDirty: true, shouldValidate: true });
    setValue("volume_id", "", { shouldDirty: true, shouldValidate: true });
    setValue("issue_id", "", { shouldDirty: true, shouldValidate: true });
    setValue("month_from", "", { shouldDirty: true, shouldValidate: false });
    setValue("month_to", "", { shouldDirty: true, shouldValidate: false });
  };
  const onVolumeChange = (e) => {
    const v = e.target.value ?? "";
    setValue("volume_id", String(v), { shouldDirty: true, shouldValidate: true });
    setValue("issue_id", "", { shouldDirty: true, shouldValidate: true });
    setValue("month_from", "", { shouldDirty: true, shouldValidate: false });
    setValue("month_to", "", { shouldDirty: true, shouldValidate: false });
  };


  // Step 0 — Basic Information
  const Step0 = (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Article Status */}
        <div>
          <label className="block text-sm font-medium">
            Article Status <span className="text-red-500">*</span>
          </label>
          <select
            {...register("article_status")}
            value={article_status}
            onChange={(e) =>
              setValue("article_status", e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={submitting || isSubmitting}
            className="border rounded-md p-2 w-full"
          >
            <option value="">Select Status</option>
            <option value="unpublished">Unpublished</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Journal */}
        <div>
          <label className="block text-sm font-medium">
            Journal <span className="text-red-500">*</span>
          </label>
          <select
            {...register("journal_id")}
            value={journal_id || ""}
            onChange={onJournalChange}
            disabled={disabledJournal}
            className={`border rounded-md p-2 w-full ${
              disabledJournal ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            <option value="">Select Journal</option>
            {journals.map((j) => (
              <option key={j.id} value={`${j.id}`}>
                {j.journal_name}
              </option>
            ))}
          </select>
        </div>

        {/* Volume */}
        <div>
          <label className="block text-sm font-medium">
            Volume <span className="text-red-500">*</span>
          </label>
          <select
            {...register("volume_id")}
            value={volume_id}
            onChange={onVolumeChange}
            className="border rounded-md p-2 w-full"
          >
            <option value="">Select Volume</option>
            {volumesMeta.map((v) => (
              <option key={v.id} value={`${v.id}`}>
                {v.volume_number ?? v.volume_label ?? v.id}
              </option>
            ))}
          </select>
        </div>

        {/* Issue */}
        <div>
          <label className="block text-sm font-medium">
            Issue <span className="text-red-500">*</span>
          </label>
          <select
            {...register("issue_id")}
            value={issue_id}
            onChange={(e) =>
              setValue("issue_id", e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={!volume_id}
            className="border rounded-md p-2 w-full"
          >
            <option value="">Select Issue</option>
            {issuesMeta.map((i) => (
              <option key={i.id} value={`${i.id}`}>
                {i.issue_number ?? i.issue_label ?? i.id}
              </option>
            ))}
          </select>
        </div>

        {/* Article ID */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">
            Article ID <span className="text-red-500">*</span>
          </label>
          <Input
            {...register("article_id")}
            value={article_id}
            onChange={(e) =>
              setValue("article_id", e.target.value, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            placeholder="Article ID"
            className="border rounded-md p-2 w-full"
          />
        </div>
      </div>

      {/* Pages */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Page From</label>
          <Input
            {...register("page_from")}
            value={page_from}
            onChange={(e) =>
              setValue("page_from", e.target.value, {
                shouldDirty: true,
                shouldValidate: false,
              })
            }
            type="number"
            placeholder="Page From"
            className="border rounded-md p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Page To</label>
          <Input
            {...register("page_to")}
            value={page_to}
            onChange={(e) =>
              setValue("page_to", e.target.value, {
                shouldDirty: true,
                shouldValidate: false,
              })
            }
            type="number"
            placeholder="Page To"
            className="border rounded-md p-2 w-full"
          />
        </div>
      </div>

      {/* Months (optional, only if months[] provided) */}
      {Array.isArray(months) && months.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Month From</label>
            <select
              {...register("month_from")}
              value={month_from}
              onChange={(e) =>
                setValue("month_from", e.target.value, {
                  shouldDirty: true,
                  shouldValidate: false,
                })
              }
              disabled={!issue_id}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select</option>
              {months.map((m) => (
                <option key={m.id} value={`${m.id}`}>
                  {m.label ?? m.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Month To</label>
            <select
              {...register("month_to")}
              value={month_to}
              onChange={(e) =>
                setValue("month_to", e.target.value, {
                  shouldDirty: true,
                  shouldValidate: false,
                })
              }
              disabled={!issue_id}
              className="border rounded-md p-2 w-full"
            >
              <option value="">Select</option>
              {months.map((m) => (
                <option key={m.id} value={`${m.id}`}>
                  {m.label ?? m.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { k: "received", v: received },
          { k: "revised", v: revised },
          { k: "accepted", v: accepted },
          { k: "published", v: published },
        ].map(({ k, v }) => (
          <div key={k}>
            <label className="block text-sm font-medium">
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </label>
            <Input
              {...register(k)}
              value={v}
              onChange={(e) =>
                setValue(k, e.target.value, {
                  shouldDirty: true,
                  shouldValidate: false,
                })
              }
              type="date"
              className="border rounded-md p-2 w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Step 1 — Abstract & Upload
  const Step1 = (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">
          DOI <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("doi")}
          value={doi}
          onChange={(e) =>
            setValue("doi", e.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="DOI"
          className="border rounded-md p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("article_title")}
          value={article_title}
          onChange={(e) =>
            setValue("article_title", e.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="Title"
          className="border rounded-md p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Authors (comma separated) <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("authors")}
          value={authors}
          onChange={(e) =>
            setValue("authors", e.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="Authors (comma separated)"
          className="border rounded-md p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Abstract <span className="text-red-500">*</span>
        </label>
<Controller
  name="abstract"
  control={control}
  render={({ field: { value, onChange } }) => (
    <CKEditorField
      value={value || ""}
      onChange={onChange}
      placeholder="Enter abstract…"
    />
  )}
/>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Keywords (comma separated) <span className="text-red-500">*</span>
        </label>
        <Input
          {...register("keywords")}
          value={keywords}
          onChange={(e) =>
            setValue("keywords", e.target.value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          placeholder="Keywords (comma separated)"
          className="border rounded-md p-2 w-full"
        />
      </div>

      {/* PDF Upload (optional) */}
      <div>
        <label className="block text-sm font-medium">Article PDF (optional)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            onFileSelect?.(file);
          }}
          disabled={submitting || isSubmitting}
          className="block w-full border rounded-md p-2"
        />
        {selectedFile ? (
          <div className="text-sm mt-1">
            Selected: <strong>{selectedFile.name}</strong>{" "}
            <button
              type="button"
              onClick={() => onFileSelect?.(null)}
              className="text-blue-600 underline ml-2"
              disabled={submitting || isSubmitting}
            >
              remove
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-1">No file selected yet.</div>
        )}
      </div>
    </div>
  );

  // Step 2 — References
  const Step2 = (
    <div>
      <label className="block text-sm font-medium">
        References <span className="text-red-500">*</span>
      </label>
<Controller
  name="references"
  control={control}
  render={({ field: { value, onChange } }) => (
    <CKEditorField
      value={value || ""}
      onChange={onChange}
      placeholder="Enter references here…"
    />
  )}
/>
    </div>
  );

  // ---- Body (Stepper + Steps + Nav) ----
  const stepLabels = ["Basic Info", "Abstract & Upload", "References"];

  const body = (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-4">
        {stepLabels.map((label, idx) => {
          const isActive = idx === step;
          const completed = isStepCompleted(idx);
          return (
            <div key={idx} className="flex-1 flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : completed
                    ? "bg-green-500 text-white border-green-500"
                    : "border-gray-300 text-gray-500"
                }`}
                title={completed ? "Completed" : isActive ? "In progress" : "Incomplete"}
              >
                {completed ? "✓" : idx + 1}
              </div>
              <div className="ml-2 text-sm font-medium">{label}</div>
              {idx < stepLabels.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
<div>
  <div style={{ display: step === 0 ? "block" : "none" }}>{Step0}</div>
  <div style={{ display: step === 1 ? "block" : "none" }}>{Step1}</div>
  <div style={{ display: step === 2 ? "block" : "none" }}>{Step2}</div>
</div>


      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" disabled={step === 0} onClick={handlePrev}>
          Previous
        </Button>
        {step < 2 ? (
          <Button onClick={handleNext} disabled={!canGoNext}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={submitting || isSubmitting}>
            {submitting || isSubmitting ? "Saving..." : submitLabel}
          </Button>
        )}
      </div>
    </div>
  );

  // If wrapped by an external FormProvider, render just the body.
  if (ctx) return body;

  // Otherwise, self-wrap so it works standalone.
  const localOnSubmit = onSubmitProp || ((data) => console.log("submit", data));
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(localOnSubmit)}>{body}</form>
    </FormProvider>
  );
}
