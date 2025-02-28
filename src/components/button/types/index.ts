import { StaticImageData } from "next/image";

export type ButtonProps = {
  imageSrc?: StaticImageData | string;
  imageAlt?: string;
  type?: "submit" | "reset" | "button";
  text: string;
  color: string;
  hoverColor: string;
  disabled?: boolean;
  onClick?: any;
};
