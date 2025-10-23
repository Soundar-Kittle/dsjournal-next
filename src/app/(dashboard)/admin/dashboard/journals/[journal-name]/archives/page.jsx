// // ✅ src/app/dashboard/journals/[journal-name]/archives/page.jsx
// "use client";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useMemo, useState, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table";
// import { articlesData, archivesData } from "./data";
// import { Dialog } from "@headlessui/react";

// function safeParseArray(input) {
//   try {
//     const parsed = typeof input === "string" ? JSON.parse(input) : input;
//     return Array.isArray(parsed) ? parsed : [];
//   } catch {
//     return [];
//   }
// }

// export default function page() {
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


//   const years = [...new Set(articles.map((a) => a.year))];

//   useEffect(() => {
//     const fetchMetaData = async () => {
//       if (!jid) return;

//       const [volumesRes, issuesRes] = await Promise.all([
//         fetch(`/api/volume?journal_id=${jid}`),       // ✅ Corrected endpoint
//         fetch(`/api/issues?journal_id=${jid}`),
//       ]);

//       const [volumesData, issuesData] = await Promise.all([
//         volumesRes.json(),
//         issuesRes.json(),
//       ]);

//       if (volumesData.success) setVolumesMeta(volumesData.volumes);
//       if (issuesData.success) setIssuesMeta(issuesData.issues);
//     };

//     fetchMetaData();
//   }, [jid]);

//   useEffect(() => {
//     const fetchJournals = async () => {
//       const res = await fetch(`/api/journals?id=${jid}`, {
//         method: "GET",
//       });
//       const data = await res.json();
//       if (data.success) setJournals(data.journals);
//     };
//     fetchJournals();
//   }, []);

//   const getJournalName = (id) => {
//     const journal = journals.find((j) => j.id === Number(id));
//     console.log(journal ? journal : "no record found");
//     return journal?.journal_name || "Journal Name";
//   };
//   const getVolumeName = (id) => {
//     const v = volumesMeta.find((v) => v.id === Number(id));
//     return v?.volume_number || id;
//   };

//   const getIssueName = (id) => {
//     const i = issuesMeta.find((i) => i.id === Number(id));
//     return i?.issue_number || id;
//   };
//   const filteredArticles = useMemo(() => {
//     console.log(articles);
//     return articles.filter((a) => {
//       return (
//         a.title.toLowerCase().includes(filters.title.toLowerCase()) &&
//         a.authors.join(", ").toLowerCase().includes(filters.author.toLowerCase()) &&
//         (filters.volume ? a.volume === filters.volume : true) &&
//         (filters.issue ? a.issue === filters.issue : true) &&
//         (filters.year ? a.year === filters.year : true) &&
//         (filters.journal_id ? String(a.journal_id) === filters.journal_id : true) &&
//         (filters.article_id ? String(a.article_id).includes(filters.article_id) : true)
//       );
//     });
//   }, [articles, filters]);

//   const columns = useMemo(
//     () => [
//       { header: "Article ID", accessorKey: "article_id" },
//       {
//         header: "Journal Name",
//         accessorKey: "journal_id",
//         cell: (info) => getJournalName(info.getValue())
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
//             <button onClick={() => setViewArticle(row.original)} className="text-blue-600">View</button>
//             {/* <button onClick={() => alert("Edit UI pending")}>Edit</button> */}
//             <button
//               onClick={() => {
//                 const { id, article_id, journal_id } = row.original;
//                 const journalCode = String(article_id || "").split("-")[0] || "journal";
//                 const qs = id
//                   ? `id=${encodeURIComponent(id)}`
//                   : `article_id=${encodeURIComponent(article_id)}`;
//                 router.push(
//                   `/dashboard/journals/${journalCode}/article?jid=${encodeURIComponent(
//                     journal_id
//                   )}&edit=1&${qs}`
//                 );
//               }}
//             >
//               Edit
//             </button>
//             <button onClick={() => handleDelete(row.original.article_id)} className="text-red-600">Delete</button>
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

//   const handleDelete = (id) => {
//     const confirmed = window.confirm("Are you sure you want to delete this article?");
//     if (confirmed) {
//       table.options.data = table.options.data.filter((a) => a.article_id !== id);
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Page Here! Articles for Journal #{jid} - {getJournalName(jid)}</h2>
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
//         <input placeholder="Search Title" value={filters.title} onChange={(e) => setFilters({ ...filters, title: e.target.value })} className="border p-2" />
//         <input placeholder="Search Author" value={filters.author} onChange={(e) => setFilters({ ...filters, author: e.target.value })} className="border p-2" />
//         <input placeholder="Search Article ID" value={filters.article_id} onChange={(e) => setFilters({ ...filters, article_id: e.target.value })} className="border p-2" />
//         <select value={filters.volume} onChange={(e) => setFilters({ ...filters, volume: e.target.value })} className="border p-2">
//           <option value="">All Volumes</option>
//           {volumesMeta.map((v) => (
//             <option key={v.id} value={v.id}>{v.volume_number}</option>
//           ))}
//         </select>
//         <select value={filters.issue} onChange={(e) => setFilters({ ...filters, issue: e.target.value })} className="border p-2">
//           <option value="">All Issues</option>
//           {issuesMeta.map((i) => (
//             <option key={i.id} value={i.id}>{i.issue_number}</option>
//           ))}
//         </select>
//         <select value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="border p-2">
//           <option value="">All Years</option>
//           {years.map((y) => (<option key={y} value={y}>{y}</option>))}
//         </select>
//       </div>

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

//       <Dialog open={!!viewArticle} onClose={() => setViewArticle(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
//         <div className="bg-white p-4 sm:p-8 max-w-4xl w-full rounded shadow-lg overflow-y-auto max-h-[90vh] text-sm sm:text-base">
//           {viewArticle && (
//             <>
//               <div className="mb-2 text-xs text-gray-500">
//                 <span className="uppercase">Research Article</span> | <span className="text-green-700 font-medium">Open Access</span>
//                 {viewArticle.article_file_path && (
//                   <> · <a
//                     href={viewArticle.article_file_path.replace(/ /g, "-")}
//                     download
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="text-blue-600 underline"
//                   >
//                     Download Full Text
//                   </a></>
//                 )}
//               </div>

//               <h2 className="text-xl sm:text-2xl font-bold leading-snug mb-2 text-gray-900">{viewArticle.title}</h2>
//               <div className="text-gray-800 font-medium mb-3 text-sm sm:text-base">{viewArticle.authors.join(", ")}</div>

//               <div className="text-xs text-gray-600 mb-4">
//                 <strong>Volume</strong> {viewArticle.volume} | <strong>Issue</strong> {viewArticle.issue} | <strong>Year</strong> {viewArticle.year} | <strong>Article ID:</strong> {viewArticle.article_id} | <strong>DOI:</strong> <a href={`https://doi.org/${viewArticle.doi}`} target="_blank" className="text-blue-600 underline">https://doi.org/{viewArticle.doi}</a>
//               </div>

//               <div className="mb-4">
//                 <h4 className="font-semibold mb-1 text-gray-800">Citations:</h4>
//                 <p className="text-gray-700 text-sm sm:text-base">
//                   {viewArticle.authors.join(", ")} . "{viewArticle.title}" . <em>{getJournalName(viewArticle.journal_id)}</em>, vol. {viewArticle.volume}, no. {viewArticle.issue}, pp. {viewArticle.page_from}–{viewArticle.page_to}, {viewArticle.year}.
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 sm:grid-cols-4 text-center text-xs text-gray-700 mb-4 border divide-x rounded overflow-hidden">
//                 {["received", "revised", "accepted", "published"].map((key) => {
//                   const label = key[0].toUpperCase() + key.slice(1);
//                   const rawDate = viewArticle[`${key}_date`];
//                   const formattedDate = rawDate
//                     ? new Date(rawDate).toLocaleDateString("en-GB", {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                     })
//                     : "-";
//                   return (
//                     <div className="p-2" key={key}>
//                       <div className="font-medium">{label}</div>
//                       <div>{formattedDate}</div>
//                     </div>
//                   );
//                 })}
//               </div>
//               <div className="mb-4">
//                 <h4 className="font-semibold mb-1 text-gray-800">Abstract</h4>
//                 <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{viewArticle.abstract}</p>
//               </div>

//               <div className="mb-4">
//                 <h4 className="font-semibold mb-1 text-gray-800">Keywords</h4>
//                 <p className="text-gray-700 text-sm sm:text-base">{viewArticle.key_words.join(", ")}</p>
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
//                 <button onClick={() => setViewArticle(null)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded">Close</button>
//               </div>
//             </>
//           )}
//         </div>
//       </Dialog>
//     </div>
//   );
// }

// ✅ src/app/dashboard/journals/[journal-name]/archives/page.jsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from "@tanstack/react-table";
import { Dialog } from "@headlessui/react";

function safeParseArray(input) {
  try {
    const parsed = typeof input === "string" ? JSON.parse(input) : input;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Page() {
  const searchParams = useSearchParams();
  const jid = searchParams.get("jid");
  const router = useRouter();

  const [filters, setFilters] = useState({
    title: "",
    author: "",
    volume: "",
    issue: "",
    year: "",
    journal_id: "",
    article_id: "",
  });

  const [viewArticle, setViewArticle] = useState(null);
  const [journals, setJournals] = useState([]);
  const [volumesMeta, setVolumesMeta] = useState([]);
  const [issuesMeta, setIssuesMeta] = useState([]);

const { data: articles = [] } = useQuery({
  queryKey: ["articles", jid],
  queryFn: async () => {
    const res = await fetch(`/api/articles?journal_id=${jid}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.articles)) return [];
    return data.articles.map((a) => ({
      ...a,
  id: a.id,                     // numeric primary key
  article_id: a.article_id,     // string like DST-V1I1P1011
      title: a.article_title || "",
      authors: safeParseArray(a.authors),
      key_words: safeParseArray(a.keywords),

      // keep IDs for filtering; we'll render numbers via helpers
 volume: a.volume_number ? String(a.volume_number) : String(a.volume_id ?? ""),
 issue: a.issue_number ? String(a.issue_number) : String(a.issue_id ?? ""),
     year: a.year ? String(a.year) : "",   // 👈 use DB year from volumes

      article_file_path: a.pdf_path || "",
      received_date: a.received || "",
      revised_date: a.revised || "",
      accepted_date: a.accepted || "",
      published_date: a.published || "",
    }));
  },
  enabled: !!jid,
});
  const years = [...new Set(articles.map((a) => a.year).filter(Boolean))];

  // Volumes & Issues metadata
  useEffect(() => {
    const fetchMetaData = async () => {
      if (!jid) return;
      const [volumesRes, issuesRes] = await Promise.all([
        fetch(`/api/volume?journal_id=${jid}`),
        fetch(`/api/issues?journal_id=${jid}`),
      ]);
      const [volumesData, issuesData] = await Promise.all([volumesRes.json(), issuesRes.json()]);
      if (volumesData.success) setVolumesMeta(volumesData.volumes || []);
      if (issuesData.success) setIssuesMeta(issuesData.issues || []);
    };
    fetchMetaData();
  }, [jid]);

  // Journal name
  useEffect(() => {
    const fetchJournals = async () => {
      if (!jid) return;
      const res = await fetch(`/api/journals?id=${jid}`);
      const data = await res.json();
      if (data.success) setJournals(data.journals || []);
    };
    fetchJournals();
  }, [jid]);

  const getJournalName = (id) => {
    const journal = journals.find((j) => j.id === Number(id));
    return journal?.journal_name || "Journal Name";
  };

  // Helpers to translate IDs -> numbers
  const getVolumeName = (id) => {
    const v = volumesMeta.find((vv) => vv.id === Number(id));
    return v?.volume_number ?? id;
  };
  const getIssueName = (id) => {
    const i = issuesMeta.find((ii) => ii.id === Number(id));
    return i?.issue_number ?? id;
  };

  // Filtering (by title/author text & by volume/issue IDs, year, etc.)
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      return (
        a.title.toLowerCase().includes(filters.title.toLowerCase()) &&
        a.authors.join(", ").toLowerCase().includes(filters.author.toLowerCase()) &&
        (filters.volume ? a.volume === filters.volume : true) &&
        (filters.issue ? a.issue === filters.issue : true) &&
        (filters.year ? a.year === filters.year : true) &&
        (filters.journal_id ? String(a.journal_id) === filters.journal_id : true) &&
        (filters.article_id ? String(a.article_id).toLowerCase().includes(filters.article_id.toLowerCase()) : true)
      );
    });
  }, [articles, filters]);

  // Table columns — show volume/issue numbers in UI
  const columns = useMemo(
    () => [
      { header: "Article ID", accessorKey: "article_id" },
      {
        header: "Journal Name",
        accessorKey: "journal_id",
        cell: (info) => getJournalName(info.getValue()),
      },
      { header: "Title", accessorKey: "title" },
      { header: "Authors", accessorKey: "authors", cell: (info) => info.getValue().join(", ") },
      { header: "Keywords", accessorKey: "key_words", cell: (info) => info.getValue().join(", ") },
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
      { header: "DOI", accessorKey: "doi" },
    {
  header: "Actions",
  cell: ({ row }) => (
    <div className="space-x-2">
      <button
        onClick={() => setViewArticle(row.original)}
        className="text-blue-600"
      >
        View
      </button>

      <button
        onClick={() => {
          const { id, article_id, journal_id } = row.original;
          // 👇 compute here
          const journalCode = String(article_id || "").split("-")[0] || "journal";
          const qs = id
            ? `id=${encodeURIComponent(id)}`
            : `article_id=${encodeURIComponent(article_id)}`;

          setViewArticle(null); // close modal
          router.push(
            `/admin/dashboard/journals/${journalCode}/article?jid=${encodeURIComponent(
              journal_id
            )}&edit=1&${qs}`
          );
        }}
        className="text-green-600"
      >
        Edit
      </button>

   <button
  onClick={() => handleDelete(row.original.id)}   // ✅ numeric DB id
  className="text-red-600"
>
  Delete
</button>

    </div>
  ),
},
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({
    data: filteredArticles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

const handleDelete = async (id) => {
  const confirmed = window.confirm("Are you sure you want to delete this article?");
  if (!confirmed) return;

  try {
    const res = await fetch(`/api/articles?id=${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok || !data.success) throw new Error(data.message || "Failed to delete");

    // ✅ remove by numeric id
    table.options.data = table.options.data.filter((a) => a.id !== id);

    alert("Article deleted successfully.");
  } catch (err) {
    console.error("Delete error:", err);
    alert(err.message || "Something went wrong.");
  }
};


  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Page Here! Articles for Journal #{jid} - {getJournalName(jid)}
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <input
          placeholder="Search Title"
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
          className="border p-2"
        />
        <input
          placeholder="Search Author"
          value={filters.author}
          onChange={(e) => setFilters({ ...filters, author: e.target.value })}
          className="border p-2"
        />
        <input
          placeholder="Search Article ID"
          value={filters.article_id}
          onChange={(e) => setFilters({ ...filters, article_id: e.target.value })}
          className="border p-2"
        />

        <select
          value={filters.volume}
          onChange={(e) => setFilters({ ...filters, volume: e.target.value })}
          className="border p-2"
        >
          <option value="">All Volumes</option>
          {volumesMeta.map((v) => (
            <option key={v.id} value={v.id}>
              {v.volume_number}
            </option>
          ))}
        </select>

        <select
          value={filters.issue}
          onChange={(e) => setFilters({ ...filters, issue: e.target.value })}
          className="border p-2"
        >
          <option value="">All Issues</option>
          {issuesMeta.map((i) => (
            <option key={i.id} value={i.id}>
              {i.issue_number}
            </option>
          ))}
        </select>

        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="border p-2"
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-2 text-left">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-2">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Dialog
        open={!!viewArticle}
        onClose={() => setViewArticle(null)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <div className="bg-white p-4 sm:p-8 max-w-4xl w-full rounded shadow-lg overflow-y-auto max-h-[90vh] text-sm sm:text-base">
          {viewArticle && (
            <>
              <div className="mb-2 text-xs text-gray-500">
                <span className="uppercase">Research Article</span> |{" "}
                <span className="text-green-700 font-medium">Open Access</span>
                {viewArticle.article_file_path && (
                  <>
                    {" "}
                    ·{" "}
                    <a
                      href={viewArticle.article_file_path.replace(/ /g, "-")}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Download Full Text
                    </a>
                  </>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold leading-snug mb-2 text-gray-900">
                {viewArticle.title}
              </h2>
              <div className="text-gray-800 font-medium mb-3 text-sm sm:text-base">
                {viewArticle.authors.join(", ")}
              </div>

              {/* ✅ Show numbers (not IDs) using helpers */}
              <div className="text-xs text-gray-600 mb-4">
                <strong>Volume</strong> {getVolumeName(viewArticle.volume)} |{" "}
                <strong>Issue</strong> {getIssueName(viewArticle.issue)} |{" "}
                <strong>Year</strong> {viewArticle.year} | <strong>Article ID:</strong>{" "}
                {viewArticle.article_id}
                {viewArticle.doi ? (
                  <>
                    {" "}
                    | <strong>DOI:</strong>{" "}
                    <a
                      href={`https://doi.org/${viewArticle.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      https://doi.org/{viewArticle.doi}
                    </a>
                  </>
                ) : null}
              </div>

              {/* ✅ Citation line with numbers */}
              <div className="mb-4">
                <h4 className="font-semibold mb-1 text-gray-800">Citations:</h4>
                <p className="text-gray-700 text-sm sm:text-base">
                  {viewArticle.authors.join(", ")}. "{viewArticle.title}".{" "}
                  <em>{getJournalName(viewArticle.journal_id)}</em>, vol.{" "}
                  {getVolumeName(viewArticle.volume)}, no. {getIssueName(viewArticle.issue)}, pp.{" "}
                  {viewArticle.page_from}–{viewArticle.page_to}, {viewArticle.year}.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 text-center text-xs text-gray-700 mb-4 border divide-x rounded overflow-hidden">
                {["received", "revised", "accepted", "published"].map((key) => {
                  const label = key[0].toUpperCase() + key.slice(1);
                  const rawDate = viewArticle[`${key}_date`];
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";
                  return (
                    <div className="p-2" key={key}>
                      <div className="font-medium">{label}</div>
                      <div>{formattedDate}</div>
                    </div>
                  );
                })}
              </div>

        <div className="mb-4">
  <h4 className="font-semibold mb-1 text-gray-800">Abstract</h4>
  <div
    // className="  prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base"
    className="text-gray-700 leading-relaxed text-sm sm:text-base"
    dangerouslySetInnerHTML={{ __html: viewArticle.abstract }}
  />
</div>

              <div className="mb-4">
                <h4 className="font-semibold mb-1 text-gray-800">Keywords</h4>
                <p className="text-gray-700 text-sm sm:text-base">
                  {viewArticle.key_words.join(", ")}
                </p>
              </div>

              {viewArticle.references && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-1 text-gray-800">References</h4>
                  <div
                    className="space-y-1 text-gray-700 text-xs sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: viewArticle.references }}
                  />
                </div>
              )}

              <div className="text-right mt-5">
                <button
                  onClick={() => setViewArticle(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded"
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
