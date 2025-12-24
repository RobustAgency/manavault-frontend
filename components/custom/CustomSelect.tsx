'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  triggerClassName?: string;
  disabled?: boolean;
}

 const CustomSelect = ({
  value,
  placeholder = 'Select option',
  options,
  onChange,
  triggerClassName = '',
  disabled = false,
}: CustomSelectProps) => {
  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;
