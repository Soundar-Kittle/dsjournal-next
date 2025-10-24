"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import moment from "moment";

import { useApiMutation } from "@/hooks";
import { queryClient } from "@/lib/queryClient";
import { Input, Button, Checkbox, Select } from "@/components/ui";
import { callForPaper, useJournals } from "@/services";

// ----------------- Validation Schema -----------------
const schema = yup.object({
  is_common: yup.boolean().default(false),
  date_mode: yup.string().oneOf(["manual", "auto"]).required(),

  manual_date: yup
    .date()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("date_mode", {
      is: "manual",
      then: (s) => s.required("Date is required in manual mode"),
      otherwise: (s) => s.nullable(),
    }),

  start_date: yup
    .date()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("date_mode", {
      is: "auto",
      then: (s) => s.required("Start date is required in auto mode"),
      otherwise: (s) => s.nullable(),
    }),

  end_date: yup
    .date()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .when("date_mode", {
      is: "auto",
      then: (s) =>
        s
          .required("End date is required in auto mode")
          .test(
            "is-after-start",
            "End date cannot be earlier than start date",
            function (value) {
              const { start_date } = this.parent;
              return !start_date || !value || value >= start_date;
            }
          ),
      otherwise: (s) => s.nullable(),
    }),

  permit_dates: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null ? null : Number(value)
    )
    .nullable()
    .when("date_mode", {
      is: "auto",
      then: (s) => s.min(0, "Permit duration must be positive"),
      otherwise: (s) => s.nullable(),
    }),

  journal_id: yup.mixed().nullable(),
  is_active: yup.boolean().default(true),
});

// ----------------- Component -----------------
const AddCallForPaper = ({ type = "add", editData = {}, onClose }) => {
  const defaults = {
    is_common: editData?.is_common ?? false,
    date_mode: editData?.date_mode || "manual",
    manual_date: editData?.manual_date || "",
    start_date: editData?.start_date || "",
    end_date: editData?.end_date || "",
    permit_dates: editData?.permit_dates || "",
    journal_id: editData?.journal_id || "",
    is_active: editData?.is_active ?? true,
  };

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: defaults,
    resolver: yupResolver(schema),
  });

  const dateMode = watch("date_mode");
  const isCommon = watch("is_common");

  // --------------- Journals Fetch ---------------
  const { data: journalsData } = useJournals();
  const journalOptions =
    journalsData?.journals?.map((j) => ({
      value: j.id,
      label: j.journal_name,
    })) || [];

  // --------------- Mutation ----------------
  const mutation = useApiMutation({
    endpoint: type === "add" ? callForPaper.add.url : callForPaper.update.url,
    method:
      type === "add" ? callForPaper.add.method : callForPaper.update.method,
    onSuccess: (res) => {
      queryClient.invalidateQueries(callForPaper.getPaginated.key);
      toast.success(
        res?.message ||
          `Call for Paper ${type === "add" ? "added" : "updated"} successfully`
      );
      onClose?.();
    },
    onError: (err) => toast.error(err?.message || "Something went wrong"),
  });

  // --------------- Submit ------------------
  const onSubmit = async (data) => {
    let finalData = { ...data };

    // clean up based on mode
    if (data.date_mode === "manual") {
      finalData.manual_date = data.manual_date
        ? moment(data.manual_date).format("YYYY-MM-DD")
        : null;
      finalData.start_date = null;
      finalData.end_date = null;
      finalData.permit_dates = null;
    } else if (data.date_mode === "auto") {
      finalData.manual_date = null;
      finalData.start_date = data.start_date
        ? moment(data.start_date).format("YYYY-MM-DD")
        : null;
      finalData.end_date = data.end_date
        ? moment(data.end_date).format("YYYY-MM-DD")
        : null;
      finalData.permit_dates =
        data.permit_dates !== "" ? Number(data.permit_dates) : null;
    }

    // if it's common, journal_id is null
    if (data.is_common) {
      finalData.journal_id = null;
    }

    console.log("Final Cleaned Submit Data:", finalData);

    await mutation.mutateAsync(finalData);
  };

  // --------------- Render ------------------
  return (
    <div className="p-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Common Toggle --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <label className="inline-flex items-center gap-2">
            <Controller
              name="is_common"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <span>Is Common (All Journals)</span>
          </label>
        </div>

        {/* --- Date Mode --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Controller
            name="date_mode"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                label="Date Mode"
                placeholder="Select mode"
                options={[
                  { value: "manual", label: "Manual" },
                  { value: "auto", label: "Auto" },
                ]}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        {/* --- Journal Selection (only when NOT common) --- */}
        {!isCommon && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Controller
              name="journal_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Journal"
                  placeholder="Select journal"
                  options={journalOptions}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        )}

        {/* --- Manual Mode: Single Date --- */}
        {dateMode === "manual" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Date"
              error={errors.manual_date?.message}
              {...register("manual_date")}
            />
          </div>
        )}

        {/* --- Auto Mode: Start + End Dates + Permit Duration --- */}
        {dateMode === "auto" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              type="date"
              label="Start Date"
              error={errors.start_date?.message}
              {...register("start_date")}
            />
            <Input
              type="date"
              label="End Date"
              min={watch("start_date") || undefined}
              error={errors.end_date?.message}
              {...register("end_date")}
            />
            <Input
              type="number"
              label="Permit Duration (Days)"
              placeholder="e.g., 15"
              error={errors.permit_dates?.message}
              {...register("permit_dates")}
            />
          </div>
        )}

        {/* --- Active Status --- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          <label className="inline-flex items-center gap-2">
            <Controller
              name="is_active"
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

        {/* --- Actions --- */}
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
            {type === "edit" ? "Update Call for Paper" : "Save Call for Paper"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export { AddCallForPaper };
