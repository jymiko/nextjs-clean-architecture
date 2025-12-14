"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Settings, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTheme } from "@/presentation/providers";

interface BrandingSettings {
  systemName: string;
  systemDescription: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

const DEFAULT_BRANDING: BrandingSettings = {
  systemName: "Document Control Management System",
  systemDescription: "A comprehensive document control and management platform",
  primaryColor: "#2563eb",
  secondaryColor: "#8b5cf6",
  logoUrl: null,
};

export function SystemSettings() {
  const [formData, setFormData] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [originalData, setOriginalData] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { refetch: refetchTheme } = useTheme();

  const fetchBranding = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/system/settings/branding");
      const result = await response.json();

      if (result.success && result.data) {
        setFormData(result.data);
        setOriginalData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch branding settings:", error);
      toast.error("Failed to load branding settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  const handleInputChange = (field: keyof BrandingSettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData(originalData);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const response = await fetch("/api/system/settings/branding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const errorMessages = result.errors
            .map((e: { field: string; message: string }) => `${e.field}: ${e.message}`)
            .join(", ");
          toast.error(`Validation error: ${errorMessages}`);
        } else {
          toast.error(result.message || "Failed to save branding settings");
        }
        return;
      }

      if (result.success && result.data) {
        setFormData(result.data);
        setOriginalData(result.data);
        // Refresh theme to apply new colors immediately
        await refetchTheme();
        toast.success("Branding settings saved successfully");
      }
    } catch (error) {
      console.error("Failed to save branding settings:", error);
      toast.error("Failed to save branding settings");
    } finally {
      setIsSaving(false);
    }
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

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
              placeholder="Enter system name"
            />
          </div>

          {/* System Description */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#364153]">System Description</label>
            <Textarea
              value={formData.systemDescription}
              onChange={(e) => handleInputChange("systemDescription", e.target.value)}
              className="min-h-[94px] border-[#d1d5dc] rounded-xl text-base resize-none"
              placeholder="Enter system description"
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
            <div className="size-20 rounded-xl bg-gray-100 border-2 border-dashed border-[#d1d5dc] flex items-center justify-center overflow-hidden relative">
              {formData.logoUrl ? (
                <Image
                  src={formData.logoUrl}
                  alt="System Logo"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <ImageIcon className="size-6 text-gray-400" />
              )}
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
              <input
                type="color"
                value={isValidHexColor(formData.primaryColor) ? formData.primaryColor : "#2563eb"}
                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                className="size-10 rounded border border-[#d1d5dc] shrink-0 cursor-pointer p-0.5"
              />
              <Input
                value={formData.primaryColor}
                onChange={(e) => handleInputChange("primaryColor", e.target.value)}
                className="h-10 flex-1 border-[#d1d5dc] rounded-xl text-base"
                placeholder="#2563eb"
              />
            </div>
            {formData.primaryColor && !isValidHexColor(formData.primaryColor) && (
              <p className="text-sm text-red-500">Invalid hex color format</p>
            )}
          </div>

          {/* Secondary Color */}
          <div className="flex flex-col gap-2">
            <label className="text-base text-[#364153]">Secondary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={isValidHexColor(formData.secondaryColor) ? formData.secondaryColor : "#8b5cf6"}
                onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                className="size-10 rounded border border-[#d1d5dc] shrink-0 cursor-pointer p-0.5"
              />
              <Input
                value={formData.secondaryColor}
                onChange={(e) => handleInputChange("secondaryColor", e.target.value)}
                className="h-10 flex-1 border-[#d1d5dc] rounded-xl text-base"
                placeholder="#8b5cf6"
              />
            </div>
            {formData.secondaryColor && !isValidHexColor(formData.secondaryColor) && (
              <p className="text-sm text-red-500">Invalid hex color format</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 bg-white p-4 rounded-xl">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges || isSaving}
          className="h-11 px-6 border-[#d1d5dc] text-[#364153] hover:bg-gray-50 rounded-xl disabled:opacity-50"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="h-11 px-8 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-xl disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
