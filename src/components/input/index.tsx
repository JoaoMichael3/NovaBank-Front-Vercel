import React from "react";
import Image from "next/image";
import { useField } from "formik";
import { CustomInputProps } from "./types";

const CustomInput: React.FC<CustomInputProps> = ({
  name,
  imageSrc,
  imageAlt,
  label,
  type,
  placeholder,
  ariaLabel,
  validate,
  required,
  minLength,
  maxLength,
  onChange,
  value,
  prefix,
  suffix,
}) => {
  const [field, meta, helpers] = useField({ name, validate });
  const fieldValue = field?.value || value;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue;
    if (type === "checkbox") {
      const currentValues = field.value || [];
      if (e.target.checked) {
        newValue = [...currentValues, e.target.value];
      } else {
        newValue = currentValues.filter(
          (val: string) => val !== e.target.value
        );
      }
      helpers.setValue(newValue);
    } else {
      helpers.setValue(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div
      className={`flex mb-4 gap-y-2 w-full ${
        type === "radio" || type === "checkbox"
          ? "flex-row-reverse items-center justify-end gap-x-2"
          : "flex-col"
      }`}
    >
      {label && (
        <label className="font-roboto text-[12px] text-[#DDD]" htmlFor={name}>
          {label}
        </label>
      )}
      <div
        className={`flex items-center rounded-md  ${
          type === "radio"
            ? "bg-transparent w-auto"
            : type === "checkbox"
            ? "w-auto"
            : "bg-slate-600  w-full"
        }
        ${prefix && "pl-3"}
        ${suffix && "pr-3"}
        `}
      >
        {imageSrc && imageAlt && (
          <div>
            <div className="w-10/12">
              <Image src={imageSrc} alt={imageAlt} />
            </div>
          </div>
        )}
        {prefix && (
          <span className="font-roboto  text-[#DDD]">{prefix}</span>
        )}
        <input
          {...field}
          type={type}
          id={name}
          name={name}
          placeholder={placeholder}
          aria-label={ariaLabel}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          onChange={handleChange}
          className={`py-3 ${
            meta.touched && meta.error ? "border-red-500" : ""
          } ${!imageSrc && "rounded-md p-3"}
          ${
            type === "radio"
              ? "bg-white relative w-6 cursor-pointer appearance-none rounded-full transition-all active:bg-[#9D54BD] focus:bg-[#9D54BD] checked:border-[#9D54BD] hover:before:opacity-10"
              : type === "checkbox"
              ? "w-5 h-5 cursor-pointer appearance-none rounded-md bg-slate-600 text-[#dddd] border border-[#ddd] checked:bg-[#9D54BD] checked:border-none"
              : "w-full bg-slate-600 text-[#dddd] text-white text-left rounded-r-md focus:outline-none focus:bg-none border-none active:bg-none"
          }
          `}
          {...(type === "radio" && value !== undefined
            ? { value: fieldValue }
            : {})}
          {...(type === "checkbox" && value !== undefined
            ? { value: value }
            : {})}
        />
        {suffix && (
          <span className="font-roboto text-[10px] text-[#DDD]">{suffix}</span>
        )}
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

export default CustomInput;
