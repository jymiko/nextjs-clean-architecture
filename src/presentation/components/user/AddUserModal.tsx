"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import apiClient from "@/lib/api-client";
import { Department, DepartmentListResponse } from "@/domain/entities/Department";
import { Division, DivisionListResponse } from "@/domain/entities/Division";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
}

export type CreationMethod = 'generate_password' | 'invitation_link';

export interface UserFormData {
  id: string;           // Database ID (cuid) for API calls
  displayId: string;    // Employee ID for display
  name: string;
  email: string;
  positionId: string;
  divisionId: string;
  departmentId: string;
  roleId: string;
  status: string;
  creationMethod?: CreationMethod;  // Only used for new user creation
}

const roles = [
  { id: "1", name: "Admin" },
  { id: "2", name: "User" },
];

interface FormErrors {
  displayId?: string;
  name?: string;
  email?: string;
  departmentId?: string;
  positionId?: string;
  roleId?: string;
  status?: string;
}

export function AddUserModal({ isOpen, onClose, onSubmit }: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    id: "",
    displayId: "",
    name: "",
    email: "",
    positionId: "",
    divisionId: "",
    departmentId: "",
    roleId: "",
    status: "",
    creationMethod: "generate_password",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [positions, setPositions] = useState<Division[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingDivisions, setIsLoadingDivisions] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPositions();
      fetchDivisions();
      fetchDepartments();
    }
  }, [isOpen]);

  const fetchDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const response = await apiClient.get<DepartmentListResponse>('/api/departments?limit=100&isActive=true');
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const fetchPositions = async () => {
    setIsLoadingPositions(true);
    try {
      const response = await apiClient.get<DivisionListResponse>('/api/positions?limit=100&isActive=true');
      setPositions(response.data);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    } finally {
      setIsLoadingPositions(false);
    }
  };

  const fetchDivisions = async () => {
    setIsLoadingDivisions(true);
    try {
      const response = await apiClient.get<DivisionListResponse>('/api/divisions?limit=100&isActive=true');
      setDivisions(response.data);
    } catch (error) {
      console.error('Failed to fetch divisions:', error);
    } finally {
      setIsLoadingDivisions(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.roleId) {
      newErrors.roleId = "Role is required";
    }

    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      id: "",
      displayId: "",
      name: "",
      email: "",
      positionId: "",
      divisionId: "",
      departmentId: "",
      roleId: "",
      status: "",
      creationMethod: "generate_password",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[579px] p-0 gap-0 rounded-lg shadow-[0px_14px_32px_-2px_rgba(16,24,40,0.06),0px_2px_4px_0px_rgba(16,24,40,0.02)]">
        <DialogHeader className="px-6 py-3 border-b border-[#f5f5f5]">
          <DialogTitle className="text-base font-medium text-black">
            Add New User
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* User ID (Employee ID) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              User ID
            </label>
            <Input
              placeholder="Input user ID"
              value={formData.displayId}
              onChange={(e) => setFormData({ ...formData, displayId: e.target.value })}
              className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 focus-visible:border-[#4db1d4]"
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Input full name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              className={`h-10 bg-[#f6faff] border-0 border-b rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 ${errors.name ? "border-red-500" : "border-[#4db1d4]"
                }`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Input email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={`h-10 bg-[#f6faff] border-0 border-b rounded-none text-sm placeholder:text-[#8a8f9d] focus-visible:ring-0 ${errors.email ? "border-red-500" : "border-[#4db1d4]"
                }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Position
            </label>
            <Select
              value={formData.positionId}
              onValueChange={(value) => setFormData({ ...formData, positionId: value })}
              disabled={isLoadingPositions}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0">
                <SelectValue placeholder={isLoadingPositions ? "Loading..." : "Select position"} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Division */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Division
            </label>
            <Select
              value={formData.divisionId}
              onValueChange={(value) => setFormData({ ...formData, divisionId: value })}
              disabled={isLoadingDivisions}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0">
                <SelectValue placeholder={isLoadingDivisions ? "Loading..." : "Select division"} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {divisions.map((div) => (
                  <SelectItem key={div.id} value={div.id}>
                    {div.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Department
            </label>
            <Select
              value={formData.departmentId}
              onValueChange={(value) => setFormData({ ...formData, departmentId: value })}
              disabled={isLoadingDepartments}
            >
              <SelectTrigger className="h-10 bg-[#f6faff] border-0 border-b border-[#4db1d4] rounded-none text-sm focus:ring-0">
                <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select department"} />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Role <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => {
                setFormData({ ...formData, roleId: value });
                if (errors.roleId) setErrors({ ...errors, roleId: undefined });
              }}
            >
              <SelectTrigger className={`h-10 bg-[#f6faff] border-0 border-b rounded-none text-sm focus:ring-0 ${errors.roleId ? "border-red-500" : "border-[#4db1d4]"
                }`}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && (
              <p className="text-xs text-red-500 mt-1">{errors.roleId}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1a1a1a]">
              Status <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => {
                setFormData({ ...formData, status: value });
                if (errors.status) setErrors({ ...errors, status: undefined });
              }}
            >
              <SelectTrigger className={`h-10 bg-[#f6faff] border-0 border-b rounded-none text-sm focus:ring-0 ${errors.status ? "border-red-500" : "border-[#4db1d4]"
                }`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-red-500 mt-1">{errors.status}</p>
            )}
          </div>

          {/* Access Method */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#1a1a1a]">
              How should the user get access? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-[#f6faff] rounded-lg cursor-pointer border border-transparent hover:border-[#4db1d4] transition-colors">
                <input
                  type="radio"
                  name="creationMethod"
                  value="generate_password"
                  checked={formData.creationMethod === "generate_password"}
                  onChange={(e) => setFormData({ ...formData, creationMethod: e.target.value as CreationMethod })}
                  className="w-4 h-4 text-[#4db1d4] focus:ring-[#4db1d4]"
                />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Generate Password</p>
                  <p className="text-xs text-[#8a8f9d]">System will generate a temporary password that you can share with the user</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-[#f6faff] rounded-lg cursor-pointer border border-transparent hover:border-[#4db1d4] transition-colors">
                <input
                  type="radio"
                  name="creationMethod"
                  value="invitation_link"
                  checked={formData.creationMethod === "invitation_link"}
                  onChange={(e) => setFormData({ ...formData, creationMethod: e.target.value as CreationMethod })}
                  className="w-4 h-4 text-[#4db1d4] focus:ring-[#4db1d4]"
                />
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">Send Invitation Link</p>
                  <p className="text-xs text-[#8a8f9d]">User will receive a link to set their own password (valid for 7 days)</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-[#fcfcfc] border-t border-[#f5f5f5] gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-[164px] h-11 border-[#4db1d4] text-[#4db1d4] hover:bg-[#4db1d4]/10"
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-[164px] h-11 bg-[#4db1d4] hover:bg-[#3da0c2] text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
