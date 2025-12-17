"use client";

import * as React from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface MultiSelectProps {
  options: {
    value: string;
    label: string;
    disabled?: boolean;
  }[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSelections?: number;
  currentTotalSelected?: number;
  error?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  disabled = false,
  maxSelections,
  currentTotalSelected = 0,
  error = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const handleUnselect = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  const handleToggle = (value: string, isDisabled?: boolean) => {
    if (isDisabled) return;

    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      const currentTotal = currentTotalSelected + selected.length;
      if (maxSelections && currentTotal >= maxSelections) {
        return;
      }
      onChange([...selected, value]);
    }
  };

  const isMaxReached = maxSelections
    ? (currentTotalSelected + selected.length) >= maxSelections
    : false;

  // Filter options based on search input
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [options, searchValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-12 h-auto py-2 border-[#E1E1E6] rounded-sm hover:bg-transparent",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-500",
            className
          )}
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 w-full">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="rounded-sm px-2 py-0.5 text-xs"
                  >
                    {option?.label || value}
                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 inline-flex cursor-pointer"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleUnselect(value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(value);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </span>
                  </Badge>
                );
              })
            )}
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b">
            <Input
              placeholder="Search options..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Options List */}
          <div className="max-h-[300px] overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {searchValue ? "No results found." : "No options available."}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value);
                const isDisabledByMax = isMaxReached && !isSelected;
                const isOptionDisabled = option.disabled || isDisabledByMax;

                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center px-2 py-2 rounded-sm cursor-pointer hover:bg-accent transition-colors",
                      isOptionDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                    onClick={() => handleToggle(option.value, isOptionDisabled)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span className={cn(
                      "text-sm flex-1",
                      isOptionDisabled && "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                    {isOptionDisabled && (
                      <span className="text-xs text-muted-foreground">
                        {option.disabled ? "(Sudah dipilih)" : "(Limit tercapai)"}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}