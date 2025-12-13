"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { apiClient } from "@/lib/api-client";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface AddPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    departmentId?: string;
    isActive: boolean;
  }) => void;
}

export function AddPositionModal({ isOpen, onClose, onSave }: AddPositionModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    departmentId: "",
    isActive: true,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/departments?limit=100&isActive=true');
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    onSave({
      code: formData.code,
      name: formData.name,
      ...(formData.departmentId && { departmentId: formData.departmentId }),
      isActive: formData.isActive,
    });
    setFormData({ code: "", name: "", departmentId: "", isActive: true });
  };

  const handleClose = () => {
    setFormData({ code: "", name: "", departmentId: "", isActive: true });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Add New Position
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Position Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Position Code
            </Label>
            <Input
              placeholder="Position Code (e.g., MGR-001)"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Position Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Position Name
            </Label>
            <Input
              placeholder="Position Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Department */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department (Optional)
            </Label>
            <Select
              value={formData.departmentId || "none"}
              onValueChange={(value) => setFormData({ ...formData, departmentId: value === "none" ? "" : value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                <SelectItem value="none">-- None --</SelectItem>
                {loading ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : departments.length > 0 ? (
                  departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-dept" disabled>No departments available</SelectItem>
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
              value={formData.isActive ? "Active" : "Inactive"}
              onValueChange={(value) => setFormData({ ...formData, isActive: value === "Active" })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Choose status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
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
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
