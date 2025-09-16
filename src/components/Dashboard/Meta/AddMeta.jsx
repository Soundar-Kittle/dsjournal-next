"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";

import { useApiMutation } from "@/hooks";
import { queryClient } from "@/lib/queryClient";
import { Input, Button, Select, Switch } from "@/components/ui";
import { CustomDropZone } from "@/components/ui/FormInput/Inputs";
import { metas, useSitemaps /* later: useJournals */ } from "@/services";
import { PlusIcon, TrashIcon } from "lucide-react";

const shiftUploadedFileIndices = (indexToRemove, uploadedFiles) => {
  const updated = {};
  for (const [key, value] of Object.entries(uploadedFiles)) {
    const match = key.match(/^metas\.(\d+)\.image$/);
    if (match) {
      const oldIdx = parseInt(match[1]);
      if (oldIdx < indexToRemove) {
        updated[key] = value;
      } else if (oldIdx > indexToRemove) {
        updated[`metas.${oldIdx - 1}.image`] = value;
      }
    }
  }
  return updated;
};

// ----------------- Validation -----------------
const schema = yup.object({
  reference_type: yup
    .string()
    .oneOf(["page", "journal"], "Invalid reference type")
    .required("Reference type is required"),
  reference_id: yup.string().required("Reference ID is required"),
  metas: yup
    .array()
    .of(
      yup.object().shape({
        attribute_scope: yup
          .string()
          .oneOf(["general", "og", "twitter"], "Invalid scope")
          .required(),
        attribute_type: yup
          .string()
          .oneOf(["name", "property", "http-equiv"])
          .required(),
        attribute_key: yup.string().required("Meta key is required"),
        is_content: yup.boolean().default(true),
        content: yup.string().when("is_content", {
          is: true,
          then: (s) => s.required("Content is required"),
          otherwise: (s) => s.nullable(),
        }),
        // image: yup.object({
        //   image: yup.array().of(yup.mixed()).nullable(),
        // }),
        image: yup.mixed().when("is_content", {
          is: false,
          then: () => yup.array().min(1, "Image is required"),
          otherwise: () => yup.mixed().nullable(),
        }),
      })
    )
    .min(1, "At least one meta tag is required")
    .test(
      "no-duplicate-metas",
      "Duplicate meta tags with same scope, type and key are not allowed.",
      function (metas = []) {
        const seen = new Set();
        for (let i = 0; i < metas.length; i++) {
          const { attribute_scope, attribute_type, attribute_key } = metas[i];
          const combo =
            `${attribute_scope}-${attribute_type}-${attribute_key}`.toLowerCase();
          if (seen.has(combo)) {
            return this.createError({
              path: `metas.${i}.attribute_key`,
              message: "Already added meta key",
            });
          }
          seen.add(combo);
        }
        return true;
      }
    ),
});

const AddMeta = ({ type = "add", editData = {}, onClose }) => {
  const defaults = {
    reference_type: editData?.reference_type || "page",
    reference_id: editData?.reference_id || "",
    metas:
      editData?.metas?.length > 0
        ? editData.metas.map((m) => ({
            attribute_scope: m.attribute_scope || "general",
            attribute_type: m.attribute_type || "name",
            attribute_key: m.attribute_key || "",
            is_content: m.is_content ?? true,
            content: m.content || "",
            image: { image: m.image ? [m.image] : [] },
          }))
        : [
            {
              attribute_scope: "general",
              attribute_type: "name",
              attribute_key: "",
              is_content: true,
              content: "",
              image: { image: [] },
            },
          ],
  };

  const { data: sitemap } = useSitemaps();

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaults,
    resolver: yupResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "metas",
  });

  const metasValues = useWatch({ control, name: "metas" });
  const [uploadedFiles, setUploadedFiles] = useState({});

  useEffect(() => {
    if (type === "edit" && editData && editData.metas) {
      const initialFiles = {};
      editData.metas.forEach((meta, index) => {
        if (meta.image) {
          initialFiles[`metas.${index}.image`] = [meta.image];
        }
      });
      setUploadedFiles(initialFiles);
    }
  }, [type, editData]);

  useEffect(() => {
    Object.entries(uploadedFiles).forEach(([id, value]) => {
      const idx = fields.findIndex((f) => f.id === id);
      if (idx !== -1) {
        setValue(`metas.${idx}.image`, value, { shouldValidate: true });
      }
    });
  }, [uploadedFiles, fields, setValue]);

  useEffect(() => {
    metasValues?.forEach((meta, index) => {
      let expectedType = "name";
      if (meta?.attribute_scope === "og") expectedType = "property";

      if (meta?.attribute_type !== expectedType) {
        setValue(`metas.${index}.attribute_type`, expectedType, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });
  }, [metasValues, setValue]);

  useEffect(() => {
    Object.entries(uploadedFiles).forEach(([key, value]) => {
      setValue(key, value);
    });
  }, [uploadedFiles, setValue]);

  // Watch reference_type to decide options for reference_id
  const refType = useWatch({ control, name: "reference_type" });
  const referenceOptions = refType === "page" ? sitemap?.rows || [] : [];

  // Mutation
  const mutation = useApiMutation({
    endpoint: type === "add" ? metas.add.url : metas.update.url,
    method: type === "add" ? metas.add.method : metas.update.method,
    onSuccess: (res) => {
      queryClient.invalidateQueries(metas.getPaginated.key);
      toast.success(
        res?.message ||
          `Meta ${type === "add" ? "added" : "updated"} successfully`
      );
      onClose?.();
    },
    onError: (err) => {
      const message = err?.error || err?.message || "Something went wrong";

      toast.error(message);
    },
  });

  // Submit
  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("folder", "meta");
    if (type === "edit" && editData?.id) fd.append("id", editData.id);

    fd.append("reference_type", data.reference_type);
    fd.append("reference_id", data.reference_id);

    data.metas.forEach((m, i) => {
      fd.append(`metas[${i}][attribute_scope]`, m.attribute_scope);
      fd.append(`metas[${i}][attribute_type]`, m.attribute_type);
      fd.append(`metas[${i}][attribute_key]`, m.attribute_key);
      fd.append(`metas[${i}][is_content]`, m.is_content ? "1" : "0");

      if (m.is_content) {
        fd.append(`metas[${i}][content]`, m.content || "");
      } else if (m.image && m.image[0]) {
        const imageFile = m.image[0];
        if (imageFile instanceof File) {
          fd.append(`metas[${i}][image]`, imageFile);
        } else {
          fd.append(`metas[${i}][image]`, imageFile);
        }
      }
    });

    await mutation.mutateAsync(fd);
  };

  return (
    <div className="bg-white rounded-md border border-gray-200">
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Reference Type */}
          <Controller
            control={control}
            name="reference_type"
            render={({ field }) => (
              <Select
                {...field}
                label="Reference Type"
                placeholder="Select type"
                options={[
                  { label: "Static Page", value: "page" },
                  // { label: "Journal", value: "journal" },
                ]}
                onValueChange={field.onChange}
                error={errors.reference_type?.message}
                required
              />
            )}
          />

          {/* Reference ID */}
          <Controller
            control={control}
            name="reference_id"
            render={({ field }) => (
              <Select
                {...field}
                label="Reference ID"
                placeholder="Select reference"
                options={referenceOptions}
                onValueChange={field.onChange}
                error={errors.reference_id?.message}
                required
                disabled={!refType}
              />
            )}
          />
        </div>

        {/* Dynamic Meta Fields */}
        {fields.map((field, index) => {
          const isContent = metasValues?.[index]?.is_content;

          return (
            <div key={field.id} className="border rounded-md p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Meta Tag #{index + 1}</h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      remove(index);
                      setUploadedFiles((prev) =>
                        shiftUploadedFileIndices(index, prev)
                      );
                    }}
                  >
                    <TrashIcon size={16} />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller
                  name={`metas.${index}.attribute_scope`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Scope"
                      options={[
                        { value: "general", label: "General" },
                        { value: "og", label: "Open Graph" },
                        { value: "twitter", label: "Twitter" },
                      ]}
                      onValueChange={field.onChange}
                      error={errors?.metas?.[index]?.attribute_scope?.message}
                    />
                  )}
                />

                <Controller
                  name={`metas.${index}.attribute_type`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Type"
                      options={[
                        { value: "name", label: "name" },
                        { value: "property", label: "property" },
                        { value: "http-equiv", label: "http-equiv" },
                      ]}
                      onValueChange={field.onChange}
                      error={errors?.metas?.[index]?.attribute_type?.message}
                      disabled
                    />
                  )}
                />

                <Input
                  label="Meta Key"
                  placeholder="e.g. title"
                  error={errors?.metas?.[index]?.attribute_key?.message}
                  {...register(`metas.${index}.attribute_key`)}
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Content Type
                  </label>
                  <Controller
                    name={`metas.${index}.is_content`}
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>

              {isContent ? (
                <Input
                  label="Content"
                  placeholder="Meta content"
                  error={errors?.metas?.[index]?.content?.message}
                  {...register(`metas.${index}.content`)}
                />
              ) : (
                <CustomDropZone
                  name={`metas.${index}.image`}
                  label="Meta Image"
                  number_of_images={1}
                  errors={errors?.metas?.[index]?.image}
                  fileType="image"
                  image_size={500 * 1024}
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  required={!isContent}
                  folder={"meta"}
                />
              )}
            </div>
          );
        })}

        {/* Add new meta button */}
        <Button
          type="button"
          onClick={() =>
            append({
              attribute_scope: "general",
              attribute_type: "name",
              attribute_key: "",
              is_content: true,
              content: "",
              image: { image: [] },
            })
          }
          variant="outline"
          className="border-brand-dark text-brand-dark"
        >
          <PlusIcon size={16} className="mr-2" /> Add Meta Tag
        </Button>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="ghost"
            type="button"
            onClick={() => reset(defaults)}
            disabled={isSubmitting || mutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting || mutation.isPending}
            disabled={isSubmitting || mutation.isPending}
          >
            {type === "edit" ? "Update Meta" : "Save Meta"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { AddMeta };
