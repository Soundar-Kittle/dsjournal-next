"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Trash2 } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { CustomDropZone } from "@/components/ui/FormInput/Inputs";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FaWhatsapp } from "react-icons/fa";
import { useSettings, useSettingsMutation } from "@/services";

const schema = yup
  .object({
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    location: yup.string().nullable(),
    name: yup.string().required("Name is required"),
    phone_number: yup
      .array()
      .of(
        yup.object({
          number: yup
            .string()
            .required("Phone number is required")
            .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit number"),
          is_whatsapp: yup.boolean().default(false),
        })
      )
      .min(1, "At least one phone number is required"),

    addresses: yup
      .array()
      .of(
        yup.object().shape({
          line1: yup.string().required("Address Line 1 is required"),
          line2: yup.string(),
          city: yup.string().required("City is required"),
          state: yup.string().required("State is required"),
          country: yup.string().required("Country is required"),
          pincode: yup.string().required("Pincode is required"),
        })
      )
      .min(1, "At least one address is required"),
    app_name: yup.string().nullable(),
    app_email: yup.string().email("Invalid email format").nullable(),
    app_password: yup.string().nullable(),
    social_links: yup.array().of(
      yup.object().shape({
        platform: yup.string().required("Platform is required"),
        url: yup.string().url("Invalid URL format").required("URL is required"),
      })
    ),
  })
  .test("mail-required", null, function (value) {
    const { app_name, app_email, app_password } = value;
    const anyProvided = !!(app_name || app_email || app_password);
    const errors = [];

    if (anyProvided) {
      if (!app_name)
        errors.push(
          this.createError({
            path: "app_name",
            message: "App Name is required when mail details are provided",
          })
        );
      if (!app_email)
        errors.push(
          this.createError({
            path: "app_email",
            message: "App Email is required when mail details are provided",
          })
        );
      if (!app_password) {
        errors.push(
          this.createError({
            path: "app_password",
            message: "App Password is required when mail details are provided",
          })
        );
      } else if (app_password.length !== 16) {
        errors.push(
          this.createError({
            path: "app_password",
            message: "App Password must be exactly 16 characters",
          })
        );
      }
    }

    if (errors.length) throw new yup.ValidationError(errors);
    return true;
  });

// Error component for consistent styling
const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return <p className="text-red-500 text-sm mt-1">{error.message}</p>;
};

export default function AddSettings() {
  const [tab, setTab] = useState("default");
  const [logoFile, setLogoFile] = useState({ logo: [] });
  const [iconFile, setIconFile] = useState({ icon: [] });
  const [showPassword, setShowPassword] = useState(false);

  const { data } = useSettings();
  const settingsData = useMemo(() => {
    if (!data?.rows) return null;
    return data.rows.reduce((acc, item) => {
      acc[item.settings_name] = item.settings_value;
      return acc;
    }, {});
  }, [data]);

  const {
    watch,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      phone_number: [{ number: "", is_whatsapp: false }],
      addresses: [
        { line1: "", line2: "", city: "", state: "", country: "", pincode: "" },
      ],
      app_name: "",
      app_email: "",
      app_password: "",
      social_links: [],
      location: "",
    },
  });

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: "phone_number",
  });

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: "addresses",
  });

  const {
    fields: socialFields,
    append: appendSocial,
    remove: removeSocial,
  } = useFieldArray({
    control,
    name: "social_links",
  });

  useEffect(() => {
    setValue("logo", logoFile);
    setValue("icon", iconFile);
  }, [logoFile, iconFile, setValue]);

  useEffect(() => {
    if (!settingsData) return;

    reset({
      email: settingsData.email || "",
      name: settingsData.name || "",
      phone_number: settingsData.phone_number?.length
        ? settingsData.phone_number
        : [{ number: "", is_whatsapp: false }],
      addresses: settingsData.address
        ? settingsData.address
        : [
            {
              line1: "",
              line2: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
            },
          ],
      app_name: settingsData.app_name || "",
      app_email: settingsData.app_email || "",
      app_password: settingsData.app_password || "",
      social_links: settingsData.social_links?.length
        ? settingsData.social_links
        : [],
      location: settingsData.location || "",
    });

    setLogoFile({ logo: settingsData.logo ? [settingsData.logo] : [] });
    setIconFile({ icon: settingsData.icon ? [settingsData.icon] : [] });
  }, [settingsData, reset]);

  const mutation = useSettingsMutation();

  const onSubmit = async (payload) => {
    const fd = new FormData();
    fd.append("email", payload.email);
    fd.append("name", payload.name);
    fd.append("address", JSON.stringify(payload.addresses));
    fd.append("location", payload.location);
    fd.append("app_name", payload.app_name);
    fd.append("app_email", payload.app_email);
    fd.append("app_password", payload.app_password);
    fd.append("phone_number", JSON.stringify(payload.phone_number));
    fd.append("social_links", JSON.stringify(payload.social_links));
    fd.append("folder", "settings");

    const safeAppend = (key, value) => {
      if (value && value !== "" && value !== null && value !== undefined) {
        fd.append(key, value);
      }
    };

    if (logoFile.logo?.[0] instanceof File)
      safeAppend("logo", logoFile.logo[0]);
    else safeAppend("logo", logoFile.logo?.[0]);
    if (iconFile.icon?.[0] instanceof File)
      safeAppend("icon", iconFile.icon[0]);
    else safeAppend("icon", iconFile.icon?.[0]);

    console.log("data", [...fd.entries()]);

    await mutation.mutateAsync(fd);
  };

  return (
    <div className="bg-white rounded-md shadow-md overflow-hidden">
      <div className="p-4 bg-primary/5 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-primary">Settings</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="block md:hidden mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between capitalize"
                >
                  {tab === "default"
                    ? "Default Settings"
                    : tab === "social"
                    ? "Social Links"
                    : "Mail Details"}
                  {/* {tab} */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                <DropdownMenuItem onClick={() => setTab("default")}>
                  Default Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTab("social")}>
                  Social Links
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTab("mail")}>
                  Mail Details
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TabsList className="hidden md:flex mb-4 justify-start">
            <TabsTrigger value="default">Default Settings</TabsTrigger>
            <TabsTrigger value="social">Social Links</TabsTrigger>
            <TabsTrigger value="mail">Mail Details</TabsTrigger>
          </TabsList>

          {/* Default Settings Tab */}
          <TabsContent
            className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-2"
            value="default"
          >
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <CustomDropZone
                  name="logo"
                  label="Logo"
                  number_of_images={1}
                  errors={errors.logo}
                  fileType="image"
                  uploadedFiles={logoFile}
                  setUploadedFiles={setLogoFile}
                />
                <ErrorMessage error={errors.logo} />
              </div>
              <div>
                <CustomDropZone
                  name="icon"
                  label="Icon"
                  number_of_images={1}
                  errors={errors.icon}
                  fileType="image"
                  uploadedFiles={iconFile}
                  setUploadedFiles={setIconFile}
                />
                <ErrorMessage error={errors.icon} />
              </div>
            </div>

            <div className="">
              <label htmlFor="name" className="text-sm font-bold mb-2 block">
                Name *
              </label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    id="name"
                    {...field}
                    placeholder="Name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                )}
              />
              <ErrorMessage error={errors.name} />
            </div>

            <div className="">
              <label htmlFor="email" className="text-sm font-bold mb-2 block">
                Email *
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    placeholder="Email"
                    className={errors.email ? "border-red-500" : ""}
                  />
                )}
              />
              <ErrorMessage error={errors.email} />
            </div>

            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold mb-2 block">
                Phone Numbers *
              </label>
              {phoneFields.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 border p-3 rounded-md bg-gray-50"
                >
                  <div className="flex-1">
                    <Controller
                      name={`phone_number.${index}.number`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Phone number"
                          className={
                            errors.phone_number?.[index]?.number
                              ? "border-red-500"
                              : ""
                          }
                        />
                      )}
                    />
                    <ErrorMessage
                      error={errors.phone_number?.[index]?.number}
                    />
                  </div>

                  <Controller
                    name={`phone_number.${index}.is_whatsapp`}
                    control={control}
                    render={({ field }) => {
                      const isActive = !!field.value;

                      return (
                        <div
                          onClick={() => {
                            const current = watch("phone_number");
                            const newState = current.map((p, i) => {
                              if (i === index) {
                                return { ...p, is_whatsapp: !p.is_whatsapp };
                              } else {
                                return {
                                  ...p,
                                  is_whatsapp: isActive ? p.is_whatsapp : false,
                                };
                              }
                            });

                            // If user turned ON, others must be OFF
                            const finalState = newState.map((p, i) => ({
                              ...p,
                              is_whatsapp:
                                i === index
                                  ? !isActive
                                  : !isActive
                                  ? false
                                  : p.is_whatsapp,
                            }));

                            setValue("phone_number", finalState, {
                              shouldDirty: true,
                            });
                          }}
                          className={`cursor-pointer flex items-center gap-2 select-none px-3 py-2 rounded-md border transition-all ${
                            isActive
                              ? "bg-green-100 border-green-500 text-green-700"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`inline-block w-3 h-3 rounded-full border ${
                              isActive ? "border-green-800" : "border-c"
                            } shrink-0`}
                          >
                            {isActive && (
                              <span className="block w-full h-full bg-green-500 rounded-full "></span>
                            )}
                          </span>
                          <span className="text-xs">
                            {/* Same as{" "} */}
                            <FaWhatsapp
                              size={20}
                              className="inline-block text-green-500 ml-1"
                            />
                          </span>
                        </div>
                      );
                    }}
                  />

                  {index > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removePhone(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              ))}
              <ErrorMessage error={errors.phone_number} />
              <Button type="button" onClick={() => appendPhone({ number: "" })}>
                + Add Phone
              </Button>
            </div>

            <div className="col-span-full space-y-2">
              <label className="text-sm font-bold mb-2 block">
                Addresses *
              </label>
              {addressFields.map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-md"
                >
                  {[
                    {
                      field: "line1",
                      label: "Address Line 1",
                      required: true,
                    },
                    {
                      field: "line2",
                      label: "Address Line 2",
                      required: false,
                    },
                    { field: "city", label: "City", required: true },
                    { field: "state", label: "State", required: true },
                    { field: "country", label: "Country", required: true },
                    { field: "pincode", label: "Pincode", required: true },
                  ].map(({ field, label, required }) => (
                    <div key={field}>
                      <Controller
                        name={`addresses.${index}.${field}`}
                        control={control}
                        render={({ field: f }) => (
                          <Input
                            {...f}
                            placeholder={`${label}${required ? " *" : ""}`}
                            className={
                              errors.addresses?.[index]?.[field]
                                ? "border-red-500"
                                : ""
                            }
                          />
                        )}
                      />
                      <ErrorMessage
                        error={errors.addresses?.[index]?.[field]}
                      />
                    </div>
                  ))}
                  {index > 0 && (
                    <div className="col-span-full">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => removeAddress(index)}
                      >
                        Remove Address
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              <ErrorMessage error={errors.addresses} />
              <Button
                type="button"
                onClick={() =>
                  appendAddress({
                    line1: "",
                    line2: "",
                    city: "",
                    state: "",
                    country: "",
                    pincode: "",
                  })
                }
              >
                + Add Address
              </Button>
            </div>

            <div className="col-span-full space-y-2">
              <label
                htmlFor="location"
                className="text-sm font-bold mb-2 block"
              >
                Location (Map Embed or URL)
              </label>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    id="location"
                    rows={3}
                    className={`w-full border p-2 rounded ${
                      errors.location ? "border-red-500" : ""
                    }`}
                    placeholder="Paste Google Maps embed code or location URL"
                  />
                )}
              />
              <ErrorMessage error={errors.location} />
            </div>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <div className="space-y-3">
              <label className="text-sm font-bold mb-2 block">
                Social Links
              </label>
              {socialFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-semibold">Link #{index + 1}</h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeSocial(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="w-full">
                      {/* <Controller
                        name={`social_links.${index}.platform`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              className={`w-full ${
                                errors.social_links?.[index]?.platform
                                  ? "border-red-500"
                                  : ""
                              }`}
                            >
                              <SelectValue placeholder="Select Platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="instagram">
                                Instagram
                              </SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      /> */}
                      <Controller
                        control={control}
                        name={`social_links.${index}.platform`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[
                              { label: "INSTAGRAM", value: "instagram" },
                              { label: "FACEBOOK", value: "facebook" },
                              { label: "TWITTER", value: "twitter" },
                              { label: "YOUTUBE", value: "youtube" },
                              { label: "LINKEDIN", value: "linkedin" },
                            ]}
                            onValueChange={field.onChange}
                          />
                        )}
                      />
                    </div>

                    <div>
                      <Controller
                        name={`social_links.${index}.url`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="https://..."
                            className={
                              errors.social_links?.[index]?.url
                                ? "border-red-500"
                                : ""
                            }
                          />
                        )}
                      />
                      <ErrorMessage error={errors.social_links?.[index]?.url} />
                    </div>
                  </div>
                </div>
              ))}
              <ErrorMessage error={errors.social_links} />
              <Button
                type="button"
                onClick={() => appendSocial({ platform: "", url: "" })}
              >
                + Add Social Link
              </Button>
            </div>
          </TabsContent>

          {/* Mail Details Tab */}
          <TabsContent
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            value="mail"
          >
            <div>
              <label
                htmlFor="app_name"
                className="text-sm font-bold mb-2 block"
              >
                App Name
              </label>
              <Controller
                name="app_name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="app_name"
                    placeholder="App Name"
                    className={errors.app_name ? "border-red-500" : ""}
                  />
                )}
              />
              <ErrorMessage error={errors.app_name} />
            </div>

            <div>
              <label
                htmlFor="app_email"
                className="text-sm font-bold mb-2 block"
              >
                App Email
              </label>
              <Controller
                name="app_email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="app_email"
                    placeholder="App Email"
                    className={errors.app_email ? "border-red-500" : ""}
                  />
                )}
              />
              <ErrorMessage error={errors.app_email} />
            </div>

            <div className="col-span-full">
              <label
                htmlFor="app_password"
                className="text-sm font-bold mb-2 block"
              >
                App Password
              </label>
              <Controller
                name="app_password"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      {...field}
                      id="app_password"
                      type={showPassword ? "text" : "password"}
                      placeholder="App Password (16 characters)"
                      className={`pr-10 ${
                        errors.app_password ? "border-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}
              />
              <ErrorMessage error={errors.app_password} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Final Save Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isLoading}>
            {mutation.isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
