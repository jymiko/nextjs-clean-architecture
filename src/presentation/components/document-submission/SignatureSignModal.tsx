"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Pencil, CheckCircle, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

interface SignatureSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureImage: string) => Promise<void>;
  userSignature?: string | null;
  existingSignature?: string | null;
  isLoading?: boolean;
}

export function SignatureSignModal({
  isOpen,
  onClose,
  onSign,
  userSignature,
  existingSignature,
  isLoading = false,
}: SignatureSignModalProps) {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("draw");
  const [drawnSignature, setDrawnSignature] = useState<string>("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsEmpty(true);
      setDrawnSignature("");
      // Default to "current" tab if editing existing signature, otherwise "saved" if available
      if (existingSignature) {
        setActiveTab("current");
      } else if (userSignature) {
        setActiveTab("saved");
      } else {
        setActiveTab("draw");
      }
      signatureRef.current?.clear();
    }
  }, [isOpen, userSignature, existingSignature]);

  const handleClear = useCallback(() => {
    signatureRef.current?.clear();
    setIsEmpty(true);
    setDrawnSignature("");
  }, []);

  const handleEnd = useCallback(() => {
    if (signatureRef.current) {
      const trimmedCanvas = signatureRef.current.getTrimmedCanvas();
      const data = trimmedCanvas.toDataURL("image/png");
      setIsEmpty(signatureRef.current.isEmpty());
      setDrawnSignature(data);
    }
  }, []);

  const handleSign = async () => {
    if (activeTab === "draw") {
      if (isEmpty || !drawnSignature) {
        return;
      }
      await onSign(drawnSignature);
    } else if (activeTab === "saved") {
      if (!userSignature) {
        return;
      }
      await onSign("use-profile");
    } else if (activeTab === "current") {
      if (!existingSignature) {
        return;
      }
      await onSign("keep-current");
    }
  };

  const canSign =
    activeTab === "draw"
      ? !isEmpty && drawnSignature
      : activeTab === "saved"
        ? !!userSignature
        : !!existingSignature;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#E1E2E3]">
          <DialogTitle className="text-[#384654] text-lg font-semibold">
            Sign Document
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={cn("grid w-full mb-4", existingSignature ? "grid-cols-3" : "grid-cols-2")}>
              {existingSignature && (
                <TabsTrigger value="current" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Current
                </TabsTrigger>
              )}
              <TabsTrigger value="draw" className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Draw New
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="flex items-center gap-2"
                disabled={!userSignature}
              >
                <ImageIcon className="w-4 h-4" />
                Use Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="draw" className="mt-0">
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
            </TabsContent>

            <TabsContent value="saved" className="mt-0">
              <div className="border border-[#D1D5DC] rounded-lg bg-white p-4">
                {userSignature ? (
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-[#6A7282] mb-3">
                      Your saved signature from profile:
                    </p>
                    <div className="border border-dashed border-[#D1D5DC] rounded-lg p-4 bg-[#FAFAFA] relative w-full h-[150px]">
                      <NextImage
                        src={userSignature}
                        alt="Saved signature"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-2">
                      This signature will be used for signing the document.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <ImageIcon className="w-12 h-12 text-[#D1D5DC] mb-3" />
                    <p className="text-sm text-[#6A7282]">
                      No saved signature found.
                    </p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      Please draw a signature or save one in your profile settings.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {existingSignature && (
              <TabsContent value="current" className="mt-0">
                <div className="border border-[#D1D5DC] rounded-lg bg-white p-4">
                  <div className="flex flex-col items-center">
                    <p className="text-sm text-[#6A7282] mb-3">
                      Current signature on this document:
                    </p>
                    <div className="border border-dashed border-[#D1D5DC] rounded-lg p-4 bg-[#FAFAFA] relative w-full h-[150px]">
                      <NextImage
                        src={existingSignature}
                        alt="Current signature"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    </div>
                    <p className="text-xs text-[#9CA3AF] mt-2">
                      Click &quot;Sign Document&quot; to keep this signature, or select another tab to change it.
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-[#E1E2E3] bg-[#F9FAFB]">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="border-[#D1D5DC] text-[#384654]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSign}
            disabled={!canSign || isLoading}
            className="bg-[#0E9211] hover:bg-[#0C7A0E] text-white"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Signing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Sign Document
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
