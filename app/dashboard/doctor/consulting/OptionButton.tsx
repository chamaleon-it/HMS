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
    <div className="relative inline-flex group items-center">
      {fieldName === editable && (
        <button
          type="button"
          className="absolute -right-1.5 -top-1.5 grid place-items-center size-4 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 focus:outline-none z-10 cursor-pointer transition-transform hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            remove();
          }}
          title="Delete option"
        >
          <Minus className="h-3 w-3" />
        </button>
      )}
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "px-3 py-1.5 rounded-xl text-xs select-none transition-all duration-150 cursor-pointer font-medium border",
          isSelected
            ? "bg-(--color-synapse-light) text-white border-(--color-synapse-light) shadow-xs font-semibold scale-[1.01]"
            : "bg-slate-50 border-slate-200/90 text-slate-600 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900"
        )}
      >
        {value}
      </button>
    </div>
  );
};

export default OptionButton;
