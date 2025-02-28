export interface CustomSelectProps<T> {
  name: string;
  label?: string;
  ariaLabel?: string;
  options: T;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: any;
}
