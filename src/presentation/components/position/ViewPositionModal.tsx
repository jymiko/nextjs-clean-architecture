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

interface Position {
  id: string;
  code: string;
  name: string;
  departmentId?: string | null;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
  isActive: boolean;
  totalEmployees?: number;
}

interface ViewPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
}

export function ViewPositionModal({ isOpen, onClose, position }: ViewPositionModalProps) {
  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Detail Master Position
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Position Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Position Code
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">{position.code}</span>
            </div>
          </div>

          {/* Position Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Position Name
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{position.name}</span>
            </div>
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">
                {position.department ? `${position.department.name} (${position.department.code})` : "-"}
              </span>
            </div>
          </div>

          {/* Total Employees */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Total Employees
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{position.totalEmployees || 0}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Status
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">
                {position.isActive ? "Active" : "Inactive"}
              </span>
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
