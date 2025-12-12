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

interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  divisionId: string;
  divisionName: string;
  status: "Active" | "Inactive";
}

interface Division {
  id: string;
  code: string;
  name: string;
}

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Department) => void;
  department: Department | null;
  divisions?: Division[];
}

export function EditDepartmentModal({ isOpen, onClose, onSave, department, divisions = [] }: EditDepartmentModalProps) {
  const [formData, setFormData] = useState<Department>({
    id: "",
    code: "",
    name: "",
    headOfDepartment: "",
    divisionId: "",
    divisionName: "",
    status: "Active",
  });

  useEffect(() => {
    if (department) {
      setFormData(department);
    }
  }, [department]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleClose = () => {
    onClose();
  };

  // Sample head of department options
  const headOptions = [
    { value: "Khoirul Ma'arif", label: "Khoirul Ma'arif" },
    { value: "Sari Siwandari", label: "Sari Siwandari" },
    { value: "Trisna Piliandy", label: "Trisna Piliandy" },
    { value: "Kristo Suharto", label: "Kristo Suharto" },
    { value: "Hamdan Mursyid", label: "Hamdan Mursyid" },
  ];

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
              Department Code
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
              Department Name
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Head Of Department */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Head Of Department
            </Label>
            <Input
              value={formData.headOfDepartment}
              onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Division */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division
            </Label>
            <Select
              value={formData.divisionId}
              onValueChange={(value) => {
                const selectedDivision = divisions.find(d => d.id === value);
                setFormData({
                  ...formData,
                  divisionId: value,
                  divisionName: selectedDivision ? `${selectedDivision.code} - ${selectedDivision.name}` : formData.divisionName
                });
              }}
            >
              <SelectTrigger className="h-10 bg-slate-100 border-0 border-b border-slate-400 rounded-none text-sm text-[#243644] focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Division" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                {divisions.length > 0 ? (
                  divisions.map((division) => (
                    <SelectItem key={division.id} value={division.id}>
                      {division.code} - {division.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="IT">IT - Information Technology</SelectItem>
                    <SelectItem value="OPS">OPS - Operations</SelectItem>
                    <SelectItem value="FSC">FSC - Food Safety & Compliance</SelectItem>
                    <SelectItem value="HR">HR - Human Resources</SelectItem>
                  </>
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
              value={formData.status}
              onValueChange={(value: "Active" | "Inactive") => setFormData({ ...formData, status: value })}
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
