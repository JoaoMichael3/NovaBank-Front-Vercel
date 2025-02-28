import React from "react";
import { useField, useFormikContext } from "formik";
import { CustomSelectProps } from "./types";

const CustomSelect = <T extends Record<string, string>>({
  name,
  label,
  ariaLabel,
  options,
  required,
  value,
  onChange,
}: CustomSelectProps<T>) => {
  const formikContext = useFormikContext();
  const [field, meta, helpers] = useField(name || "");
  const fieldValue = field?.value || value;
  

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e);
    } else if (helpers.setValue) {
      helpers.setValue(e.target.value);
    }
  };

  return (
    <div className="flex flex-col mb-4 gap-y-2 w-full text-[12px]">
      {label && (
        <label className="font-roboto mt-1.5 text-[#ddd]" htmlFor={name}>
          {label}
        </label>
      )}
      <select
        {...(formikContext ? field : {})}
        id={name}
        aria-label={ariaLabel}
        required={required}
        onChange={handleChange}
        value={fieldValue || ""}
        className={`bg-[#3A3A3A] py-3 pl-3 text-white text-left w-full rounded-md focus:outline-none focus:bg-[#3A3A3A] border-none active:bg-[#3A3A3A] checked:bg-[#3A3A3A] ${
          meta.touched && meta.error ? "border-red-500" : ""
        }`}
      >
        <option value="" disabled>
          Selecionar
        </option>
        {Object.keys(options).map((key) => (
          <option value={key} key={key}>
            {options[key as keyof T]}
          </option>
        ))}
      </select>
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

export default CustomSelect;
