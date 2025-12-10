"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  useForm,
  useFormContext,
  FormProvider,
  Controller,
  useWatch,
} from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, TextEditor } from "@/components/ui";

function ArticleForm({
  journals = [],
  volumesMeta = [],
  issuesMeta: externalIssues = [],
  months = [],
  fetchIssuesByVolume,
  onFileSelect,
  selectedFile,
  submitting = false,
  submitLabel = "Submit",
  disabledJournal = false,
  onSubmit: onSubmitProp,
  defaultJournalId,
  defaultArticleStatus = "unpublished",
  resetSignal,
  formData = {},
  isEdit = false, // ✅ New prop
}) {
  // --------------------------------------------------------------------
  // RHF setup
  // --------------------------------------------------------------------
  const ctx = useFormContext();
  const localForm = useForm({
    defaultValues: useMemo(
      () => ({
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
      }),
      []
    ),
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
    reset,
    formState: { isSubmitting },
  } = methods;
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [issuesMeta, setIssuesMeta] = useState(externalIssues || []);

  // --------------------------------------------------------------------
  // Prefill (edit mode)
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!formData || Object.keys(formData).length === 0) return;
    reset({
      ...formData,
      article_status: formData.article_status || defaultArticleStatus,
      journal_id: formData.journal_id || defaultJournalId || "",
    });
    if (formData.volume_id && fetchIssuesByVolume) {
      fetchIssuesByVolume(formData.volume_id).then((issues) => {
        setIssuesMeta(Array.isArray(issues) ? issues : []);
        if (formData.issue_id) {
          setValue("issue_id", String(formData.issue_id)); // ✅ auto-select issue
        }
      });
    }
  }, [
    formData,
    reset,
    defaultJournalId,
    defaultArticleStatus,
    fetchIssuesByVolume,
  ]);

  // --------------------------------------------------------------------
  // Reset for add mode
  // --------------------------------------------------------------------
  // useEffect(() => {
  //   if (!resetSignal) return;
  //   reset({
  //     article_status: defaultArticleStatus,
  //     journal_id: defaultJournalId ?? "",
  //     volume_id: "",
  //     issue_id: "",
  //     article_id: "",
  //     page_from: "",
  //     page_to: "",
  //     received: "",
  //     revised: "",
  //     accepted: "",
  //     published: "",
  //     month_from: "",
  //     month_to: "",
  //     doi: "",
  //     article_title: "",
  //     authors: "",
  //     abstract: "",
  //     keywords: "",
  //     references: "",
  //   });
  //   if (fileInputRef.current) fileInputRef.current.value = "";
  //   onFileSelect?.(null);
  //   setStep(0);
  // }, [resetSignal, reset, defaultJournalId, defaultArticleStatus]);
  // ─────────────────────────────────────────────
  // Reset for ADD mode (or after successful save)
  // ─────────────────────────────────────────────
  // ─────────────────────────────────────────────
  // Reset form + file input + stepper
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!resetSignal) return;

    reset({
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
    });

    // Clear file input (native)
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Reset stepper to first step
    setStep(0);
  }, [resetSignal, reset, defaultArticleStatus, defaultJournalId]);

  // --------------------------------------------------------------------
  // Watches
  // --------------------------------------------------------------------
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
  const doi = useWatch({ control, name: "doi" }) ?? "";
  const article_title = useWatch({ control, name: "article_title" }) ?? "";
  const authors = useWatch({ control, name: "authors" }) ?? "";
  const keywords = useWatch({ control, name: "keywords" }) ?? "";
  const references = useWatch({ control, name: "references" }) ?? "";

  // --------------------------------------------------------------------
  // Auto DOI
  // --------------------------------------------------------------------
  useEffect(() => {
    if (!article_id || !journal_id) return;
    const jr = journals.find((j) => String(j.id) === String(journal_id));
    if (!jr) return;
    const prefix = jr.doi_prefix?.replace(/\/$/, "") || "";
    if (prefix)
      setValue("doi", `${prefix}/${article_id}`, { shouldDirty: true });
  }, [article_id, journal_id, journals, setValue]);

  // --------------------------------------------------------------------
  // Issues + Months
  // --------------------------------------------------------------------
  // --------------------------------------------------------------------
  // Load Issues (handles both Add & Edit safely)
  // --------------------------------------------------------------------
  useEffect(() => {
    const loadIssues = async () => {
      if (!volume_id || !fetchIssuesByVolume) {
        setIssuesMeta([]);
        setValue("issue_id", "");
        return;
      }

      try {
        // reset issue field to prevent stale state
        setValue("issue_id", "", { shouldDirty: true, shouldValidate: true });

        let issues = [];

        // Detect case
        if (isEdit && formData?.issue_id) {
          // 🧩 Case B — Edit Mode
          console.log("Edit mode: fetch with include_id", formData.issue_id);
          issues = await fetchIssuesByVolume(volume_id, formData.issue_id);
        } else {
          // 🆕 Case A — Add Mode
          console.log("Add mode: normal fetch");
          issues = await fetchIssuesByVolume(volume_id);
        }

        console.log("✅ Loaded issues:", issues);
        setIssuesMeta(Array.isArray(issues) ? issues : []);

        // Prefill issue_id if editing and issue exists in response
        if (isEdit && formData?.issue_id) {
          const found = issues.some((i) => i.id == formData.issue_id);
          if (found) {
            console.log("Prefilling issue_id:", formData.issue_id);
            setValue("issue_id", String(formData.issue_id), {
              shouldDirty: false,
            });
          } else {
            console.warn("⚠️ Prefill issue not found in loaded list");
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch issues:", err);
        setIssuesMeta([]);
      }
    };

    loadIssues();
  }, [volume_id, fetchIssuesByVolume, setValue, isEdit, formData]);

  useEffect(() => {
    const loadMonthRange = async () => {
      if (!journal_id || !volume_id || !issue_id) return;
      try {
        const res = await fetch(
          `/api/month-groups?journal_id=${journal_id}&volume_id=${volume_id}&issue_id=${issue_id}`
        );
        const data = await res.json();
        if (data?.success && data.months?.length > 0) {
          const { from_month, to_month } = data.months[0];
          setValue("month_from", from_month || "");
          setValue("month_to", to_month || "");
        } else {
          setValue("month_from", "");
          setValue("month_to", "");
        }
      } catch (err) {
        console.error("❌ Failed to fetch month range:", err);
      }
    };
    loadMonthRange();
  }, [journal_id, volume_id, issue_id, setValue]);

  // --------------------------------------------------------------------
  // Title check (skip if edit)
  // --------------------------------------------------------------------
  const [titleCheck, setTitleCheck] = useState({
    checking: false,
    exists: false,
    message: "",
  });
  const titleCheckTimeout = useRef(null);

  useEffect(() => {
    if (isEdit || !article_title || !journal_id || !formData.article_id) return;

    clearTimeout(titleCheckTimeout.current);
    titleCheckTimeout.current = setTimeout(async () => {
      try {
        setTitleCheck({ checking: true, exists: false, message: "" });
        const res = await fetch(
          `/api/articles?checkTitle=1&journal_id=${journal_id}&title=${encodeURIComponent(
            article_title
          )}`
        );
        const data = await res.json();
        if (data?.exists) {
          setTitleCheck({
            checking: false,
            exists: true,
            message: "⚠️ Title already exists in this journal.",
          });
        } else {
          setTitleCheck({
            checking: false,
            exists: false,
            message: "✅ Title is unique and available.",
          });
        }
      } catch {
        setTitleCheck({
          checking: false,
          exists: false,
          message: "⚠️ Could not verify title.",
        });
      }
    }, 600);
    return () => clearTimeout(titleCheckTimeout.current);
  }, [article_title, journal_id, isEdit]);

  // --------------------------------------------------------------------
  // Stepper logic
  // --------------------------------------------------------------------
  const stripHtml = (html) =>
    (html || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  const isFilled = (val) =>
    typeof val === "string" ? stripHtml(val).length > 0 : !!val;

  const requiredByStep = {
    0: ["article_status", "journal_id", "volume_id", "issue_id", "article_id"],
    1: ["doi", "article_title", "authors", "abstract", "keywords"],
    2: ["references"],
  };

  const isStepCompleted = (idx) => {
    const vals = getValues();
    return (requiredByStep[idx] || []).every((k) => isFilled(vals[k]));
  };
  const canGoNext = isStepCompleted(step);

  const handleNext = async () => {
    await trigger(requiredByStep[step] || []);
    const vals = getValues();
    const missing =
      step === 0
        ? !vals.journal_id || !vals.volume_id || !vals.issue_id
        : step === 1
        ? !vals.doi || !vals.article_title || !vals.authors
        : step === 2
        ? !isFilled(vals.references)
        : false;
    if (missing) return alert("Please complete required fields.");
    setStep((s) => Math.min(s + 1, 2));
  };
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));

  // --------------------------------------------------------------------
  // Select handlers
  // --------------------------------------------------------------------
  const onJournalChange = (e) => {
    const v = e.target.value ?? "";
    setValue("journal_id", String(v));
    setValue("volume_id", "");
    setValue("issue_id", "");
    setValue("month_from", "");
    setValue("month_to", "");
  };
  const onVolumeChange = (e) => {
    const v = e.target.value ?? "";
    setValue("volume_id", String(v));
    setValue("issue_id", "");
    setValue("month_from", "");
    setValue("month_to", "");
  };

  // --------------------------------------------------------------------
  // Step 0 – Basic Info
  // --------------------------------------------------------------------
  const Step0 = (
    <div className="space-y-6">
      {/* article status + journal + volume + issue + article_id */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="article_status"
          control={control}
          render={({ field }) => (
            <Select
              label="Select Status"
              placeholder="Select Status"
              value={article_status}
              onValueChange={(val) => {
                field.onChange(val);
                setValue("article_status", val);
              }}
              options={[
                { value: "unpublished", label: "Unpublished" },
                { value: "published", label: "Published" },
              ]}
            />
          )}
        />

        <Controller
          name="journal_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Select Journal"
              placeholder="Choose Journal"
              value={journal_id}
              disabled={disabledJournal}
              options={journals.map((j) => ({
                value: `${j.id}`,
                label: j.journal_name,
              }))}
              onValueChange={(val) => {
                field.onChange(val);
                onJournalChange({
                  target: { value: val },
                });
              }}
            />
          )}
        />

        <Controller
          name="volume_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Select Volume"
              placeholder="Select Volume"
              value={volume_id}
              options={[
                ...volumesMeta.map((v) => ({
                  value: `${v.id}`,
                  label: v.volume_number ?? v.volume_label ?? v.id,
                })),
              ]}
              onValueChange={(val) => {
                field.onChange(val);
                onVolumeChange({
                  target: { value: val },
                });
              }}
            />
          )}
        />

        <Controller
          name="issue_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Select Issue"
              placeholder="Select Issue"
              value={issue_id}
              disabled={!volume_id}
              options={[
                ...issuesMeta.map((i) => ({
                  value: `${i.id}`,
                  label: i.issue_number ?? i.issue_label ?? i.id,
                })),
              ]}
              onValueChange={(val) => {
                field.onChange(val);
                setValue("issue_id", val);
              }}
            />
          )}
        />

        {/* Article ID */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Article ID *</label>
          <Input
            {...register("article_id")}
            value={article_id}
            onChange={(e) => setValue("article_id", e.target.value)}
            placeholder="Article ID"
            className="border rounded-md p-2 w-full"
          />
        </div>
      </div>

      {/* Page and month ranges */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register("page_from")}
          value={page_from}
          placeholder="Page From"
        />
        <Input {...register("page_to")} value={page_to} placeholder="Page To" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          {...register("month_from")}
          value={month_from}
          readOnly
          disabled
        />
        <Input {...register("month_to")} value={month_to} readOnly disabled />
      </div>

{/* Dates */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {["received", "revised", "accepted", "published"].map((k) => (
    <div key={k} className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 capitalize">
        {k}
      </label>

      <Input
        {...register(k)}
        type="date"
        className="border p-2 rounded-md"
      />
    </div>
  ))}
</div>
    </div>
  );

  // --------------------------------------------------------------------
  // Step 1 – Abstract, Upload
  // --------------------------------------------------------------------
  const Step1 = (
    <div className="space-y-4">
      <Input
        {...register("doi")}
        value={doi}
        readOnly
        className="bg-gray-100"
      />

      <div>
        <label className="block text-sm font-medium">Title *</label>
        <Input
          {...register("article_title")}
          value={article_title}
          onChange={(e) => setValue("article_title", e.target.value)}
          placeholder="Enter article title"
          className={`border p-2 rounded-md ${
            titleCheck.exists ? "border-red-500" : ""
          }`}
        />
        {!isEdit && titleCheck.message && (
          <p
            className={`text-xs mt-1 ${
              titleCheck.exists ? "text-red-600" : "text-green-600"
            }`}
          >
            {titleCheck.message}
          </p>
        )}
      </div>

      <Input
        {...register("authors")}
        value={authors}
        onChange={(e) => setValue("authors", e.target.value)}
        placeholder="Authors (comma separated)"
      />

      <Controller
        name="abstract"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextEditor
            value={value || ""}
            onChange={onChange}
            placeholder="Abstract…"
          />
        )}
      />

      <Input
        {...register("keywords")}
        value={keywords}
        onChange={(e) => setValue("keywords", e.target.value)}
        placeholder="Keywords (comma separated)"
      />

      {/* 📄 Article PDF */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Article PDF (optional)
        </label>
        <input
          key={
            selectedFile ? selectedFile.name : formData?.pdf_path || "no-file"
          } // ✅ force re-render when cleared
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const MAX = 10 * 1024 * 1024;
              if (file.size > MAX) {
                alert("PDF must be ≤ 10 MB.");
                e.target.value = "";
                return;
              }
              onFileSelect?.(file);
            }
          }}
          disabled={submitting || isSubmitting}
          className="block w-full border rounded-md p-2"
        />

        {/* ✅ Handle all states */}
        {selectedFile ? (
          <div className="text-sm mt-1">
            Selected: <strong>{selectedFile.name}</strong>{" "}
            <button
              type="button"
              onClick={() => {
                onFileSelect?.(null);
                if (fileInputRef.current) fileInputRef.current.value = ""; // clear native file input
              }}
              className="text-blue-600 underline ml-2"
            >
              remove
            </button>
          </div>
        ) : formData?.pdf_path ? (
          <div className="text-sm mt-1">
            Existing:{" "}
            <a
              href={
                formData.pdf_path.startsWith("http")
                  ? formData.pdf_path
                  : `/uploads/${formData.pdf_path.replace(/^\/+/, "")}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {formData.pdf_path.split("/").pop()}
            </a>
            <button
              type="button"
              onClick={() => {
                // 🗑 allow removing existing file before uploading new one
                onFileSelect?.(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-red-600 underline ml-3"
            >
              remove
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-500 mt-1">
            No file selected yet.
          </div>
        )}
      </div>
    </div>
  );

  // --------------------------------------------------------------------
  // Step 2 – References
  // --------------------------------------------------------------------
  const Step2 = (
    <div>
      <Controller
        name="references"
        control={control}
        render={({ field: { value, onChange } }) => (
          <TextEditor
            value={value || ""}
            onChange={onChange}
            placeholder="Enter references…"
          />
        )}
      />
    </div>
  );

  // --------------------------------------------------------------------
  // Stepper + Navigation
  // --------------------------------------------------------------------
  const Steps = (
    <>
      <div style={{ display: step === 0 ? "block" : "none" }}>{Step0}</div>
      <div style={{ display: step === 1 ? "block" : "none" }}>{Step1}</div>
      <div style={{ display: step === 2 ? "block" : "none" }}>{Step2}</div>
    </>
  );

  const stepLabels = ["Basic Info", "Abstract & Upload", "References"];
  const Stepper = (
    <div className="flex items-center justify-between mb-4">
      {stepLabels.map((label, idx) => {
        const active = idx === step;
        const done = isStepCompleted(idx);
        return (
          <div key={idx} className="flex-1 flex items-center">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : done
                  ? "bg-green-500 text-white border-green-500"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {done ? "✓" : idx + 1}
            </div>
            <div className="ml-2 text-sm font-medium">{label}</div>
            {idx < 2 && <div className="flex-1 h-0.5 bg-gray-300 mx-2" />}
          </div>
        );
      })}
    </div>
  );

  const Navigation = (
    <div className="flex justify-between pt-6 border-t mt-6">
      <button
        type="button"
        disabled={step === 0}
        onClick={handlePrev}
        className="px-4 py-2 border rounded-md text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50"
      >
        Previous
      </button>
      {step < 2 ? (
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Next
        </button>
      ) : (
        <Button type="submit" disabled={submitting || isSubmitting}>
          {submitting || isSubmitting ? "Saving..." : submitLabel}
        </Button>
      )}
    </div>
  );

  // --------------------------------------------------------------------
  // Final body + submit
  // --------------------------------------------------------------------
  const localOnSubmit = (data) => {
    if (!isEdit && titleCheck.exists) {
      alert("Duplicate title found. Please use a unique article title.");
      return;
    }
    onSubmitProp?.(data);
  };

  const body = (
    <div className="space-y-6">
      {Stepper}
      {Steps}
      {Navigation}
    </div>
  );

  if (ctx) return body;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(localOnSubmit)}>{body}</form>
    </FormProvider>
  );
}

export default React.memo(ArticleForm);
