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
import { useState } from "react";

interface AddDocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    description?: string;
    prefix?: string;
    isActive: boolean;
  }) => void;
}

interface FormErrors {
  code?: string;
  name?: string;
}

export function AddDocumentTypeModal({ isOpen, onClose, onSave }: AddDocumentTypeModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    prefix: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Document type code is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Document type name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    const dataToSave = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description || undefined,
      prefix: formData.prefix || undefined,
      isActive: formData.isActive,
    };
    onSave(dataToSave);
    setFormData({ code: "", name: "", description: "", prefix: "", isActive: true });
  };

  const handleClose = () => {
    setFormData({ code: "", name: "", description: "", prefix: "", isActive: true });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Add New Document Type
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Document Type Code */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Document Type Code <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., WI-DT, SPEC-DT"
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value.toUpperCase() });
                if (errors.code) setErrors({ ...errors, code: undefined });
              }}
              className={`h-10 bg-[#f6faff] border-0 border-b rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none ${
                errors.code ? "border-red-500" : "border-[#4db1d4]"
              }`}
            />
            {errors.code ? (
              <p className="text-xs text-red-500 mt-1">{errors.code}</p>
            ) : (
              <p className="text-xs text-slate-500">Use uppercase letters, numbers, hyphens, and underscores only</p>
            )}
          </div>

          {/* Document Type Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Document Type Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Document Type Name"
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

          {/* Document Number Prefix */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Document Number Prefix
            </Label>
            <Input
              placeholder="e.g., WI, SOP, SPEC"
              value={formData.prefix}
              onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
            <p className="text-xs text-slate-500">This prefix will be used when generating document numbers</p>
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
