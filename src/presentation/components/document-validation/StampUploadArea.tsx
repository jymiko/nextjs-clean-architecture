"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface StampUploadAreaProps {
  value: string | null;
  onChange: (base64: string | null) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export function StampUploadArea({
  value,
  onChange,
  onClear,
  disabled = false,
  className,
}: StampUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    (file: File) => {
      setError(null);

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload PNG, JPG, JPEG, WEBP, or GIF.");
        return;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File is too large. Maximum size is 10MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onChange(dataUrl);
      };
      reader.onerror = () => {
        setError("Failed to read file. Please try again.");
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
    // Reset input to allow re-uploading same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleClear = () => {
    onChange(null);
    onClear?.();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!value ? (
        // Upload area
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-[#4DB1D4] bg-[#E9F5FE]"
              : "border-[#E1E2E3] hover:border-[#4DB1D4] hover:bg-[#F9FBFF]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#E9F5FE] flex items-center justify-center">
              <Upload className="h-6 w-6 text-[#4DB1D4]" />
            </div>
            <div>
              <p className="text-[#384654] font-medium text-sm">Upload Image</p>
              <p className="text-[#738193] text-xs mt-1">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-[#738193] text-xs mt-1">
                Max size: 10MB - JPG, PNG, JPEG, WEBP, GIF
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Preview area
        <div className="border border-[#E1E2E3] rounded-lg p-4">
          <div className="flex items-start gap-4">
            {/* Image preview */}
            <div className="relative w-32 h-32 bg-[#F5F5F5] rounded-lg overflow-hidden flex items-center justify-center border border-[#E1E2E3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Company stamp preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Info and actions */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-[#738193]" />
                <span className="text-[#384654] text-sm font-medium">
                  Company Stamp
                </span>
              </div>
              <p className="text-[#738193] text-xs mb-4">
                Stamp uploaded successfully
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={disabled}
                  className="h-8 text-xs"
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Change
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={disabled}
                  className="h-8 text-xs text-[#F24822] border-[#F24822] hover:bg-[#FFF4F4]"
                >
                  <X className="h-3 w-3 mr-1" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-[#F24822] text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
