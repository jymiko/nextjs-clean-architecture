"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { Plus, Search, Eye, Pencil, Trash2, Users, UserCheck, UserX, ChevronLeft, ChevronRight, User, Bell } from "lucide-react";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AddUserModal,
  ViewUserModal,
  EditUserModal,
  DeleteConfirmModal,
  SuccessModal,
  ErrorModal,
} from "@/presentation/components/user";
import { UserFormData } from "@/presentation/components/user/AddUserModal";
import apiClient from "@/lib/api-client";

interface User {
  id: string;          // Database ID (cuid) for API calls
  displayId: string;   // Employee ID for display
  name: string;
  email: string;
  departmentId: string;
  departmentName?: string;
  positionId: string;
  positionName?: string;
  roleId: string;
  roleName?: string;
  status: string;
  lastLogin?: string;
}

export default function UsersPage() {
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const data = await apiClient.get(`/api/users?${params}`);

      // Transform API response to frontend format
      const transformedUsers = (data.data || []).map((user: {
        id: string;
        employeeId?: string;
        name: string;
        email: string;
        role?: string;
        departmentId?: string;
        department?: { id: string; name: string };
        positionId?: string;
        position?: { id: string; name: string };
        isActive: boolean;
        lastLogin?: string;
      }) => ({
        id: user.id,                              // Keep database ID for API calls
        displayId: user.employeeId || user.id,    // Employee ID for display
        name: user.name,
        email: user.email,
        departmentId: user.departmentId || "",
        departmentName: user.department?.name || "-",
        positionId: user.positionId || "",
        positionName: user.position?.name || "-",
        roleId: user.role === "ADMIN" ? "1" : "2",
        roleName: user.role || "-",
        status: user.isActive ? "active" : "inactive",
        lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "-",
      }));

      setUsers(transformedUsers);
      setTotalCount(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const totalUsers = totalCount;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const inactiveUsers = users.filter((u) => u.status === "inactive").length;
  
  // Pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Handlers
  const handleAdd = async (data: UserFormData) => {
    try {
      // Transform frontend data to API format
      const apiData = {
        employeeId: data.displayId || undefined, // displayId is the Employee ID
        name: data.name,
        email: data.email,
        departmentId: data.departmentId || undefined,
        positionId: data.positionId || undefined,
        role: data.roleId === "1" ? "ADMIN" : data.roleId === "2" ? "USER" : undefined,
        isActive: data.status === "active",
      };

      await apiClient.post("/api/users", apiData);

      setSuccessMessage({
        title: "Successfully Added!",
        message: "The user data has been added to the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      setIsErrorModalOpen(true);
    }
  };

  const handleEdit = async (data: UserFormData) => {
    try {
      // Transform frontend data to API format
      const apiData = {
        name: data.name,
        email: data.email,
        departmentId: data.departmentId || null,
        positionId: data.positionId || null,
        role: data.roleId === "1" ? "ADMIN" : data.roleId === "2" ? "USER" : undefined,
        isActive: data.status === "active",
      };

      await apiClient.put(`/api/users/${data.id}`, apiData);

      setSuccessMessage({
        title: "Successfully Updated!",
        message: "The user data has been updated. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setIsErrorModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await apiClient.delete(`/api/users/${selectedUser.id}`);

      setIsDeleteModalOpen(false);
      setSuccessMessage({
        title: "Successfully Deleted!",
        message: "The user data has been deleted from the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f9fbff] relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="lg:ml-[280px] flex flex-col gap-[6px]">
        {/* Header */}
        <header className="bg-white min-h-[80px] lg:h-[111px] flex items-center justify-between px-4 lg:px-6 py-4 lg:py-8">
          <div className="flex items-center gap-3 lg:gap-0 lg:flex-col lg:items-start">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-col gap-1 lg:gap-2">
              <h1 className="text-black text-lg lg:text-2xl font-bold">Master Data - Users</h1>
              <p className="hidden sm:block text-black text-xs lg:text-sm">Manage user accounts and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="size-5 lg:size-6 text-[#DA318C]" />
              <span className="absolute top-1 right-1 size-2 bg-[#DA318C] rounded-full" />
            </button>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative size-8 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {currentUser?.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt="User avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="size-5 text-gray-400" />
                )}
              </div>
              <span className="hidden sm:block text-black text-sm lg:text-base font-semibold">
                {isUserLoading ? '...' : currentUser?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="bg-white px-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Users */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Total Users</p>
                  <p className="text-[#151d48] text-2xl font-semibold leading-8">{totalUsers}</p>
                </div>
                <div className="size-[54px] bg-[#e9f5fe] rounded-full flex items-center justify-center">
                  <Users className="size-6 text-[#4db1d4]" />
                </div>
              </CardContent>
            </Card>

            {/* Active Users */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Active Users</p>
                  <p className="text-[#0e9211] text-2xl font-semibold leading-8">{activeUsers}</p>
                </div>
                <div className="size-[50px] bg-[#dbffe0] rounded-full flex items-center justify-center">
                  <UserCheck className="size-6 text-[#0e9211]" />
                </div>
              </CardContent>
            </Card>

            {/* Inactive Users */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Inactive Users</p>
                  <p className="text-[#c08f2c] text-2xl font-semibold leading-8">{inactiveUsers}</p>
                </div>
                <div className="size-[50px] bg-[#fff4d4] rounded-full flex items-center justify-center">
                  <UserX className="size-6 text-[#c08f2c]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white px-4 py-2 flex-1">
          {/* Search and Add Button */}
          <div className="bg-[#e9f5fe] px-4 py-3 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 rounded-t-lg">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#e1e2e3]" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-[40px] lg:h-[44px] bg-white border-[#e1e2e3]"
              />
            </div>
            <Button
              className="h-[40px] lg:h-[44px] bg-[#4db1d4] hover:bg-[#3a9fc2] shadow-[0px_6px_12px_0px_rgba(10,141,208,0.2)]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="size-[18px] mr-2" />
              <span className="font-semibold text-sm lg:text-base">Add New User</span>
            </Button>
          </div>

          {/* Table */}
          <div className="border border-[#e1e2e3] rounded-b-lg overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader className="bg-[#e9f5fe]">
                <TableRow className="hover:bg-[#e9f5fe]">
                  <TableHead className="w-[100px] text-[#384654] font-semibold text-xs lg:text-sm">User ID</TableHead>
                  <TableHead className="w-[150px] text-[#384654] font-semibold text-xs lg:text-sm">Full Name</TableHead>
                  <TableHead className="w-[200px] text-[#384654] font-semibold text-xs lg:text-sm">Email</TableHead>
                  <TableHead className="w-[100px] text-[#384654] font-semibold text-xs lg:text-sm">Role</TableHead>
                  <TableHead className="w-[150px] text-[#384654] font-semibold text-xs lg:text-sm">Department</TableHead>
                  <TableHead className="w-[100px] text-[#384654] font-semibold text-xs lg:text-sm">Status</TableHead>
                  <TableHead className="w-[150px] text-[#384654] font-semibold text-xs lg:text-sm">Last Login</TableHead>
                  <TableHead className="w-[150px] text-[#384654] font-semibold text-xs lg:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4db1d4]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-[#384654]">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="h-[68px]">
                      <TableCell className="text-[#4db1d4] font-semibold">{user.displayId}</TableCell>
                      <TableCell className="text-[#384654]">{user.name}</TableCell>
                      <TableCell className="text-[#384654]">{user.email}</TableCell>
                      <TableCell className="text-[#384654]">{user.roleName || "-"}</TableCell>
                      <TableCell className="text-[#384654]">{user.departmentName || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            user.status === "active"
                              ? "bg-[#dbffe0] text-[#0e9211] hover:bg-[#dbffe0]"
                              : "bg-[#fff4d4] text-[#c08f2c] hover:bg-[#fff4d4]"
                          }`}
                        >
                          {user.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#384654]">{user.lastLogin || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleView(user)}
                          >
                            <Eye className="size-4 text-[#384654]" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleEditClick(user)}
                          >
                            <Pencil className="size-4 text-[#4db1d4]" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="size-4 text-[#f24822]" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination - Desktop */}
            <div className="hidden lg:flex items-center justify-between px-4 lg:px-6 py-4 border-t border-[#e1e2e3]">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-xs lg:text-sm text-[#384654]">Show</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[60px] lg:w-[70px] h-8 lg:h-9 text-xs lg:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs lg:text-sm text-[#384654]">entries</span>
              </div>

              {/* Page info */}
              <div className="text-xs lg:text-sm text-[#384654]">
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 lg:h-9 lg:w-9"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 lg:h-9 lg:w-9 text-xs lg:text-sm ${
                      currentPage === page
                        ? "bg-[#4db1d4] hover:bg-[#3a9fc2]"
                        : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 lg:h-9 lg:w-9"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Pagination - Mobile */}
            <div className="flex lg:hidden flex-col items-center gap-2 px-4 py-4 border-t border-[#e1e2e3]">
              <div className="flex items-center justify-between w-full">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-9 px-4 text-xs"
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Prev
                </Button>

                <span className="text-sm font-medium text-[#384654]">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-9 px-4 text-xs"
                >
                  Next
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
              <span className="text-xs text-[#6b7280]">
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAdd}
      />

      <ViewUserModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        user={selectedUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        user={
          selectedUser
            ? {
                id: selectedUser.id,              // Database ID for API
                displayId: selectedUser.displayId, // Employee ID for display
                name: selectedUser.name,
                email: selectedUser.email,
                departmentId: selectedUser.departmentId,
                positionId: selectedUser.positionId,
                roleId: selectedUser.roleId,
                status: selectedUser.status,
              }
            : null
        }
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      />
    </div>
  );
}
