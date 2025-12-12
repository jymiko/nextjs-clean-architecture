"use client";

import { useRef, useState, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eraser, Check, X } from "lucide-react";

interface SignaturePadProps {
  open: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

export function SignaturePad({ open, onClose, onSave }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

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
      onClose();
    }
  }, [onSave, onClose]);

  const handleClose = useCallback(() => {
    clear();
    onClose();
  }, [clear, onClose]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Draw Your Signature</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 452,
                height: 200,
                className: "signature-canvas",
                style: {
                  width: "100%",
                  height: "200px",
                  backgroundColor: "#fff",
                },
              }}
              onEnd={handleEnd}
            />
          </div>

          <p className="text-sm text-gray-500 text-center">
            Draw your signature in the box above
          </p>

          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={clear}
              className="flex items-center gap-2"
            >
              <Eraser className="size-4" />
              Clear
            </Button>

            <div className="flex gap-3">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
