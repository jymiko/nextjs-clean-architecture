"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { User, Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignaturePad } from "@/presentation/components/document-submission/SignaturePad";
import { useCurrentUser } from "@/hooks/use-current-user";
import { toast } from "sonner";

interface Division {
  id: string;
  code: string;
  name: string;
}

interface Department {
  id: string;
  code: string;
  name: string;
  divisionId?: string;
}

interface Position {
  id: string;
  code: string;
  name: string;
  departmentId?: string;
}

export function ProfileSettings() {
  const { user, isLoading, refetch } = useCurrentUser();

  const [formData, setFormData] = useState({
    userId: "",
    fullName: "",
    email: "",
    divisionId: "",
    departmentId: "",
    positionId: "",
    status: "Active",
    role: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);

  const [signatureDataUrl, setSignatureDataUrl] = useState<string>("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingSignature, setIsSavingSignature] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch divisions, departments, and positions
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [divisionsRes, departmentsRes, positionsRes] = await Promise.all([
          fetch('/api/divisions?limit=100&isActive=true'),
          fetch('/api/departments?limit=100&isActive=true'),
          fetch('/api/positions?limit=100&isActive=true'),
        ]);

        if (divisionsRes.ok) {
          const data = await divisionsRes.json();
          setDivisions(data.data || []);
        }

        if (departmentsRes.ok) {
          const data = await departmentsRes.json();
          setDepartments(data.data || []);
        }

        if (positionsRes.ok) {
          const data = await positionsRes.json();
          setPositions(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      // Find the department to get divisionId
      const userDepartment = departments.find(d => d.id === user.departmentId);

      setFormData(prev => ({
        ...prev,
        userId: user.employeeId || user.id,
        fullName: user.name,
        email: user.email,
        divisionId: userDepartment?.divisionId || "",
        departmentId: user.departmentId || "",
        positionId: user.positionId || "",
        status: user.isActive ? "Active" : "Inactive",
        role: user.role,
      }));
      setSignatureDataUrl(user.signature || "");
    }
  }, [user, departments]);

  // Filter departments when division changes
  useEffect(() => {
    if (formData.divisionId) {
      const filtered = departments.filter(d => d.divisionId === formData.divisionId);
      setFilteredDepartments(filtered);

      // If current department is not in filtered list, clear it
      if (!filtered.find(d => d.id === formData.departmentId)) {
        setFormData(prev => ({ ...prev, departmentId: "", positionId: "" }));
      }
    } else {
      setFilteredDepartments(departments);
    }
  }, [formData.divisionId, departments, formData.departmentId]);

  // Filter positions when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const filtered = positions.filter(p => p.departmentId === formData.departmentId);
      setFilteredPositions(filtered);

      // If current position is not in filtered list, clear it
      if (!filtered.find(p => p.id === formData.positionId)) {
        setFormData(prev => ({ ...prev, positionId: "" }));
      }
    } else {
      setFilteredPositions(positions);
    }
  }, [formData.departmentId, positions, formData.positionId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignatureChange = useCallback((dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  }, []);

  const handleSaveSignature = useCallback(async () => {
    if (!signatureDataUrl) {
      toast.error('Please draw your signature first');
      return;
    }

    setIsSavingSignature(true);
    try {
      const response = await fetch('/api/auth/profile/signature', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signature: signatureDataUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save signature');
      }

      toast.success('Signature saved successfully');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save signature');
    } finally {
      setIsSavingSignature(false);
    }
  }, [signatureDataUrl, refetch]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setSignatureDataUrl(dataUrl);

        // Auto-save signature
        setIsSavingSignature(true);
        try {
          const response = await fetch('/api/auth/profile/signature', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ signature: dataUrl }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save signature');
          }

          toast.success('Signature uploaded successfully');
          refetch();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to upload signature');
        } finally {
          setIsSavingSignature(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const updateData: Record<string, unknown> = {};

      // Only include changed profile fields
      if (formData.fullName !== user?.name) {
        updateData.name = formData.fullName;
      }
      if (formData.departmentId !== (user?.departmentId || "")) {
        updateData.departmentId = formData.departmentId || null;
      }
      if (formData.positionId !== (user?.positionId || "")) {
        updateData.positionId = formData.positionId || null;
      }
      if (formData.role !== user?.role) {
        updateData.role = formData.role;
      }
      if ((formData.status === "Active") !== user?.isActive) {
        updateData.isActive = formData.status === "Active";
      }

      // If no profile changes, skip profile update
      if (Object.keys(updateData).length > 0) {
        const response = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }

        toast.success('Profile updated successfully');
        refetch();
      } else {
        toast.info('No changes to save');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSavePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await fetch('/api/auth/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle validation errors with field-level details
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors: {
            currentPassword?: string;
            newPassword?: string;
            confirmPassword?: string;
          } = {};

          errorData.details.forEach((detail: { field: string; message: string }) => {
            if (detail.field === 'currentPassword') {
              fieldErrors.currentPassword = detail.message;
            } else if (detail.field === 'newPassword') {
              fieldErrors.newPassword = detail.message;
            } else if (detail.field === 'confirmPassword') {
              fieldErrors.confirmPassword = detail.message;
            }
          });

          if (Object.keys(fieldErrors).length > 0) {
            setPasswordErrors(fieldErrors);
            // Show first error message in toast
            const firstError = errorData.details[0];
            toast.error(firstError.message);
            return;
          }
        }

        // Handle simple error messages (without details array)
        const errorMessage = errorData.error || 'Failed to change password';

        // Map known error messages to specific fields
        if (errorMessage.toLowerCase().includes('current password')) {
          setPasswordErrors({ currentPassword: errorMessage });
        }

        toast.error(errorMessage);
        return;
      }

      toast.success('Password changed successfully');

      // Clear password fields and errors
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setPasswordErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      const userDepartment = departments.find(d => d.id === user.departmentId);
      setFormData({
        userId: user.employeeId || user.id,
        fullName: user.name,
        email: user.email,
        divisionId: userDepartment?.divisionId || "",
        departmentId: user.departmentId || "",
        positionId: user.positionId || "",
        status: user.isActive ? "Active" : "Inactive",
        role: user.role,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  // Check if there are profile changes
  const hasProfileChanges = user && (
    formData.fullName !== user.name ||
    formData.departmentId !== (user.departmentId || "") ||
    formData.positionId !== (user.positionId || "") ||
    formData.role !== user.role ||
    (formData.status === "Active") !== user.isActive
  );

  // Check if password fields are filled
  const hasPasswordInput = formData.currentPassword || formData.newPassword || formData.confirmPassword;

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
            value={formData.divisionId}
            onValueChange={(value) => handleInputChange("divisionId", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Department</label>
          <Select
            value={formData.departmentId}
            onValueChange={(value) => handleInputChange("departmentId", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {filteredDepartments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Position */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-neutral-950">Position</label>
          <Select
            value={formData.positionId}
            onValueChange={(value) => handleInputChange("positionId", value)}
          >
            <SelectTrigger className="h-9 bg-[#f6faff] border-transparent rounded-lg">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {filteredPositions.map((position) => (
                <SelectItem key={position.id} value={position.id}>
                  {position.name}
                </SelectItem>
              ))}
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
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
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

      {/* Action Buttons for Profile */}
      {hasProfileChanges && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="h-9 px-6 border-[#f24822] text-[#f24822] hover:bg-[#f24822]/10 rounded-lg"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveProfile}
            disabled={isSavingProfile}
            className="h-9 px-6 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-lg"
          >
            {isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      )}

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
              onChange={(e) => {
                handleInputChange("currentPassword", e.target.value);
                if (passwordErrors.currentPassword) {
                  setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
                }
              }}
              className={`h-9 bg-[#f6faff] rounded-lg ${
                passwordErrors.currentPassword ? "border-red-500" : "border-transparent"
              }`}
              placeholder="Enter current password"
            />
            {passwordErrors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-950">New Password</label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) => {
                  handleInputChange("newPassword", e.target.value);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                  }
                }}
                className={`h-9 bg-[#f6faff] rounded-lg ${
                  passwordErrors.newPassword ? "border-red-500" : "border-transparent"
                }`}
                placeholder="Enter new password"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-neutral-950">Confirm New Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => {
                  handleInputChange("confirmPassword", e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                className={`h-9 bg-[#f6faff] rounded-lg ${
                  passwordErrors.confirmPassword ? "border-red-500" : "border-transparent"
                }`}
                placeholder="Confirm new password"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons for Password */}
        {hasPasswordInput && (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                }));
                setPasswordErrors({});
              }}
              className="h-9 px-6 border-[#f24822] text-[#f24822] hover:bg-[#f24822]/10 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavePassword}
              disabled={isSavingPassword}
              className="h-9 px-6 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-lg"
            >
              {isSavingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Signature Section */}
      <div className="pt-4 border-t border-gray-200 space-y-4">
        <h4 className="text-base font-normal text-[#101828]">Signature</h4>
        <div className="space-y-4">
          <label className="text-sm text-neutral-950">Your Signature</label>

          {/* Inline Signature Pad */}
          <SignaturePad
            value={signatureDataUrl}
            onChange={handleSignatureChange}
          />

          {/* Hidden file input for upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadClick}
              disabled={isSavingSignature}
              className="h-9 px-6 border-[#00b3d8] text-[#4db1d4] hover:bg-[#4db1d4]/10 rounded-lg flex items-center gap-2"
            >
              <Camera className="size-4" />
              <span>Upload</span>
            </Button>
            <Button
              type="button"
              onClick={handleSaveSignature}
              disabled={isSavingSignature || !signatureDataUrl}
              className="h-9 px-6 bg-[#4db1d4] hover:bg-[#3da0bf] text-white rounded-lg"
            >
              {isSavingSignature && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Signature
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
