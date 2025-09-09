import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";
import { Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const CustomDropZone = ({
  name,
  label,
  uploadedFiles,
  number_of_images,
  image_size,
  type = "add",
  folder,
  errors,
  required = false,
  setUploadedFiles,
  labelComponent,
  labelPlacement = "default",
  fileType,
  component,
}) => {
  const [uploadError, setUploadError] = useState(false);

  const getAcceptedFileTypes = () => {
    switch (fileType) {
      case "image":
        return {
          "image/jpeg": [],
          "image/jpg": [],
          "image/png": [],
          "image/webp": [],
          "image/avif": [],
        };
      case "docs":
        return {
          "application/pdf": [],
          "application/msword": [],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            [],
          "application/vnd.ms-excel": [],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            [],
          "text/csv": [],
        };
      case "mixed":
        return {
          "image/jpeg": [],
          "image/jpg": [],
          "image/png": [],
          "image/webp": [],
          "image/avif": [],
          "application/pdf": [],
          "application/msword": [],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            [],
          "application/vnd.ms-excel": [],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            [],
          "text/csv": [],
        };
      default:
        return {};
    }
  };

  const onDrop = useCallback(
    (acceptedFiles) => {
      setUploadedFiles((prevFiles) => {
        const current = prevFiles[name] || [];

        // Filter duplicates (by name for File objects, by string for URLs)
        const all = [
          ...current,
          ...acceptedFiles.filter(
            (file) =>
              !current.some((f) =>
                file instanceof File
                  ? f instanceof File && f.name === file.name
                  : f === file
              )
          ),
        ];

        // Limit to max allowed
        const limited = all.slice(0, number_of_images);

        return { ...prevFiles, [name]: limited };
      });
    },
    [name, setUploadedFiles, number_of_images]
  );

  const { fileRejections, getRootProps, getInputProps } = useDropzone({
    accept: getAcceptedFileTypes(),
    maxFiles: number_of_images,
    maxSize: image_size,
    onDrop,
  });

  const acceptedFileItems = (uploadedFiles[name] || [])?.map((file, idx) => {
    const isFileObject = file instanceof File;
    const fileName = isFileObject ? file.name : file;
    const isImage = isFileObject
      ? file.type.startsWith("image/")
      : /\.(jpeg|jpg|png|webp|avif)$/i.test(file);

    return (
      <div
        key={idx}
        className={`relative inline-block mr-2 bg-white group ${
          isImage ? "hover:scale-[3] hover:z-10" : ""
        } transition-all duration-200 origin-center`}
        style={
          isImage
            ? { width: "22px", height: "22px" }
            : {
                minWidth: "80px",
                padding: "3px 6px",
                backgroundColor: "#ddd",
                borderRadius: "4px",
              }
        }
      >
        {isImage ? (
          <img
            src={
              isFileObject
                ? URL.createObjectURL(file)
                : `${file}`
            }
            alt={fileName}
            className="w-full h-full object-cover rounded border "
          />
        ) : (
          <div className="text-[10px] text-gray-800 break-words max-w-[180px]">
            {/* <p className="font-medium truncate">{fileName}</p> */}
            {isFileObject && <p className="font-medium truncate">{fileName}</p>}

            {!isFileObject && (
              <a
                href={file}
                download={fileName?.split("/").pop()}
                className="text-blue-600 underline text-[10px] block"
              >
                {fileName?.split("/").pop()}
                {/* Download */}
              </a>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            setUploadedFiles((prevFiles) => ({
              ...prevFiles,
              [name]: prevFiles[name].filter((element) => {
                if (isFileObject && element instanceof File) {
                  return (
                    element.name !== file.name || element.size !== file.size
                  );
                }
                return element !== file;
              }),
            }))
          }
          className={`absolute cursor-pointer -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center
          text-[8px] group-hover:text-[6px] shadow-md hover:bg-red-600 ${
            isImage
              ? "w-2 h-2 text-xs shadow-md hover:bg-red-600 group-hover:w-2 group-hover:h-2"
              : ""
          }`}
        >
          ×
        </button>
      </div>
    );
  });

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <div key={file.path} className="text-xs text-red-600">
      <p className="font-semibold">{file.name}</p>
      {errors.map((e, idx) => {
        if (e.code === "file-too-large") {
          return (
            <p key={idx}>
              File too large. Max size: {Math.ceil(image_size / 1024)} KB
            </p>
          );
        }
        if (e.code === "file-invalid-type") {
          return <p key={idx}>Invalid file type</p>;
        }
        return <p key={idx}>{e.message}</p>;
      })}
    </div>
  ));

  return (
    <div className="w-full">
      {/* Label logic */}

      {label && labelPlacement === "default" ? (
        <label
          htmlFor={name}
          className="flex items-center gap-2 text-sm font-medium mb-0.5"
        >
          <div>
            {label}
            {required && <span className=" ml-1 text-red-500">*</span>}
          </div>
          {labelComponent && labelComponent}
        </label>
      ) : null}
      <div
        className={`rounded-md border relative ${
          errors && errors[name] ? "border-red-500" : "border-gray-300"
        } bg-gray-50 `}
      >
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className="cursor-pointer  flex items-center justify-between px-4 py-1.5 bg-white border rounded-md hover:bg-gray-100"
        >
          {acceptedFileItems.length > 0 ? (
            <div className="flex flex-wrap gap-1">{acceptedFileItems}</div>
          ) : labelPlacement !== "default" ? (
            <p className="text-sm text-gray-600">
              Upload {label}{" "}
              {required && <span className="text-red-500 font-bold">*</span>}
            </p>
          ) : (
            <p className="text-sm text-gray-600">Upload Files... </p>
          )}
          <CloudUpload size={18.2} className="text-gray-500" />
          <input {...getInputProps()} />
        </div>
        {component && component}
      </div>
      {errors && (
        <p className="text-xs text-red-500 mt-1 ">{errors[name]?.message}</p>
      )}
      {uploadError && uploadedFiles[name]?.length === 0 && (
        <p className="text-sm text-red-500 mt-1">{uploadError}</p>
      )}

      {fileRejectionItems.length > 0 && (
        <div className="mt-2 space-y-1">{fileRejectionItems}</div>
      )}
    </div>
  );
};

export const CustomToggle = ({
  options,
  control,
  errors,
  showTooltip = false,
  showLabel = true,
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      {options.map((option) => (
        <div key={option.name} className="flex flex-col">
          <Controller
            name={option.name}
            control={control}
            defaultValue={false}
            render={({ field: { value = false, onChange } }) => (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                      <Switch
                        id={option.name}
                        checked={value}
                        onCheckedChange={onChange}
                      />
                      {option.label && showLabel && (
                        <span
                          className={
                            value ? "text-foreground" : "text-muted-foreground"
                          }
                        >
                          {option.label}
                        </span>
                      )}
                    </label>
                  </TooltipTrigger>

                  {showTooltip && option.label && (
                    <TooltipContent side="top">{option.label}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
          />
          {errors?.[option.name] && (
            <p className="text-sm text-red-500 mt-1">
              {errors[option.name]?.message}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
