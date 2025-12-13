"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SignaturePad({
  value,
  onChange,
  className,
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Load existing signature if provided
  useEffect(() => {
    if (value && signatureRef.current) {
      signatureRef.current.fromDataURL(value);
      setIsEmpty(false);
    }
  }, [value]);

  const handleClear = useCallback(() => {
    signatureRef.current?.clear();
    setIsEmpty(true);
    onChange?.("");
  }, [onChange]);

  const handleEnd = useCallback(() => {
    if (signatureRef.current) {
      const data = signatureRef.current.toDataURL("image/png");
      setIsEmpty(signatureRef.current.isEmpty());
      onChange?.(data);
    }
  }, [onChange]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="relative border border-[#D1D5DC] rounded-lg shadow-sm bg-white">
        {/* Signature Canvas */}
        <div className="relative">
          <SignatureCanvas
            ref={signatureRef}
            penColor="#000"
            canvasProps={{
              className: "w-full h-[200px] cursor-crosshair",
              style: {
                borderRadius: "8px 8px 0 0",
              },
            }}
            onEnd={handleEnd}
          />

          {/* Placeholder text when empty */}
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-[#6A7282] text-sm">
                Draw your signature in the space provided.
              </p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-t border-[#E5E7EB] bg-[rgba(249,250,251,0.5)] rounded-b-lg">
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            title="Clear signature"
          >
            <Trash2 className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-[#D1D5DC]" />
          <button
            type="button"
            className="p-2 rounded hover:bg-gray-100 transition-colors text-gray-600"
            title="Draw"
          >
            <Pencil className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
