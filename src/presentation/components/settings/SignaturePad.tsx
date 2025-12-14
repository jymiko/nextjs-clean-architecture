"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
  initialValue?: string;
}

export function SignaturePad({ open, onClose, onSave, initialValue }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  // Load initial value when dialog opens
  useEffect(() => {
    if (open && initialValue && sigCanvas.current) {
      sigCanvas.current.fromDataURL(initialValue);
      setIsEmpty(false);
    }
  }, [open, initialValue]);

  const clear = useCallback(() => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  }, []);

  const handleEnd = useCallback(() => {
    if (sigCanvas.current) {
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  }, []);

  const save = useCallback(() => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
      onSave(dataUrl);
      clear();
    }
  }, [onSave, clear]);

  const handleClose = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Signature Canvas with Document Submission Style */}
          <div className="relative border border-[#D1D5DC] rounded-lg shadow-sm bg-white overflow-hidden">
            <div className="relative">
              <SignatureCanvas
                ref={sigCanvas}
                penColor="#000"
                canvasProps={{
                  className: "w-full cursor-crosshair",
                  style: {
                    width: "100%",
                    height: "200px",
                    backgroundColor: "#fff",
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

            {/* Toolbar - Document Submission Style */}
            <div className="flex items-center gap-2 px-4 py-2 border-t border-[#E5E7EB] bg-[rgba(249,250,251,0.5)]">
              <button
                type="button"
                onClick={clear}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex items-center gap-2 border-[#f24822] text-[#f24822] hover:bg-[#f24822]/10"
            >
              <X className="size-4" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={save}
              disabled={isEmpty}
              className="flex items-center gap-2 bg-[#4db1d4] hover:bg-[#3da0bf] text-white"
            >
              <Check className="size-4" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
