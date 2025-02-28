import { StaticImageData } from "next/image";
import { FieldValidator } from "formik";

export type CustomInputProps = {
  name: string;
  imageSrc?: StaticImageData | string;
  imageAlt?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  ariaLabel?: string;
  validate?: FieldValidator;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  onChange?: any;
  value?: string;
  prefix?: string;
  suffix?: string;
};
