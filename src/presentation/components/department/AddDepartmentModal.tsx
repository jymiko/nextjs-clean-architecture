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
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Division {
  id: string;
  code: string;
  name: string;
}

interface AddDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    description?: string;
    divisionId?: string;
    headOfDepartmentId?: string;
    isActive: boolean;
  }) => void;
}

export function AddDepartmentModal({ isOpen, onClose, onSave }: AddDepartmentModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    divisionId: "",
    headOfDepartmentId: "",
    isActive: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);

  // Fetch users and divisions when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchDivisions();
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

  const fetchDivisions = async () => {
    try {
      setLoadingDivisions(true);
      const response = await apiClient.get('/api/divisions?limit=100&isActive=true');
      setDivisions(response.data || []);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    } finally {
      setLoadingDivisions(false);
    }
  };

  const handleSave = () => {
    const dataToSave = {
      code: formData.code,
      name: formData.name,
      description: formData.description || undefined,
      divisionId: formData.divisionId || undefined,
      headOfDepartmentId: formData.headOfDepartmentId || undefined,
      isActive: formData.isActive,
    };
    onSave(dataToSave);
    setFormData({ code: "", name: "", description: "", divisionId: "", headOfDepartmentId: "", isActive: true });
  };

  const handleClose = () => {
    setFormData({ code: "", name: "", description: "", divisionId: "", headOfDepartmentId: "", isActive: true });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Add New Department
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Department Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department Code <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Department Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Department Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Department Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Department Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Description
            </Label>
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-20 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
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
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Head Of Department" />
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

          {/* Division */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division
            </Label>
            <Select
              value={formData.divisionId}
              onValueChange={(value) => setFormData({ ...formData, divisionId: value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                {loadingDivisions ? (
                  <SelectItem value="loading" disabled>Loading...</SelectItem>
                ) : divisions.length > 0 ? (
                  divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-divisions" disabled>No divisions available</SelectItem>
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
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Choose status department" />
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
