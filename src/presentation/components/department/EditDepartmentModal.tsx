"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useState, useEffect } from "react";

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

interface User {
  id: string;
  name: string;
  email: string;
}

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    description?: string | null;
    headOfDepartmentId?: string | null;
    isActive: boolean;
  }) => void;
  department: Department | null;
}

export function EditDepartmentModal({ isOpen, onClose, onSave, department }: EditDepartmentModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    headOfDepartmentId: "",
    isActive: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        code: department.code,
        name: department.name,
        description: department.description || "",
        headOfDepartmentId: department.headOfDepartmentId || "",
        isActive: department.isActive,
      });
    }
  }, [department]);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users?limit=100&isActive=true');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const dataToSave = {
      code: formData.code,
      name: formData.name,
      description: formData.description || null,
      headOfDepartmentId: formData.headOfDepartmentId || null,
      isActive: formData.isActive,
    };
    onSave(dataToSave);
  };

  const handleClose = () => {
    onClose();
  };

  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Edit Master Data - Department
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Department Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department Code <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm text-[#243644] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Department Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Description
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-20 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Head Of Department */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Head Of Department
            </Label>
            <Select
              value={formData.headOfDepartmentId}
              onValueChange={(value) => setFormData({ ...formData, headOfDepartmentId: value })}
            >
              <SelectTrigger className="h-10 bg-slate-100 border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Select Head Of Department" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                {loading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-users" disabled>No users available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Status
            </Label>
            <Select
              value={formData.isActive ? "true" : "false"}
              onValueChange={(value) => setFormData({ ...formData, isActive: value === "true" })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm text-[#243644] focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Choose status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5]">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-[164px] h-11 border-[#4db1d4] text-[#4db1d4] hover:bg-[#4db1d4]/10"
          >
            Close
          </Button>
          <Button
            onClick={handleSave}
            className="w-[164px] h-11 bg-[#4db1d4] hover:bg-[#3da0c2] text-white"
            disabled={!formData.code || !formData.name}
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
