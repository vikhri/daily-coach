"use client";

import { Chip } from "@/components/ui/chip";
import { TAG_LABELS } from "@/lib/constants";

type TagPickerProps = {
  value: string[];
  options: readonly string[];
  onChange: (value: string[]) => void;
};

export function TagPicker({ value, options, onChange }: TagPickerProps) {
  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => (
        <Chip
          key={tag}
          active={value.includes(tag)}
          onClick={() => toggle(tag)}
          label={TAG_LABELS[tag] ?? tag}
        />
      ))}
    </div>
  );
}
