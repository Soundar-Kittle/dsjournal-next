// "use client";

// import React from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { toast } from "sonner";
// import moment from "moment";

// import { useApiMutation } from "@/hooks";
// import { queryClient } from "@/lib/queryClient";
// import { Input, Button, Checkbox, Select } from "@/components/ui";
// import { callForPaper, useJournals } from "@/services";

// // ----------------- Validation Schema -----------------
// const schema = yup.object({
//   is_common: yup.boolean().default(false),
//   date_mode: yup.string().oneOf(["manual", "auto"]).required(),

//   manual_date: yup
//     .date()
//     .transform((value, originalValue) => (originalValue === "" ? null : value))
//     .nullable()
//     .when("date_mode", {
//       is: "manual",
//       then: (s) => s.required("Date is required in manual mode"),
//       otherwise: (s) => s.nullable(),
//     }),

//   start_date: yup
//     .date()
//     .transform((value, originalValue) => (originalValue === "" ? null : value))
//     .nullable()
//     .when("date_mode", {
//       is: "auto",
//       then: (s) => s.required("Start date is required in auto mode"),
//       otherwise: (s) => s.nullable(),
//     }),

//   end_date: yup
//     .date()
//     .transform((value, originalValue) => (originalValue === "" ? null : value))
//     .nullable()
//     .when("date_mode", {
//       is: "auto",
//       then: (s) =>
//         s
//           .required("End date is required in auto mode")
//           .test(
//             "is-after-start",
//             "End date cannot be earlier than start date",
//             function (value) {
//               const { start_date } = this.parent;
//               return !start_date || !value || value >= start_date;
//             }
//           ),
//       otherwise: (s) => s.nullable(),
//     }),

//   permit_dates: yup
//     .number()
//     .transform((value, originalValue) =>
//       originalValue === "" || originalValue === null ? null : Number(value)
//     )
//     .nullable()
//     .when("date_mode", {
//       is: "auto",
//       then: (s) => s.min(0, "Permit duration must be positive"),
//       otherwise: (s) => s.nullable(),
//     }),

//   journal_id: yup.mixed().nullable(),
//   is_active: yup.boolean().default(true),
// });

// // ----------------- Component -----------------
// const AddCallForPaper = ({ type = "add", editData = {}, onClose }) => {
//   const defaults = {
//     is_common: editData?.is_common ?? false,
//     date_mode: editData?.date_mode || "manual",
//     manual_date: editData?.manual_date || "",
//     start_date: editData?.start_date || "",
//     end_date: editData?.end_date || "",
//     permit_dates: editData?.permit_dates || "",
//     journal_id: editData?.journal_id || "",
//     is_active: editData?.is_active ?? true,
//   };

//   const {
//     register,
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     defaultValues: defaults,
//     resolver: yupResolver(schema),
//   });

//   const dateMode = watch("date_mode");
//   const isCommon = watch("is_common");

//   // --------------- Journals Fetch ---------------
//   const { data: journalsData } = useJournals();
//   const journalOptions =
//     journalsData?.journals?.map((j) => ({
//       value: j.id,
//       label: j.journal_name,
//     })) || [];

//   // --------------- Mutation ----------------
//   const mutation = useApiMutation({
//     endpoint: type === "add" ? callForPaper.add.url : callForPaper.update.url,
//     method:
//       type === "add" ? callForPaper.add.method : callForPaper.update.method,
//     onSuccess: (res) => {
//       queryClient.invalidateQueries(callForPaper.getPaginated.key);
//       toast.success(
//         res?.message ||
//           `Call for Paper ${type === "add" ? "added" : "updated"} successfully`
//       );
//       onClose?.();
//     },
//     onError: (err) => toast.error(err?.message || "Something went wrong"),
//   });

//   // --------------- Submit ------------------
//   const onSubmit = async (data) => {
//     let finalData = { ...data };

//     // clean up based on mode
//     if (data.date_mode === "manual") {
//       finalData.manual_date = data.manual_date
//         ? moment(data.manual_date).format("YYYY-MM-DD")
//         : null;
//       finalData.start_date = null;
//       finalData.end_date = null;
//       finalData.permit_dates = null;
//     } else if (data.date_mode === "auto") {
//       finalData.manual_date = null;
//       finalData.start_date = data.start_date
//         ? moment(data.start_date).format("YYYY-MM-DD")
//         : null;
//       finalData.end_date = data.end_date
//         ? moment(data.end_date).format("YYYY-MM-DD")
//         : null;
//       finalData.permit_dates =
//         data.permit_dates !== "" ? Number(data.permit_dates) : null;
//     }

//     // if it's common, journal_id is null
//     if (data.is_common) {
//       finalData.journal_id = null;
//     }

//     console.log("Final Cleaned Submit Data:", finalData);

//     await mutation.mutateAsync(finalData);
//   };

//   // --------------- Render ------------------
//   return (
//     <div className="p-5">
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* --- Common Toggle --- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
//           <label className="inline-flex items-center gap-2">
//             <Controller
//               name="is_common"
//               control={control}
//               render={({ field }) => (
//                 <Checkbox
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               )}
//             />
//             <span>Is Common (All Journals)</span>
//           </label>
//         </div>

//         {/* --- Issue / Month Group --- */}
// {!isCommon && watch("journal_id") && (
//   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//     <Controller
//       name="month_group_id"
//       control={control}
//       render={({ field }) => (
//         <Select
//           {...field}
//           label="Issue / Month Group"
//           placeholder="Select issue"
//           options={monthGroupOptions}
//           onValueChange={field.onChange}
//         />
//       )}
//     />
//   </div>
// )}

//         {/* --- Date Mode --- */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           <Controller
//             name="date_mode"
//             control={control}
//             render={({ field }) => (
//               <Select
//                 {...field}
//                 label="Date Mode"
//                 placeholder="Select mode"
//                 options={[
//                   { value: "manual", label: "Manual" },
//                   { value: "auto", label: "Auto" },
//                 ]}
//                 onValueChange={field.onChange}
//               />
//             )}
//           />
//         </div>

//         {/* --- Journal Selection (only when NOT common) --- */}
//         {!isCommon && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             <Controller
//               name="journal_id"
//               control={control}
//               render={({ field }) => (
//                 <Select
//                   {...field}
//                   label="Journal"
//                   placeholder="Select journal"
//                   options={journalOptions}
//                   onValueChange={field.onChange}
//                 />
//               )}
//             />
//           </div>
//         )}

//         {/* --- Manual Mode: Single Date --- */}
//         {dateMode === "manual" && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             <Input
//               type="date"
//               label="Date"
//               error={errors.manual_date?.message}
//               {...register("manual_date")}
//             />
//           </div>
//         )}

//         {/* --- Auto Mode: Start + End Dates + Permit Duration --- */}
//         {dateMode === "auto" && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             <Input
//               type="date"
//               label="Start Date"
//               error={errors.start_date?.message}
//               {...register("start_date")}
//             />
//             <Input
//               type="date"
//               label="End Date"
//               min={watch("start_date") || undefined}
//               error={errors.end_date?.message}
//               {...register("end_date")}
//             />
//             <Input
//               type="number"
//               label="Permit Duration (Days)"
//               placeholder="e.g., 15"
//               error={errors.permit_dates?.message}
//               {...register("permit_dates")}
//             />
//           </div>
//         )}

//         {/* --- Active Status --- */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
//           <label className="inline-flex items-center gap-2">
//             <Controller
//               name="is_active"
//               control={control}
//               render={({ field }) => (
//                 <Checkbox
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               )}
//             />
//             <span>Active</span>
//           </label>
//         </div>

//         {/* --- Actions --- */}
//         <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
//           <Button
//             variant="ghost"
//             type="button"
//             onClick={() => reset(defaults)}
//             disabled={isSubmitting || mutation.isPending}
//           >
//             Reset
//           </Button>
//           <Button
//             type="submit"
//             isLoading={isSubmitting || mutation.isPending}
//             disabled={isSubmitting || mutation.isPending}
//           >
//             {type === "edit" ? "Update Call for Paper" : "Save Call for Paper"}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export { AddCallForPaper };


"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import moment from "moment";

import { useApiMutation } from "@/hooks";
import { queryClient } from "@/lib/queryClient";
import { Input, Button, Checkbox, Select } from "@/components/ui";
import { callForPaper, useJournals, useMonthGroups} from "@/services";

// ----------------- Validation Schema -----------------
const schema = yup.object({
  is_common: yup.boolean().default(false),
  date_mode: yup.string().oneOf(["manual", "auto"]).required(),

  manual_date: yup
    .date()
    .transform((v, o) => (o === "" ? null : v))
    .nullable()
    .when("date_mode", {
      is: "manual",
      then: (s) => s.required("Date is required in manual mode"),
      otherwise: (s) => s.nullable(),
    }),

  start_date: yup
    .date()
    .transform((v, o) => (o === "" ? null : v))
    .nullable()
    .when("date_mode", {
      is: "auto",
      then: (s) => s.required("Start date is required in auto mode"),
      otherwise: (s) => s.nullable(),
    }),

  end_date: yup
    .date()
    .transform((v, o) => (o === "" ? null : v))
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
    .transform((v, o) =>
      o === "" || o === null ? null : Number(o)
    )
    .nullable()
    .when("date_mode", {
      is: "auto",
      then: (s) => s.min(0, "Permit duration must be positive"),
      otherwise: (s) => s.nullable(),
    }),

  journal_id: yup.mixed().nullable(),
  month_group_id: yup
    .mixed()
    .nullable()
    .when("is_common", {
      is: false,
      then: (s) => s.required("Please select issue / month group"),
    }),
  is_active: yup.boolean().default(true),
});

function getCurrentPeriod(monthGroups = []) {
  if (!Array.isArray(monthGroups) || monthGroups.length === 0) return null;

  const monthIndex = new Date().getMonth(); // 0=Jan, 11=Dec
  const monthNames = [
    "January","February","March",
    "April","May","June",
    "July","August","September",
    "October","November","December"
  ];

  const currentMonthName = monthNames[monthIndex];
  let current = null;

  // Find if currentMonth lies between from_month and to_month
  for (const g of monthGroups) {
    if (!g.from_month || !g.to_month) continue;
    const fromIdx = monthNames.indexOf(g.from_month);
    const toIdx = monthNames.indexOf(g.to_month);
    if (fromIdx === -1 || toIdx === -1) continue;

    // handle wrapping periods like Nov–Feb
    const inRange =
      fromIdx <= toIdx
        ? monthIndex >= fromIdx && monthIndex <= toIdx
        : monthIndex >= fromIdx || monthIndex <= toIdx;

    if (inRange) {
      current = g;
      break;
    }
  }

  // if no active found, choose next upcoming
  if (!current) {
    const upcoming = monthGroups.find((g) => {
      const fromIdx = monthNames.indexOf(g.from_month);
      return fromIdx > monthIndex;
    });
    current = upcoming || monthGroups[0]; // fallback
  }

  return current;
}


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
    month_group_id: editData?.month_group_id || "",
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
  const selectedJournal = watch("journal_id");

  // --------------- Journals Fetch ---------------
  const { data: journalsData } = useJournals();
  const journalOptions =
    journalsData?.journals?.map((j) => ({
      value: j.id,
      label: j.journal_name,
    })) || [];

  // --------------- Month Groups Fetch ---------------
  const { data: monthGroupData, refetch } = useMonthGroups({
    journalId: selectedJournal,
    enabled: !!selectedJournal,
  });

const [monthGroupOptions, setMonthGroupOptions] = useState([]);

// useEffect(() => {
//   const groups = monthGroupData?.months || monthGroupData?.groups || [];

//   if (groups.length) {
//     const opts = groups.map((g) => {
//       const from = g.from_month || "—";
//       const to = g.to_month || "—";

//       const vol =
//         g.volume_number
//           ? `${g.volume_label ? `${g.volume_label}` : ""}`
//           : "Vol ?";
//       const issue =
//         g.issue_number
//           ? `${g.issue_label ? ` ${g.issue_label}` : ""}`
//           : "Issue ?";

//       return {
//         value: g.id,
//         label: `${from} – ${to} (${vol} – ${issue})`,
//       };
//     });

//     // optional: remove duplicates if any
//     const uniqueOpts = Array.from(new Map(opts.map((o) => [o.label, o])).values());
//     setMonthGroupOptions(uniqueOpts);
//   } else {
//     setMonthGroupOptions([]);
//   }
// }, [monthGroupData]);

useEffect(() => {
  if (monthGroupData?.groups?.length) {
    const groups = monthGroupData.groups.map((g) => ({
      value: g.id,
      label: `${g.from_month} – ${g.to_month} (Volume ${g.volume_number || "?"} – Issue ${g.issue_number || "?"})`,
      ...g,
    }));
    setMonthGroupOptions(groups);

    // ✅ auto-select current or next upcoming
    const current = getCurrentPeriod(groups);
    if (current) {
      setSelectedMonthGroup(current.value);
    }
  } else {
    setMonthGroupOptions([]);
  }
}, [monthGroupData]);


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

    if (data.is_common) {
      finalData.journal_id = null;
      finalData.month_group_id = null;
    }

    console.log("✅ Final Cleaned Submit Data:", finalData);
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

        {/* --- Issue / Month Group --- */}
        {!isCommon && selectedJournal && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Controller
              name="month_group_id"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Issue / Month Group"
                  placeholder="Select issue period"
                  options={monthGroupOptions}
                  onValueChange={field.onChange}
                />
              )}
            />
          </div>
        )}

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
