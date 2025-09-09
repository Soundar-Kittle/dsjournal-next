"use client";

import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import moment from "moment";
// import { format } from "date-fns";
import {
  publicationFrequencies,
  languages,
  formatofpublication,
} from "@/@data/data";

export default function Addform({ editData = null, onSuccess }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const [preview, setPreview] = useState(null);
  const [showPrintIssn, setShowPrintIssn] = useState(false);
  const [showEissn, setShowEissn] = useState(true);

  useEffect(() => {
    if (editData) {
      reset({
        ...editData,
        year_started: editData.year_started
          ? `${editData.year_started}-01-01`
          : "",
      });
      setPreview(editData.cover_image ? `/${editData.cover_image}` : null);
      setShowPrintIssn(Boolean(editData.is_print_issn));
      setShowEissn(Boolean(editData.is_e_issn));
    }
  }, [editData, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    for (const key in data) {
      if (key === "cover_image" && data[key]?.[0]) {
        formData.append("cover_image", data[key][0]);
      } else {
        formData.append(key, data[key]);
      }
    }
    formData.append("is_print_issn", showPrintIssn ? "1" : "0");
    formData.append("is_e_issn", showEissn ? "1" : "0");

    if (data.year_started) {
      formData.set("year_started", new Date(data.year_started).getFullYear());
    }

    const res = await fetch("/api/journals", {
      method: editData ? "PATCH" : "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      reset();
      setPreview(null);
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="md:col-span-2">
        <Label className="text-lg">Journal Page</Label>
      </div>
      <div>
        <Label>Journal Name</Label>
        <Input {...register("journal_name", { required: true })} />
      </div>
      <div>
        <Label>Short Name</Label>
        <Input {...register("short_name", { required: true })} />
      </div>

      <div className="md:col-span-2 flex gap-4">
        <Button
          type="button"
          variant={showPrintIssn ? "default" : "outline"}
          onClick={() => setShowPrintIssn(!showPrintIssn)}
        >
          {showPrintIssn ? "Hide Print ISSN" : "Add Print ISSN"}
        </Button>
        <Button
          type="button"
          variant={showEissn ? "default" : "outline"}
          onClick={() => setShowEissn(!showEissn)}
        >
          {showEissn ? "Hide e-ISSN" : "Add e-ISSN"}
        </Button>
      </div>

      {showPrintIssn && (
        <div>
          <Label>Print ISSN</Label>
          <Input {...register("issn_print")} />
        </div>
      )}
      {showEissn && (
        <div>
          <Label>e-ISSN</Label>
          <Input {...register("issn_online")} />
        </div>
      )}

      <div>
        <Label>Subject</Label>
        <Input {...register("subject")} />
      </div>
      <div>
        <Label>Year Started</Label>
        {/* <Controller
          control={control}
          name="year_started"
          render={({ field }) => (
            <Input
              type="date"
              onChange={(e) => {
                const selected = new Date(e.target.value);
                field.onChange(selected);
              }}
              value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
              className="w-full"
              placeholder="Pick a date"
            />
          )}
        /> */}
        <Controller
          control={control}
          name="year_started"
          render={({ field }) => (
            <Input
              type="date"
              onChange={(e) => {
                const selected = moment(e.target.value, "YYYY-MM-DD").toDate();
                field.onChange(selected);
              }}
              value={
                field.value ? moment(field.value).format("YYYY-MM-DD") : ""
              }
              className="w-full"
              placeholder="Pick a date"
            />
          )}
        />
      </div>
      <div>
        <Label>Publication Frequency</Label>
        <select
          {...register("publication_frequency")}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Select</option>
          {publicationFrequencies.map((freq) => (
            <option key={freq} value={freq}>
              {freq}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Language</Label>
        <select
          {...register("language")}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Select</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Submission Email</Label>
        <Input type="email" {...register("paper_submission_id")} />
      </div>
      <div>
        <Label>Format</Label>
        <select
          {...register("format")}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Select</option>
          {formatofpublication.map((publishtype) => (
            <option key={publishtype} value={publishtype}>
              {publishtype}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Publication Fee</Label>
        <Input {...register("publication_fee")} />
      </div>
      <div>
        <Label>Publisher</Label>
        <Input {...register("publisher")} />
      </div>
      <div>
        <Label>DOI Prefix</Label>
        <Input {...register("doi_prefix")} />
      </div>
      <div className="md:col-span-2">
        <Label>Cover Image</Label>
        <Input
          type="file"
          accept="image/*"
          {...register("cover_image")}
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setPreview(URL.createObjectURL(e.target.files[0]));
            }
          }}
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 h-32 rounded border shadow"
          />
        )}
      </div>
      <div className="md:col-span-2 text-right">
        <Button type="submit" className="cursor-pointer">
          {editData ? "Update Journal" : "Save Journal"}
        </Button>
      </div>
    </form>
  );
}
