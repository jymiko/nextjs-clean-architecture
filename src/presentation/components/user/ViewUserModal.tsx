"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    displayId: string;
    name: string;
    email: string;
    departmentName?: string;
    positionName?: string;
    roleName?: string;
    status: string;
  } | null;
}

export function ViewUserModal({ isOpen, onClose, user }: ViewUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0 rounded-lg shadow-[0px_14px_32px_-2px_rgba(16,24,40,0.06),0px_2px_4px_0px_rgba(16,24,40,0.02)]">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Detail
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* User ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              User ID
            </label>
            <div className="h-10 bg-[#f6faff] border-0 border-b border-[#e5e5e5] flex items-center px-3">
              <span className="text-sm text-[#1a1a1a]">{user.displayId}</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Full Name
            </label>
            <div className="h-10 bg-[#f6faff] border-0 border-b border-[#e5e5e5] flex items-center px-3">
              <span className="text-sm text-[#1a1a1a]">{user.name}</span>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Email
            </label>
            <div className="h-10 bg-[#f6faff] border-0 border-b border-[#e5e5e5] flex items-center px-3">
              <span className="text-sm text-[#1a1a1a]">{user.email}</span>
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Department
            </label>
            <div className="h-10 bg-[#f6faff] border-0 border-b border-[#e5e5e5] flex items-center px-3">
              <span className="text-sm text-[#1a1a1a]">{user.departmentName || "-"}</span>
            </div>
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Position
            </label>
            <div className="h-10 bg-[#f6faff] border-0 border-b border-[#e5e5e5] flex items-center px-3">
              <span className="text-sm text-[#1a1a1a]">{user.positionName || "-"}</span>
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Role
            </label>
            <div className="h-10 bg-[#f6faff] border-0 border-b border-[#e5e5e5] flex items-center px-3">
              <span className="text-sm text-[#1a1a1a]">{user.roleName || "-"}</span>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Status
            </label>
            <div className="h-10 bg-[#f6faff] border-0 border-b border-[#e5e5e5] flex items-center px-3">
              <span className={`text-sm ${user.status === "active" ? "text-[#0e9211]" : "text-[#f24822]"}`}>
                {user.status === "active" ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5]">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-[164px] h-11 border-[#4db1d4] text-[#4db1d4] hover:bg-[#4db1d4]/10"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
