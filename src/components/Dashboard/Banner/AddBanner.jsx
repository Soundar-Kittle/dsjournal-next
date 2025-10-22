"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";

import { useApiMutation } from "@/hooks";
import { queryClient } from "@/lib/queryClient";
import { Input, Button, Checkbox, Select } from "@/components/ui";
import { CustomDropZone } from "@/components/ui/FormInput/Inputs";
import { linkOptions } from "@/@data/data";
import { banners } from "@/services";

// ----------------- Validation -----------------
const schema = yup.object({
  title: yup.string().nullable().max(255, "Title is too long"),
  description: yup.string().nullable(),
  image: yup
    .object({
      image: yup.array().of(yup.mixed().required()).min(1, "Upload an image"),
    })
    .required(),
  button_link: yup.string().nullable(),
  button_name: yup.string().when("button_link", {
    is: (val) => val !== null && val !== "",
    then: (s) => s.required("Button name is required when link is provided"),
    otherwise: (s) => s.nullable().notRequired(),
  }),
  alignment: yup.number().oneOf([0, 1, 2], "Invalid alignment").default(0),
  show_button: yup.boolean().default(false),
  show_content: yup.boolean().default(true),
  show_description: yup.boolean().default(false),
  status: yup.boolean().default(true),
});

// ----------------- Defaults -----------------

const AddBanner = ({ type = "add", editData = {}, onClose }) => {
  const defaults = {
    title: editData?.title || "",
    description: editData?.description || "",
    image: { image: [editData.image] } || { image: [] },
    button_link: editData?.button_link || "",
    button_name: editData?.button_name || "",
    alignment: editData?.alignment || 0, // 0=center, 1=left, 2=right
    show_button: false,
    show_content: true,
    show_description: false,
    status: true,
  };
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaults,
    resolver: yupResolver(schema, { context: { type } }),
  });

  // local file holder for CustomDropZone
  const [imageFile, setImageFile] = useState({ image: [] });
  useEffect(() => {
    setValue("image", imageFile);
  }, [imageFile, setValue]);

  // prefill on edit
  useEffect(() => {
    if (type === "edit" && editData) {
      reset({
        title: editData.title ?? "",
        description: editData.description ?? "",
        button_link: editData.button_link ?? "",
        button_name: editData.button_name ?? "",
        alignment: editData.alignment,
        show_button: !!editData.visibility?.show_button,
        show_content: !!editData.visibility?.show_content,
        show_description: !!editData.visibility?.show_description,
        status: !!editData.status,
        image: { image: [] },
      });
      setImageFile({ image: [editData.image] });
    }
  }, [type, editData, reset]);

  // --------------- Mutation ----------------
  const mutation = useApiMutation({
    endpoint: type === "add" ? banners.add.url : banners.update.url,
    method: type === "add" ? banners.add.method : banners.update.method,
    // headers: { "Content-Type": "multipart/form-data" },
    onSuccess: (res) => {
      queryClient.invalidateQueries(banners.getPaginated.key);
      setImageFile({ image: [] });
      toast.success(
        res?.message ||
          `Banner ${type === "add" ? "added" : "updated"} successfully`
      );
      onClose?.();
    },
    onError: (err) => toast.error(err?.message || "Something went wrong"),
  });

  // --------------- Submit ------------------
  const onSubmit = async (data) => {
    const fd = new FormData();
    fd.append("folder", "banners");
    if (type === "edit" && editData?.id) fd.append("id", editData.id);

    if (data.title) fd.append("title", data.title);
    if (data.description) fd.append("description", data.description);
    fd.append("alignment", data.alignment ?? 0);

    // visibility/status flags expected by your controller as "1"/"0"
    fd.append("show_button", data.show_button ? "1" : "0");
    fd.append("show_content", data.show_content ? "1" : "0");
    fd.append("show_description", data.show_description ? "1" : "0");
    fd.append("status", data.status ? "1" : "0");

    // button link/name
    if (data.button_link) fd.append("button_link", data.button_link);
    if (data.button_name) fd.append("button_name", data.button_name);

    // image: only append file if user picked a new one
    if (imageFile.image?.[0] instanceof File) {
      fd.append("image", imageFile.image[0]);
    }

    // console.log([...fd.entries()]);
    await mutation.mutateAsync(fd);
  };

  return (
    <div className="p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Upload */}
          <CustomDropZone
            name="image"
            label="Banner Image"
            number_of_images={1}
            errors={errors.image}
            fileType="image"
            image_size={1024 * 1024}
            uploadedFiles={imageFile}
            setUploadedFiles={setImageFile}
            folder="banners"
            showIcon={false}
            required
          />
          <Input
            label="Title"
            placeholder="Optional banner title"
            error={errors.title?.message}
            {...register("title")}
          />
          <Input
            label="description"
            placeholder="Optional banner description"
            error={errors.description?.message}
            {...register("description")}
          />

          <Controller
            control={control}
            name="button_link"
            render={({ field }) => (
              <Select
                {...field}
                label="Button Link"
                placeholder="Select a link"
                options={linkOptions}
                onValueChange={field.onChange}
              />
            )}
          />

          <Input
            label="Button Name"
            placeholder="e.g., Contact us"
            error={errors.button_name?.message}
            {...register("button_name")}
          />

          <Controller
            control={control}
            name="alignment"
            render={({ field }) => (
              <Select
                {...field}
                label="Alignment"
                placeholder="Select alignment"
                options={[
                  { value: 0, label: "Center" },
                  { value: 1, label: "Left" },
                  { value: 2, label: "Right" },
                ]}
                onValueChange={field.onChange}
              />
            )}
          />

          {/* Visibility & Status */}
          <div className="col-span-full grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            <label className="inline-flex items-center gap-2">
              <Controller
                name="show_content"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span>Show Content</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <Controller
                name="show_button"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span>Show Button</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <Controller
                name="show_description"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span>Show Description</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span>Active</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              reset(defaults);
              setImageFile({ image: [] });
            }}
            disabled={isSubmitting || mutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting || mutation.isPending}
            disabled={isSubmitting || mutation.isPending}
          >
            {type === "edit" ? "Update Banner" : "Save Banner"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { AddBanner };
