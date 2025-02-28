import React from "react";
import Image from "next/image";
import { useField } from "formik";
import { CustomTextareaProps } from "./types";

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  name,
  imageSrc,
  imageAlt,
  label,
  placeholder,
  ariaLabel,
  validate,
  required,
  minLength,
  maxLength,
  onChange,
  value,
  rows,
  cols,
}) => {
  const [field, meta, helpers] = useField({ name, validate });
  const fieldValue = field?.value || value;
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      helpers.setValue(e.target.value);
    }
  };

  return (
    <div className="flex flex-col mb-4 gap-y-2 w-full">
      {label && (
        <label className="font-roboto  text-[#DDD]" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="flex items-start rounded-md shadow-lg bg-[#3A3A3A] w-full">
        {imageSrc && imageAlt && (
          <div className="px-2 py-1">
            <Image src={imageSrc} alt={imageAlt} />
          </div>
        )}
        <textarea
          {...field}
          id={name}
          name={name}
          placeholder={placeholder}
          aria-label={ariaLabel}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          onChange={handleChange}
          rows={rows}
          cols={cols}
          className={`py-3 px-3 w-full bg-[#3A3A3A] text-white text-left rounded-md focus:outline-none ${
            meta.touched && meta.error ? "border-red-500" : ""
          }`}
        />
      </div>
      <span
        className={`h-4 text-xs ${
          meta.touched && meta.error ? "text-red-500" : ""
        }`}
      >
        {meta.touched && meta.error ? meta.error : ""}
      </span>
    </div>
  );
};

export default CustomTextarea;
