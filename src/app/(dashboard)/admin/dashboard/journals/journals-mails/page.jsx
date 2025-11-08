"use client";

import React, { useEffect, useState } from "react";
import Addform from "@/components/Dashboard/Journals/journalsmaildetails/Addform";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";

export default function Page() {
  const [journals, setJournals] = useState([]);
  const [mails, setMails] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMail, setEditMail] = useState(null);

  // 🟢 Fetch data
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [jRes, mRes] = await Promise.all([
        axios.get("/api/journals"),
        axios.get("/api/journals-mail?limit=100"),
      ]);
      const j = jRes.data.journals || [];
      const m = mRes.data.mails || [];
      setJournals(j);
      setMails(m);
      setFiltered(m);
    } catch {
      toast.error("Failed to fetch data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // 🟡 Filter & Search
  useEffect(() => {
    let res = mails;
    if (journal)
      res = res.filter((m) => String(m.journal_id) === String(journal));
    if (search)
      res = res.filter(
        (m) =>
          m.email.toLowerCase().includes(search.toLowerCase()) ||
          m.purpose.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(res);
  }, [search, journal, mails]);

  // 🟠 Handle Edit
  const handleEdit = (mail) => {
    setEditMail(mail);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔴 Handle Delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;
    try {
      await axios.delete(`/api/journals-mail?id=${id}`);
      toast.success("Mail configuration deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete configuration");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      
      {/* 🧾 Add/Edit Form */}
      <Addform
        onSaved={fetchAll}
        editMail={editMail}
        onCancelEdit={() => setEditMail(null)}
      />

      {/* 🔍 Filter & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white shadow p-4 rounded-md">
        <div className="flex gap-3 flex-wrap">
          <select
            className="border rounded px-3 py-2"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
          >
            <option value="">All Journals</option>
            {journals.map((j) => (
              <option key={j.id} value={j.id}>
                {j.journal_name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search by email or purpose..."
            className="border rounded px-3 py-2 w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <span className="text-sm text-gray-500">
            {filtered.length} result(s)
          </span>
        </div>
      </div>

      {/* 📋 Table */}
      <div className="bg-white shadow rounded-lg border overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-100 text-left border-b">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">Journal</th>
              <th className="p-2">Purpose</th>
              <th className="p-2">Email</th>
              <th className="p-2">Host</th>
              <th className="p-2">Port</th>
              <th className="p-2">Secure</th>
              <th className="p-2">Active</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((m, i) => (
                <tr key={m.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{m.journal_name}</td>
                  <td className="p-2 capitalize">{m.purpose}</td>
                  <td className="p-2">{m.email}</td>
                  <td className="p-2">{m.smtp_host}</td>
                  <td className="p-2">{m.smtp_port}</td>
                  <td className="p-2">{m.secure ? "Yes" : "No"}</td>
                  <td className="p-2">{m.is_active ? "✔" : "✖"}</td>
                  <td className="p-2 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(m)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(m.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  No configurations found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
