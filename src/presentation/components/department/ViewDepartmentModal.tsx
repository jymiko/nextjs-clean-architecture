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

interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  headOfDepartmentId?: string | null;
  headOfDepartment?: {
    id: string;
    name: string;
    email: string;
  } | null;
  isActive: boolean;
  totalEmployees?: number;
  createdAt: string;
  updatedAt: string;
}

interface ViewDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department | null;
}

export function ViewDepartmentModal({ isOpen, onClose, department }: ViewDepartmentModalProps) {
  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Detail Master Department
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Department Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department Code
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">{department.code}</span>
            </div>
          </div>

          {/* Department Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department Name
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{department.name}</span>
            </div>
          </div>

          {/* Description */}
          {department.description && (
            <div className="space-y-2">
              <Label className="text-xs font-normal text-slate-700">
                Description
              </Label>
              <div className="min-h-20 bg-slate-100 border-b border-slate-400 px-3 py-2">
                <span className="text-sm text-[#243644]">{department.description}</span>
              </div>
            </div>
          )}

          {/* Head Of Department */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Head Of Department
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">
                {department.headOfDepartment 
                  ? `${department.headOfDepartment.name} (${department.headOfDepartment.email})` 
                  : '-'}
              </span>
            </div>
          </div>

          {/* Total Employees */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Total Employees
            </Label>
            <div className="h-10 bg-slate-100 border-b border-slate-400 px-3 flex items-center">
              <span className="text-sm text-[#243644]">{department.totalEmployees || 0}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Status
            </Label>
            <div className="h-10 bg-slate-100 border-b border-[#4db1d4] px-3 flex items-center">
              <span className="text-sm text-[#243644]">{department.isActive ? 'Active' : 'Inactive'}</span>
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
