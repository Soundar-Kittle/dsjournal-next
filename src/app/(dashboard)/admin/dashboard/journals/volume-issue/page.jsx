// "use client";

// import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import * as Tabs from "@radix-ui/react-tabs";
// import { toast } from "sonner";
// import axios from "axios";

// export default function VolumeIssuePage() {
//   const [volumes, setVolumes] = useState([]);
//   const [issues, setIssues] = useState([]);
//   const [journals, setJournals] = useState([]);
//   const [jid, setJid] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });

//   const [formVolume, setFormVolume] = useState({
//     journal_id: "",
//     volume_label: "",
//     alias_name: "",
//     year: "",
//   });

//   const [formIssue, setFormIssue] = useState({
//     journal_id: "",
//     issue_label: "",
//     alias_name: "",
//     year: "",
//   });

//   const [editVolumeId, setEditVolumeId] = useState(null);
//   const [editIssueId, setEditIssueId] = useState(null);

//   useEffect(() => {
//     fetchJournals();
//   }, []);

//   useEffect(() => {
//     if (jid) {
//       fetchVolumes(jid, pagination.page, pagination.limit);
//       fetchIssues(jid);
//     }
//   }, [jid, pagination.page]);

//   const fetchJournals = async () => {
//     const res = await fetch("/api/journals");
//     const data = await res.json();
//     if (data.success) setJournals(data.journals);
//   };

//   const fetchVolumes = async (journal_id, page = 1, limit = 10) => {
//     const res = await fetch(
//       `/api/volume-issue?type=volume&journal_id=${journal_id}&page=${page}&limit=${limit}&year=${selectedYear}`
//     );
//     const data = await res.json();
//     if (data.success) {
//       setVolumes(data.data || []);
//       setPagination((prev) => ({
//         ...prev,
//         totalPages: data.pagination.totalPages,
//       }));
//     }
//   };

//   const fetchIssues = async (journal_id) => {
//     const res = await fetch(`/api/volume-issue?type=issue&journal_id=${journal_id}&year=${selectedYear}`);
//     const data = await res.json();
//     if (data.success) setIssues(data.data || []);
//   };

//   const handleAddVolume = async () => {
//     if (!formVolume.volume_label || !formVolume.year) {
//       return toast.error("Volume label and year are required");
//     }
//     const url = "/api/volume-issue";
//     const method = editVolumeId ? axios.patch : axios.post;
//     const payload = editVolumeId ? { ...formVolume, id: editVolumeId, type: "volume" } : { ...formVolume, type: "volume" };

//     const res = await method(url, payload);
//     if (res.data.success) {
//       toast.success(`Volume ${editVolumeId ? "updated" : "added"} successfully`);
//       setFormVolume({ journal_id: jid, volume_label: "", alias_name: "", year: "" });
//       setEditVolumeId(null);
//       fetchVolumes(jid, pagination.page, pagination.limit);
//     }
//   };

//   const handleAddIssue = async () => {
//     if (!formIssue.issue_label || !formIssue.year) {
//       return toast.error("Issue label and year are required");
//     }
//     const url = "/api/volume-issue";
//     const method = editIssueId ? axios.patch : axios.post;
//     const payload = editIssueId ? { ...formIssue, id: editIssueId, type: "issue" } : { ...formIssue, type: "issue" };

//     const res = await method(url, payload);
//     if (res.data.success) {
//       toast.success(`Issue ${editIssueId ? "updated" : "added"} successfully`);
//       setFormIssue({ journal_id: jid, issue_label: "", alias_name: "", year: "" });
//       setEditIssueId(null);
//       fetchIssues(jid);
//     }
//   };

//   const handleDelete = async (id, type) => {
//     const res = await axios.delete(`/api/volume-issue?id=${id}&type=${type}`);
//     if (res.data.success) {
//       toast.success(`${type} deleted`);
//       if (type === "volume") fetchVolumes(jid, pagination.page, pagination.limit);
//       else fetchIssues(jid);
//     }
//   };

//   const handleEdit = (item, type) => {
//     if (type === "volume") {
//       setFormVolume({ journal_id: item.journal_id, volume_label: item.volume_label, alias_name: item.alias_name, year: item.year });
//       setEditVolumeId(item.id);
//     } else {
//       setFormIssue({ journal_id: item.journal_id, issue_label: item.issue_label, alias_name: item.alias_name, year: item.year });
//       setEditIssueId(item.id);
//     }
//   };

//   const handleJournalSelect = (id) => {
//     setJid(id);
//     setFormVolume({ journal_id: id, volume_label: "", alias_name: "", year: "" });
//     setFormIssue({ journal_id: id, issue_label: "", alias_name: "", year: "" });
//   };

//   return (
//     <div className="p-6">
//       <div className="flex gap-4 mb-4">
//         <select
//           className="border p-2 w-full max-w-sm"
//           value={jid}
//           onChange={(e) => handleJournalSelect(e.target.value)}
//         >
//           <option value="">Select Journal</option>
//           {journals.map((j) => (
//             <option key={j.id} value={j.id}>
//               {j.journal_name}
//             </option>
//           ))}
//         </select>
//         <Input
//           type="number"
//           placeholder="Filter by Year"
//           className="w-40"
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//         />
//         <Button onClick={() => { fetchVolumes(jid, pagination.page, pagination.limit); fetchIssues(jid); }}>Apply</Button>
//       </div>

//       <Tabs.Root defaultValue="volume" className="space-y-4">
//         <Tabs.List className="flex gap-2">
//           <Tabs.Trigger
//             value="volume"
//             className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
//           >
//             Volume
//           </Tabs.Trigger>
//           <Tabs.Trigger
//             value="issue"
//             className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
//           >
//             Issue
//           </Tabs.Trigger>
//         </Tabs.List>

//         <Tabs.Content value="volume">
//           <Card className="mb-4">
//             <CardHeader>
//               <CardTitle>{editVolumeId ? "Edit Volume" : "Add Volume"}</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <Input placeholder="Volume Label" value={formVolume.volume_label} onChange={(e) => setFormVolume({ ...formVolume, volume_label: e.target.value })} />
//               <Input placeholder="Alias Name" value={formVolume.alias_name} onChange={(e) => setFormVolume({ ...formVolume, alias_name: e.target.value })} />
//               <Input placeholder="Year" type="number" value={formVolume.year} onChange={(e) => setFormVolume({ ...formVolume, year: e.target.value })} />
//               <Button onClick={handleAddVolume}>{editVolumeId ? "Update" : "Add"} Volume</Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Volume List</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {volumes.length ? (
//                 <ul className="list-disc pl-6 space-y-1">
//                   {volumes.map((v) => (
//                     <li key={v.id} className="flex justify-between gap-2">
//                       <span>
//                         <strong>{v.volume_label}</strong> ({v.year}) — <em>{v.alias_name}</em>
//                       </span>
//                       <span className="flex gap-1">
//                         <Button variant="outline" size="sm" onClick={() => handleEdit(v, "volume")}>Edit</Button>
//                         <Button variant="destructive" size="sm" onClick={() => handleDelete(v.id, "volume")}>Delete</Button>
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-gray-500">No volumes available.</p>
//               )}
//             </CardContent>
//           </Card>
//         </Tabs.Content>

//         <Tabs.Content value="issue">
//           <Card className="mb-4">
//             <CardHeader>
//               <CardTitle>{editIssueId ? "Edit Issue" : "Add Issue"}</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <Input placeholder="Issue Label" value={formIssue.issue_label} onChange={(e) => setFormIssue({ ...formIssue, issue_label: e.target.value })} />
//               <Input placeholder="Alias Name" value={formIssue.alias_name} onChange={(e) => setFormIssue({ ...formIssue, alias_name: e.target.value })} />
//               <Input placeholder="Year" type="number" value={formIssue.year} onChange={(e) => setFormIssue({ ...formIssue, year: e.target.value })} />
//               <Button onClick={handleAddIssue}>{editIssueId ? "Update" : "Add"} Issue</Button>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle>Issue List</CardTitle>
//             </CardHeader>
//             <CardContent>
//               {issues.length ? (
//                 <ul className="list-disc pl-6 space-y-1">
//                   {issues.map((i) => (
//                     <li key={i.id} className="flex justify-between gap-2">
//                       <span>
//                         <strong>{i.issue_label}</strong> — <em>{i.alias_name}</em> ({i.year})
//                       </span>
//                       <span className="flex gap-1">
//                         <Button variant="outline" size="sm" onClick={() => handleEdit(i, "issue")}>Edit</Button>
//                         <Button variant="destructive" size="sm" onClick={() => handleDelete(i.id, "issue")}>Delete</Button>
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-sm text-gray-500">No issues available.</p>
//               )}
//             </CardContent>
//           </Card>
//         </Tabs.Content>
//       </Tabs.Root>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import * as Tabs from "@radix-ui/react-tabs";
// import { toast } from "sonner";
// import axios from "axios";

// export default function VolumeIssuePage() {
//   const [journals, setJournals] = useState([]);
//   const [issues, setIssues] = useState([]);
//   const [activeTab, setActiveTab] = useState("volume");

//   const [volumeForm, setVolumeForm] = useState({
//     journal_id: "",
//     volume_number: "",
//     volume_label: "",
//     alias_name: "",
//     year: ""
//   });

//   const [issueForm, setIssueForm] = useState({
//     journal_id: "",
//     issue_number: "",
//     issue_label: "",
//     alias_name_issue: "",
//     year: ""
//   });

//   const [monthForm, setMonthForm] = useState({
//     journal_id: "",
//     issue_id: "",
//     from_month: "",
//     to_month: ""
//   });

//   const fetchJournals = async () => {
//     const res = await fetch("/api/journals");
//     const data = await res.json();
//     if (data.success) setJournals(data.journals);
//   };

//   const fetchIssues = async (journalId) => {
//     try {
//       const res = await fetch(`/api/issues?journal_id=${journalId}`);
//       const data = await res.json();
//       if (data.success) setIssues(data.issues);
//     } catch (err) {
//       console.error("Failed to load issues:", err);
//     }
//   };

//   useEffect(() => {
//     fetchJournals();
//   }, []);

//   const handleVolumeSubmit = async () => {
//     const { journal_id, volume_number, volume_label, year } = volumeForm;
//     if (!journal_id || !volume_number || !volume_label || !year)
//       return toast.error("All volume fields are required");

//     try {
//       const res = await axios.post("/api/volume", volumeForm);
//       toast.success(res.data.message);
//       setVolumeForm({ journal_id: "", volume_number: "", volume_label: "", alias_name: "", year: "" });
//     } catch (error) {
//       if (error.response?.status === 409) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error("Failed to add volume");
//       }
//     }
//   };

//   const handleIssueSubmit = async () => {
//     const { journal_id, issue_number, issue_label} = issueForm;
//     if (!journal_id || !issue_number || !issue_label)
//       return toast.error("All issue fields are required");

//     try {
//       const res = await axios.post("/api/issues", issueForm);
//       toast.success(res.data.message);
//       fetchIssues(issueForm.journal_id);
//       setIssueForm({
//         journal_id: "",
//         issue_number: "",
//         issue_label: "",
//         alias_name_issue: ""
//       });
//     } catch (error) {
//       if (error.response?.status === 409) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error("Failed to add issue");
//       }
//     }
//   };

//   const handleMonthSubmit = async () => {
//     const { journal_id, issue_id, from_month } = monthForm;
//     if (!journal_id || !issue_id || !from_month) return toast.error("Journal, issue, and from month are required");

//     try {
//       const res = await axios.post("/api/month-groups", monthForm);
//       toast.success(res.data.message);
//       setMonthForm({ journal_id: "", issue_id: "", from_month: "", to_month: "" });
//       if (monthForm.journal_id) fetchIssues(monthForm.journal_id);
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to add month");
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "month") {
//       const journalId = volumeForm.journal_id || issueForm.journal_id || journals[0]?.id;
//       if (journalId) fetchIssues(journalId);
//     }
//   }, [activeTab]);

//   const monthOptions = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];

//   return (
//     <div className="p-6 max-w-3xl mx-auto space-y-8">
//       <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//         <Tabs.List className="flex gap-2">
//           <Tabs.Trigger value="volume" className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Volume</Tabs.Trigger>
//           <Tabs.Trigger value="issue" className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Issue</Tabs.Trigger>
//           <Tabs.Trigger value="month" className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Month</Tabs.Trigger>
//         </Tabs.List>

//         <Tabs.Content value="volume">
//           <Card>
//             <CardHeader><CardTitle>Add Volume</CardTitle></CardHeader>
//             <CardContent className="space-y-2">
//               <select name="journal_id" className="border p-2 w-full" value={volumeForm.journal_id} onChange={e => setVolumeForm({ ...volumeForm, journal_id: e.target.value })}>
//                 <option value="">Select Journal</option>
//                 {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
//               </select>
//               <Input name="volume_number" placeholder="Volume Number" type="number" value={volumeForm.volume_number} onChange={e => setVolumeForm({ ...volumeForm, volume_number: e.target.value })} />
//               <Input name="volume_label" placeholder="Volume Label" value={volumeForm.volume_label} onChange={e => setVolumeForm({ ...volumeForm, volume_label: e.target.value })} />
//               <Input name="alias_name" placeholder="Alias Name (Volume)" value={volumeForm.alias_name} onChange={e => setVolumeForm({ ...volumeForm, alias_name: e.target.value })} />
//               <Input name="year" placeholder="Year" type="number" value={volumeForm.year} onChange={e => setVolumeForm({ ...volumeForm, year: e.target.value })} />
//               <Button onClick={handleVolumeSubmit}>Add Volume</Button>
//             </CardContent>
//           </Card>
//         </Tabs.Content>

//         <Tabs.Content value="issue">
//           <Card>
//             <CardHeader><CardTitle>Add Issue</CardTitle></CardHeader>
//             <CardContent className="space-y-2">
//               <select name="journal_id" className="border p-2 w-full" value={issueForm.journal_id} onChange={e => setIssueForm({ ...issueForm, journal_id: e.target.value })}>
//                 <option value="">Select Journal</option>
//                 {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
//               </select>
//               <Input name="issue_number" placeholder="Issue Number" type="number" value={issueForm.issue_number} onChange={e => setIssueForm({ ...issueForm, issue_number: e.target.value })} />
//               <Input name="issue_label" placeholder="Issue Label" value={issueForm.issue_label} onChange={e => setIssueForm({ ...issueForm, issue_label: e.target.value })} />
//               <Input name="alias_name_issue" placeholder="Alias Name (Issue)" value={issueForm.alias_name_issue} onChange={e => setIssueForm({ ...issueForm, alias_name_issue: e.target.value })} />
//               <Button onClick={handleIssueSubmit}>Add Issue</Button>
//             </CardContent>
//           </Card>
//         </Tabs.Content>

//    <Tabs.Content value="month">
//   <Card>
//     <CardHeader><CardTitle>Add Month Group</CardTitle></CardHeader>
//     <CardContent className="space-y-2">

//       {/* 🔹 Select Journal */}
//       <select
//         name="journal_id"
//         className="border p-2 w-full"
//         value={monthForm.journal_id}
//         onChange={async (e) => {
//           const journal_id = e.target.value;
//           setMonthForm({ ...monthForm, journal_id, issue_id: "" });
//           await fetchIssues(journal_id);
//         }}
//       >
//         <option value="">Select Journal</option>
//         {journals.map(j => (
//           <option key={j.id} value={j.id}>{j.journal_name}</option>
//         ))}
//       </select>

//       {/* 🔹 Select Issue (filtered by journal_id) */}
//       <select
//         name="issue_id"
//         className="border p-2 w-full"
//         value={monthForm.issue_id}
//         onChange={e => setMonthForm({ ...monthForm, issue_id: e.target.value })}
//       >
//         <option value="">Select Issue</option>
//         {issues.map(i => (
//           <option key={i.id} value={i.id}>
//             Issue {i.issue_number} ({i.issue_label})
//           </option>
//         ))}
//       </select>

//       {/* 🔹 Select From Month */}
//       <select
//         name="from_month"
//         className="border p-2 w-full"
//         value={monthForm.from_month}
//         onChange={e => setMonthForm({ ...monthForm, from_month: e.target.value })}
//       >
//         <option value="">Select From Month</option>
//         {monthOptions.map(month => (
//           <option key={month} value={month}>{month}</option>
//         ))}
//       </select>

//       {/* 🔹 Select To Month */}
//       <select
//         name="to_month"
//         className="border p-2 w-full"
//         value={monthForm.to_month}
//         onChange={e => setMonthForm({ ...monthForm, to_month: e.target.value })}
//       >
//         <option value="">Select To Month (optional)</option>
//         {monthOptions.map(month => (
//           <option key={month} value={month}>{month}</option>
//         ))}
//       </select>

//       <Button onClick={handleMonthSubmit}>Add Month</Button>
//     </CardContent>
//   </Card>
// </Tabs.Content>

//       </Tabs.Root>
//     </div>
//   );
// }


// "use client";

// import { useEffect, useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import * as Tabs from "@radix-ui/react-tabs";
// import { toast } from "sonner";
// import axios from "axios";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { Pencil } from "lucide-react";

// export default function VolumeIssuePage() {
//   const [journals, setJournals] = useState([]);
//   const [issues, setIssues] = useState([]);
//   const [activeTab, setActiveTab] = useState("volume");

  
// const [editingRow, setEditingRow] = useState(null);  // row data
// const [editType, setEditType] = useState("");        // "volume" | "issue" | "month"
// const [editForm, setEditForm] = useState({});

//   // forms
//   const [volumeForm, setVolumeForm] = useState({
//     journal_id: "", volume_number: "", volume_label: "", alias_name: "", year: ""
//   });
//   const [issueForm, setIssueForm] = useState({
//     journal_id: "", issue_number: "", issue_label: "", alias_name_issue: "", year: ""
//   });
//   const [monthForm, setMonthForm] = useState({
//     journal_id: "", issue_id: "", from_month: "", to_month: ""
//   });

//   // --- Summary area (separate, below forms) ---
//   const [summaryJournalId, setSummaryJournalId] = useState("");
//   const [volumesList, setVolumesList] = useState([]);
//   const [summaryIssues, setSummaryIssues] = useState([]);
//   const [monthGroupsByIssue, setMonthGroupsByIssue] = useState({}); // { [issueId]: [...] }

//   // data fetchers
//   const fetchJournals = async () => {
//     const res = await fetch("/api/journals");
//     const data = await res.json();
//     if (data.success) setJournals(data.journals);
//   };

//   const fetchIssues = async (journalId) => {
//     try {
//       const res = await fetch(`/api/issues?journal_id=${journalId}`);
//       const data = await res.json();
//       if (data.success) setIssues(data.issues);
//     } catch (e) { console.error(e); }
//   };

//   // summary helpers
//   const fetchSummaryVolumes = async (journalId, year = "") => {
//     try {
//       const url = year
//         ? `/api/volume?journal_id=${journalId}&year=${year}`
//         : `/api/volume?journal_id=${journalId}`;
//       const res = await fetch(url);
//       const data = await res.json();
//       setVolumesList(data.success ? (data.volumes || []) : []);
//     } catch { setVolumesList([]); }
//   };

//   const fetchSummaryIssues = async (journalId) => {
//     try {
//       const res = await fetch(`/api/issues?journal_id=${journalId}`);
//       const data = await res.json();
//       const list = data.success ? (data.issues || []) : [];
//       setSummaryIssues(list);
//       return list;
//     } catch {
//       setSummaryIssues([]); return [];
//     }
//   };

//   const fetchAllMonthGroups = async (journalId, issuesArr) => {
//     const map = {};
//     await Promise.all(
//       (issuesArr || []).map(async (it) => {
//         try {
//           const res = await fetch(`/api/month-groups?journal_id=${journalId}&issue_id=${it.id}`);
//           const data = await res.json();
//           map[it.id] = data.success ? (data.months || []) : [];
//         } catch { map[it.id] = []; }
//       })
//     );
//     setMonthGroupsByIssue(map);
//   };

//   const loadJournalSummary = async (journalId) => {
//     if (!journalId) {
//       setVolumesList([]); setSummaryIssues([]); setMonthGroupsByIssue({});
//       return;
//     }
//     await fetchSummaryVolumes(journalId);
//     const iss = await fetchSummaryIssues(journalId);
//     await fetchAllMonthGroups(journalId, iss);
//   };

//   // init journals + default summary filter
//   useEffect(() => { fetchJournals(); }, []);
//   useEffect(() => {
//     if (journals.length && !summaryJournalId) {
//       const first = String(journals[0].id);
//       setSummaryJournalId(first);
//       loadJournalSummary(first);
//     }
//   }, [journals]); // eslint-disable-line

//   // --- submit handlers ---
//   const handleVolumeSubmit = async () => {
//     const { journal_id, volume_number, volume_label, year } = volumeForm;
//     if (!journal_id || !volume_number || !volume_label || !year)
//       return toast.error("All volume fields are required");
//     try {
//       const res = await axios.post("/api/volume", volumeForm);
//       toast.success(res.data.message);
//       setVolumeForm({ journal_id: "", volume_number: "", volume_label: "", alias_name: "", year: "" });
//       // refresh separate summary if it’s the same journal
//       if (summaryJournalId && String(summaryJournalId) === String(journal_id)) {
//         await loadJournalSummary(summaryJournalId);
//       }
//     } catch (error) {
//       if (error.response?.status === 409) toast.error(error.response.data.message);
//       else toast.error("Failed to add volume");
//     }
//   };

//   const handleIssueSubmit = async () => {
//     const { journal_id, issue_number, issue_label } = issueForm;
//     if (!journal_id || !issue_number || !issue_label)
//       return toast.error("All issue fields are required");
//     try {
//       const res = await axios.post("/api/issues", issueForm);
//       toast.success(res.data.message);
//       await fetchIssues(issueForm.journal_id); // form tab list
//       setIssueForm({ journal_id: "", issue_number: "", issue_label: "", alias_name_issue: "" });
//       if (summaryJournalId && String(summaryJournalId) === String(journal_id)) {
//         await loadJournalSummary(summaryJournalId);
//       }
//     } catch (error) {
//       if (error.response?.status === 409) toast.error(error.response.data.message);
//       else toast.error("Failed to add issue");
//     }
//   };

//   const handleMonthSubmit = async () => {
//     const { journal_id, issue_id, from_month } = monthForm;
//     if (!journal_id || !issue_id || !from_month)
//       return toast.error("Journal, issue, and from month are required");
//     try {
//       const res = await axios.post("/api/month-groups", monthForm);
//       toast.success(res.data.message);
//       setMonthForm({ journal_id: "", issue_id: "", from_month: "", to_month: "" });
//       if (summaryJournalId && String(summaryJournalId) === String(journal_id)) {
//         await loadJournalSummary(summaryJournalId);
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to add month");
//     }
//   };


//   const handleSave = async () => {
//   try {
//     let url = "";
//     if (editType === "volume") url = "/api/volume";
//     if (editType === "issue") url = "/api/issues";
//     if (editType === "month") url = "/api/month-groups";

//     await axios.put(url, { ...editForm, type: editType });
//     toast.success(`${editType} updated successfully`);

//     setEditingRow(null);
//     await loadJournalSummary(summaryJournalId); // refresh table
//   } catch (err) {
//     toast.error("Update failed");
//   }
// };

//   const monthOptions = [
//     "January","February","March","April","May","June",
//     "July","August","September","October","November","December"
//   ];

//   return (
//     <div className="p-6 max-w-4xl mx-auto space-y-8">
//       {/* ===================== Forms in Tabs ===================== */}
//       <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
//         <Tabs.List className="flex gap-2">
//           <Tabs.Trigger value="volume" className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Volume</Tabs.Trigger>
//           <Tabs.Trigger value="issue"  className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Issue</Tabs.Trigger>
//           <Tabs.Trigger value="month"  className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Month</Tabs.Trigger>
//         </Tabs.List>

//         {/* Volume tab */}
//         <Tabs.Content value="volume">
//           <Card>
//             <CardHeader><CardTitle>Add Volume</CardTitle></CardHeader>
//             <CardContent className="space-y-2">
//               <select className="border p-2 w-full"
//                 value={volumeForm.journal_id}
//                 onChange={e => setVolumeForm({ ...volumeForm, journal_id: e.target.value })}
//               >
//                 <option value="">Select Journal</option>
//                 {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
//               </select>
//               <Input placeholder="Volume Number" type="number" value={volumeForm.volume_number}
//                 onChange={e => setVolumeForm({ ...volumeForm, volume_number: e.target.value })}/>
//               <Input placeholder="Volume Label" value={volumeForm.volume_label}
//                 onChange={e => setVolumeForm({ ...volumeForm, volume_label: e.target.value })}/>
//               <Input placeholder="Alias Name (Volume)" value={volumeForm.alias_name}
//                 onChange={e => setVolumeForm({ ...volumeForm, alias_name: e.target.value })}/>
//               <Input placeholder="Year" type="number" value={volumeForm.year}
//                 onChange={e => setVolumeForm({ ...volumeForm, year: e.target.value })}/>
//               <Button onClick={handleVolumeSubmit}>Add Volume</Button>
//             </CardContent>
//           </Card>
//         </Tabs.Content>

//         {/* Issue tab */}
//         <Tabs.Content value="issue">
//           <Card>
//             <CardHeader><CardTitle>Add Issue</CardTitle></CardHeader>
//             <CardContent className="space-y-2">
//               <select className="border p-2 w-full"
//                 value={issueForm.journal_id}
//                 onChange={e => setIssueForm({ ...issueForm, journal_id: e.target.value })}
//               >
//                 <option value="">Select Journal</option>
//                 {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
//               </select>
//               <Input placeholder="Issue Number" type="number" value={issueForm.issue_number}
//                 onChange={e => setIssueForm({ ...issueForm, issue_number: e.target.value })}/>
//               <Input placeholder="Issue Label" value={issueForm.issue_label}
//                 onChange={e => setIssueForm({ ...issueForm, issue_label: e.target.value })}/>
//               <Input placeholder="Alias Name (Issue)" value={issueForm.alias_name_issue}
//                 onChange={e => setIssueForm({ ...issueForm, alias_name_issue: e.target.value })}/>
//               <Button onClick={handleIssueSubmit}>Add Issue</Button>
//             </CardContent>
//           </Card>
//         </Tabs.Content>

//         {/* Month tab (form only) */}
//         <Tabs.Content value="month">
//           <Card>
//             <CardHeader><CardTitle>Add Month Group</CardTitle></CardHeader>
//             <CardContent className="space-y-2">
//               <select className="border p-2 w-full"
//                 value={monthForm.journal_id}
//                 onChange={async (e) => {
//                   const journal_id = e.target.value;
//                   setMonthForm({ ...monthForm, journal_id, issue_id: "" });
//                   // also preload issues for the month form dropdown
//                   if (journal_id) {
//                     const res = await fetch(`/api/issues?journal_id=${journal_id}`);
//                     const data = await res.json();
//                     if (data.success) setIssues(data.issues || []);
//                     else setIssues([]);
//                   } else {
//                     setIssues([]);
//                   }
//                 }}
//               >
//                 <option value="">Select Journal</option>
//                 {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
//               </select>

//               <select className="border p-2 w-full"
//                 value={monthForm.issue_id}
//                 onChange={e => setMonthForm({ ...monthForm, issue_id: e.target.value })}
//               >
//                 <option value="">Select Issue</option>
//                 {issues.map(i => (
//                   <option key={i.id} value={i.id}>Issue {i.issue_number} ({i.issue_label})</option>
//                 ))}
//               </select>

//               <select className="border p-2 w-full"
//                 value={monthForm.from_month}
//                 onChange={e => setMonthForm({ ...monthForm, from_month: e.target.value })}
//               >
//                 <option value="">Select From Month</option>
//                 {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
//               </select>

//               <select className="border p-2 w-full"
//                 value={monthForm.to_month}
//                 onChange={e => setMonthForm({ ...monthForm, to_month: e.target.value })}
//               >
//                 <option value="">Select To Month (optional)</option>
//                 {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
//               </select>

//               <Button onClick={handleMonthSubmit}>Add Month</Button>
//             </CardContent>
//           </Card>
//         </Tabs.Content>
//       </Tabs.Root>


//       {editingRow && (
//   <Dialog open onOpenChange={() => setEditingRow(null)}>
//     <DialogContent>
//       <DialogHeader>
//         <DialogTitle>Edit {editType}</DialogTitle>
//       </DialogHeader>

//       <div className="space-y-2">
//         {editType === "volume" && (
//           <>
//             <Input value={editForm.volume_number} onChange={e => setEditForm({ ...editForm, volume_number: e.target.value })} placeholder="Volume Number"/>
//             <Input value={editForm.volume_label} onChange={e => setEditForm({ ...editForm, volume_label: e.target.value })} placeholder="Volume Label"/>
//             <Input value={editForm.alias_name} onChange={e => setEditForm({ ...editForm, alias_name: e.target.value })} placeholder="Alias"/>
//             <Input value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} placeholder="Year"/>
//           </>
//         )}

//         {editType === "issue" && (
//           <>
//             <Input value={editForm.issue_number} onChange={e => setEditForm({ ...editForm, issue_number: e.target.value })} placeholder="Issue Number"/>
//             <Input value={editForm.issue_label} onChange={e => setEditForm({ ...editForm, issue_label: e.target.value })} placeholder="Issue Label"/>
//             <Input value={editForm.alias_name} onChange={e => setEditForm({ ...editForm, alias_name: e.target.value })} placeholder="Alias"/>
//           </>
//         )}

//         {editType === "month" && (
//           <>
//             <select
//               className="border p-2 w-full"
//               value={editForm.from_month}
//               onChange={e => setEditForm({ ...editForm, from_month: e.target.value })}
//             >
//               {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
//             </select>

//             <select
//               className="border p-2 w-full"
//               value={editForm.to_month}
//               onChange={e => setEditForm({ ...editForm, to_month: e.target.value })}
//             >
//               <option value="">Select To Month (optional)</option>
//               {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
//             </select>
//           </>
//         )}
//       </div>

//       <DialogFooter>
//         <Button onClick={handleSave}>Save</Button>
//         <Button variant="outline" onClick={() => setEditingRow(null)}>Cancel</Button>
//       </DialogFooter>
//     </DialogContent>
//   </Dialog>
// )}

//       {/* ===================== Separate Summary Section ===================== */}
//       <Card>
//         <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <CardTitle>Journal Summary</CardTitle>
//           <div className="flex gap-2 items-center">
//             <select
//               className="border p-2"
//               value={summaryJournalId}
//               onChange={async (e) => {
//                 const id = e.target.value;
//                 setSummaryJournalId(id);
//                 await loadJournalSummary(id);
//               }}
//             >
//               <option value="">Select Journal</option>
//               {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
//             </select>
//             <Button variant="outline" onClick={() => loadJournalSummary(summaryJournalId)} disabled={!summaryJournalId}>
//               Refresh
//             </Button>
//           </div>
//         </CardHeader>

//         <CardContent className="space-y-6">
//           {/* Volumes */}
//           <div>
//   <h3 className="font-semibold mb-2">Volume / Issue / Month Groups</h3>
// {summaryIssues.map(issue => {
//   const groups = monthGroupsByIssue[issue.id] || [];
//   const volume = volumesList.find(v => v.journal_id === issue.journal_id);

//   return groups.length > 0
//     ? groups.map(group => {
//         const row = { ...issue, ...volume, ...group }; // combine data
//         return (
//           <div key={group.id} className="grid grid-cols-9 gap-2 px-3 py-2 border-t text-sm">
//             <div>{volume?.volume_number || "—"}</div>
//             <div>{volume?.volume_label || "—"}</div>
//             <div>{volume?.alias_name || "—"}</div>
//             <div>{issue.issue_number}</div>
//             <div>{issue.issue_label}</div>
//             <div>{issue.alias_name}</div>
//             <div>{group.from_month}</div>
//             <div>{group.to_month}</div>
//             <div className="flex gap-2">
//               <Button
//                 size="sm"
//                 variant="outline"
//                 onClick={() => {
//                   setEditingRow(row);   // ✅ now row is defined
//                   setEditType("month");
//                   setEditForm(row);
//                 }}
//               >
//                 Edit
//               </Button>
//               <Button size="sm" variant="destructive">Delete</Button>
//             </div>
//           </div>
//         );
//       })
//     : (
//       <div key={issue.id} className="grid grid-cols-9 gap-2 px-3 py-2 border-t text-sm">
//         <div>{volume?.volume_number || "—"}</div>
//         <div>{volume?.volume_label || "—"}</div>
//         <div>{volume?.alias_name || "—"}</div>
//         <div>{issue.issue_number}</div>
//         <div>{issue.issue_label}</div>
//         <div>{issue.alias_name}</div>
//         <div>—</div>
//         <div>—</div>
//         <div className="flex gap-2">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={() => {
//               setEditingRow(issue);   // ✅ passing issue object
//               setEditType("issue");
//               setEditForm(issue);
//             }}
//           >
//             Edit
//           </Button>
//           <Button size="sm" variant="destructive">Delete</Button>
//         </div>
//       </div>
//     );
// })}
// </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil,OctagonXIcon} from "lucide-react";

export default function VolumeIssuePage() {
  const [journals, setJournals] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("volume");

  const [editingRow, setEditingRow] = useState(null);
  const [editType, setEditType] = useState(""); 
  const [editForm, setEditForm] = useState({});

  // forms
  const [volumeForm, setVolumeForm] = useState({
    journal_id: "", volume_number: "", volume_label: "", alias_name: "", year: ""
  });
  const [issueForm, setIssueForm] = useState({
    journal_id: "", issue_number: "", issue_label: "", alias_name_issue: "", year: ""
  });
  const [monthForm, setMonthForm] = useState({
    journal_id: "", issue_id: "", from_month: "", to_month: ""
  });

  // summary
  const [summaryJournalId, setSummaryJournalId] = useState("");
  const [volumesList, setVolumesList] = useState([]);
  const [summaryIssues, setSummaryIssues] = useState([]);
  const [monthGroupsByIssue, setMonthGroupsByIssue] = useState({});

  // fetchers
  const fetchJournals = async () => {
    const res = await fetch("/api/journals");
    const data = await res.json();
    if (data.success) setJournals(data.journals);
  };

  const fetchIssues = async (journalId) => {
    try {
      const res = await fetch(`/api/issues?journal_id=${journalId}`);
      const data = await res.json();
      if (data.success) setIssues(data.issues);
    } catch (e) { console.error(e); }
  };

  const fetchSummaryVolumes = async (journalId, year = "") => {
    try {
      const url = year
        ? `/api/volume?journal_id=${journalId}&year=${year}`
        : `/api/volume?journal_id=${journalId}`;
      const res = await fetch(url);
      const data = await res.json();
      setVolumesList(data.success ? (data.volumes || []) : []);
    } catch { setVolumesList([]); }
  };

  const fetchSummaryIssues = async (journalId) => {
    try {
      const res = await fetch(`/api/issues?journal_id=${journalId}`);
      const data = await res.json();
      const list = data.success ? (data.issues || []) : [];
      setSummaryIssues(list);
      return list;
    } catch {
      setSummaryIssues([]); return [];
    }
  };

  const fetchAllMonthGroups = async (journalId, issuesArr) => {
    const map = {};
    await Promise.all(
      (issuesArr || []).map(async (it) => {
        try {
          const res = await fetch(`/api/month-groups?journal_id=${journalId}&issue_id=${it.id}`);
          const data = await res.json();
          map[it.id] = data.success ? (data.months || []) : [];
        } catch { map[it.id] = []; }
      })
    );
    setMonthGroupsByIssue(map);
  };

  const loadJournalSummary = async (journalId) => {
    if (!journalId) {
      setVolumesList([]); setSummaryIssues([]); setMonthGroupsByIssue({});
      return;
    }
    await fetchSummaryVolumes(journalId);
    const iss = await fetchSummaryIssues(journalId);
    await fetchAllMonthGroups(journalId, iss);
  };

  // init
  useEffect(() => { fetchJournals(); }, []);
  useEffect(() => {
    if (journals.length && !summaryJournalId) {
      const first = String(journals[0].id);
      setSummaryJournalId(first);
      loadJournalSummary(first);
    }
  }, [journals]);

  // submit handlers
  const handleVolumeSubmit = async () => {
    const { journal_id, volume_number, volume_label, year } = volumeForm;
    if (!journal_id || !volume_number || !volume_label || !year)
      return toast.error("All volume fields are required");
    try {
      const res = await axios.post("/api/volume", volumeForm);
      toast.success(res.data.message);
      setVolumeForm({ journal_id: "", volume_number: "", volume_label: "", alias_name: "", year: "" });
      if (summaryJournalId && String(summaryJournalId) === String(journal_id)) {
        await loadJournalSummary(summaryJournalId);
      }
    } catch {
      toast.error("Failed to add volume");
    }
  };

  const handleIssueSubmit = async () => {
    const { journal_id, issue_number, issue_label } = issueForm;
    if (!journal_id || !issue_number || !issue_label)
      return toast.error("All issue fields are required");
    try {
      const res = await axios.post("/api/issues", issueForm);
      toast.success(res.data.message);
      await fetchIssues(issueForm.journal_id);
      setIssueForm({ journal_id: "", issue_number: "", issue_label: "", alias_name_issue: "" });
      if (summaryJournalId && String(summaryJournalId) === String(journal_id)) {
        await loadJournalSummary(summaryJournalId);
      }
    } catch {
      toast.error("Failed to add issue");
    }
  };

  const handleMonthSubmit = async () => {
    const { journal_id, issue_id, from_month } = monthForm;
    if (!journal_id || !issue_id || !from_month)
      return toast.error("Journal, issue, and from month are required");
    try {
      const res = await axios.post("/api/month-groups", monthForm);
      toast.success(res.data.message);
      setMonthForm({ journal_id: "", issue_id: "", from_month: "", to_month: "" });
      if (summaryJournalId && String(summaryJournalId) === String(journal_id)) {
        await loadJournalSummary(summaryJournalId);
      }
    } catch {
      toast.error("Failed to add month");
    }
  };

  const handleSave = async () => {
    try {
      let url = "";
      if (editType === "volume") url = "/api/volume";
      if (editType === "issue") url = "/api/issues";
      if (editType === "month") url = "/api/month-groups";

      await axios.put(url, { ...editForm, type: editType });
      toast.success(`${editType} updated successfully`);

      setEditingRow(null);
      await loadJournalSummary(summaryJournalId);
    } catch {
      toast.error("Update failed");
    }
  };


  const handleDelete = async (row, type) => {
  if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

  try {
    let url = "";
    if (type === "volume") url = "/api/volume";
    if (type === "issue") url = "/api/issues";
    if (type === "month") url = "/api/month-groups";

    await axios.delete(url, { data: { id: row.id, type } });

    toast.success(`${type} deleted successfully`);
    await loadJournalSummary(summaryJournalId); // refresh
  } catch (err) {
    toast.error("Delete failed");
  }
};

  const monthOptions = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* ===================== Forms in Tabs ===================== */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <Tabs.List className="flex gap-2">
          <Tabs.Trigger value="volume" className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Volume</Tabs.Trigger>
          <Tabs.Trigger value="issue"  className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Issue</Tabs.Trigger>
          <Tabs.Trigger value="month"  className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white">Month</Tabs.Trigger>
        </Tabs.List>

        {/* Volume form */}
        <Tabs.Content value="volume">
          <Card>
            <CardHeader><CardTitle>Add Volume</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <select className="border p-2 w-full"
                value={volumeForm.journal_id}
                onChange={e => setVolumeForm({ ...volumeForm, journal_id: e.target.value })}
              >
                <option value="">Select Journal</option>
                {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
              </select>
              <Input placeholder="Volume Number" type="number" value={volumeForm.volume_number}
                onChange={e => setVolumeForm({ ...volumeForm, volume_number: e.target.value })}/>
              <Input placeholder="Volume Label" value={volumeForm.volume_label}
                onChange={e => setVolumeForm({ ...volumeForm, volume_label: e.target.value })}/>
              <Input placeholder="Alias Name (Volume)" value={volumeForm.alias_name}
                onChange={e => setVolumeForm({ ...volumeForm, alias_name: e.target.value })}/>
              <Input placeholder="Year" type="number" value={volumeForm.year}
                onChange={e => setVolumeForm({ ...volumeForm, year: e.target.value })}/>
              <Button onClick={handleVolumeSubmit}>Add Volume</Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Issue form */}
        <Tabs.Content value="issue">
          <Card>
            <CardHeader><CardTitle>Add Issue</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <select className="border p-2 w-full"
                value={issueForm.journal_id}
                onChange={e => setIssueForm({ ...issueForm, journal_id: e.target.value })}
              >
                <option value="">Select Journal</option>
                {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
              </select>
              <Input placeholder="Issue Number" type="number" value={issueForm.issue_number}
                onChange={e => setIssueForm({ ...issueForm, issue_number: e.target.value })}/>
              <Input placeholder="Issue Label" value={issueForm.issue_label}
                onChange={e => setIssueForm({ ...issueForm, issue_label: e.target.value })}/>
              <Input placeholder="Alias Name (Issue)" value={issueForm.alias_name_issue}
                onChange={e => setIssueForm({ ...issueForm, alias_name_issue: e.target.value })}/>
              <Button onClick={handleIssueSubmit}>Add Issue</Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Month form */}
        <Tabs.Content value="month">
          <Card>
            <CardHeader><CardTitle>Add Month Group</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <select className="border p-2 w-full"
                value={monthForm.journal_id}
                onChange={async (e) => {
                  const journal_id = e.target.value;
                  setMonthForm({ ...monthForm, journal_id, issue_id: "" });
                  if (journal_id) {
                    const res = await fetch(`/api/issues?journal_id=${journal_id}`);
                    const data = await res.json();
                    if (data.success) setIssues(data.issues || []);
                    else setIssues([]);
                  } else {
                    setIssues([]);
                  }
                }}
              >
                <option value="">Select Journal</option>
                {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
              </select>

              <select className="border p-2 w-full"
                value={monthForm.issue_id}
                onChange={e => setMonthForm({ ...monthForm, issue_id: e.target.value })}
              >
                <option value="">Select Issue</option>
                {issues.map(i => (
                  <option key={i.id} value={i.id}>Issue {i.issue_number} ({i.issue_label})</option>
                ))}
              </select>

              <select className="border p-2 w-full"
                value={monthForm.from_month}
                onChange={e => setMonthForm({ ...monthForm, from_month: e.target.value })}
              >
                <option value="">Select From Month</option>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <select className="border p-2 w-full"
                value={monthForm.to_month}
                onChange={e => setMonthForm({ ...monthForm, to_month: e.target.value })}
              >
                <option value="">Select To Month (optional)</option>
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              <Button onClick={handleMonthSubmit}>Add Month</Button>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      {/* ===================== Edit Modal ===================== */}
      {editingRow && (
        <Dialog open onOpenChange={() => setEditingRow(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit {editType}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {editType === "volume" && (
                <>
                  <Input value={editForm.volume_number} onChange={e => setEditForm({ ...editForm, volume_number: e.target.value })}/>
                  <Input value={editForm.volume_label} onChange={e => setEditForm({ ...editForm, volume_label: e.target.value })}/>
                  <Input value={editForm.alias_name} onChange={e => setEditForm({ ...editForm, alias_name: e.target.value })}/>
                  <Input value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })}/>
                </>
              )}
              {editType === "issue" && (
                <>
                  <Input value={editForm.issue_number} onChange={e => setEditForm({ ...editForm, issue_number: e.target.value })}/>
                  <Input value={editForm.issue_label} onChange={e => setEditForm({ ...editForm, issue_label: e.target.value })}/>
                  <Input value={editForm.alias_name} onChange={e => setEditForm({ ...editForm, alias_name: e.target.value })}/>
                </>
              )}
              {editType === "month" && (
                <>
                  <select className="border p-2 w-full"
                    value={editForm.from_month}
                    onChange={e => setEditForm({ ...editForm, from_month: e.target.value })}
                  >
                    {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="border p-2 w-full"
                    value={editForm.to_month}
                    onChange={e => setEditForm({ ...editForm, to_month: e.target.value })}
                  >
                    <option value="">Select To Month (optional)</option>
                    {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setEditingRow(null)}>Cancel</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ===================== Journal Summary ===================== */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Journal Summary</CardTitle>
          <div className="flex gap-2 items-center">
            <select
              className="border p-2"
              value={summaryJournalId}
              onChange={async (e) => {
                const id = e.target.value;
                setSummaryJournalId(id);
                await loadJournalSummary(id);
              }}
            >
              <option value="">Select Journal</option>
              {journals.map(j => <option key={j.id} value={j.id}>{j.journal_name}</option>)}
            </select>
            <Button variant="outline" onClick={() => loadJournalSummary(summaryJournalId)} disabled={!summaryJournalId}>
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <h3 className="font-semibold mb-2">Volume / Issue / Month Groups</h3>
          <div className="grid grid-cols-9 gap-2 px-3 py-2 font-medium bg-gray-50 text-sm">
            <div>Vol #</div>
            <div>Vol Label</div>
            <div>Vol Alias</div>
            <div>Issue #</div>
            <div>Issue Label</div>
            <div>Issue Alias</div>
            <div>From</div>
            <div>To</div>
          </div>

          {summaryIssues.map(issue => {
            const groups = monthGroupsByIssue[issue.id] || [];
            const volume = volumesList.find(v => v.journal_id === issue.journal_id);

            return groups.length > 0
              ? groups.map(group => (
                  <div key={group.id} className="grid grid-cols-9 gap-2 px-3 py-2 border-t text-sm items-center">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingRow(volume); setEditType("volume"); setEditForm(volume); }}>
                        <Pencil size={14} />
                      </button>
                      
  <button
    size="sm"
    variant="destructive"
    onClick={() => handleDelete(volume, "volume")}
  >
     <OctagonXIcon size={14} />
  </button>

                      {volume?.volume_number || "—"}
                    </div>
                    <div>{volume?.volume_label || "—"}</div>
                    <div>{volume?.alias_name || "—"}</div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingRow(issue); setEditType("issue"); setEditForm(issue); }}>
                        <Pencil size={14} />
                      </button>
                      <button
  size="sm"
  variant="destructive"
  onClick={() => handleDelete(issue, "issue")}
>
  <OctagonXIcon size={14} />
  </button>
                      {issue.issue_number}
                    </div>
                    <div>{issue.issue_label}</div>
                    <div>{issue.alias_name}</div>

                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingRow(group); setEditType("month"); setEditForm(group); }}>
                        <Pencil size={14} />
                      </button>
                      <button
  size="sm"
  variant="destructive"
  onClick={() => handleDelete(group, "month")}
>
  <OctagonXIcon size={14} />
  </button>
                      {group.from_month}
                    </div>
                    <div>{group.to_month}</div>

                  </div>
                ))
              : (
                <div key={issue.id} className="grid grid-cols-9 gap-2 px-3 py-2 border-t text-sm items-center">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingRow(volume); setEditType("volume"); setEditForm(volume); }}>
                      <Pencil size={14} />
                    </button>
                    {volume?.volume_number || "—"}
                  </div>
                  <div>{volume?.volume_label || "—"}</div>
                  <div>{volume?.alias_name || "—"}</div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditingRow(issue); setEditType("issue"); setEditForm(issue); }}>
                      <Pencil size={14} />
                    </button>
                    <Button
  size="sm"
  variant="destructive"
  onClick={() => handleDelete(issue, "issue")}
>
  Delete
</Button>
                    {issue.issue_number}
                  </div>
                  <div>{issue.issue_label}</div>
                  <div>{issue.alias_name}</div>

                  <div>—</div>
                  <div>—</div>
                  

                </div>
              );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

