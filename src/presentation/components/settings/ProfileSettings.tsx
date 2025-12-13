"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { User, Camera, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignaturePad } from "./SignaturePad";
import { useCurrentUser } from "@/hooks/use-current-user";

export function ProfileSettings() {
  const { user, isLoading } = useCurrentUser();

  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    email: "",
    division: "",
    department: "",
    position: "",
    status: "Active",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userId: user.employeeId || user.id,
        fullName: user.name,
        email: user.email,
        department: user.department?.name || "",
        position: user.position?.name || "",
        status: user.isActive ? "Active" : "Inactive",
        role: user.role,
      }));
      if (user.signature) {
        setSignatureDataUrl(user.signature);
      }
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignatureSave = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteSignature = () => {
    setSignatureDataUrl(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 space-y-6">
      {/* Profile Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
        <div className="relative">
          <div className="size-20 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt="User avatar"
                fill
                className="object-cover"
              />
            ) : (
              <User className="size-10 text-blue-600" />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-normal text-[#101828]">
            {isLoading ? '...' : user?.name || 'User'}
          </h3>
          <p className="text-sm text-[#4a5565]">{user?.email || ''}</p>
          <p className="text-sm text-[#6a7282] capitalize">{user?.role?.toLowerCase() || ''}</p>
        </div>
      </div>

      {/* Profile Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User ID */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">User ID</label>
          <Input
            value={formData.userId}
            onChange={(e) => handleInputChange("userId", e.target.value)}
            className="h-9 bg-[#f3f3f5] border-transparent rounded-lg"
            readOnly
          />
        </div>

        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Full Name</label>
          <Input
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className="h-9 bg-[#f6faff] border-transparent rounded-lg"
          />
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Email Address</label>
          <Input
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="h-9 bg-[#f3f3f5] border-transparent rounded-lg"
            readOnly
          />
        </div>

        {/* Division */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Division</label>
          <Select
            value={formData.division}
            onValueChange={(value) => handleInputChange("division", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Information Technology">Information Technology</SelectItem>
              <SelectItem value="Human Resources">Human Resources</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Department</label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleInputChange("department", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Digital Transformation">Digital Transformation</SelectItem>
              <SelectItem value="Software Development">Software Development</SelectItem>
              <SelectItem value="Infrastructure">Infrastructure</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Position */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Position</label>
          <Select
            value={formData.position}
            onValueChange={(value) => handleInputChange("position", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Staff">Staff</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Role</label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleInputChange("role", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="text-base font-normal text-[#101828]">Change Password</h4>
        <div className="space-y-4">
          {/* Current Password */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-neutral-950">Current Password</label>
            <Input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => handleInputChange("currentPassword", e.target.value)}
              className="h-9 bg-[#f6faff] border-transparent rounded-lg"
              placeholder="Enter current password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-950">New Password</label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                className="h-9 bg-[#f6faff] border-transparent rounded-lg"
                placeholder="Enter new password"
              />
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-950">Confirm New Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="h-9 bg-[#f6faff] border-transparent rounded-lg"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="h-9 px-6 border-[#f24822] text-[#f24822] hover:bg-[#f24822]/10 rounded-lg"
          >
            Cancel
          </Button>
          <Button className="h-9 px-6 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-lg">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Signature Section */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="text-base font-normal text-[#101828]">Signature</h4>
        <div className="space-y-4">
          <label className="text-sm text-neutral-950">Your Signature</label>

          {signatureDataUrl ? (
            <div className="relative bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-center h-[180px]">
                <Image
                  src={signatureDataUrl}
                  alt="Your signature"
                  width={300}
                  height={150}
                  className="max-h-[150px] w-auto object-contain"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDeleteSignature}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="bg-[#f3f3f5] border border-transparent rounded-lg h-[200px] flex flex-col items-center justify-center text-[#8a8f9d] text-sm">
              <p>No signature added yet</p>
              <p>Upload or draw your signature below</p>
            </div>
          )}

          {/* Hidden file input for upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Signature Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              className="h-11 border-[#00b3d8] text-[#4db1d4] hover:bg-[#4db1d4]/10 rounded-lg flex items-center justify-center gap-2"
            >
              <Camera className="size-5" />
              <span>Upload Signature</span>
            </Button>
            <Button
              type="button"
              onClick={() => setIsSignaturePadOpen(true)}
              className="h-11 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-lg flex items-center justify-center gap-2"
            >
              <Pencil className="size-5" />
              <span>Draw Signature</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Signature Pad Dialog */}
      <SignaturePad
        open={isSignaturePadOpen}
        onClose={() => setIsSignaturePadOpen(false)}
        onSave={handleSignatureSave}
      />
    </div>
  );
}
