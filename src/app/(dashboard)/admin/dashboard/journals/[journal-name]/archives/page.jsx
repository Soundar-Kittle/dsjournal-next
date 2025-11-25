// "use client";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useMemo, useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getFilteredRowModel,
//   flexRender,
// } from "@tanstack/react-table";
// import { Dialog } from "@headlessui/react";

// function safeParseArray(input) {
//   try {
//     const parsed = typeof input === "string" ? JSON.parse(input) : input;
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// export default function Page() {
//   const searchParams = useSearchParams();
//   const jid = searchParams.get("jid");
//   const router = useRouter();

//   const [filters, setFilters] = useState({
//     title: "",
//     author: "",
//     volume: "",
//     issue: "",
//     year: "",
//     journal_id: "",
//     article_id: "",
//   });

//   const [viewArticle, setViewArticle] = useState(null);
//   const [journals, setJournals] = useState([]);
//   const [volumesMeta, setVolumesMeta] = useState([]);
//   const [issuesMeta, setIssuesMeta] = useState([]);

//   // =====================
//   // ARTICLES
//   // =====================
//   const { data: articles = [] } = useQuery({
//     queryKey: ["articles", jid],
//     queryFn: async () => {
//       const res = await fetch(`/api/articles?journal_id=${jid}`);
//       const data = await res.json();
//       if (!data.success || !Array.isArray(data.articles)) return [];
//       return data.articles.map((a) => ({
//         ...a,
//         id: a.id,
//         article_id: a.article_id,
//         title: a.article_title || "",
//         authors: safeParseArray(a.authors),
//         key_words: safeParseArray(a.keywords),
//         volume: a.volume_id ? String(a.volume_id) : "",
//         issue: a.issue_id ? String(a.issue_id) : "",
//         year: a.year ? String(a.year) : "",
//         article_file_path: a.pdf_path || "",
//         received_date: a.received || "",
//         revised_date: a.revised || "",
//         accepted_date: a.accepted || "",
//         published_date: a.published || "",
//       }));
//     },
//     enabled: !!jid,
//   });

//   const years = [...new Set(articles.map((a) => a.year).filter(Boolean))];

//   // =====================
//   // VOLUMES & ISSUES
//   // =====================
//   useEffect(() => {
//     const fetchMetaData = async () => {
//       if (!jid) return;
//       const [volumesRes, issuesRes] = await Promise.all([
//         fetch(`/api/volume?journal_id=${jid}`),
//         fetch(`/api/issues?journal_id=${jid}`),
//       ]);
//       const [volumesData, issuesData] = await Promise.all([
//         volumesRes.json(),
//         issuesRes.json(),
//       ]);
//       if (volumesData.success) setVolumesMeta(volumesData.volumes || []);
//       if (issuesData.success) setIssuesMeta(issuesData.issues || []);
//     };
//     fetchMetaData();
//   }, [jid]);

//   // Combine Volume + Issue label
//   const volumeIssueList = useMemo(() => {
//     return issuesMeta.map((issue) => {
//       const vol = volumesMeta.find((v) => v.id === issue.volume_id);
//       return {
//         id: issue.id, // unique issue id
//         volume_id: issue.volume_id,
//         issue_number: issue.issue_number,
//         label: `Volume ${vol?.volume_number ?? "?"} – Issue ${
//           issue.issue_number
//         }`,
//       };
//     });
//   }, [issuesMeta, volumesMeta]);

//   // =====================
//   // JOURNALS
//   // =====================
//   useEffect(() => {
//     const fetchJournals = async () => {
//       if (!jid) return;
//       const res = await fetch(`/api/journals?id=${jid}`);
//       const data = await res.json();
//       if (data.success) setJournals(data.journals || []);
//     };
//     fetchJournals();
//   }, [jid]);

//   const getJournalName = (id) => {
//     const journal = journals.find((j) => j.id === Number(id));
//     return journal?.journal_name || "Journal Name";
//   };

//   // =====================
//   // HELPER MAPPERS
//   // =====================
//   const getVolumeName = (id) => {
//     const v = volumesMeta.find((vv) => vv.id === Number(id));
//     return v?.volume_number ?? id;
//   };
//   const getIssueName = (id) => {
//     const i = issuesMeta.find((ii) => ii.id === Number(id));
//     return i?.issue_number ?? id;
//   };

//   // =====================
//   // FILTERING
//   // =====================
// const filteredArticles = useMemo(() => {
//   return articles.filter((a) => {
//     return (
//       a.title.toLowerCase().includes(filters.title.toLowerCase()) &&
//       a.authors.join(", ").toLowerCase().includes(filters.author.toLowerCase()) &&
//       (filters.volume ? String(a.volume_id) === String(filters.volume) : true) &&
//       (filters.issue ? String(a.issue_id) === String(filters.issue) : true) &&
//       (filters.year ? a.year === filters.year : true) &&
//       (filters.article_id
//         ? String(a.article_id).toLowerCase().includes(filters.article_id.toLowerCase())
//         : true)
//     );
//   });
// }, [articles, filters]);

//   // =====================
//   // TABLE COLUMNS
//   // =====================
//   const columns = useMemo(
//     () => [
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
//         cell: (info) => info.getValue().join(", "),
//       },
//       {
//         header: "Keywords",
//         accessorKey: "key_words",
//         cell: (info) => info.getValue().join(", "),
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
//         cell: ({ row }) => (
//           <div className="space-x-2">
//             <button
//               onClick={() => setViewArticle(row.original)}
//               className="text-blue-600"
//             >
//               View
//             </button>

//             <button
//               onClick={() => {
//                 const { id, article_id, journal_id } = row.original;
//                 const journalCode =
//                   String(article_id || "").split("-")[0] || "journal";
//                 const qs = id
//                   ? `id=${encodeURIComponent(id)}`
//                   : `article_id=${encodeURIComponent(article_id)}`;
//                 setViewArticle(null);
//                 router.push(
//                   `/admin/dashboard/journals/${journalCode}/article?jid=${encodeURIComponent(
//                     journal_id
//                   )}&edit=1&${qs}`
//                 );
//               }}
//               className="text-green-600"
//             >
//               Edit
//             </button>

//             <button
//               onClick={() => handleDelete(row.original.id)}
//               className="text-red-600"
//             >
//               Delete
//             </button>
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   const table = useReactTable({
//     data: filteredArticles,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//   });

//   // =====================
//   // DELETE HANDLER
//   // =====================
//   const handleDelete = async (id) => {
//     const confirmed = window.confirm("Are you sure you want to delete this article?");
//     if (!confirmed) return;
//     try {
//       const res = await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
//       table.options.data = table.options.data.filter((a) => a.id !== id);
//       alert("Article deleted successfully.");
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert(err.message || "Something went wrong.");
//     }
//   };

//   // =====================
//   // RENDER
//   // =====================
//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">
//         {getJournalName(jid)}
//       </h2>

//       {/* Filters */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
//         <input
//           placeholder="Search Title"
//           value={filters.title}
//           onChange={(e) => setFilters({ ...filters, title: e.target.value })}
//           className="border p-2"
//         />
//         <input
//           placeholder="Search Author"
//           value={filters.author}
//           onChange={(e) => setFilters({ ...filters, author: e.target.value })}
//           className="border p-2"
//         />
//         <input
//           placeholder="Search Article ID"
//           value={filters.article_id}
//           onChange={(e) => setFilters({ ...filters, article_id: e.target.value })}
//           className="border p-2"
//         />

// <div className="flex flex-col">
//   <label className="text-xs text-gray-600 mb-1 font-medium">Volume & Issue</label>
// <select
//   value={
//     filters.volume && filters.issue
//       ? `${filters.volume}|${filters.issue}`
//       : ""
//   }
//   onChange={(e) => {
//     const val = e.target.value;
//     if (!val) {
//       setFilters({ ...filters, volume: "", issue: "" });
//     } else {
//       const [volume_id, issue_id] = val.split("|");
//       setFilters({
//         ...filters,
//         volume: volume_id,
//         issue: issue_id,
//       });
//     }
//   }}
//   className="border p-2"
// >
//   <option value="">All Volume & Issue</option>
//   {issuesMeta.map((i) => {
//     const vol = volumesMeta.find((v) => v.id === i.volume_id);
//     return (
//       <option key={i.id} value={`${i.volume_id}|${i.id}`}>
//         Volume {vol?.volume_number ?? "-"} – Issue {i.issue_number}
//       </option>
//     );
//   })}
// </select>

// </div>

//         {/* Year Dropdown */}
//         <div className="flex flex-col">
//            <label className="text-xs text-gray-600 mb-1 font-medium">Year</label>
//         <select
//           value={filters.year}
//           onChange={(e) => setFilters({ ...filters, year: e.target.value })}
//           className="border p-2"
//         >
//           <option value="">All Years</option>
//           {years.map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </select>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border text-sm">
//           <thead className="bg-gray-100">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <tr key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <th key={header.id} className="p-2 text-left">
//                     {flexRender(header.column.columnDef.header, header.getContext())}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.map((row) => (
//               <tr key={row.id} className="border-b">
//                 {row.getVisibleCells().map((cell) => (
//                   <td key={cell.id} className="p-2">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Modal */}
//       <Dialog
//         open={!!viewArticle}
//         onClose={() => setViewArticle(null)}
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
//       >
//         <div className="bg-white p-4 sm:p-8 max-w-4xl w-full rounded shadow-lg overflow-y-auto max-h-[90vh] text-sm sm:text-base">
//           {viewArticle && (
//             <>
//               <div className="mb-2 text-xs text-gray-500">
//                 <span className="uppercase">Research Article</span> |{" "}
//                 <span className="text-green-700 font-medium">Open Access</span>
//                 {viewArticle.article_file_path && (
//                   <>
//                     {" "}
//                     ·{" "}
//                     <a
//                       href={viewArticle.article_file_path.replace(/ /g, "-")}
//                       download
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       Download Full Text
//                     </a>
//                   </>
//                 )}
//               </div>

//               <h2 className="text-xl sm:text-2xl font-bold leading-snug mb-2 text-gray-900">
//                 {viewArticle.title}
//               </h2>
//               <div className="text-gray-800 font-medium mb-3 text-sm sm:text-base">
//                 {viewArticle.authors.join(", ")}
//               </div>

//               {/* ✅ Show numbers (not IDs) */}
//               <div className="text-xs text-gray-600 mb-4">
//                 <strong>Volume</strong> {getVolumeName(viewArticle.volume)} |{" "}
//                 <strong>Issue</strong> {getIssueName(viewArticle.issue)} |{" "}
//                 <strong>Year</strong> {viewArticle.year} | <strong>Article ID:</strong>{" "}
//                 {viewArticle.article_id}
//                 {viewArticle.doi ? (
//                   <>
//                     {" "}
//                     | <strong>DOI:</strong>{" "}
//                     <a
//                       href={`https://doi.org/${viewArticle.doi}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       https://doi.org/{viewArticle.doi}
//                     </a>
//                   </>
//                 ) : null}
//               </div>

//               <div className="mb-4">
//                 <h4 className="font-semibold mb-1 text-gray-800">Abstract</h4>
//                 <div
//                   className="text-gray-700 leading-relaxed text-sm sm:text-base"
//                   dangerouslySetInnerHTML={{ __html: viewArticle.abstract }}
//                 />
//               </div>

//               <div className="mb-4">
//                 <h4 className="font-semibold mb-1 text-gray-800">Keywords</h4>
//                 <p className="text-gray-700 text-sm sm:text-base">
//                   {viewArticle.key_words.join(", ")}
//                 </p>
//               </div>

//               {viewArticle.references && (
//                 <div className="mb-4">
//                   <h4 className="font-semibold mb-1 text-gray-800">References</h4>
//                   <div
//                     className="space-y-1 text-gray-700 text-xs sm:text-sm"
//                     dangerouslySetInnerHTML={{ __html: viewArticle.references }}
//                   />
//                 </div>
//               )}

//               <div className="text-right mt-5">
//                 <button
//                   onClick={() => setViewArticle(null)}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
//                 >
//                   Close
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </Dialog>
//     </div>
//   );
// }

// "use client";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useMemo, useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   useReactTable,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   flexRender,
// } from "@tanstack/react-table";
// import { Dialog } from "@headlessui/react";

// function safeParseArray(input) {
//   try {
//     const parsed = typeof input === "string" ? JSON.parse(input) : input;
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// export default function Page() {
//   const searchParams = useSearchParams();
//   const jid = searchParams.get("jid");
//   const router = useRouter();

//   const [filters, setFilters] = useState({
//     title: "",
//     author: "",
//     volume: "",
//     issue: "",
//     year: "",
//     journal_id: "",
//     article_id: "",
//   });

//   const [viewArticle, setViewArticle] = useState(null);
//   const [journals, setJournals] = useState([]);
//   const [volumesMeta, setVolumesMeta] = useState([]);
//   const [issuesMeta, setIssuesMeta] = useState([]);

//   // =====================
//   // ARTICLES
//   // =====================
//   const { data: articles = [] } = useQuery({
//     queryKey: ["articles", jid],
//     queryFn: async () => {
//       const res = await fetch(`/api/articles?journal_id=${jid}`);
//       const data = await res.json();
//       if (!data.success || !Array.isArray(data.articles)) return [];
//       return data.articles.map((a) => ({
//         ...a,
//         id: a.id,
//         article_id: a.article_id,
//         title: a.article_title || "",
//         authors: safeParseArray(a.authors),
//         key_words: safeParseArray(a.keywords),
//         volume: a.volume_id ? String(a.volume_id) : "",
//         issue: a.issue_id ? String(a.issue_id) : "",
//         year: a.year ? String(a.year) : "",
//         article_file_path: a.pdf_path || "",
//         received_date: a.received || "",
//         revised_date: a.revised || "",
//         accepted_date: a.accepted || "",
//         published_date: a.published || "",
//       }));
//     },
//     enabled: !!jid,
//   });

//   const years = [...new Set(articles.map((a) => a.year).filter(Boolean))];

//   // =====================
//   // VOLUMES & ISSUES
//   // =====================
//   useEffect(() => {
//     const fetchMetaData = async () => {
//       if (!jid) return;
//       const [volumesRes, issuesRes] = await Promise.all([
//         fetch(`/api/volume?journal_id=${jid}`),
//         fetch(`/api/issues?journal_id=${jid}`),
//       ]);
//       const [volumesData, issuesData] = await Promise.all([
//         volumesRes.json(),
//         issuesRes.json(),
//       ]);
//       if (volumesData.success) setVolumesMeta(volumesData.volumes || []);
//       if (issuesData.success) setIssuesMeta(issuesData.issues || []);
//     };
//     fetchMetaData();
//   }, [jid]);

//   // Combine Volume + Issue label
//   const volumeIssueList = useMemo(() => {
//     return issuesMeta.map((issue) => {
//       const vol = volumesMeta.find((v) => v.id === issue.volume_id);
//       return {
//         id: issue.id,
//         volume_id: issue.volume_id,
//         issue_number: issue.issue_number,
//         label: `Volume ${vol?.volume_number ?? "?"} – Issue ${issue.issue_number}`,
//       };
//     });
//   }, [issuesMeta, volumesMeta]);

//   // =====================
//   // JOURNALS
//   // =====================
//   useEffect(() => {
//     const fetchJournals = async () => {
//       if (!jid) return;
//       const res = await fetch(`/api/journals?id=${jid}`);
//       const data = await res.json();
//       if (data.success) setJournals(data.journals || []);
//     };
//     fetchJournals();
//   }, [jid]);

//   const getJournalName = (id) => {
//     const journal = journals.find((j) => j.id === Number(id));
//     return journal?.journal_name || "Journal Name";
//   };

//   // =====================
//   // HELPER MAPPERS
//   // =====================
//   const getVolumeName = (id) => {
//     const v = volumesMeta.find((vv) => vv.id === Number(id));
//     return v?.volume_number ?? id;
//   };
//   const getIssueName = (id) => {
//     const i = issuesMeta.find((ii) => ii.id === Number(id));
//     return i?.issue_number ?? id;
//   };

//   // =====================
//   // FILTERING
//   // =====================
//   const filteredArticles = useMemo(() => {
//     return articles.filter((a) => {
//       return (
//         a.title.toLowerCase().includes(filters.title.toLowerCase()) &&
//         a.authors.join(", ").toLowerCase().includes(filters.author.toLowerCase()) &&
//         (filters.volume ? String(a.volume) === String(filters.volume) : true) &&
//         (filters.issue ? String(a.issue) === String(filters.issue) : true) &&
//         (filters.year ? a.year === filters.year : true) &&
//         (filters.article_id
//           ? String(a.article_id).toLowerCase().includes(filters.article_id.toLowerCase())
//           : true)
//       );
//     });
//   }, [articles, filters]);

//   // =====================
//   // TABLE COLUMNS
//   // =====================
//   const columns = useMemo(
//     () => [
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
//         cell: (info) => info.getValue().join(", "),
//       },
//       {
//         header: "Keywords",
//         accessorKey: "key_words",
//         cell: (info) => info.getValue().join(", "),
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
//         cell: ({ row }) => (
//           <div className="space-x-2 text-sm">
//             <button
//               onClick={() => setViewArticle(row.original)}
//               className="text-blue-600 hover:underline"
//             >
//               View
//             </button>
//             <button
//               onClick={() => {
//                 const { id, article_id, journal_id } = row.original;
//                 const journalCode =
//                   String(article_id || "").split("-")[0] || "journal";
//                 const qs = id
//                   ? `id=${encodeURIComponent(id)}`
//                   : `article_id=${encodeURIComponent(article_id)}`;
//                 setViewArticle(null);
//                 router.push(
//                   `/admin/dashboard/journals/${journalCode}/article?jid=${encodeURIComponent(
//                     journal_id
//                   )}&edit=1&${qs}`
//                 );
//               }}
//               className="text-green-600 hover:underline"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => handleDelete(row.original.id)}
//               className="text-red-600 hover:underline"
//             >
//               Delete
//             </button>
//           </div>
//         ),
//       },
//     ],
//     []
//   );

//   const table = useReactTable({
//     data: filteredArticles,
//     columns,
//     getCoreRowModel: getCoreRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     initialState: {
//       pagination: { pageSize: 5, pageIndex: 0 },
//     },
//   });

//   // =====================
//   // DELETE HANDLER
//   // =====================
//   const handleDelete = async (id) => {
//     const confirmed = window.confirm("Are you sure you want to delete this article?");
//     if (!confirmed) return;
//     try {
//       const res = await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
//       const data = await res.json();
//       if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");
//       table.options.data = table.options.data.filter((a) => a.id !== id);
//       alert("Article deleted successfully.");
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert(err.message || "Something went wrong.");
//     }
//   };

//   // =====================
//   // RENDER
//   // =====================
//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">
//         {getJournalName(jid)}
//       </h2>

//       {/* Filters */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
//         <input
//           placeholder="Search Title"
//           value={filters.title}
//           onChange={(e) => setFilters({ ...filters, title: e.target.value })}
//           className="border p-2 rounded"
//         />
//         <input
//           placeholder="Search Author"
//           value={filters.author}
//           onChange={(e) => setFilters({ ...filters, author: e.target.value })}
//           className="border p-2 rounded"
//         />
//         <input
//           placeholder="Search Article ID"
//           value={filters.article_id}
//           onChange={(e) => setFilters({ ...filters, article_id: e.target.value })}
//           className="border p-2 rounded"
//         />

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600 mb-1 font-medium">
//             Volume & Issue
//           </label>
//           <select
//             value={
//               filters.volume && filters.issue
//                 ? `${filters.volume}|${filters.issue}`
//                 : ""
//             }
//             onChange={(e) => {
//               const val = e.target.value;
//               if (!val) {
//                 setFilters({ ...filters, volume: "", issue: "" });
//               } else {
//                 const [volume_id, issue_id] = val.split("|");
//                 setFilters({
//                   ...filters,
//                   volume: volume_id,
//                   issue: issue_id,
//                 });
//               }
//             }}
//             className="border p-2 rounded"
//           >
//             <option value="">All Volume & Issue</option>
//             {volumeIssueList.map((i) => (
//               <option key={i.id} value={`${i.volume_id}|${i.id}`}>
//                 {i.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600 mb-1 font-medium">Year</label>
//           <select
//             value={filters.year}
//             onChange={(e) => setFilters({ ...filters, year: e.target.value })}
//             className="border p-2 rounded"
//           >
//             <option value="">All Years</option>
//             {years.map((y) => (
//               <option key={y} value={y}>
//                 {y}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto border rounded-lg shadow-sm">
//         <table className="w-full border-collapse text-sm">
//           <thead className="bg-gray-100 text-gray-800">
//             {table.getHeaderGroups().map((headerGroup) => (
//               <tr key={headerGroup.id}>
//                 {headerGroup.headers.map((header) => (
//                   <th key={header.id} className="p-2 text-left font-semibold border-b">
//                     {flexRender(header.column.columnDef.header, header.getContext())}
//                   </th>
//                 ))}
//               </tr>
//             ))}
//           </thead>
//           <tbody>
//             {table.getRowModel().rows.map((row) => (
//               <tr
//                 key={row.id}
//                 className="border-b hover:bg-gray-50 transition"
//               >
//                 {row.getVisibleCells().map((cell) => (
//                   <td key={cell.id} className="p-2 align-top">
//                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="flex justify-between items-center mt-4 text-sm">
//         <div>
//           Page {table.getState().pagination.pageIndex + 1} of{" "}
//           {table.getPageCount()}
//         </div>
//         <div className="space-x-2">
//           <button
//             onClick={() => table.previousPage()}
//             disabled={!table.getCanPreviousPage()}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>
//           <button
//             onClick={() => table.nextPage()}
//             disabled={!table.getCanNextPage()}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//           <select
//             value={table.getState().pagination.pageSize}
//             onChange={(e) => table.setPageSize(Number(e.target.value))}
//             className="border p-1 rounded"
//           >
//             {[5, 10, 20, 50].map((size) => (
//               <option key={size} value={size}>
//                 Show {size}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Modal */}
//       <Dialog
//         open={!!viewArticle}
//         onClose={() => setViewArticle(null)}
//         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
//       >
//         <div className="bg-white p-4 sm:p-8 max-w-4xl w-full rounded shadow-lg overflow-y-auto max-h-[90vh] text-sm sm:text-base">
//           {viewArticle && (
//             <>
//               <div className="mb-2 text-xs text-gray-500">
//                 <span className="uppercase">Research Article</span> |{" "}
//                 <span className="text-green-700 font-medium">Open Access</span>
//                 {viewArticle.article_file_path && (
//                   <>
//                     {" "}
//                     ·{" "}
//                     <a
//                       href={viewArticle.article_file_path.replace(/ /g, "-")}
//                       download
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       Download Full Text
//                     </a>
//                   </>
//                 )}
//               </div>

//               <h2 className="text-xl sm:text-2xl font-bold leading-snug mb-2 text-gray-900">
//                 {viewArticle.title}
//               </h2>
//               <div className="text-gray-800 font-medium mb-3 text-sm sm:text-base">
//                 {viewArticle.authors.join(", ")}
//               </div>

//               <div className="text-xs text-gray-600 mb-4">
//                 <strong>Volume</strong> {getVolumeName(viewArticle.volume)} |{" "}
//                 <strong>Issue</strong> {getIssueName(viewArticle.issue)} |{" "}
//                 <strong>Year</strong> {viewArticle.year} | <strong>Article ID:</strong>{" "}
//                 {viewArticle.article_id}
//                 {viewArticle.doi ? (
//                   <>
//                     {" "}
//                     | <strong>DOI:</strong>{" "}
//                     <a
//                       href={`https://doi.org/${viewArticle.doi}`}
//                       target="_blank"
//                       rel="noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       https://doi.org/{viewArticle.doi}
//                     </a>
//                   </>
//                 ) : null}
//               </div>

//               <div className="mb-4">
//                 <h4 className="font-semibold mb-1 text-gray-800">Abstract</h4>
//                 <div
//                   className="text-gray-700 leading-relaxed text-sm sm:text-base"
//                   dangerouslySetInnerHTML={{ __html: viewArticle.abstract }}
//                 />
//               </div>

//               <div className="mb-4">
//                 <h4 className="font-semibold mb-1 text-gray-800">Keywords</h4>
//                 <p className="text-gray-700 text-sm sm:text-base">
//                   {viewArticle.key_words.join(", ")}
//                 </p>
//               </div>

//               {viewArticle.references && (
//                 <div className="mb-4">
//                   <h4 className="font-semibold mb-1 text-gray-800">References</h4>
//                   <div
//                     className="space-y-1 text-gray-700 text-xs sm:text-sm"
//                     dangerouslySetInnerHTML={{ __html: viewArticle.references }}
//                   />
//                 </div>
//               )}

//               <div className="text-right mt-5">
//                 <button
//                   onClick={() => setViewArticle(null)}
//                   className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
//                 >
//                   Close
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </Dialog>
//     </div>
//   );
// }

// "use client";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useMemo, useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   useReactTable,
//   getCoreRowModel,
//   flexRender,
// } from "@tanstack/react-table";
// import { Dialog } from "@headlessui/react";
// import { Settings, MoreVertical, Loader2 } from "lucide-react";

// function safeParseArray(input) {
//   try {
//     const parsed = typeof input === "string" ? JSON.parse(input) : input;
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// export default function Page() {
//   const searchParams = useSearchParams();
//   const jid = searchParams.get("jid");
//   const router = useRouter();

//   const [filters, setFilters] = useState({
//     title: "",
//     author: "",
//     volume: "",
//     issue: "",
//     year: "",
//     article_id: "",
//   });

//   const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
//   const [viewArticle, setViewArticle] = useState(null);
//   const [volumesMeta, setVolumesMeta] = useState([]);
//   const [issuesMeta, setIssuesMeta] = useState([]);
//   const [journals, setJournals] = useState([]);
// const [columnVisibility, setColumnVisibility] = useState({
//   article_id: true,  // visible
//   title: true,       // visible
//   authors: true,     // visible
//   key_words: false,  // hidden by default
//   volume: true,      // visible
//   issue: true,       // visible
//   year: true,        // visible
//   doi: false,        // hidden by default
//   actions: true,     // visible
// });
//   const [activeMenu, setActiveMenu] = useState(null);

//   // ------------------------------------------------------------------
//   // ARTICLES (server pagination)
//   // ------------------------------------------------------------------
//  const { data, isFetching } = useQuery({
//   queryKey: ["articles", jid, pagination.pageIndex, pagination.pageSize, filters],
//     queryFn: async () => {
// const params = new URLSearchParams({
//   journal_id: jid,
//   page: pagination.pageIndex + 1,
//   limit: pagination.pageSize,
// });

// if (filters.query) params.append("query", filters.query);
// if (filters.volume) params.append("volume", filters.volume);
// if (filters.issue) params.append("issue", filters.issue);
// if (filters.year) params.append("year", filters.year);

// const res = await fetch(`/api/articles?${params.toString()}`);
//       const json = await res.json();
//       if (!json.success) return { articles: [], total: 0 };

//       const mapped = json.articles.map((a) => ({
//         ...a,
//         id: a.id,
//         article_id: a.article_id,
//         title: a.article_title || "",
//         authors: safeParseArray(a.authors),
//         key_words: safeParseArray(a.keywords),
//         volume: a.volume_id ? String(a.volume_id) : "",
//         issue: a.issue_id ? String(a.issue_id) : "",
//         year: a.year ? String(a.year) : "",
//         article_file_path: a.pdf_path || "",
//       }));

//       return { articles: mapped, total: json.total || 0 };
//     },
//    enabled: !!jid,
//   keepPreviousData: true,
//   });

//   const articles = data?.articles || [];
//   const total = data?.total || 0;
//   const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

//   // ------------------------------------------------------------------
//   // META DATA
//   // ------------------------------------------------------------------
//   useEffect(() => {
//     const fetchMeta = async () => {
//       if (!jid) return;
//       const [v, i] = await Promise.all([
//         fetch(`/api/volume?journal_id=${jid}`).then((r) => r.json()),
//         fetch(`/api/issues?journal_id=${jid}`).then((r) => r.json()),
//       ]);
//       if (v.success) setVolumesMeta(v.volumes);
//       if (i.success) setIssuesMeta(i.issues);
//     };
//     fetchMeta();
//   }, [jid]);

//   useEffect(() => {
//     const fetchJournals = async () => {
//       if (!jid) return;
//       const res = await fetch(`/api/journals?id=${jid}`);
//       const data = await res.json();
//       if (data.success) setJournals(data.journals || []);
//     };
//     fetchJournals();
//   }, [jid]);

//   const getJournalName = (id) =>
//     journals.find((j) => j.id === Number(id))?.journal_name || "Journal Name";
//   const getVolumeName = (id) =>
//     volumesMeta.find((v) => v.id === Number(id))?.volume_number ?? id;
//   const getIssueName = (id) =>
//     issuesMeta.find((i) => i.id === Number(id))?.issue_number ?? id;

//   const volumeIssueList = useMemo(
//     () =>
//       issuesMeta.map((issue) => {
//         const vol = volumesMeta.find((v) => v.id === issue.volume_id);
//         return {
//           id: issue.id,
//           volume_id: issue.volume_id,
//           label: `Vol. ${vol?.volume_number ?? "?"} / Issue ${issue.issue_number}`,
//         };
//       }),
//     [issuesMeta, volumesMeta]
//   );
// const filteredArticles = useMemo(() => {
//   const q = filters.query?.toLowerCase() || "";
//   return articles.filter((a) => {
//     const authors = Array.isArray(a.authors) ? a.authors.join(", ").toLowerCase() : "";
//     const matchQuery =
//       !q ||
//       a.article_id.toLowerCase().includes(q) ||
//       a.title.toLowerCase().includes(q) ||
//       authors.includes(q);

//     return (
//       matchQuery &&
//       (filters.volume ? String(a.volume) === String(filters.volume) : true) &&
//       (filters.issue ? String(a.issue) === String(filters.issue) : true) &&
//       (filters.year ? a.year === filters.year : true)
//     );
//   });
// }, [articles, filters]);

//   // ------------------------------------------------------------------
//   // TABLE
//   // ------------------------------------------------------------------
//   const columns = useMemo(
//     () => [
//       { header: "Article ID", accessorKey: "article_id" },
//       {
//         header: "Title",
//         accessorKey: "title",
//         cell: (info) => (
//           <div
//             dangerouslySetInnerHTML={{
//               __html: info.getValue() || "",
//             }}
//           />
//         ),
//       },
//       {
//         header: "Authors",
//         accessorKey: "authors",
//         cell: (info) => info.getValue().join(", "),
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
//    {
//   id: "actions",
//   header: "Actions",
//   cell: ({ row }) => {
//     const [open, setOpen] = useState(false);
//     const { id, article_id, journal_id } = row.original;

//     const handleEdit = () => {
//       const code = String(article_id || "").split("-")[0] || "journal";
//       router.push(
//         `/admin/dashboard/journals/${code}/article?jid=${journal_id}&edit=1&id=${id}`
//       );
//     };

//     const handleDelete = async () => {
//       if (!confirm("Are you sure you want to delete this article?")) return;
//       try {
//         const res = await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
//         const json = await res.json();
//         if (!json.success) throw new Error(json.message || "Failed to delete");
//         alert("✅ Article deleted successfully.");
//         // Optionally trigger refetch
//         queryClient.invalidateQueries(["articles", jid]);
//       } catch (err) {
//         alert("❌ " + (err.message || "Something went wrong."));
//       }
//     };

//     return (
//       <div className="relative">
//         <button
//           onClick={() => setOpen((p) => !p)}
//           className="p-1 rounded hover:bg-gray-100"
//         >
//           <MoreVertical size={16} />
//         </button>

//         {open && (
//           <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-30 text-sm">
//             <button
//               onClick={() => {
//                 setViewArticle(row.original);
//                 setOpen(false);
//               }}
//               className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
//             >
//               View
//             </button>
//             <button
//               onClick={() => {
//                 handleEdit();
//                 setOpen(false);
//               }}
//               className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 text-blue-600"
//             >
//               Edit
//             </button>
//             <button
//               onClick={() => {
//                 handleDelete();
//                 setOpen(false);
//               }}
//               className="block w-full text-left px-3 py-1.5 text-red-600 hover:bg-gray-100"
//             >
//               Delete
//             </button>
//           </div>
//         )}
//       </div>
//     );
//   },
// },
//     ],
//     [activeMenu, volumesMeta, issuesMeta]
//   );

//   const table = useReactTable({
//     data: articles,
//     columns,
//     state: { columnVisibility },
//     onColumnVisibilityChange: setColumnVisibility,
//     getCoreRowModel: getCoreRowModel(),
//     manualPagination: true,
//     pageCount: totalPages,
//   });

//   // ------------------------------------------------------------------
//   // DELETE HANDLER
//   // ------------------------------------------------------------------
//   const handleDelete = async (id) => {
//     if (!confirm("Delete this article?")) return;
//     const res = await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
//     const data = await res.json();
//     if (data.success) alert("Deleted!");
//   };

//   // ------------------------------------------------------------------
//   // RENDER
//   // ------------------------------------------------------------------
//   return (
//     <div className="relative p-6">
//       <h2 className="text-xl font-bold mb-4">{getJournalName(jid)}</h2>
//       {/* Filters */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
// <input
//   placeholder="Search by Title, Author, or Article ID"
//   value={filters.query || ""}
//   onChange={(e) => setFilters({ ...filters, query: e.target.value })}
//   className="border p-2 rounded col-span-2 md:col-span-3"
// />
//         <div className="flex flex-col">
//           <label className="text-xs text-gray-600 mb-1 font-medium">
//             Volume & Issue
//           </label>
//           <select
//             value={
//               filters.volume && filters.issue
//                 ? `${filters.volume}|${filters.issue}`
//                 : ""
//             }
//             onChange={(e) => {
//               const val = e.target.value;
//               if (!val) return setFilters({ ...filters, volume: "", issue: "" });
//               const [vol, iss] = val.split("|");
//               setFilters({ ...filters, volume: vol, issue: iss });
//             }}
//             className="border p-2 rounded"
//           >
//             <option value="">All</option>
//             {volumeIssueList.map((i) => (
//               <option key={i.id} value={`${i.volume_id}|${i.id}`}>
//                 {i.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Table Controls */}
//       <div className="flex justify-between items-center mb-3 text-sm">
//         <div className="text-gray-600">
//           Showing {(pagination.pageIndex * pagination.pageSize) + 1}–
//           {Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of {total}
//         </div>

//         <div className="relative">
//          <button
//   onClick={() =>
//     setActiveMenu(activeMenu === "columns" ? null : "columns")
//   }
//   className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 text-sm font-medium text-gray-700"
// >
//   <Settings size={16} className="text-gray-600" />
//   Columns
// </button>
//           {activeMenu === "columns" && (
//             <div className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-lg p-2 z-20">
//               {table.getAllLeafColumns().map((column) => (
//                 <label
//                   key={column.id}
//                   className="flex items-center space-x-2 text-sm mb-1"
//                 >
//                   <input
//                     type="checkbox"
//                     checked={column.getIsVisible()}
//                     onChange={column.getToggleVisibilityHandler()}
//                   />
//                   <span>{column.columnDef.header}</span>
//                 </label>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Table */}
// <div className="overflow-x-auto border rounded-lg shadow-sm relative">
//   <table className="w-full border-collapse text-sm">
//     <thead className="bg-gray-100">
//       {table.getHeaderGroups().map((hg) => (
//         <tr key={hg.id}>
//           {hg.headers.map((header) => (
//             <th key={header.id} className="p-2 text-left border-b font-medium">
//               {flexRender(header.column.columnDef.header, header.getContext())}
//             </th>
//           ))}
//         </tr>
//       ))}
//     </thead>

//     <tbody className="relative min-h-[200px]">
//       {isFetching && (
//         <tr>
//           <td
//             colSpan={columns.length}
//             className="p-6 text-center align-middle"
//           >
//             <div className="flex items-center justify-center">
//               <Loader2
//                 size={30}
//                 className="animate-spin text-blue-600 opacity-80"
//               />
//               <span className="ml-2 text-gray-600">Loading...</span>
//             </div>
//           </td>
//         </tr>
//       )}

//       {!isFetching &&
//         (articles.length ? (
//           table.getRowModel().rows.map((row) => (
//             <tr
//               key={row.id}
//               className="border-b hover:bg-gray-50 transition"
//             >
//               {row.getVisibleCells().map((cell) => (
//                 <td key={cell.id} className="p-2">
//                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
//                 </td>
//               ))}
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td
//               colSpan={columns.length}
//               className="p-4 text-center text-gray-500"
//             >
//               No records found.
//             </td>
//           </tr>
//         ))}
//     </tbody>
//   </table>
// </div>

//       {/* Pagination */}
//       <div className="flex justify-between items-center mt-4 text-sm">
//         <div>
//           Page {pagination.pageIndex + 1} of {totalPages}
//         </div>
//         <div className="space-x-2">
//           <button
//             onClick={() =>
//               setPagination((p) => ({ ...p, pageIndex: Math.max(p.pageIndex - 1, 0) }))
//             }
//             disabled={pagination.pageIndex === 0}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Prev
//           </button>
//           <button
//             onClick={() =>
//               setPagination((p) => ({
//                 ...p,
//                 pageIndex: Math.min(p.pageIndex + 1, totalPages - 1),
//               }))
//             }
//             disabled={pagination.pageIndex + 1 >= totalPages}
//             className="px-3 py-1 border rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//           <select
//             value={pagination.pageSize}
//             onChange={(e) =>
//               setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
//             }
//             className="border p-1 rounded"
//           >
//             {[5, 10, 20, 50].map((n) => (
//               <option key={n} value={n}>
//                 Show {n}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Modal */}
// <Dialog
//   open={!!viewArticle}
//   onClose={() => setViewArticle(null)}
//   className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
// >
//   <div className="bg-white p-6 max-w-5xl w-full rounded shadow-lg overflow-y-auto max-h-[90vh] text-sm">
//     {viewArticle && (
//       <>
//         {/* Header Section */}
//         {/* Header Section */}
// {/* Header Section */}
// <div className="relative mb-4 border-b pb-2">

//   {/* Close button — positioned outside top-right */}
//   <button
//     onClick={() => setViewArticle(null)}
//     className="absolute -top-3 -right-3 bg-white border rounded-full shadow-md text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition p-1"
//     aria-label="Close"
//   >
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       className="w-4 h-4"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth={2}
//       stroke="currentColor"
//     >
//       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//     </svg>
//   </button>

// <div className="flex flex-wrap items-center gap-2">
//   <h3 className="text-[13px] font-semibold text-blue-700 uppercase tracking-wide">
//     Research Article | Open Access
//   </h3>

//   {viewArticle.pdf_path && (
//     <a
//       href={viewArticle.pdf_path}
//       target="_blank"
//       rel="noopener noreferrer"
//       className="text-[13px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
//     >
//       <span className="text-blue-500">|</span> Download Full Text
//     </a>
//   )}
// </div>

//   <div className="text-gray-500 text-xs mt-1">
//     Volume {getVolumeName(viewArticle.volume)} | Issue {getIssueName(viewArticle.issue)} | Year{" "}
//     {viewArticle.year} | <strong>Article Id:</strong> {viewArticle.article_id}{" "}
//     {viewArticle.doi && (
//       <>
//         | <strong>DOI:</strong>{" "}
//         <a
//           href={`https://doi.org/${viewArticle.doi}`}
//           className="text-blue-600 underline"
//           target="_blank"
//         >
//           https://doi.org/{viewArticle.doi}
//         </a>
//       </>
//     )}
//   </div>
// </div>

//         {/* Title */}
//         <h2
//           className="text-2xl font-semibold mb-2 leading-snug"
//           dangerouslySetInnerHTML={{ __html: viewArticle.title }}
//         />

//         {/* Authors */}
//         <p className="text-gray-800 mb-4 font-medium">
//           {Array.isArray(viewArticle.authors)
//             ? viewArticle.authors.join(", ")
//             : viewArticle.authors}
//         </p>

//         {/* Date Table */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 text-xs text-gray-700 mb-4 border rounded divide-x divide-y sm:divide-y-0">
//           {[
//             ["Received", viewArticle.received],
//             ["Revised", viewArticle.revised],
//             ["Accepted", viewArticle.accepted],
//             ["Published", viewArticle.published],
//           ].map(([label, val]) => (
//             <div key={label} className="p-3 text-center">
//               <div className="font-semibold">{label}</div>
//               <div className="mt-1">
//                 {val
//                   ? new Date(val).toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                   : "-"}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Citation */}
//         {viewArticle.authors && (
//           <div className="mb-4">
//             <h4 className="font-semibold text-gray-800 mb-1">Citations</h4>
//             <p className="text-gray-700 leading-relaxed">
//               {Array.isArray(viewArticle.authors)
//                 ? viewArticle.authors.join(", ")
//                 : viewArticle.authors}
//               . “
//               <span
//                 dangerouslySetInnerHTML={{
//                   __html: viewArticle.title || "",
//                 }}
//               />
//               ”. <em>{getJournalName(viewArticle.journal_id)}</em>, vol.{" "}
//               {getVolumeName(viewArticle.volume)}, no.{" "}
//               {getIssueName(viewArticle.issue)}, {viewArticle.year}.
//             </p>
//           </div>
//         )}

//         {/* Abstract */}
//         {viewArticle.abstract && (
//           <div className="mb-4">
//             <h4 className="font-semibold text-gray-800 mb-1">Abstract</h4>
//             <div
//               className="text-gray-700 leading-relaxed"
//               dangerouslySetInnerHTML={{ __html: viewArticle.abstract }}
//             />
//           </div>
//         )}

//         {/* Keywords */}
//         {viewArticle.keywords && (
//           <div className="mb-4">
//             <h4 className="font-semibold text-gray-800 mb-1">Keywords</h4>
//             <p className="text-gray-700">
//               {Array.isArray(viewArticle.key_words)
//                 ? viewArticle.key_words.join(", ")
//                 : viewArticle.keywords}
//             </p>
//           </div>
//         )}

//         {/* References */}
//         {viewArticle.references && (
//           <div className="mb-4">
//             <h4 className="font-semibold text-gray-800 mb-1">References</h4>
//             <div
//               className="text-gray-700 text-xs leading-relaxed space-y-1"
//               dangerouslySetInnerHTML={{ __html: viewArticle.references }}
//             />
//           </div>
//         )}

//         {/* Close */}
//         <div className="text-right mt-5">
//           <button
//             onClick={() => setViewArticle(null)}
//             className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
//           >
//             Close
//           </button>
//         </div>
//       </>
//     )}
//   </div>
// </Dialog>

//     </div>
//   );
// }

"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Dialog } from "@headlessui/react";
import { Settings, MoreVertical, Loader2, Plus } from "lucide-react";
import { Input, Select } from "@/components/ui";


// -------------------------------------------------------------
// Utility
// -------------------------------------------------------------
function safeParseArray(input) {
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// -------------------------------------------------------------
// Component
// -------------------------------------------------------------
export default function Page() {
  const searchParams = useSearchParams();
  const jid = searchParams.get("jid");
  const router = useRouter();
  const queryClient = useQueryClient();

  // -------------------------------------------------------------
  // State
  // -------------------------------------------------------------
  const [filters, setFilters] = useState({
    title: "",
    author: "",
    volume: "",
    issue: "",
    year: "",
    article_id: "",
  });

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [viewArticle, setViewArticle] = useState(null);
  const [volumesMeta, setVolumesMeta] = useState([]);
  const [issuesMeta, setIssuesMeta] = useState([]);
  const [journals, setJournals] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({
    article_id: true,
    title: true,
    authors: true,
    key_words: false,
    volume: true,
    issue: true,
    year: true,
    doi: false,
    actions: true,
  });

  const [activeMenu, setActiveMenu] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState("down");

  // -------------------------------------------------------------
  // Handle outside click (for both actions & columns menus)
  // -------------------------------------------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".article-menu") &&
        !event.target.closest(".columns-menu")
      ) {
        setOpenMenuId(null);
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (id, e) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      const rect = e.target.getBoundingClientRect();
      const distanceToBottom = window.innerHeight - rect.bottom;
      setMenuPosition(distanceToBottom < 150 ? "up" : "down");
      setOpenMenuId(id);
    }
  };

  // -------------------------------------------------------------
  // Fetch Articles (server pagination)
  // -------------------------------------------------------------
  const { data, isFetching } = useQuery({
    queryKey: [
      "articles",
      jid,
      pagination.pageIndex,
      pagination.pageSize,
      filters,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        journal_id: jid,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });
      if (filters.query) params.append("query", filters.query);
      if (filters.volume) params.append("volume", filters.volume);
      if (filters.issue) params.append("issue", filters.issue);
      if (filters.year) params.append("year", filters.year);

      const res = await fetch(`/api/articles?${params.toString()}`);
      const json = await res.json();
      if (!json.success) return { articles: [], total: 0 };

      const mapped = json.articles.map((a) => ({
        ...a,
        id: a.id,
        article_id: a.article_id,
        title: a.article_title || "",
        authors: safeParseArray(a.authors),
        key_words: safeParseArray(a.keywords),
        volume: a.volume_id ? String(a.volume_id) : "",
        issue: a.issue_id ? String(a.issue_id) : "",
        year: a.year ? String(a.year) : "",
        article_file_path: a.pdf_path || "",
      }));

      return { articles: mapped, total: json.total || 0 };
    },
    enabled: !!jid,
    keepPreviousData: true,
  });

  const articles = data?.articles || [];
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));

  // -------------------------------------------------------------
  // Meta data loading (journals, volumes, issues)
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchMeta = async () => {
      if (!jid) return;
      const [v, i] = await Promise.all([
        fetch(`/api/volume?journal_id=${jid}`).then((r) => r.json()),
        fetch(`/api/issues?journal_id=${jid}`).then((r) => r.json()),
      ]);
      if (v.success) setVolumesMeta(v.volumes);
      if (i.success) setIssuesMeta(i.issues);
    };
    fetchMeta();
  }, [jid]);

  useEffect(() => {
    const fetchJournals = async () => {
      if (!jid) return;
      const res = await fetch(`/api/journals?id=${jid}`);
      const data = await res.json();
      if (data.success) setJournals(data.journals || []);
    };
    fetchJournals();
  }, [jid]);

  // -------------------------------------------------------------
  // Helper functions
  // -------------------------------------------------------------
  const getJournalName = (id) =>
    journals.find((j) => j.id === Number(id))?.journal_name || "Journal Name";
  const getVolumeName = (id) =>
    volumesMeta.find((v) => v.id === Number(id))?.volume_number ?? id;
  const getIssueName = (id) =>
    issuesMeta.find((i) => i.id === Number(id))?.issue_number ?? id;

  const volumeIssueList = useMemo(
    () =>
      issuesMeta.map((issue) => {
        const vol = volumesMeta.find((v) => v.id === issue.volume_id);
        return {
          id: issue.id,
          volume_id: issue.volume_id,
          label: `Vol. ${vol?.volume_number ?? "?"} / Issue ${
            issue.issue_number
          }`,
        };
      }),
    [issuesMeta, volumesMeta]
  );

  // -------------------------------------------------------------
  // Table columns
  // -------------------------------------------------------------
  const columns = useMemo(
    () => [
      { header: "Article ID", accessorKey: "article_id" },
      {
        header: "Title",
        accessorKey: "title",
        cell: (info) => (
          <div dangerouslySetInnerHTML={{ __html: info.getValue() || "" }} />
        ),
      },
      {
        header: "Authors",
        accessorKey: "authors",
        cell: (info) => info.getValue().join(", "),
      },
      {
        header: "Volume",
        accessorKey: "volume",
        cell: (info) => getVolumeName(info.getValue()),
      },
      {
        header: "Issue",
        accessorKey: "issue",
        cell: (info) => getIssueName(info.getValue()),
      },
      { header: "Year", accessorKey: "year" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const { id, article_id, journal_id } = row.original;

          const handleEdit = () => {
            const code = String(article_id || "").split("-")[0] || "journal";
            router.push(
              `/admin/dashboard/journals/${code}/article?jid=${journal_id}&edit=1&id=${id}`
            );
          };

          const handleDelete = async () => {
            if (!confirm("Are you sure you want to delete this article?"))
              return;
            try {
              const res = await fetch(`/api/articles?id=${id}`, {
                method: "DELETE",
              });
              const json = await res.json();
              if (!json.success)
                throw new Error(json.message || "Failed to delete");
              alert("✅ Article deleted successfully.");
              queryClient.invalidateQueries(["articles", jid]);
            } catch (err) {
              alert("❌ " + (err.message || "Something went wrong."));
            }
          };

          return (
            <div className="relative article-menu">
              <button
                onClick={(e) => toggleMenu(row.id, e)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <MoreVertical size={16} />
              </button>

              {openMenuId === row.id && (
                <div
                  className={`absolute right-0 ${
                    menuPosition === "up" ? "bottom-full mb-2" : "mt-2"
                  } w-36 bg-white border rounded-md shadow-lg z-50`}
                >
                  <button
                    onClick={() => setViewArticle(row.original)}
                    className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
                  >
                    View
                  </button>
                  <button
                    onClick={handleEdit}
                    className="block w-full text-left px-3 py-1.5 hover:bg-gray-100 text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="block w-full text-left px-3 py-1.5 text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [volumesMeta, issuesMeta, openMenuId, menuPosition]
  );

  const table = useReactTable({
    data: articles,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------
  return (
    <div className="relative p-6">
      <h2 className="text-xl font-bold mb-4">{getJournalName(jid)}</h2>

<div className="flex justify-end mb-4">
<button
  onClick={() => {
    const jr = journals.find(j => j.id === Number(jid));
    if (!jr) return alert("Journal not found.");

    const shortName = encodeURIComponent(jr.short_name);

    router.push(
      `/admin/dashboard/journals/${shortName}/article?jid=${jid}`
    );
  }}
  className="flex items-center gap-2 px-5 py-2 bg-[#0B1736] text-white rounded-lg shadow hover:bg-[#0d1e45] transition cursor-pointer"
>
  <Plus className="w-4 h-4" />
  <span>Add</span>
</button>
</div>


      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        <Input
          label="Search"
          placeholder="Search by Title, Author, or Article ID"
          value={filters.query || ""}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
          className="border p-2 rounded col-span-2 md:col-span-3"
        />

        <div className="flex flex-col">
          <Select
            label="Volume / Issue"
            placeholder="All"
            className="border p-2 rounded w-full"
            value={
              filters.volume && filters.issue
                ? `${filters.volume}|${filters.issue}`
                : ""
            }
            onValueChange={(val) => {
              if (!val) {
                return setFilters({ ...filters, volume: "", issue: "" });
              }

              const [vol, iss] = val.split("|");
              setFilters({ ...filters, volume: vol, issue: iss });
            }}
            options={[
              ...volumeIssueList.map((i) => ({
                value: `${i.volume_id}|${i.id}`,
                label: i.label,
              })),
            ]}
          />
        </div>
      </div>

      {/* Column Settings */}
      <div className="flex justify-between items-center mb-3 text-sm">
        <div className="text-gray-600">
          Showing {pagination.pageIndex * pagination.pageSize + 1}–
          {Math.min((pagination.pageIndex + 1) * pagination.pageSize, total)} of{" "}
          {total}
        </div>

        <div className="relative columns-menu">
          <button
            onClick={() =>
              setActiveMenu(activeMenu === "columns" ? null : "columns")
            }
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 text-sm font-medium text-gray-700"
          >
            <Settings size={16} className="text-gray-600" />
            Columns
          </button>

          {activeMenu === "columns" && (
            <div className="absolute right-0 mt-2 w-52 bg-white border rounded shadow-lg p-2 z-20">
              {table.getAllLeafColumns().map((column) => (
                <label
                  key={column.id}
                  className="flex items-center space-x-2 text-sm mb-1"
                >
                  <input
                    type="checkbox"
                    checked={column.getIsVisible()}
                    onChange={column.getToggleVisibilityHandler()}
                  />
                  <span>{column.columnDef.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm relative">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 text-left border-b font-medium"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="relative min-h-[200px]">
            {isFetching && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center align-middle"
                >
                  <div className="flex items-center justify-center">
                    <Loader2
                      size={30}
                      className="animate-spin text-blue-600 opacity-80"
                    />
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                </td>
              </tr>
            )}

            {!isFetching &&
              (articles.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-4 text-center text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Page {pagination.pageIndex + 1} of {totalPages}
        </div>
        <div className="space-x-2">
          <button
            onClick={() =>
              setPagination((p) => ({
                ...p,
                pageIndex: Math.max(p.pageIndex - 1, 0),
              }))
            }
            disabled={pagination.pageIndex === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <button
            onClick={() =>
              setPagination((p) => ({
                ...p,
                pageIndex: Math.min(p.pageIndex + 1, totalPages - 1),
              }))
            }
            disabled={pagination.pageIndex + 1 >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
          <select
            value={pagination.pageSize}
            onChange={(e) =>
              setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
            }
            className="border p-1 rounded"
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                Show {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Article View Dialog */}
      <Dialog
        open={!!viewArticle}
        onClose={() => setViewArticle(null)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div className="bg-white p-6 max-w-5xl w-full rounded shadow-lg overflow-y-auto max-h-[90vh] text-sm relative">
          {viewArticle && (
            <>
              {/* Header */}
              <div className="relative mb-4 border-b pb-2">
                <button
                  onClick={() => setViewArticle(null)}
                  className="absolute top-2 right-2 bg-white/90 backdrop-blur border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow hover:bg-white hover:scale-105 transition"
                  aria-label="Close"
                >
                  ✕
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[13px] font-semibold text-blue-700 uppercase tracking-wide">
                    Research Article | Open Access
                  </h3>

                  {viewArticle.pdf_path && (
                    <a
                      href={viewArticle.pdf_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span className="text-blue-500">|</span> Download Full
                      Text
                    </a>
                  )}
                </div>

                <div className="text-gray-500 text-xs mt-1">
                  Volume {getVolumeName(viewArticle.volume)} | Issue{" "}
                  {getIssueName(viewArticle.issue)} | Year {viewArticle.year} |{" "}
                  <strong>Article Id:</strong> {viewArticle.article_id}{" "}
                  {viewArticle.doi && (
                    <>
                      | <strong>DOI:</strong>{" "}
                      <a
                        href={`${viewArticle.doi}${viewArticle.article_id}`}
                        className="text-blue-600 underline"
                        target="_blank"
                      >
                        {viewArticle.doi}
                        {viewArticle.article_id}
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2
                className="text-2xl font-semibold mb-2 leading-snug"
                dangerouslySetInnerHTML={{ __html: viewArticle.title }}
              />

              {/* Authors */}
              <p className="text-gray-800 mb-4 font-medium">
                {Array.isArray(viewArticle.authors)
                  ? viewArticle.authors.join(", ")
                  : viewArticle.authors}
              </p>

              {/* Dates */}
              <div className="grid grid-cols-2 sm:grid-cols-4 text-xs text-gray-700 mb-4 border rounded divide-x divide-y sm:divide-y-0">
                {[
                  ["Received", viewArticle.received],
                  ["Revised", viewArticle.revised],
                  ["Accepted", viewArticle.accepted],
                  ["Published", viewArticle.published],
                ].map(([label, val]) => (
                  <div key={label} className="p-3 text-center">
                    <div className="font-semibold">{label}</div>
                    <div className="mt-1">
                      {val
                        ? new Date(val).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Citation */}
              {viewArticle.authors && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-1">Citation</h4>

                  {(() => {
                    // 🔧 normalize keys from API
                    const title =
                      viewArticle?.article_title ?? viewArticle?.title ?? "";

                    const volume =
                      viewArticle?.volume_number ?? viewArticle?.volume ?? null;

                    const issue =
                      viewArticle?.issue_number ?? viewArticle?.issue ?? null;

                    const pageFrom =
                      viewArticle?.page_from ?? viewArticle?.pages_from ?? null;

                    const pageTo =
                      viewArticle?.page_to ?? viewArticle?.pages_to ?? null;

                    const year = viewArticle?.year ?? null;

                    // 👤 authors can be LONGTEXT JSON or plain text
                    let authorsText = "";
                    const rawAuthors = viewArticle?.authors;
                    if (Array.isArray(rawAuthors)) {
                      authorsText = rawAuthors.join(", ");
                    } else if (typeof rawAuthors === "string") {
                      try {
                        const parsed = JSON.parse(rawAuthors);
                        authorsText = Array.isArray(parsed)
                          ? parsed.join(", ")
                          : rawAuthors;
                      } catch {
                        authorsText = rawAuthors;
                      }
                    }

                    return (
                      <p className="text-gray-700 leading-relaxed">
                        {/* Authors */}
                        {authorsText && <span>{authorsText}</span>}
                        {authorsText ? ", " : ""}
                        {/* Title */}
                        “
                        <span
                          dangerouslySetInnerHTML={{
                            __html: title,
                          }}
                        />
                        ”,&nbsp;
                        {/* Journal */}
                        <em>{getJournalName(viewArticle.journal_id)}</em>
                        {/* Volume / Issue */}
                        {volume ? <> , vol. {volume}</> : null}
                        {issue ? <> , no. {issue}</> : null}
                        {/* Pages */}
                        {pageFrom && pageTo ? (
                          <>
                            {" "}
                            , pp. {pageFrom}–{pageTo}
                          </>
                        ) : null}
                        {/* Year */}
                        {year ? <> , {year}.</> : "."}
                      </p>
                    );
                  })()}
                </div>
              )}

              {/* Abstract */}
              {viewArticle.abstract && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-1">Abstract</h4>
                  <div
                    className="text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: viewArticle.abstract }}
                  />
                </div>
              )}

              {/* Keywords */}
              {viewArticle.keywords && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-1">Keywords</h4>
                  <p className="text-gray-700">
                    {Array.isArray(viewArticle.key_words)
                      ? viewArticle.key_words.join(", ")
                      : viewArticle.keywords}
                  </p>
                </div>
              )}

              {/* References */}
              {viewArticle.references && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    References
                  </h4>
                  <div
                    className="text-gray-700 text-xs leading-relaxed space-y-1"
                    dangerouslySetInnerHTML={{ __html: viewArticle.references }}
                  />
                </div>
              )}

              {/* Close */}
              <div className="text-right mt-5">
                <button
                  onClick={() => setViewArticle(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
}
