// "use client";

// import { useForm, Controller } from "react-hook-form";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Button } from "@/components/ui/button";
// import { useEffect, useState } from "react";
// import moment from "moment";
// // import { format } from "date-fns";
// import {
//   publicationFrequencies,
//   languages,
//   formatofpublication,
// } from "@/@data/data";

// export default function Addform({ editData = null, onSuccess }) {
//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm();

//   const [preview, setPreview] = useState(null);
//   const [showPrintIssn, setShowPrintIssn] = useState(false);
//   const [showEissn, setShowEissn] = useState(true);
//   const [bannerPreview, setBannerPreview] = useState(null);

//   useEffect(() => {
//     if (editData) {
//       reset({
//         ...editData,
//         year_started: editData.year_started
//           ? `${editData.year_started}-01-01`
//           : "",
//       });
//       setPreview(editData.cover_image ? `/${editData.cover_image}` : null);
//       setBannerPreview(
//         editData.banner_image ? `/${editData.banner_image}` : null
//       );
//       setShowPrintIssn(Boolean(editData.is_print_issn));
//       setShowEissn(Boolean(editData.is_e_issn));
//     }
//   }, [editData, reset]);

//   const onSubmit = async (data) => {
//     const formData = new FormData();
//     for (const key in data) {
//       if (key === "cover_image" && data[key]?.[0]) {
//         formData.append("cover_image", data[key][0]);
//       } else if (key === "banner_image" && data[key]?.[0]) {
//         formData.append("banner_image", data[key][0]);
//       } else {
//         formData.append(key, data[key]);
//       }
//     }
//     formData.append("is_print_issn", showPrintIssn ? "1" : "0");
//     formData.append("is_e_issn", showEissn ? "1" : "0");

//     if (data.year_started) {
//       formData.set("year_started", new Date(data.year_started).getFullYear());
//     }

//     const res = await fetch("/api/journals", {
//       method: editData ? "PATCH" : "POST",
//       body: formData,
//     });

//     const result = await res.json();
//     if (result.success) {
//       reset();
//       setPreview(null);
//       setBannerPreview(null);
//       if (onSuccess) onSuccess();
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6"
//     >
//       <div className="md:col-span-2">
//         <Label className="text-lg">Journal Page</Label>
//       </div>
//       <div>
//         <Label>Journal Name</Label>
//         <Input {...register("journal_name", { required: true })} />
//       </div>
//       <div>
//         <Label>Short Name</Label>
//         <Input {...register("short_name", { required: true })} />
//       </div>

//       <div className="md:col-span-2 flex gap-4">
//         <Button
//           type="button"
//           variant={showPrintIssn ? "default" : "outline"}
//           onClick={() => setShowPrintIssn(!showPrintIssn)}
//         >
//           {showPrintIssn ? "Hide Print ISSN" : "Add Print ISSN"}
//         </Button>
//         <Button
//           type="button"
//           variant={showEissn ? "default" : "outline"}
//           onClick={() => setShowEissn(!showEissn)}
//         >
//           {showEissn ? "Hide e-ISSN" : "Add e-ISSN"}
//         </Button>
//       </div>

//       {showPrintIssn && (
//         <div>
//           <Label>Print ISSN</Label>
//           <Input {...register("issn_print")} />
//         </div>
//       )}
//       {showEissn && (
//         <div>
//           <Label>e-ISSN</Label>
//           <Input {...register("issn_online")} />
//         </div>
//       )}

//       <div>
//         <Label>Subject</Label>
//         <Input {...register("subject")} />
//       </div>
//       <div>
//         <Label>Year Started</Label>
//         {/* <Controller
//           control={control}
//           name="year_started"
//           render={({ field }) => (
//             <Input
//               type="date"
//               onChange={(e) => {
//                 const selected = new Date(e.target.value);
//                 field.onChange(selected);
//               }}
//               value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
//               className="w-full"
//               placeholder="Pick a date"
//             />
//           )}
//         /> */}
//         <Controller
//           control={control}
//           name="year_started"
//           render={({ field }) => (
//             <Input
//               type="date"
//               onChange={(e) => {
//                 const selected = moment(e.target.value, "YYYY-MM-DD").toDate();
//                 field.onChange(selected);
//               }}
//               value={
//                 field.value ? moment(field.value).format("YYYY-MM-DD") : ""
//               }
//               className="w-full"
//               placeholder="Pick a date"
//             />
//           )}
//         />
//       </div>
//       <div>
//         <Label>Publication Frequency</Label>
//         <select
//           {...register("publication_frequency")}
//           className="w-full border rounded px-2 py-1"
//         >
//           <option value="">Select</option>
//           {publicationFrequencies.map((freq) => (
//             <option key={freq} value={freq}>
//               {freq}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <Label>Language</Label>
//         <select
//           {...register("language")}
//           className="w-full border rounded px-2 py-1"
//         >
//           <option value="">Select</option>
//           {languages.map((lang) => (
//             <option key={lang} value={lang}>
//               {lang}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <Label>Submission Email</Label>
//         <Input type="email" {...register("paper_submission_id")} />
//       </div>
//       <div>
//         <Label>Format</Label>
//         <select
//           {...register("format")}
//           className="w-full border rounded px-2 py-1"
//         >
//           <option value="">Select</option>
//           {formatofpublication.map((publishtype) => (
//             <option key={publishtype} value={publishtype}>
//               {publishtype}
//             </option>
//           ))}
//         </select>
//       </div>
//       <div>
//         <Label>Publication Fee</Label>
//         <Input {...register("publication_fee")} />
//       </div>
//       <div>
//         <Label>Publisher</Label>
//         <Input {...register("publisher")} />
//       </div>
//       <div>
//         <Label>DOI Prefix</Label>
//         <Input {...register("doi_prefix")} />
//       </div>
//       <div className="md:col-span-2">
//         <Label>Cover Image</Label>
//         <Input
//           type="file"
//           accept="image/*"
//           {...register("cover_image")}
//           onChange={(e) => {
//             if (e.target.files?.[0]) {
//               setPreview(URL.createObjectURL(e.target.files[0]));
//             }
//           }}
//         />
//         {preview && (
//           <img
//             src={preview}
//             alt="Preview"
//             className="mt-2 h-32 rounded border shadow"
//           />
//         )}
//       </div>

//       <div className="md:col-span-2">
//         <Label>Banner Image</Label>
//         <Input
//           type="file"
//           accept="image/*"
//           {...register("banner_image")}
//           onChange={(e) => {
//             if (e.target.files?.[0]) {
//               setBannerPreview(URL.createObjectURL(e.target.files[0]));
//             }
//           }}
//         />
//         {bannerPreview && (
//           <img
//             src={bannerPreview}
//             alt="Banner Preview"
//             className="mt-2 h-32 rounded border shadow"
//           />
//         )}
//       </div>

//       <div className="md:col-span-2 text-right">
//         <Button type="submit" className="cursor-pointer">
//           {editData ? "Update Journal" : "Save Journal"}
//         </Button>
//       </div>
//     </form>
//   );
// }

/////////////////////
/////////////////////
/////////////////////
/////////////////////
/////////////////////
/////////////////////
/////////////////////
/////////////////////

"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import moment from "moment";

import { Input, Button, Select } from "@/components/ui";
import { CustomDropZone } from "@/components/ui/FormInput/Inputs";
import {
  publicationFrequencies,
  languages,
  formatofpublication,
} from "@/@data/data";

/* ------------------ ✅ Validation Schema ------------------ */
const schema = yup.object({
  journal_name: yup.string().required("Journal Name is required"),
  short_name: yup.string().required("Short Name is required"),
  issn_print: yup.string().nullable(),
  issn_online: yup.string().nullable(),
  subject: yup.string().nullable(),
  year_started: yup
    .date()
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value)),
  publication_frequency: yup.string().nullable(),
  language: yup.string().nullable(),
  paper_submission_id: yup.string().nullable(),
  format: yup.string().nullable(),
  publication_fee: yup.string().nullable(),
  publisher: yup.string().nullable(),
  doi_prefix: yup.string().nullable(),
  cover_image: yup.mixed().nullable(),
  banner_image: yup.mixed().nullable(),
  paper_template: yup.mixed().nullable(),
  copyright_form: yup.mixed().nullable(),
});

/* ------------------ ✅ Component ------------------ */
export default function Addform({ editData = null, onSuccess }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cover_image: { cover_image: [editData?.cover_image] } || {
        cover_image: [],
      },
      banner_image: { banner_image: [editData?.banner_image] } || {
        banner_image: [],
      },
      paper_template: { paper_template: [editData?.paper_template] } || {
        paper_template: [],
      },
      copyright_form: { copyright_form: [editData?.copyright_form] } || {
        copyright_form: [],
      },
    },
    resolver: yupResolver(schema),
  });

  /* ------------------ State ------------------ */
  const [showPrintIssn, setShowPrintIssn] = useState(false);
  const [showEissn, setShowEissn] = useState(true);

  // DropZone states
  const [coverImage, setCoverImage] = useState({ cover_image: [] });
  const [bannerImage, setBannerImage] = useState({ banner_image: [] });
  const [paperTemplate, setPaperTemplate] = useState({ paper_template: [] });
  const [copyrightForm, setCopyrightForm] = useState({ copyright_form: [] });

  /* ------------------ Sync DropZone with RHF ------------------ */
  useEffect(() => {
    setValue("cover_image", coverImage);
    setValue("banner_image", bannerImage);
    setValue("paper_template", paperTemplate);
    setValue("copyright_form", copyrightForm);
  }, [coverImage, bannerImage, paperTemplate, copyrightForm, setValue]);

  /* ------------------ Prefill on Edit ------------------ */
  useEffect(() => {
    if (!editData) return;

    reset({
      ...editData,
      year_started: editData.year_started
        ? `${editData.year_started}-01-01`
        : "",
    });

    setShowPrintIssn(Boolean(editData.is_print_issn));
    setShowEissn(Boolean(editData.is_e_issn));
    if (editData.cover_image)
      setCoverImage({ cover_image: [editData.cover_image] });
    if (editData.banner_image)
      setBannerImage({ banner_image: [editData.banner_image] });
    if (editData.paper_template)
      setPaperTemplate({ paper_template: [editData.paper_template] });
    if (editData.copyright_form)
      setCopyrightForm({ copyright_form: [editData.copyright_form] });
  }, [editData, reset]);

  /* ------------------ Submit ------------------ */
  const onSubmit = async (data) => {
    const fd = new FormData();

    fd.append("folder", "journal_banners");
    fd.append("is_print_issn", showPrintIssn ? "1" : "0");
    fd.append("is_e_issn", showEissn ? "1" : "0");
    fd.append("journal_name", data.journal_name);
    fd.append("short_name", data.short_name);
    fd.append("issn_print", data.issn_print);
    fd.append("issn_online", data.issn_online);
    fd.append("subject", data.subject);
    fd.append("year_started", data.year_started ? data.year_started : null);
    fd.append("publication_frequency", data.publication_frequency);
    fd.append("language", data.language);
    fd.append("paper_submission_id", data.paper_submission_id);
    fd.append("format", data.format);
    fd.append("publication_fee", data.publication_fee);
    fd.append("publisher", data.publisher);
    fd.append("doi_prefix", data.doi_prefix);
    if (data.year_started) {
      fd.set("year_started", new Date(data.year_started).getFullYear());
    }

    if (coverImage.cover_image?.[0] instanceof File)
      fd.append("cover_image", coverImage.cover_image[0]);
    if (bannerImage.banner_image?.[0] instanceof File)
      fd.append("banner_image", bannerImage.banner_image[0]);
    if (paperTemplate.paper_template?.[0] instanceof File)
      fd.append("paper_template", paperTemplate.paper_template[0]);
    if (copyrightForm.copyright_form?.[0] instanceof File)
      fd.append("copyright_form", copyrightForm.copyright_form[0]);
    fd.append("cover_image_state", JSON.stringify(coverImage));
    fd.append("banner_image_state", JSON.stringify(bannerImage));
    fd.append("paper_template_state", JSON.stringify(paperTemplate));
    fd.append("copyright_form_state", JSON.stringify(copyrightForm));

    if (editData) fd.append("id", editData.id);
    console.log([...fd.entries()]);

    const res = await fetch("/api/journals", {
      method: editData ? "PATCH" : "POST",
      body: fd,
    });

    const result = await res.json();
    if (result.success) {
      reset();
      setCoverImage({ cover_image: [] });
      setBannerImage({ banner_image: [] });
      setPaperTemplate({ paper_template: [] });
      setCopyrightForm({ copyright_form: [] });
      onSuccess?.();
    }
  };

  /* ------------------ JSX ------------------ */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* ---------- Journal Basics ---------- */}
      <Input
        label="Journal Name"
        placeholder="Enter Journal Name"
        error={errors.journal_name?.message}
        {...register("journal_name")}
        isRequired
      />

      <Input
        label="Short Name"
        placeholder="Enter Short Name"
        error={errors.short_name?.message}
        {...register("short_name")}
        isRequired
      />

      {/* ISSN toggles */}
      <div className="col-span-full flex flex-wrap gap-4">
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
        <Input
          label="Print ISSN"
          placeholder="Enter Print ISSN"
          {...register("issn_print")}
        />
      )}

      {showEissn && (
        <Input
          label="e-ISSN"
          placeholder="Enter e-ISSN"
          {...register("issn_online")}
        />
      )}

      <Input
        label="Subject"
        placeholder="Enter Subject"
        {...register("subject")}
      />

      <Controller
        control={control}
        name="year_started"
        render={({ field }) => (
          <Input
            label="Year Started"
            type="date"
            value={field.value ? moment(field.value).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              field.onChange(moment(e.target.value, "YYYY-MM-DD").toDate())
            }
          />
        )}
      />

      <Controller
        control={control}
        name="publication_frequency"
        render={({ field }) => (
          <Select
            {...field}
            label="Publication Frequency"
            placeholder="Select frequency"
            options={publicationFrequencies.map((v) => ({
              value: v,
              label: v,
            }))}
            onValueChange={field.onChange}
          />
        )}
      />

      <Controller
        control={control}
        name="language"
        render={({ field }) => (
          <Select
            {...field}
            label="Language"
            placeholder="Select language"
            options={languages.map((v) => ({ value: v, label: v }))}
            onValueChange={field.onChange}
          />
        )}
      />

      <Input
        label="Submission Email"
        type="email"
        placeholder="Enter Submission Email"
        {...register("paper_submission_id")}
      />

      <Controller
        control={control}
        name="format"
        render={({ field }) => (
          <Select
            {...field}
            label="Format"
            placeholder="Select format"
            options={formatofpublication.map((v) => ({
              value: v,
              label: v,
            }))}
            onValueChange={field.onChange}
          />
        )}
      />

      <Input
        label="Publication Fee"
        placeholder="e.g., Free of Cost"
        {...register("publication_fee")}
      />

      <Input
        label="Publisher"
        placeholder="Enter Publisher"
        {...register("publisher")}
      />

      <Input
        label="DOI Prefix"
        placeholder="Enter DOI Prefix"
        {...register("doi_prefix")}
      />

      {/* ---------- File Uploads ---------- */}
      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CustomDropZone
          name="cover_image"
          label="Cover Image"
          number_of_images={1}
          errors={errors.cover_image}
          fileType="image"
          image_size={500 * 1024}
          uploadedFiles={coverImage}
          setUploadedFiles={setCoverImage}
        />

        <CustomDropZone
          name="banner_image"
          label="Banner Image"
          number_of_images={1}
          fileType="image"
          uploadedFiles={bannerImage}
          setUploadedFiles={setBannerImage}
          errors={errors.banner_image}
          image_size={500 * 1024}
        />

        <CustomDropZone
          name="paper_template"
          label="Paper Template"
          number_of_images={1}
          fileType="docs"
          uploadedFiles={paperTemplate}
          setUploadedFiles={setPaperTemplate}
          errors={errors.paper_template}
          image_size={1024 * 1024}
        />

        <CustomDropZone
          name="copyright_form"
          label="Copyright Form"
          number_of_images={1}
          fileType="docs"
          uploadedFiles={copyrightForm}
          setUploadedFiles={setCopyrightForm}
          errors={errors.copyright_form}
          image_size={1024 * 1024}
        />
      </div>

      {/* ---------- Submit ---------- */}
      <div className="col-span-full text-right mt-6">
        <Button type="submit" className="cursor-pointer">
          {editData ? "Update Journal" : "Save Journal"}
        </Button>
      </div>
    </form>
  );
}
