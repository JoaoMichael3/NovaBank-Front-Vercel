import { StaticImageData } from "next/image";

export interface Company {
  name: string;
  volume: string;
  imageSrc?: string | StaticImageData;
  imageAlt?: string;
}

export interface VolumeSalesProps {
  title: string;
  highlight: string;
  companies: Company[];
}
