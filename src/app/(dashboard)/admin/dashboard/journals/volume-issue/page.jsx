"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, OctagonXIcon, ChevronRight, ChevronDown } from "lucide-react";
import { Select } from "@/components/ui";

export default function VolumeIssuePage() {
  const [journals, setJournals] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activeTab, setActiveTab] = useState("volume");

  const [editingRow, setEditingRow] = useState(null);
  const [editType, setEditType] = useState("");
  const [editForm, setEditForm] = useState({});

  // forms
  const [volumeForm, setVolumeForm] = useState({
    journal_id: "",
    volume_number: "",
    volume_label: "",
    alias_name: "",
    year: "",
  });
  const [issueForm, setIssueForm] = useState({
    journal_id: "",
    volume_id: "", // ✅ add volume_id
    issue_number: "",
    issue_label: "",
    alias_name_issue: "",
    year: "",
  });

  const [monthForm, setMonthForm] = useState({
    journal_id: "",
    volume_id: "", // ✅ add volume_id
    issue_id: "",
    from_month: "",
    to_month: "",
  });

  // summary
  const [summaryJournalId, setSummaryJournalId] = useState("");
  const [volumesList, setVolumesList] = useState([]);
  const [summaryIssues, setSummaryIssues] = useState([]);
  const [monthGroupsByIssue, setMonthGroupsByIssue] = useState({});

  // maps for quick lookup
  const [volumeById, setVolumeById] = useState({});
  useEffect(() => {
    const map = Object.fromEntries(
      (volumesList || []).map((v) => [String(v.id), v])
    );
    setVolumeById(map);
  }, [volumesList]);

  // expanded state for year/volume/issue
  const [openYearKeys, setOpenYearKeys] = useState({});
  const [openVolumeIds, setOpenVolumeIds] = useState({});
  const [openIssueIds, setOpenIssueIds] = useState({});
  const toggleYearOpen = (y) =>
    setOpenYearKeys((s) => ({ ...s, [String(y)]: !s[String(y)] }));
  const toggleVolumeOpen = (id) =>
    setOpenVolumeIds((s) => ({ ...s, [String(id)]: !s[String(id)] }));
  const toggleIssueOpen = (id) =>
    setOpenIssueIds((s) => ({ ...s, [String(id)]: !s[String(id)] }));

  // ---- helpers to resolve relationships ----
  const resolveVolumeForIssue = (issue) => {
    if (!issue) return null;
    if (issue.volume_id && volumeById[String(issue.volume_id)]) {
      return volumeById[String(issue.volume_id)];
    }
    // fallback by matching year within same journal
    if (issue.year) {
      const byYear = (volumesList || []).find(
        (v) =>
          String(v.journal_id) === String(issue.journal_id) &&
          String(v.year) === String(issue.year)
      );
      if (byYear) return byYear;
    }
    // last resort: any volume for the journal
    return (
      (volumesList || []).find(
        (v) => String(v.journal_id) === String(issue.journal_id)
      ) || null
    );
  };

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
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSummaryVolumes = async (journalId, year = "") => {
    try {
      const url = year
        ? `/api/volume?journal_id=${journalId}&year=${year}`
        : `/api/volume?journal_id=${journalId}`;
      const res = await fetch(url);
      const data = await res.json();
      setVolumesList(data.success ? data.volumes || [] : []);
    } catch {
      setVolumesList([]);
    }
  };

  const fetchSummaryIssues = async (journalId) => {
    try {
      const res = await fetch(`/api/issues?journal_id=${journalId}`);
      const data = await res.json();
      const list = data.success ? data.issues || [] : [];
      setSummaryIssues(list);
      return list;
    } catch {
      setSummaryIssues([]);
      return [];
    }
  };

  const fetchAllMonthGroups = async (journalId, issuesArr) => {
    const map = {};
    await Promise.all(
      (issuesArr || []).map(async (it) => {
        try {
          const res = await fetch(
            `/api/month-groups?journal_id=${journalId}&issue_id=${it.id}`
          );
          const data = await res.json();
          map[it.id] = data.success ? data.months || [] : [];
        } catch {
          map[it.id] = [];
        }
      })
    );
    setMonthGroupsByIssue(map);
  };

  const loadJournalSummary = async (journalId) => {
    if (!journalId) {
      setVolumesList([]);
      setSummaryIssues([]);
      setMonthGroupsByIssue({});
      setOpenYearKeys({});
      setOpenVolumeIds({});
      setOpenIssueIds({});
      return;
    }
    await fetchSummaryVolumes(journalId);
    const iss = await fetchSummaryIssues(journalId);
    await fetchAllMonthGroups(journalId, iss);
    // reset expansions
    setOpenYearKeys({});
    setOpenVolumeIds({});
    setOpenIssueIds({});
  };

  // init
  useEffect(() => {
    fetchJournals();
  }, []);
  useEffect(() => {
    if (journals.length && !summaryJournalId) {
      const first = String(journals[0].id);
      setSummaryJournalId(first);
      loadJournalSummary(first);
    }
  }, [journals]); // eslint-disable-line

  // submit handlers
  const handleVolumeSubmit = async () => {
    const { journal_id, volume_number, volume_label, year } = volumeForm;
    if (!journal_id || !volume_number || !volume_label || !year)
      return toast.error("All volume fields are required");
    try {
      const res = await axios.post("/api/volume", volumeForm);
      toast.success(res.data.message);
      setVolumeForm({
        journal_id: "",
        volume_number: "",
        volume_label: "",
        alias_name: "",
        year: "",
      });
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
      const payload = {
        ...issueForm,
        alias_name_issue: issueForm.alias_name_issue || issueForm.alias_name,
      };
      // const res = await axios.post("/api/issues", payload);
     const res = await axios.post("/api/issues", {
  type: "issue",
  journal_id: issueForm.journal_id,
  volume_id: issueForm.volume_id,
  issue_number: issueForm.issue_number,
  issue_label: issueForm.issue_label,
  alias_name_issue: issueForm.alias_name_issue || null
});

      toast.success(res.data.message);
      await fetchIssues(issueForm.journal_id);
      setIssueForm({
        journal_id: "",
        issue_number: "",
        issue_label: "",
        alias_name_issue: "",
      });
      if (summaryJournalId && String(summaryJournalId) === String(journal_id)) {
        await loadJournalSummary(summaryJournalId);
      }
    } catch {
      toast.error("Failed to add issue");
    }
  };

  const handleMonthSubmit = async () => {
    const { journal_id, volume_id, issue_id, from_month } = monthForm;
    if (!journal_id || !volume_id || !issue_id || !from_month)
      return toast.error("Journal, issue, and from month are required");
    try {
      const res = await axios.post("/api/month-groups", monthForm);
      toast.success(res.data.message);
      setMonthForm({
        journal_id: "",
        issue_id: "",
        from_month: "",
        to_month: "",
      });
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
    if (!row) return;
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // ======== Build hierarchy: Year -> Volumes -> Issues -> Month groups ========
  // Years are drawn primarily from volumes; issues without a matching volume/year fall into "Unknown".
  const hierarchy = (() => {
    const byYear = {};

    // Seed years with volumes
    for (const v of volumesList) {
      const y = v?.year ?? "Unknown";
      if (!byYear[y]) byYear[y] = { year: y, volumes: {}, looseIssues: [] };
      byYear[y].volumes[String(v.id)] = { volume: v, issues: [] };
    }

    // Attach issues to volumes (prefer volume_id, then year match)
    for (const issue of summaryIssues) {
      const vol = resolveVolumeForIssue(issue);
      const y = vol?.year ?? issue?.year ?? "Unknown";
      if (!byYear[y]) byYear[y] = { year: y, volumes: {}, looseIssues: [] };

      if (vol) {
        const vid = String(vol.id);
        if (!byYear[y].volumes[vid])
          byYear[y].volumes[vid] = { volume: vol, issues: [] };
        byYear[y].volumes[vid].issues.push(issue);
      } else {
        byYear[y].looseIssues.push(issue);
      }
    }

    // Sort years descending numerically when possible; "Unknown" last
    const sortedYearKeys = Object.keys(byYear).sort((a, b) => {
      if (a === "Unknown") return 1;
      if (b === "Unknown") return -1;
      const na = Number(a);
      const nb = Number(b);
      if (isNaN(na) && isNaN(nb)) return String(a).localeCompare(String(b));
      if (isNaN(na)) return 1;
      if (isNaN(nb)) return -1;
      return nb - na; // newest first
    });

    return { byYear, sortedYearKeys };
  })();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* ===================== Forms in Tabs ===================== */}
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <Tabs.List className="flex gap-2">
          <Tabs.Trigger
            value="volume"
            className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Volume
          </Tabs.Trigger>
          <Tabs.Trigger
            value="issue"
            className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Issue
          </Tabs.Trigger>
          <Tabs.Trigger
            value="month"
            className="px-4 py-2 rounded bg-gray-200 data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Month
          </Tabs.Trigger>
        </Tabs.List>

        {/* Volume form */}
        <Tabs.Content value="volume">
          <Card>
            <CardHeader>
              <CardTitle>Add Volume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <Select
                  label="Select Journal"
                  placeholder="Choose Journal"
                  value={volumeForm.journal_id}
                  className="w-full"
                  options={journals.map((j) => ({
                    value: j.id,
                    label: j.journal_name,
                  }))}
                  onValueChange={(journal_id) =>
                    setVolumeForm({ ...volumeForm, journal_id })
                  }
                />

                <Input
                  label="Volume Number"
                  placeholder="Volume Number"
                  type="number"
                  value={volumeForm.volume_number}
                  onChange={(e) =>
                    setVolumeForm({
                      ...volumeForm,
                      volume_number: e.target.value,
                    })
                  }
                />
                <Input
                  label="Volume Label"
                  placeholder="Volume Label"
                  value={volumeForm.volume_label}
                  onChange={(e) =>
                    setVolumeForm({
                      ...volumeForm,
                      volume_label: e.target.value,
                    })
                  }
                />
                <Input
                  label="Alias Name (Volume)"
                  placeholder="Alias Name (Volume)"
                  value={volumeForm.alias_name}
                  onChange={(e) =>
                    setVolumeForm({ ...volumeForm, alias_name: e.target.value })
                  }
                />
                <Input
                  label="Year"
                  placeholder="Year"
                  type="number"
                  value={volumeForm.year}
                  onChange={(e) =>
                    setVolumeForm({ ...volumeForm, year: e.target.value })
                  }
                />
              </div>
              <Button onClick={handleVolumeSubmit}>Add Volume</Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Issue form */}
        <Tabs.Content value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Add Issue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                <Select
                  label="Select Journals"
                  placeholder="Choose Journal"
                  value={issueForm.journal_id}
                  options={journals.map((j) => ({
                    value: j.id,
                    label: j.journal_name,
                  }))}
                  onValueChange={async (journal_id) => {
                    // Update journal + reset volume
                    setIssueForm((prev) => ({
                      ...prev,
                      journal_id,
                      volume_id: "",
                    }));

                    // Fetch volumes for selected journal
                    if (journal_id) {
                      const res = await fetch(
                        `/api/volume?journal_id=${journal_id}`
                      );
                      const data = await res.json();
                      if (data.success) {
                        setVolumesList(data.volumes || []);
                      }
                    } else {
                      setVolumesList([]);
                    }
                  }}
                  className="w-full"
                />
                <Select
                  label="Select Volume"
                  disabled={!issueForm.journal_id}
                  placeholder="Choose Volume"
                  value={issueForm.volume_id}
                  options={volumesList
                    .filter(
                      (v) =>
                        String(v.journal_id) === String(issueForm.journal_id)
                    )
                    .map((v) => ({
                      value: v.id,
                      label: `Volume ${v.volume_number} (${v.year})`,
                    }))}
                  onValueChange={(volume_id) =>
                    setIssueForm((prev) => ({ ...prev, volume_id }))
                  }
                  className="w-full"
                />

                <Input
                  label="Issue Number"
                  placeholder="Issue Number"
                  type="number"
                  value={issueForm.issue_number}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, issue_number: e.target.value })
                  }
                />
                <Input
                  label="Issue Label"
                  placeholder="Issue Label"
                  value={issueForm.issue_label}
                  onChange={(e) =>
                    setIssueForm({ ...issueForm, issue_label: e.target.value })
                  }
                />
                <Input
                  label="Alias Name (Issue)"
                  placeholder="Alias Name (Issue)"
                  value={issueForm.alias_name_issue}
                  onChange={(e) =>
                    setIssueForm({
                      ...issueForm,
                      alias_name_issue: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={handleIssueSubmit}>Add Issue</Button>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Month form */}
        <Tabs.Content value="month">
          <Card>
            <CardHeader>
              <CardTitle>Add Month Group</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {/* Select Journal */}
                <Select
                  label="Select Journal"
                  placeholder="Choose Journal"
                  value={monthForm.journal_id}
                  className="w-full"
                  options={journals.map((j) => ({
                    value: j.id,
                    label: j.journal_name,
                  }))}
                  onValueChange={async (journal_id) => {
                    setMonthForm({
                      ...monthForm,
                      journal_id,
                      volume_id: "",
                      issue_id: "",
                    });

                    // Load volumes
                    if (journal_id) {
                      const res = await fetch(
                        `/api/volume?journal_id=${journal_id}`
                      );
                      const data = await res.json();
                      if (data.success) setVolumesList(data.volumes || []);
                      else setVolumesList([]);
                    } else {
                      setVolumesList([]);
                    }
                    setIssues([]);
                  }}
                />

                {/* Select Volume */}
                <Select
                  label="Select Volume"
                  placeholder="Choose Volume"
                  value={monthForm.volume_id}
                  className="w-full"
                  options={volumesList
                    .filter(
                      (v) =>
                        String(v.journal_id) === String(monthForm.journal_id)
                    )
                    .map((v) => ({
                      value: v.id,
                      label: `Volume ${v.volume_number} (${v.year})`,
                    }))}
                  onValueChange={async (volume_id) => {
                    setMonthForm({ ...monthForm, volume_id, issue_id: "" });

                    if (volume_id) {
                      const res = await fetch(
                        `/api/issues?journal_id=${monthForm.journal_id}&volume_id=${volume_id}`
                      );
                      const data = await res.json();
                      if (data.success) setIssues(data.issues || []);
                      else setIssues([]);
                    }
                  }}
                />

                {/* Select Issue */}
                <Select
                  label="Select Issue"
                  placeholder="Choose Issue"
                  value={monthForm.issue_id}
                  className="w-full"
                  options={issues.map((i) => ({
                    value: i.id,
                    label: `Issue ${i.issue_number} (${i.issue_label})`,
                  }))}
                  onValueChange={(issue_id) =>
                    setMonthForm({ ...monthForm, issue_id })
                  }
                />

                {/* From Month */}
                <Select
                  label="From Month"
                  placeholder="Select From Month"
                  value={monthForm.from_month}
                  className="w-full"
                  options={monthOptions.map((m, i) => ({
                    value: i + 1,
                    label: m,
                  }))}
                  onValueChange={(from_month) =>
                    setMonthForm({ ...monthForm, from_month })
                  }
                />

                {/* To Month */}
                <Select
                  label="To Month"
                  placeholder="Select To Month (optional)"
                  value={monthForm.to_month}
                  className="w-full"
                  options={monthOptions.map((m, i) => ({
                    value: i + 1,
                    label: m,
                  }))}
                  onValueChange={(to_month) =>
                    setMonthForm({ ...monthForm, to_month })
                  }
                />
              </div>
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
                  <Input
                    value={editForm.volume_number ?? ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        volume_number: e.target.value,
                      })
                    }
                  />
                  <Input
                    value={editForm.volume_label ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, volume_label: e.target.value })
                    }
                  />
                  <Input
                    value={editForm.alias_name ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, alias_name: e.target.value })
                    }
                  />
                  <Input
                    value={editForm.year ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, year: e.target.value })
                    }
                  />
                </>
              )}
              {editType === "issue" && (
                <>
                  <Input
                    value={editForm.issue_number ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, issue_number: e.target.value })
                    }
                  />
                  <Input
                    value={editForm.issue_label ?? ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, issue_label: e.target.value })
                    }
                  />
                  <Input
                    value={
                      editForm.alias_name ?? editForm.alias_name_issue ?? ""
                    }
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        alias_name: e.target.value,
                        alias_name_issue: e.target.value, // sync both for PUT
                      })
                    }
                  />
                </>
              )}
              {editType === "month" && (
                <>
                  {/* From Month */}
                  <Select
                    label="From Month"
                    placeholder="Select Month"
                    value={editForm.from_month ?? ""}
                    options={monthOptions.map((m) => ({
                      value: m,
                      label: m,
                    }))}
                    onValueChange={(val) =>
                      setEditForm({ ...editForm, from_month: val })
                    }
                  />

                  {/* To Month */}
                  <Select
                    label="To Month"
                    placeholder="Select To Month (optional)"
                    value={editForm.to_month ?? ""}
                    options={[
                      ...monthOptions.map((m) => ({
                        value: m,
                        label: m,
                      })),
                    ]}
                    onValueChange={(val) =>
                      setEditForm({ ...editForm, to_month: val })
                    }
                  />
                </>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={() => setEditingRow(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ===================== Journal Summary (Year -> Volume -> Issue -> Months) ===================== */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          {/* <CardTitle>Journal Summary</CardTitle> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
<Select
  value={summaryJournalId}
  options={journals.map((j) => ({
    value: j.id,
    label: j.journal_name,
  }))}
  onValueChange={async (val) => {
    setSummaryJournalId(val);   // ✅ critical fix
    await loadJournalSummary(val);
  }}
/>


            <div>
              <Button
                variant="outline"
                onClick={() => loadJournalSummary(summaryJournalId)}
                disabled={!summaryJournalId}
              >
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {hierarchy.sortedYearKeys.length === 0 ? (
            <div className="px-3 py-4 text-sm text-gray-500 border rounded">
              No data for this journal.
            </div>
          ) : (
            <ul className="space-y-3">
              {hierarchy.sortedYearKeys.map((yearKey) => {
                const block = hierarchy.byYear[yearKey];
                const yOpen = !!openYearKeys[String(yearKey)];

                // Collect volume IDs sorted by volume_number (asc)
                const volEntries = Object.entries(block.volumes).sort(
                  ([, a], [, b]) => {
                    const na = Number(a.volume?.volume_number);
                    const nb = Number(b.volume?.volume_number);
                    if (isNaN(na) && isNaN(nb)) return 0;
                    if (isNaN(na)) return 1;
                    if (isNaN(nb)) return -1;
                    return na - nb;
                  }
                );

                return (
                  <li key={yearKey} className="border rounded">
                    {/* Year row */}
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-100">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleYearOpen(yearKey)}
                          aria-label="Toggle Year"
                        >
                          {yOpen ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </Button>
                        <span className="font-semibold">{String(yearKey)}</span>
                      </div>
                    </div>

                    {/* Volumes under year */}
                    {yOpen && (
                      <div className="px-3 py-2">
                        {volEntries.length === 0 ? (
                          <div className="text-sm text-gray-500 pl-8">
                            No volumes.
                          </div>
                        ) : (
                          <ul className="space-y-2">
                            {volEntries.map(
                              ([volId, { volume, issues: volIssues }]) => {
                                const vOpen = !!openVolumeIds[volId];

                                // Sort issues by issue_number (asc)
                                const sortedIssues = [...volIssues].sort(
                                  (a, b) => {
                                    const na = Number(a.issue_number);
                                    const nb = Number(b.issue_number);
                                    if (isNaN(na) && isNaN(nb)) return 0;
                                    if (isNaN(na)) return 1;
                                    if (isNaN(nb)) return -1;
                                    return na - nb;
                                  }
                                );

                                return (
                                  <li key={volId} className="border rounded">
                                    {/* Volume row */}
                                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() =>
                                            toggleVolumeOpen(volId)
                                          }
                                          aria-label="Toggle Volume"
                                        >
                                          {vOpen ? (
                                            <ChevronDown size={16} />
                                          ) : (
                                            <ChevronRight size={16} />
                                          )}
                                        </Button>
                                        <span className="font-medium">
                                          {volume
                                            ? `Volume ${volume.volume_number}`
                                            : "Volume —"}
                                          {volume?.volume_label
                                            ? ` (${volume.volume_label})`
                                            : ""}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {volume && (
                                          <>
                                            <Button
                                              size="icon"
                                              variant="ghost"
                                              onClick={() => {
                                                setEditingRow(volume);
                                                setEditType("volume");
                                                setEditForm(volume);
                                              }}
                                              aria-label="Edit volume"
                                            >
                                              <Pencil size={16} />
                                            </Button>
                                            <Button
                                              size="icon"
                                              variant="destructive"
                                              onClick={() =>
                                                handleDelete(volume, "volume")
                                              }
                                              aria-label="Delete volume"
                                            >
                                              <OctagonXIcon size={16} />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>

                                    {/* Issues under volume */}
                                    {vOpen && (
                                      <div className="px-3 py-2">
                                        {sortedIssues.length === 0 ? (
                                          <div className="text-sm text-gray-500 pl-8">
                                            No issues.
                                          </div>
                                        ) : (
                                          <ul className="space-y-1">
                                            {sortedIssues.map((issue) => {
                                              const iId = String(issue.id);
                                              const iOpen = !!openIssueIds[iId];
                                              const groups =
                                                monthGroupsByIssue[issue.id] ||
                                                [];

                                              return (
                                                <li
                                                  key={iId}
                                                  className="border rounded"
                                                >
                                                  {/* Issue row */}
                                                  <div className="flex items-center justify-between px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                      <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() =>
                                                          toggleIssueOpen(iId)
                                                        }
                                                        aria-label="Toggle Issue"
                                                      >
                                                        {iOpen ? (
                                                          <ChevronDown
                                                            size={16}
                                                          />
                                                        ) : (
                                                          <ChevronRight
                                                            size={16}
                                                          />
                                                        )}
                                                      </Button>
                                                      <span>
                                                        Issue{" "}
                                                        {issue.issue_number}
                                                        {issue.issue_label
                                                          ? ` (${issue.issue_label})`
                                                          : ""}
                                                      </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => {
                                                          setEditingRow(issue);
                                                          setEditType("issue");
                                                          setEditForm(issue);
                                                        }}
                                                        aria-label="Edit issue"
                                                      >
                                                        <Pencil size={16} />
                                                      </Button>
                                                      <Button
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() =>
                                                          handleDelete(
                                                            issue,
                                                            "issue"
                                                          )
                                                        }
                                                        aria-label="Delete issue"
                                                      >
                                                        <OctagonXIcon
                                                          size={16}
                                                        />
                                                      </Button>
                                                    </div>
                                                  </div>

                                                  {/* Month groups under issue */}
                                                  {iOpen && (
                                                    <div className="px-6 pb-2">
                                                      {groups.length === 0 ? (
                                                        <div className="text-sm text-gray-500 pl-6">
                                                          No month groups.
                                                        </div>
                                                      ) : (
                                                        <ul className="space-y-1">
                                                          {groups.map((g) => (
                                                            <li
                                                              key={g.id}
                                                              className="flex items-center justify-between px-3 py-1 border rounded"
                                                            >
                                                              <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-gray-400" />
                                                                <span className="text-sm">
                                                                  {g.from_month ||
                                                                    "—"}{" "}
                                                                  <span className="mx-1">
                                                                    -
                                                                  </span>{" "}
                                                                  {g.to_month ||
                                                                    "—"}
                                                                </span>
                                                              </div>
                                                              <div className="flex items-center gap-1">
                                                                <Button
                                                                  size="icon"
                                                                  variant="ghost"
                                                                  onClick={() => {
                                                                    setEditingRow(
                                                                      g
                                                                    );
                                                                    setEditType(
                                                                      "month"
                                                                    );
                                                                    setEditForm(
                                                                      g
                                                                    );
                                                                  }}
                                                                  aria-label="Edit month group"
                                                                >
                                                                  <Pencil
                                                                    size={16}
                                                                  />
                                                                </Button>
                                                                <Button
                                                                  size="icon"
                                                                  variant="destructive"
                                                                  onClick={() =>
                                                                    handleDelete(
                                                                      g,
                                                                      "month"
                                                                    )
                                                                  }
                                                                  aria-label="Delete month group"
                                                                >
                                                                  <OctagonXIcon
                                                                    size={16}
                                                                  />
                                                                </Button>
                                                              </div>
                                                            </li>
                                                          ))}
                                                        </ul>
                                                      )}
                                                    </div>
                                                  )}
                                                </li>
                                              );
                                            })}
                                          </ul>
                                        )}
                                      </div>
                                    )}
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        )}

                        {/* Handle issues that matched the year but no volume (rare) */}
                        {block.looseIssues?.length > 0 && (
                          <div className="mt-3 ml-10">
                            <div className="text-xs uppercase text-gray-500 tracking-wide mb-1">
                              Unassigned Volume
                            </div>
                            <ul className="space-y-1">
                              {block.looseIssues.map((issue) => {
                                const iId = `loose-${issue.id}`;
                                const iOpen = !!openIssueIds[iId];
                                const groups =
                                  monthGroupsByIssue[issue.id] || [];
                                return (
                                  <li key={iId} className="border rounded">
                                    <div className="flex items-center justify-between px-3 py-2">
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => toggleIssueOpen(iId)}
                                          aria-label="Toggle Issue"
                                        >
                                          {iOpen ? (
                                            <ChevronDown size={16} />
                                          ) : (
                                            <ChevronRight size={16} />
                                          )}
                                        </Button>
                                        <span>
                                          Issue {issue.issue_number}
                                          {issue.issue_label
                                            ? ` (${issue.issue_label})`
                                            : ""}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => {
                                            setEditingRow(issue);
                                            setEditType("issue");
                                            setEditForm(issue);
                                          }}
                                          aria-label="Edit issue"
                                        >
                                          <Pencil size={16} />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="destructive"
                                          onClick={() =>
                                            handleDelete(issue, "issue")
                                          }
                                          aria-label="Delete issue"
                                        >
                                          <OctagonXIcon size={16} />
                                        </Button>
                                      </div>
                                    </div>
                                    {iOpen && (
                                      <div className="px-6 pb-2">
                                        {groups.length === 0 ? (
                                          <div className="text-sm text-gray-500 pl-6">
                                            No month groups.
                                          </div>
                                        ) : (
                                          <ul className="space-y-1">
                                            {groups.map((g) => (
                                              <li
                                                key={g.id}
                                                className="flex items-center justify-between px-3 py-1 border rounded"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 rounded-full bg-gray-400" />
                                                  <span className="text-sm">
                                                    {g.from_month || "—"}{" "}
                                                    <span className="mx-1">
                                                      -
                                                    </span>{" "}
                                                    {g.to_month || "—"}
                                                  </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                  <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                      setEditingRow(g);
                                                      setEditType("month");
                                                      setEditForm(g);
                                                    }}
                                                    aria-label="Edit month group"
                                                  >
                                                    <Pencil size={16} />
                                                  </Button>
                                                  <Button
                                                    size="icon"
                                                    variant="destructive"
                                                    onClick={() =>
                                                      handleDelete(g, "month")
                                                    }
                                                    aria-label="Delete month group"
                                                  >
                                                    <OctagonXIcon size={16} />
                                                  </Button>
                                                </div>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    )}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
