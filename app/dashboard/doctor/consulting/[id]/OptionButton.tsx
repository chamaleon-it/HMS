import React from "react";
import { DataType } from "./interface";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionButtonProps {
  value: string;
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  setData: React.Dispatch<React.SetStateAction<DataType>>;
  fieldName: "diagnosis" | "pastHistory" | "presentHistory";
  setValues: React.Dispatch<
    React.SetStateAction<{
      presentHistory: string[];
      pastHistory: string[];
      diagnosis: string[];
    }>
  >;
  editable: "diagnosis" | "pastHistory" | "presentHistory" | null;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  value,
  selectedValues,
  setSelectedValues,
  setData,
  fieldName,
  setValues,
  editable,
}) => {
  const isSelected = selectedValues.includes(value);

  const handleClick = () => {
    setSelectedValues((prev) => {
      const newData = prev.includes(value)
        ? prev.filter((x) => x !== value)
        : [...prev, value];

      setData((prevData: DataType) => ({
        ...prevData,
        consultationNotes: {
          ...prevData.consultationNotes,
          [fieldName]: newData.join(", "),
        },
      }));

      return newData;
    });
  };

  const remove = () => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((e) => e !== value),
    }));

    setSelectedValues((prev) => {
      const newData = prev.filter((x) => x !== value);
      setData((prevData: DataType) => ({
        ...prevData,
        consultationNotes: {
          ...prevData.consultationNotes,
          [fieldName]: newData.join(", "),
        },
      }));
      return newData;
    });
  };

  return (
    <div className="relative inline-flex group">
      {fieldName === editable && (
        <button
          className={cn(
            "absolute -right-1 -top-1 grid place-items-center size-3.5 rounded-md cursor-pointer",
            "bg-red-500 text-white shadow-sm hover:bg-red-600",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60",
            "transition-opacity",
            // show on hover or when selected; tweak as you like
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={remove}
        >
          <Minus className="h-3 w-3" />
        </button>
      )}
      <button
        onClick={handleClick}
        className={cn(
          "px-3 py-1 rounded-full text-xs border select-none transition-shadow",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isSelected
            ? "bg-emerald-100 border-emerald-300 text-emerald-700 shadow-sm"
            : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
        )}
      >
        {value}
      </button>
    </div>
  );
};

export default OptionButton;
