"use client"

import { useEffect,useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import GLightbox from "glightbox";
import "glightbox/dist/css/glightbox.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";



export default function SettingsForm() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      journal_name: "",
      alias_name: "",
      icon: "",
      logo: null,
      social_links: [{ platform: "", url: "" }],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "social_links",
  })

const [existingIconPath, setExistingIconPath] = useState(null);
const [existingLogoPath, setExistingLogoPath] = useState(null);
const [logoPreview, setLogoPreview] = useState(null);
const [iconPreview, setIconPreview] = useState(null);
const watchLogo = watch("logo");
const watchIcon = watch("icon");

useEffect(() => {
  if (watchLogo?.[0]) {
    const file = watchLogo[0];
    setLogoPreview(URL.createObjectURL(file));
  }
}, [watchLogo]);

useEffect(() => {
  if (watchIcon?.[0]) {
    const file = watchIcon[0];
    setIconPreview(URL.createObjectURL(file));
  }
}, [watchIcon]);

useEffect(() => {
  const lightbox = GLightbox({
    selector: ".glightbox",
  });
  return () => {
    lightbox.destroy();
  };
}, [logoPreview, existingLogoPath]);



useEffect(() => {
  fetch("/api/settings")
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.settings) {
        const { journal_name, alias_name, icon, logo, social_links } = data.settings;

        setExistingIconPath(icon);  // icon file path
        setExistingLogoPath(logo);  // logo file path

        reset({
          journal_name,
          alias_name,
          icon: null,
          logo: null,
          social_links: social_links?.length > 0 ? social_links : [{ platform: "", url: "" }],
        });
      }
    })
    .catch((err) => console.error("Load settings failed:", err));
}, [reset]);


  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append("journal_name", data.journal_name)
    formData.append("alias_name", data.alias_name)
    if (data.icon?.[0]) formData.append("icon", data.icon[0]); // ✔️ handles uploaded icon file
    if (data.logo?.[0]) formData.append("logo", data.logo[0])
    formData.append("social_links", JSON.stringify(data.social_links))

    // const res = await fetch("/api/settings", {
    //   method: "POST",
    //   body: formData,
    // })

    const res = await fetch("/api/settings", {
  method: "PATCH", // this ensures only update happens
  body: formData,
})

    const result = await res.json()
    console.log(result)
  }

  return (
 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Journal Settings</CardTitle>
        <CardDescription>Update your journal’s basic information.</CardDescription>
      </CardHeader>
      <hr class="h-px bg-gray-200 border-0 dark:bg-gray-700"></hr>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="journal_name">Journal Name</Label>
          <Input id="journal_name" {...register("journal_name", { required: true })} />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="alias_name">Alias Name</Label>
          <Input id="alias_name" {...register("alias_name", { required: true })} />
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="icon">Favicon Icon File (.ico/.png/.svg)</Label>
          <Input id="icon" type="file" accept=".ico,image/*" {...register("icon")} />
          {(iconPreview || existingIconPath) && (
            <div className="flex items-center gap-2 mt-1">
              <img
                src={iconPreview || `/${existingIconPath}`}
                alt="Icon Preview"
                className="h-8 w-8 border rounded"
              />
              {existingIconPath && !iconPreview && (
                <a
                  href={`/${existingIconPath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline text-blue-600"
                >
                  View icon
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <Label htmlFor="logo">Journal Logo</Label>
          <Input id="logo" type="file" accept="image/*" {...register("logo")} />
          {(logoPreview || existingLogoPath) && (
            <div className="mt-1">
              <a
                href={logoPreview || `/${existingLogoPath}`}
                className="glightbox cursor-pointer"
                data-gallery="logo"
              >
                <img
                  src={logoPreview || `/${existingLogoPath}`}
                  alt="Logo Preview"
                  className="h-16 rounded border cursor-zoom-in"
                />
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>Add links to your journal’s social presence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-center">
            <Input
              className="col-span-4"
              placeholder="Platform"
              {...register(`social_links.${index}.platform`)}
            />
            <Input
              className="col-span-6"
              placeholder="URL"
              {...register(`social_links.${index}.url`)}
            />
            <Button
              type="button"
              onClick={() => remove(index)}
              variant="outline"
              className="col-span-2"
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          type="button"
          onClick={() => append({ platform: "", url: "" })}
          variant="secondary"
        >
          + Add Social
        </Button>
      </CardContent>
    </Card>

    <div className="text-right">
      <Button type="submit" className="px-6">Save Changes</Button>
    </div>
  </form>

  )
}
