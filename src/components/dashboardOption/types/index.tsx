import { StaticImageData } from "next/image";

export type Section = {
  title: string;
  iconSrc: StaticImageData | string;
  alt: string;
  route: string;
};
