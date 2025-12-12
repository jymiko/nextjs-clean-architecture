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

interface Division {
  id: string;
  code: string;
  name: string;
  headOfDivisionId?: string;
  headOfDivision?: {
    id: string;
    name: string;
  };
  isActive: boolean;
}

interface EditDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Division) => void;
  division: Division | null;
}

export function EditDivisionModal({ isOpen, onClose, onSave, division }: EditDivisionModalProps) {
  const [formData, setFormData] = useState<Division>({
    id: "",
    code: "",
    name: "",
    headOfDivisionId: "",
    isActive: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (division) {
      setFormData({
        id: division.id,
        code: division.code,
        name: division.name,
        headOfDivisionId: division.headOfDivisionId || "",
        isActive: division.isActive,
      });
    }
  }, [division]);

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

  const handleSave = () => {
    onSave(formData);
  };

  const handleClose = () => {
    onClose();
  };

  if (!division) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Edit Master Data - Division
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Division Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division Code
            </Label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm text-[#243644] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Division Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division Name
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
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
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus:ring-0 focus:ring-offset-0 focus:outline-none">
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
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm text-[#243644] focus:ring-0 focus:ring-offset-0 focus:outline-none">
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
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
