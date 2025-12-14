"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface DocumentType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  prefix?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    children: number;
  };
}

interface ViewDocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType: DocumentType | null;
}

export function ViewDocumentTypeModal({ isOpen, onClose, documentType }: ViewDocumentTypeModalProps) {
  if (!documentType) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Detail Document Type
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Document Type Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Document Type Code
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">{documentType.code}</span>
            </div>
          </div>

          {/* Document Type Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Document Type Name
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{documentType.name}</span>
            </div>
          </div>

          {/* Document Number Prefix */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Document Number Prefix
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{documentType.prefix || '-'}</span>
            </div>
          </div>

          {/* Description */}
          {documentType.description && (
            <div className="space-y-2">
              <Label className="text-xs font-normal text-slate-700">
                Description
              </Label>
              <div className="min-h-20 bg-slate-100 border-b border-slate-400 px-3 py-2">
                <span className="text-sm text-[#243644]">{documentType.description}</span>
              </div>
            </div>
          )}

          {/* Total Documents */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Total Documents
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{documentType._count?.documents || 0}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Status
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">{documentType.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5]">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full h-11 border-[#4db1d4] text-[#4db1d4] hover:bg-[#4db1d4]/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
