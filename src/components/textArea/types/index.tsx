import { CustomInputProps } from "@/components/input/types";

export interface CustomTextareaProps extends Omit<CustomInputProps, "type"> {
    rows?: number;
    cols?: number;
  }