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

interface User {
  id: string;
  name: string;
  email: string;
}

interface AddDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    headOfDivisionId?: string;
    isActive: boolean;
  }) => void;
}

interface FormErrors {
  code?: string;
  name?: string;
}

export function AddDivisionModal({ isOpen, onClose, onSave }: AddDivisionModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    headOfDivisionId: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/users?limit=100&isActive=true');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Division code is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Division name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    onSave({
      code: formData.code,
      name: formData.name,
      ...(formData.headOfDivisionId && { headOfDivisionId: formData.headOfDivisionId }),
      isActive: formData.isActive,
    });
    setFormData({ code: "", name: "", headOfDivisionId: "", isActive: true });
  };

  const handleClose = () => {
    setFormData({ code: "", name: "", headOfDivisionId: "", isActive: true });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Add New Division
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Division Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division Code <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Division Code"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value });
                if (errors.code) setErrors({ ...errors, code: undefined });
              }}
              className={`h-10 bg-[#f6faff] border-0 border-b rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none ${
                errors.code ? "border-red-500" : "border-[#4db1d4]"
              }`}
            />
            {errors.code && (
              <p className="text-xs text-red-500 mt-1">{errors.code}</p>
            )}
          </div>

          {/* Division Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Division Name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`h-10 bg-[#f6faff] border-0 border-b rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none ${
                errors.name ? "border-red-500" : "border-slate-400"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Head Of Division */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Head Of Division (Optional)
            </Label>
            <Select
              value={formData.headOfDivisionId || "none"}
              onValueChange={(value) => setFormData({ ...formData, headOfDivisionId: value === "none" ? "" : value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Head Of Division" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                <SelectItem value="none">-- None --</SelectItem>
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
              value={formData.isActive ? "Active" : "Inactive"}
              onValueChange={(value) => setFormData({ ...formData, isActive: value === "Active" })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Choose status division" />
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
