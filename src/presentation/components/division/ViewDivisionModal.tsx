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

interface Division {
  id: string;
  code: string;
  name: string;
  headOfDivision: string;
  departments: string;
  status: "Active" | "Inactive";
}

interface ViewDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  division: Division | null;
}

export function ViewDivisionModal({ isOpen, onClose, division }: ViewDivisionModalProps) {
  if (!division) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Detail Master Department
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Division Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division Code
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">{division.code}</span>
            </div>
          </div>

          {/* Division Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division Name
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{division.name}</span>
            </div>
          </div>

          {/* Head Of Division */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Head Of Division
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{division.headOfDivision}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Status
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">{division.status}</span>
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
