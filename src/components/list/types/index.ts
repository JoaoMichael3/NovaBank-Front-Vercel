import { StaticImageData } from "next/image";

export type ListItem = {
  iconSrc: StaticImageData | string;
  label: string;
  alt: string;
  route: string;
};

export type Section = {
  title: string;
  iconSrc: StaticImageData | string;
  alt: string;
  items: ListItem[];
};

export interface DashboardOptionProps {
  section: Section;
  onClick?: () => void; 
}

export interface ListItemsProps {
  section: {
    title: string;
    iconSrc: any;
    alt: string;
    items: {
      route: string;
      iconSrc: StaticImageData;
      label: string;
      alt: string;
    }[];
  };
  onClick?: () => void;
}



