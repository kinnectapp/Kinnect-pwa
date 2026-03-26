import React from "react";

interface CustomDateSeparatorProps {
  date: Date;
}

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

const formatDateLabel = (date: Date): string => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const CustomDateSeparator: React.FC<CustomDateSeparatorProps> = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="bg-[#e6e3ea] text-[#77707F] text-[11px] font-medium px-3 py-1 rounded-full">
        {formatDateLabel(date)}
      </span>
    </div>
  );
};

export default CustomDateSeparator;
