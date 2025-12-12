"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
}

export interface UserFormData {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  positionId: string;
  roleId: string;
  status: string;
}

const departments = [
  { id: "1", name: "Engineering" },
  { id: "2", name: "Human Resources" },
  { id: "3", name: "Finance" },
  { id: "4", name: "Marketing" },
];

const positions = [
  { id: "1", name: "Manager" },
  { id: "2", name: "Supervisor" },
  { id: "3", name: "Staff" },
  { id: "4", name: "Intern" },
];

const roles = [
  { id: "1", name: "Admin" },
  { id: "2", name: "User" },
];

export function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    id: "",
    name: "",
    email: "",
    departmentId: "",
    positionId: "",
    roleId: "",
    status: "",
  });

  const handleSubmit = () => {
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      departmentId: "",
      positionId: "",
      roleId: "",
      status: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0 rounded-lg shadow-[0px_14px_32px_-2px_rgba(16,24,40,0.06),0px_2px_4px_0px_rgba(16,24,40,0.02)]">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Add New User
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* User ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              User ID
            </label>
            <Input
              placeholder="Input user ID"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:border-[#4db1d4]"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Full Name
            </label>
            <Input
              placeholder="Input full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:border-[#4db1d4]"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Email
            </label>
            <Input
              type="email"
              placeholder="Input email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:border-[#4db1d4]"
            />
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Department
            </label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Position
            </label>
            <Select
              value={formData.positionId}
              onValueChange={(value) => setFormData({ ...formData, positionId: value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0">
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Role
            </label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => setFormData({ ...formData, roleId: value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Status
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5] gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-[164px] h-11 border-[#4db1d4] text-[#4db1d4] hover:bg-[#4db1d4]/10"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-[164px] h-11 bg-[#4db1d4] hover:bg-[#3da0c2] text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
