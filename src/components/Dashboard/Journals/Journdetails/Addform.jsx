// "use client";

// import React, { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import moment from "moment";

// import { Input, Button, Select } from "@/components/ui";
// import { CustomDropZone } from "@/components/ui/FormInput/Inputs";
// import {
//   publicationFrequencies,
//   languages,
//   formatofpublication,
// } from "@/@data/data";

// /* ------------------ ✅ Validation Schema ------------------ */
// const schema = yup.object({
//   journal_name: yup.string().required("Journal Name is required"),
//   short_name: yup.string().required("Short Name is required"),
//   issn_print: yup.string().nullable(),
//   issn_online: yup.string().nullable(),
//   subject: yup.string().nullable(),
//   year_started: yup
//     .date()
//     .nullable()
//     .transform((value, originalValue) => (originalValue === "" ? null : value)),
//   publication_frequency: yup.string().nullable(),
//   language: yup.string().nullable(),
//   paper_submission_id: yup.string().nullable(),
//   format: yup.string().nullable(),
//   publication_fee: yup.string().nullable(),
//   publisher: yup.string().nullable(),
//   doi_prefix: yup.string().nullable(),
//   cover_image: yup.mixed().nullable(),
//   banner_image: yup.mixed().nullable(),
//   paper_template: yup.mixed().nullable(),
//   copyright_form: yup.mixed().nullable(),
// });

// /* ------------------ ✅ Component ------------------ */
// export default function Addform({ editData = null, onSuccess }) {
//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       cover_image: { cover_image: [editData?.cover_image] } || {
//         cover_image: [],
//       },
//       banner_image: { banner_image: [editData?.banner_image] } || {
//         banner_image: [],
//       },
//       paper_template: { paper_template: [editData?.paper_template] } || {
//         paper_template: [],
//       },
//       copyright_form: { copyright_form: [editData?.copyright_form] } || {
//         copyright_form: [],
//       },
//     },
//     resolver: yupResolver(schema),
//   });

//   /* ------------------ State ------------------ */
//   const [showPrintIssn, setShowPrintIssn] = useState(false);
//   const [showEissn, setShowEissn] = useState(true);

//   // DropZone states
//   const [coverImage, setCoverImage] = useState({ cover_image: [] });
//   const [bannerImage, setBannerImage] = useState({ banner_image: [] });
//   const [paperTemplate, setPaperTemplate] = useState({ paper_template: [] });
//   const [copyrightForm, setCopyrightForm] = useState({ copyright_form: [] });

//   /* ------------------ Sync DropZone with RHF ------------------ */
//   useEffect(() => {
//     setValue("cover_image", coverImage);
//     setValue("banner_image", bannerImage);
//     setValue("paper_template", paperTemplate);
//     setValue("copyright_form", copyrightForm);
//   }, [coverImage, bannerImage, paperTemplate, copyrightForm, setValue]);

//   /* ------------------ Prefill on Edit ------------------ */
//   useEffect(() => {
//     if (!editData) return;

//     reset({
//       ...editData,
//       year_started: editData.year_started
//         ? `${editData.year_started}-01-01`
//         : "",
//     });

//     setShowPrintIssn(Boolean(editData.is_print_issn));
//     setShowEissn(Boolean(editData.is_e_issn));
//     if (editData.cover_image)
//       setCoverImage({ cover_image: [editData.cover_image] });
//     if (editData.banner_image)
//       setBannerImage({ banner_image: [editData.banner_image] });
//     if (editData.paper_template)
//       setPaperTemplate({ paper_template: [editData.paper_template] });
//     if (editData.copyright_form)
//       setCopyrightForm({ copyright_form: [editData.copyright_form] });
//   }, [editData, reset]);

//   /* ------------------ Submit ------------------ */
//   const onSubmit = async (data) => {
//     const fd = new FormData();

//     fd.append("folder", "journal_banners");
//     fd.append("is_print_issn", showPrintIssn ? "1" : "0");
//     fd.append("is_e_issn", showEissn ? "1" : "0");
//     fd.append("journal_name", data.journal_name);
//     fd.append("short_name", data.short_name);
//     fd.append("issn_print", data.issn_print);
//     fd.append("issn_online", data.issn_online);
//     fd.append("subject", data.subject);
//     fd.append("year_started", data.year_started ? data.year_started : null);
//     fd.append("publication_frequency", data.publication_frequency);
//     fd.append("language", data.language);
//     fd.append("paper_submission_id", data.paper_submission_id);
//     fd.append("format", data.format);
//     fd.append("publication_fee", data.publication_fee);
//     fd.append("publisher", data.publisher);
//     fd.append("doi_prefix", data.doi_prefix);
//     if (data.year_started) {
//       fd.set("year_started", new Date(data.year_started).getFullYear());
//     }

//     if (coverImage.cover_image?.[0] instanceof File)
//       fd.append("cover_image", coverImage.cover_image[0]);
//     if (bannerImage.banner_image?.[0] instanceof File)
//       fd.append("banner_image", bannerImage.banner_image[0]);
//     if (paperTemplate.paper_template?.[0] instanceof File)
//       fd.append("paper_template", paperTemplate.paper_template[0]);
//     if (copyrightForm.copyright_form?.[0] instanceof File)
//       fd.append("copyright_form", copyrightForm.copyright_form[0]);
//     fd.append("cover_image_state", JSON.stringify(coverImage));
//     fd.append("banner_image_state", JSON.stringify(bannerImage));
//     fd.append("paper_template_state", JSON.stringify(paperTemplate));
//     fd.append("copyright_form_state", JSON.stringify(copyrightForm));

//     if (editData) fd.append("id", editData.id);
//     console.log([...fd.entries()]);

//     const res = await fetch("/api/journals", {
//       method: editData ? "PATCH" : "POST",
//       body: fd,
//     });

//     const result = await res.json();
//     if (result.success) {
//       reset();
//       setCoverImage({ cover_image: [] });
//       setBannerImage({ banner_image: [] });
//       setPaperTemplate({ paper_template: [] });
//       setCopyrightForm({ copyright_form: [] });
//       onSuccess?.();
//     }
//   };

//   /* ------------------ JSX ------------------ */
//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
//     >
//       {/* ---------- Journal Basics ---------- */}
//       <Input
//         label="Journal Name"
//         placeholder="Enter Journal Name"
//         error={errors.journal_name?.message}
//         {...register("journal_name")}
//         isRequired
//       />

//       <Input
//         label="Short Name"
//         placeholder="Enter Short Name"
//         error={errors.short_name?.message}
//         {...register("short_name")}
//         isRequired
//       />

//       {/* ISSN toggles */}
//       <div className="col-span-full flex flex-wrap gap-4">
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
//         <Input
//           label="Print ISSN"
//           placeholder="Enter Print ISSN"
//           {...register("issn_print")}
//         />
//       )}

//       {showEissn && (
//         <Input
//           label="e-ISSN"
//           placeholder="Enter e-ISSN"
//           {...register("issn_online")}
//         />
//       )}

//       <Input
//         label="Subject"
//         placeholder="Enter Subject"
//         {...register("subject")}
//       />

//       <Controller
//         control={control}
//         name="year_started"
//         render={({ field }) => (
//           <Input
//             label="Year Started"
//             type="date"
//             value={field.value ? moment(field.value).format("YYYY-MM-DD") : ""}
//             onChange={(e) =>
//               field.onChange(moment(e.target.value, "YYYY-MM-DD").toDate())
//             }
//           />
//         )}
//       />

//       <Controller
//         control={control}
//         name="publication_frequency"
//         render={({ field }) => (
//           <Select
//             {...field}
//             label="Publication Frequency"
//             placeholder="Select frequency"
//             options={publicationFrequencies.map((v) => ({
//               value: v,
//               label: v,
//             }))}
//             onValueChange={field.onChange}
//           />
//         )}
//       />

//       <Controller
//         control={control}
//         name="language"
//         render={({ field }) => (
//           <Select
//             {...field}
//             label="Language"
//             placeholder="Select language"
//             options={languages.map((v) => ({ value: v, label: v }))}
//             onValueChange={field.onChange}
//           />
//         )}
//       />

//       <Input
//         label="Submission Email"
//         type="email"
//         placeholder="Enter Submission Email"
//         {...register("paper_submission_id")}
//       />

//       <Controller
//         control={control}
//         name="format"
//         render={({ field }) => (
//           <Select
//             {...field}
//             label="Format"
//             placeholder="Select format"
//             options={formatofpublication.map((v) => ({
//               value: v,
//               label: v,
//             }))}
//             onValueChange={field.onChange}
//           />
//         )}
//       />

//       <Input
//         label="Publication Fee"
//         placeholder="e.g., Free of Cost"
//         {...register("publication_fee")}
//       />

//       <Input
//         label="Publisher"
//         placeholder="Enter Publisher"
//         {...register("publisher")}
//       />

//       <Input
//         label="DOI Prefix"
//         placeholder="Enter DOI Prefix"
//         {...register("doi_prefix")}
//       />

//       {/* ---------- File Uploads ---------- */}
//       <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         <CustomDropZone
//           name="cover_image"
//           label="Cover Image"
//           number_of_images={1}
//           errors={errors.cover_image}
//           fileType="image"
//           image_size={500 * 1024}
//           uploadedFiles={coverImage}
//           setUploadedFiles={setCoverImage}
//         />

//         <CustomDropZone
//           name="banner_image"
//           label="Banner Image"
//           number_of_images={1}
//           fileType="image"
//           uploadedFiles={bannerImage}
//           setUploadedFiles={setBannerImage}
//           errors={errors.banner_image}
//           image_size={500 * 1024}
//         />

//         <CustomDropZone
//           name="paper_template"
//           label="Paper Template"
//           number_of_images={1}
//           fileType="docs"
//           uploadedFiles={paperTemplate}
//           setUploadedFiles={setPaperTemplate}
//           errors={errors.paper_template}
//           image_size={1024 * 1024}
//         />

//         <CustomDropZone
//           name="copyright_form"
//           label="Copyright Form"
//           number_of_images={1}
//           fileType="docs"
//           uploadedFiles={copyrightForm}
//           setUploadedFiles={setCopyrightForm}
//           errors={errors.copyright_form}
//           image_size={1024 * 1024}
//         />
//       </div>

//       {/* ---------- Submit ---------- */}
//       <div className="col-span-full text-right mt-6">
//         <Button type="submit" className="cursor-pointer">
//           {editData ? "Update Journal" : "Save Journal"}
//         </Button>
//       </div>
//     </form>
//   );
// }

//////////////////////
//////////////////////
//////////////////////
//////////////////////
//////////////////////
//////////////////////

// "use client";

// import React, { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import moment from "moment";

// import { Input, Button, Select } from "@/components/ui";
// import { CustomDropZone } from "@/components/ui/FormInput/Inputs";
// import {
//   publicationFrequencies,
//   languages,
//   formatofpublication,
// } from "@/@data/data";

// /* ------------------ ✅ Validation Schema ------------------ */
// const schema = yup.object({
//   journal_name: yup.string().required("Journal Name is required"),
//   short_name: yup.string().required("Short Name is required"),
//   issn_print: yup.string().nullable(),
//   issn_online: yup.string().nullable(),
//   subject: yup.string().nullable(),
//   year_started: yup
//     .date()
//     .nullable()
//     .transform((value, originalValue) => (originalValue === "" ? null : value)),
//   publication_frequency: yup.string().nullable(),
//   language: yup.string().nullable(),
//   paper_submission_id: yup.string().nullable(),
//   format: yup.string().nullable(),
//   publication_fee: yup.string().nullable(),
//   publisher: yup.string().nullable(),
//   doi_prefix: yup.string().nullable(),
//   cover_image: yup.mixed().nullable(),
//   banner_image: yup.mixed().nullable(),
//   paper_template: yup.mixed().nullable(),
//   copyright_form: yup.mixed().nullable(),
// });

// /* ------------------ ✅ Component ------------------ */
// export default function Addform({ editData = null, onSuccess }) {
//   /* ------------------ State ------------------ */
//   const [showPrintIssn, setShowPrintIssn] = useState(
//     Boolean(editData?.is_print_issn)
//   );
//   const [showEissn, setShowEissn] = useState(Boolean(editData?.is_e_issn));

//   // DropZone states
//   const [coverImage, setCoverImage] = useState({
//     cover_image: editData?.cover_image ? [editData.cover_image] : [],
//   });
//   const [bannerImage, setBannerImage] = useState({
//     banner_image: editData?.banner_image ? [editData.banner_image] : [],
//   });
//   const [paperTemplate, setPaperTemplate] = useState({
//     paper_template: editData?.paper_template ? [editData.paper_template] : [],
//   });
//   const [copyrightForm, setCopyrightForm] = useState({
//     copyright_form: editData?.copyright_form ? [editData.copyright_form] : [],
//   });

//   /* ------------------ React Hook Form ------------------ */
//   const {
//     register,
//     handleSubmit,
//     control,
//     setValue,
//     formState: { errors },
//     reset,
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       journal_name: editData?.journal_name || "",
//       short_name: editData?.short_name || "",
//       issn_print: editData?.issn_print || "",
//       issn_online: editData?.issn_online || "",
//       subject: editData?.subject || "",
//       year_started: editData?.year_started
//         ? `${editData.year_started}-01-01`
//         : "",
//       publication_frequency: editData?.publication_frequency || "",
//       language: editData?.language || "",
//       paper_submission_id: editData?.paper_submission_id || "",
//       format: editData?.format || "",
//       publication_fee: editData?.publication_fee || "",
//       publisher: editData?.publisher || "",
//       doi_prefix: editData?.doi_prefix || "",
//       cover_image: {
//         cover_image: editData?.cover_image ? [editData.cover_image] : [],
//       },
//       banner_image: {
//         banner_image: editData?.banner_image ? [editData.banner_image] : [],
//       },
//       paper_template: {
//         paper_template: editData?.paper_template
//           ? [editData.paper_template]
//           : [],
//       },
//       copyright_form: {
//         copyright_form: editData?.copyright_form
//           ? [editData.copyright_form]
//           : [],
//       },
//     },
//   });

//   /* ------------------ Sync DropZone with RHF ------------------ */
//   useEffect(() => {
//     setValue("cover_image", coverImage);
//     setValue("banner_image", bannerImage);
//     setValue("paper_template", paperTemplate);
//     setValue("copyright_form", copyrightForm);
//   }, [coverImage, bannerImage, paperTemplate, copyrightForm, setValue]);

//   /* ------------------ Submit ------------------ */
//   const onSubmit = async (data) => {
//     const fd = new FormData();

//     fd.append("folder", "journal_banners");
//     fd.append("is_print_issn", showPrintIssn ? "1" : "0");
//     fd.append("is_e_issn", showEissn ? "1" : "0");
//     fd.append("journal_name", data.journal_name);
//     fd.append("short_name", data.short_name);
//     fd.append("issn_print", data.issn_print);
//     fd.append("issn_online", data.issn_online);
//     fd.append("subject", data.subject);
//     fd.append("year_started", data.year_started ? data.year_started : null);
//     fd.append("publication_frequency", data.publication_frequency);
//     fd.append("language", data.language);
//     fd.append("paper_submission_id", data.paper_submission_id);
//     fd.append("format", data.format);
//     fd.append("publication_fee", data.publication_fee);
//     fd.append("publisher", data.publisher);
//     fd.append("doi_prefix", data.doi_prefix);
//     if (data.year_started) {
//       fd.set("year_started", new Date(data.year_started).getFullYear());
//     }

//     if (coverImage.cover_image?.[0] instanceof File)
//       fd.append("cover_image", coverImage.cover_image[0]);
//     if (bannerImage.banner_image?.[0] instanceof File)
//       fd.append("banner_image", bannerImage.banner_image[0]);
//     if (paperTemplate.paper_template?.[0] instanceof File)
//       fd.append("paper_template", paperTemplate.paper_template[0]);
//     if (copyrightForm.copyright_form?.[0] instanceof File)
//       fd.append("copyright_form", copyrightForm.copyright_form[0]);

//     fd.append("cover_image_state", JSON.stringify(coverImage));
//     fd.append("banner_image_state", JSON.stringify(bannerImage));
//     fd.append("paper_template_state", JSON.stringify(paperTemplate));
//     fd.append("copyright_form_state", JSON.stringify(copyrightForm));

//     if (editData) fd.append("id", editData.id);

//     const res = await fetch("/api/journals", {
//       method: editData ? "PATCH" : "POST",
//       body: fd,
//     });

//     const result = await res.json();
//     if (result.success) {
//       reset();
//       setCoverImage({ cover_image: [] });
//       setBannerImage({ banner_image: [] });
//       setPaperTemplate({ paper_template: [] });
//       setCopyrightForm({ copyright_form: [] });
//       onSuccess?.();
//     }
//   };

//   /* ------------------ JSX ------------------ */
//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
//     >
//       {/* ---------- Journal Basics ---------- */}
//       <Input
//         label="Journal Name"
//         placeholder="Enter Journal Name"
//         error={errors.journal_name?.message}
//         {...register("journal_name")}
//         isRequired
//       />

//       <Input
//         label="Short Name"
//         placeholder="Enter Short Name"
//         error={errors.short_name?.message}
//         {...register("short_name")}
//         isRequired
//       />

//       {/* ISSN toggles */}
//       <div className="col-span-full flex flex-wrap gap-4">
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
//         <Input
//           label="Print ISSN"
//           placeholder="Enter Print ISSN"
//           {...register("issn_print")}
//         />
//       )}

//       {showEissn && (
//         <Input
//           label="e-ISSN"
//           placeholder="Enter e-ISSN"
//           {...register("issn_online")}
//         />
//       )}

//       <Input
//         label="Subject"
//         placeholder="Enter Subject"
//         {...register("subject")}
//       />

//       <Controller
//         control={control}
//         name="year_started"
//         render={({ field }) => (
//           <Input
//             label="Year Started"
//             type="date"
//             value={field.value ? moment(field.value).format("YYYY-MM-DD") : ""}
//             onChange={(e) =>
//               field.onChange(moment(e.target.value, "YYYY-MM-DD").toDate())
//             }
//           />
//         )}
//       />

//       <Controller
//         control={control}
//         name="publication_frequency"
//         render={({ field }) => (
//           <Select
//             {...field}
//             label="Publication Frequency"
//             placeholder="Select frequency"
//             options={publicationFrequencies.map((v) => ({
//               value: v,
//               label: v,
//             }))}
//             value={field.value}
//             onValueChange={field.onChange}
//           />
//         )}
//       />

//       <Controller
//         control={control}
//         name="language"
//         render={({ field }) => (
//           <Select
//             {...field}
//             label="Language"
//             placeholder="Select language"
//             options={languages.map((v) => ({ value: v, label: v }))}
//             value={field.value}
//             onValueChange={field.onChange}
//           />
//         )}
//       />

//       <Input
//         label="Submission Email"
//         type="email"
//         placeholder="Enter Submission Email"
//         {...register("paper_submission_id")}
//       />

//       <Controller
//         control={control}
//         name="format"
//         render={({ field }) => (
//           <Select
//             {...field}
//             label="Format"
//             placeholder="Select format"
//             options={formatofpublication.map((v) => ({
//               value: v,
//               label: v,
//             }))}
//             value={field.value}
//             onValueChange={field.onChange}
//           />
//         )}
//       />

//       <Input
//         label="Publication Fee"
//         placeholder="e.g., Free of Cost"
//         {...register("publication_fee")}
//       />

//       <Input
//         label="Publisher"
//         placeholder="Enter Publisher"
//         {...register("publisher")}
//       />

//       <Input
//         label="DOI Prefix"
//         placeholder="Enter DOI Prefix"
//         {...register("doi_prefix")}
//       />

//       {/* ---------- File Uploads ---------- */}
//       <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         <CustomDropZone
//           name="cover_image"
//           label="Cover Image"
//           number_of_images={1}
//           errors={errors.cover_image}
//           fileType="image"
//           image_size={500 * 1024}
//           uploadedFiles={coverImage}
//           setUploadedFiles={setCoverImage}
//         />

//         <CustomDropZone
//           name="banner_image"
//           label="Banner Image"
//           number_of_images={1}
//           fileType="image"
//           uploadedFiles={bannerImage}
//           setUploadedFiles={setBannerImage}
//           errors={errors.banner_image}
//           image_size={500 * 1024}
//         />

//         <CustomDropZone
//           name="paper_template"
//           label="Paper Template"
//           number_of_images={1}
//           fileType="docs"
//           uploadedFiles={paperTemplate}
//           setUploadedFiles={setPaperTemplate}
//           errors={errors.paper_template}
//           image_size={1024 * 1024}
//         />

//         <CustomDropZone
//           name="copyright_form"
//           label="Copyright Form"
//           number_of_images={1}
//           fileType="docs"
//           uploadedFiles={copyrightForm}
//           setUploadedFiles={setCopyrightForm}
//           errors={errors.copyright_form}
//           image_size={1024 * 1024}
//         />
//       </div>

//       {/* ---------- Submit ---------- */}
//       <div className="col-span-full text-right mt-6">
//         <Button type="submit" className="cursor-pointer">
//           {editData ? "Update Journal" : "Save Journal"}
//         </Button>
//       </div>
//     </form>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import moment from "moment";
import { toast } from "sonner";

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
    .transform((v, o) => (o === "" ? null : v)),
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
  /* ------------------ State ------------------ */
  const [showPrintIssn, setShowPrintIssn] = useState(false);
  const [showEissn, setShowEissn] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const [coverImage, setCoverImage] = useState({ cover_image: [] });
  const [bannerImage, setBannerImage] = useState({ banner_image: [] });
  const [paperTemplate, setPaperTemplate] = useState({ paper_template: [] });
  const [copyrightForm, setCopyrightForm] = useState({ copyright_form: [] });

  /* ------------------ React Hook Form ------------------ */
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      journal_name: "",
      short_name: "",
      issn_print: "",
      issn_online: "",
      subject: "",
      year_started: "",
      publication_frequency: "",
      language: "",
      paper_submission_id: "",
      format: "",
      publication_fee: "",
      publisher: "",
      doi_prefix: "",
    }
  });

  /* ------------------ 🧠 Populate Form When Editing ------------------ */
  useEffect(() => {
    setIsFormReady(false);
    
    if (editData) {
      // Use setTimeout to ensure state updates happen after render
      setTimeout(() => {
        const normalized = {
          journal_name: editData.journal_name || "",
          short_name: editData.short_name || "",
          issn_print: editData.issn_print || "",
          issn_online: editData.issn_online || "",
          subject: editData.subject || "",
          year_started: editData.year_started
            ? moment(editData.year_started, ["YYYY", "YYYY-MM-DD"]).format("YYYY-MM-DD")
            : "",
          publication_frequency: String(editData.publication_frequency || ""),
          language: String(editData.language || ""),
          paper_submission_id: editData.paper_submission_id || "",
          format: String(editData.format || ""),
          publication_fee: editData.publication_fee || "",
          publisher: editData.publisher || "",
          doi_prefix: editData.doi_prefix || "",
        };

        reset(normalized);

        // ✅ update toggles
        setShowPrintIssn(Boolean(editData.is_print_issn));
        setShowEissn(Boolean(editData.is_e_issn));

        // ✅ update file dropzones
        setCoverImage({
          cover_image: editData.cover_image ? [editData.cover_image] : [],
        });
        setBannerImage({
          banner_image: editData.banner_image ? [editData.banner_image] : [],
        });
        setPaperTemplate({
          paper_template: editData.paper_template ? [editData.paper_template] : [],
        });
        setCopyrightForm({
          copyright_form: editData.copyright_form ? [editData.copyright_form] : [],
        });

        setIsFormReady(true);
      }, 0);
    } else {
      // ➕ Clear form for new journal
      reset({
        journal_name: "",
        short_name: "",
        issn_print: "",
        issn_online: "",
        subject: "",
        year_started: "",
        publication_frequency: "",
        language: "",
        paper_submission_id: "",
        format: "",
        publication_fee: "",
        publisher: "",
        doi_prefix: "",
      });
      setShowPrintIssn(false);
      setShowEissn(false);
      setCoverImage({ cover_image: [] });
      setBannerImage({ banner_image: [] });
      setPaperTemplate({ paper_template: [] });
      setCopyrightForm({ copyright_form: [] });
      setIsFormReady(true);
    }
  }, [editData, reset]);

  /* ------------------ Sync DropZone with RHF ------------------ */
  useEffect(() => {
    setValue("cover_image", coverImage);
    setValue("banner_image", bannerImage);
    setValue("paper_template", paperTemplate);
    setValue("copyright_form", copyrightForm);
  }, [coverImage, bannerImage, paperTemplate, copyrightForm, setValue]);

  /* ------------------ 📨 Submit ------------------ */
  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("folder", "journal_banners");
    fd.append("is_print_issn", showPrintIssn ? "1" : "0");
    fd.append("is_e_issn", showEissn ? "1" : "0");

    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        if (key === "year_started" && val)
          fd.append("year_started", new Date(val).getFullYear());
        else if (
          ["cover_image", "banner_image", "paper_template", "copyright_form"].includes(key)
        ) {
          // handled below
        } else fd.append(key, val);
      }
    });

    // attach files if new upload
    if (coverImage.cover_image?.[0] instanceof File)
      fd.append("cover_image", coverImage.cover_image[0]);
    if (bannerImage.banner_image?.[0] instanceof File)
      fd.append("banner_image", bannerImage.banner_image[0]);
    if (paperTemplate.paper_template?.[0] instanceof File)
      fd.append("paper_template", paperTemplate.paper_template[0]);
    if (copyrightForm.copyright_form?.[0] instanceof File)
      fd.append("copyright_form", copyrightForm.copyright_form[0]);

    // append current states
    fd.append("cover_image_state", JSON.stringify(coverImage));
    fd.append("banner_image_state", JSON.stringify(bannerImage));
    fd.append("paper_template_state", JSON.stringify(paperTemplate));
    fd.append("copyright_form_state", JSON.stringify(copyrightForm));

    if (editData) fd.append("id", editData.id);

    const res = await fetch("/api/journals", {
      method: editData ? "PATCH" : "POST",
      body: fd,
    });

    const result = await res.json();
    if (result.success) {
      toast.success(editData ? "Journal updated successfully" : "Journal added");
      onSuccess?.();
      if (!editData) {
        reset();
        setCoverImage({ cover_image: [] });
        setBannerImage({ banner_image: [] });
        setPaperTemplate({ paper_template: [] });
        setCopyrightForm({ copyright_form: [] });
      }
    } else {
      toast.error(result.message || "Error saving journal");
    }
  };

  // Don't render selects until form is ready
  if (!isFormReady) {
    return <div className="w-full p-6">Loading...</div>;
  }

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

      {/* ---------- ISSN Toggles ---------- */}
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
        <Input label="Print ISSN" placeholder="Enter Print ISSN" {...register("issn_print")} />
      )}

      {showEissn && (
        <Input label="e-ISSN" placeholder="Enter e-ISSN" {...register("issn_online")} />
      )}

      <Input label="Subject" placeholder="Enter Subject" {...register("subject")} />

      <Controller
        control={control}
        name="year_started"
        render={({ field }) => (
          <Input
            label="Year Started"
            type="date"
            value={field.value ? moment(field.value).format("YYYY-MM-DD") : ""}
            onChange={(e) =>
              field.onChange(e.target.value ? moment(e.target.value, "YYYY-MM-DD").toDate() : "")
            }
          />
        )}
      />

      <Controller
        control={control}
        name="publication_frequency"
        render={({ field }) => {
          const currentValue = String(field.value || "");
          return (
            <Select
              label="Publication Frequency"
              placeholder="Select frequency"
              options={publicationFrequencies.map((v) => ({ 
                value: String(v), 
                label: String(v) 
              }))}
              value={currentValue}
              onValueChange={(val) => field.onChange(String(val || ""))}
            />
          );
        }}
      />

      <Controller
        control={control}
        name="language"
        render={({ field }) => {
          const currentValue = String(field.value || "");
          return (
            <Select
              label="Language"
              placeholder="Select language"
              options={languages.map((v) => ({ 
                value: String(v), 
                label: String(v) 
              }))}
              value={currentValue}
              onValueChange={(val) => field.onChange(String(val || ""))}
            />
          );
        }}
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
        render={({ field }) => {
          const currentValue = String(field.value || "");
          return (
            <Select
              label="Format"
              placeholder="Select format"
              options={formatofpublication.map((v) => ({ 
                value: String(v), 
                label: String(v) 
              }))}
              value={currentValue}
              onValueChange={(val) => field.onChange(String(val || ""))}
            />
          );
        }}
      />

      <Input label="Publication Fee" placeholder="e.g., Free of Cost" {...register("publication_fee")} />
      <Input label="Publisher" placeholder="Enter Publisher" {...register("publisher")} />
      <Input label="DOI Prefix" placeholder="Enter DOI Prefix" {...register("doi_prefix")} />

      {/* ---------- File Uploads ---------- */}
      <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CustomDropZone name="cover_image" label="Cover Image" number_of_images={1} fileType="image" uploadedFiles={coverImage} setUploadedFiles={setCoverImage} errors={errors.cover_image} image_size={500 * 1024} />
        <CustomDropZone name="banner_image" label="Banner Image" number_of_images={1} fileType="image" uploadedFiles={bannerImage} setUploadedFiles={setBannerImage} errors={errors.banner_image} image_size={500 * 1024} />
        <CustomDropZone name="paper_template" label="Paper Template" number_of_images={1} fileType="docs" uploadedFiles={paperTemplate} setUploadedFiles={setPaperTemplate} errors={errors.paper_template} image_size={1024 * 1024} />
        <CustomDropZone name="copyright_form" label="Copyright Form" number_of_images={1} fileType="docs" uploadedFiles={copyrightForm} setUploadedFiles={setCopyrightForm} errors={errors.copyright_form} image_size={1024 * 1024} />
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