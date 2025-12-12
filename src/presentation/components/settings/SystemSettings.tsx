"use client";

import { useState } from "react";
import { Settings, Upload, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function SystemSettings() {
  const [formData, setFormData] = useState({
    systemName: "Document Control Management System",
    systemDescription: "A comprehensive document control and management platform",
    primaryColor: "#2563eb",
    secondaryColor: "#8b5cf6",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      systemName: "Document Control Management System",
      systemDescription: "A comprehensive document control and management platform",
      primaryColor: "#2563eb",
      secondaryColor: "#8b5cf6",
    });
  };

  const handleSave = () => {
    console.log("Saving system settings:", formData);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* System Information Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Settings className="size-5 text-blue-600" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-normal text-[#101828]">
              System Information
            </h3>
            <p className="text-sm text-[#6a7282]">
              Configure basic system details
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* System Name */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#364153]">System Name</label>
            <Input
              value={formData.systemName}
              onChange={(e) => handleInputChange("systemName", e.target.value)}
              className="h-11 border-[#d1d5dc] rounded-xl text-base"
            />
          </div>

          {/* System Description */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#364153]">System Description</label>
            <Textarea
              value={formData.systemDescription}
              onChange={(e) => handleInputChange("systemDescription", e.target.value)}
              className="min-h-[94px] border-[#d1d5dc] rounded-xl text-base resize-none"
            />
          </div>
        </div>
      </div>

      {/* Logo & Branding Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#f1f4ff] flex items-center justify-center">
            <Upload className="size-5 text-[#4db1d4]" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-normal text-[#101828]">
              Logo & Branding
            </h3>
            <p className="text-sm text-[#6a7282]">
              Upload system logo and set brand colors
            </p>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="space-y-2">
          <label className="text-base text-[#364153]">System Logo</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="size-20 rounded-xl bg-gray-100 border-2 border-dashed border-[#d1d5dc] flex items-center justify-center">
              <ImageIcon className="size-6 text-gray-400" />
            </div>
            <div className="flex flex-col gap-2">
              <Button className="h-10 px-4 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-xl">
                Upload Logo
              </Button>
              <p className="text-sm text-[#6a7282]">
                PNG, JPG up to 2MB. Recommended: 200x200px
              </p>
            </div>
          </div>
        </div>

        {/* Color Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Primary Color */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#364153]">Primary Color</label>
            <div className="flex gap-2">
              <div
                className="size-10 rounded border border-[#d1d5dc] shrink-0"
                style={{ backgroundColor: formData.primaryColor }}
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                className="h-10 flex-1 border-[#d1d5dc] rounded-xl text-base"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#364153]">Secondary Color</label>
            <div className="flex gap-2">
              <div
                className="size-10 rounded border border-[#d1d5dc] shrink-0"
                style={{ backgroundColor: formData.secondaryColor }}
              />
              <Input
                value={formData.secondaryColor}
                onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                className="h-10 flex-1 border-[#d1d5dc] rounded-xl text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 bg-white p-4 rounded-xl">
        <Button
          variant="outline"
          onClick={handleReset}
          className="h-11 px-6 border-[#d1d5dc] text-[#364153] hover:bg-gray-50 rounded-xl"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          className="h-11 px-8 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-xl"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
