"use client";

import { X, ChevronDown } from "lucide-react";
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
import { useState } from "react";

interface AddDivisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    code: string;
    name: string;
    headOfDivision: string;
    status: string;
  }) => void;
}

export function AddDivisionModal({ isOpen, onClose, onSave }: AddDivisionModalProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    headOfDivision: "",
    status: "",
  });

  const handleSave = () => {
    onSave(formData);
    setFormData({ code: "", name: "", headOfDivision: "", status: "" });
  };

  const handleClose = () => {
    setFormData({ code: "", name: "", headOfDivision: "", status: "" });
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
              Division Code
            </Label>
            <Input
              placeholder="Division Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Division Name */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Division Name
            </Label>
            <Input
              placeholder="Division Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>

          {/* Head Of Division */}
          <div className="space-y-2">
            <Label className="text-xs font-normal text-slate-700">
              Head Of Division
            </Label>
            <Select
              value={formData.headOfDivision}
              onValueChange={(value) => setFormData({ ...formData, headOfDivision: value })}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-slate-400 rounded-none text-sm focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <SelectValue placeholder="Head Of Division" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#e1e2e3]">
                <SelectItem value="khoirul">Khoirul Ma&apos;arif</SelectItem>
                <SelectItem value="sari">Sari Siwandari</SelectItem>
                <SelectItem value="trisna">Trisna Piliandy</SelectItem>
                <SelectItem value="kristo">Kristo Suharto</SelectItem>
                <SelectItem value="hamdan">Hamdan Mursyid</SelectItem>
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
              onValueChange={(value) => setFormData({ ...formData, status: value })}
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
