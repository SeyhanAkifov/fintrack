"use client";

/**
 * IconPicker — grid picker for choosing a category emoji icon.
 * Created:  2026-06-21
 * Modified: 2026-06-21
 */

import { cn } from "@/lib/utils";

/** Curated set of icons suited to finance categories. */
export const CATEGORY_ICONS = [
  "🍽️", "🛒", "🍕", "☕", "🍔", "🥗", "🍷", "🍺",
  "🏠", "🛋️", "💡", "💧", "🔌", "🔥", "🧹", "🔧",
  "🚌", "🚗", "🚆", "✈️", "⛽", "🚲", "🅿️", "🛵",
  "💰", "💵", "💳", "🏦", "📈", "💼", "💻", "🧾",
  "🎬", "🎮", "🎵", "🎟️", "📺", "🎨", "📚", "🎓",
  "🛍️", "👕", "👟", "💄", "🎁", "🐶", "🐱", "🌱",
  "❤️", "💊", "🏥", "🦷", "🏋️", "🧘", "📱", "📞",
  "✈️", "🏖️", "🌍", "📦", "🔁", "⚡", "🏷️", "⭐",
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

// Renders a selectable grid of emoji icons for a category.
export function IconPicker({ value, onChange, label = "Icon" }: IconPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="grid grid-cols-8 gap-1 max-h-44 overflow-y-auto rounded-lg border border-gray-300 p-2">
        {CATEGORY_ICONS.map((icon, i) => (
          <button
            key={`${icon}-${i}`}
            type="button"
            onClick={() => onChange(icon)}
            aria-label={`Select icon ${icon}`}
            aria-pressed={value === icon}
            className={cn(
              "flex items-center justify-center aspect-square rounded-md text-lg transition-colors",
              value === icon
                ? "bg-indigo-100 ring-2 ring-indigo-500"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            )}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
