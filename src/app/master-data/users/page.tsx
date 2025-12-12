"use client";

import { useState } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { Plus, Search, Eye, Pencil, Trash2, Users, UserCheck, UserX, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
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

// Sample data
const sampleUsers = [
  {
    id: "USR001",
    name: "John Doe",
    email: "john.doe@example.com",
    departmentId: "1",
    departmentName: "Engineering",
    positionId: "1",
    positionName: "Manager",
    roleId: "1",
    roleName: "Admin",
    status: "active",
    lastLogin: "2024-01-15 09:30",
  },
  {
    id: "USR002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    departmentId: "2",
    departmentName: "Human Resources",
    positionId: "2",
    positionName: "Supervisor",
    roleId: "2",
    roleName: "User",
    status: "active",
    lastLogin: "2024-01-14 14:22",
  },
  {
    id: "USR003",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    departmentId: "3",
    departmentName: "Finance",
    positionId: "3",
    positionName: "Staff",
    roleId: "2",
    roleName: "User",
    status: "inactive",
    lastLogin: "2024-01-10 11:45",
  },
  {
    id: "USR004",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    departmentId: "4",
    departmentName: "Marketing",
    positionId: "3",
    positionName: "Staff",
    roleId: "2",
    roleName: "User",
    status: "active",
    lastLogin: "2024-01-15 08:15",
  },
  {
    id: "USR005",
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    departmentId: "1",
    departmentName: "Engineering",
    positionId: "3",
    positionName: "Staff",
    roleId: "2",
    roleName: "User",
    status: "active",
    lastLogin: "2024-01-15 10:00",
  },
];

export default function UsersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState(sampleUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof sampleUsers[0] | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const inactiveUsers = users.filter((u) => u.status === "inactive").length;

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
  const handleAdd = (data: UserFormData) => {
    const newUser = {
      ...data,
      departmentName: getDepartmentName(data.departmentId),
      positionName: getPositionName(data.positionId),
      roleName: getRoleName(data.roleId),
      lastLogin: "-",
    };
    setUsers([...users, newUser]);
    setSuccessMessage({
      title: "Successfully Added!",
      message: "The user data has been added to the system. The changes have been saved successfully.",
    });
    setIsSuccessModalOpen(true);
  };

  const handleEdit = (data: UserFormData) => {
    setUsers(
      users.map((u) =>
        u.id === data.id
          ? {
              ...u,
              ...data,
              departmentName: getDepartmentName(data.departmentId),
              positionName: getPositionName(data.positionId),
              roleName: getRoleName(data.roleId),
            }
          : u
      )
    );
    setSuccessMessage({
      title: "Successfully Updated!",
      message: "The user data has been updated. The changes have been saved successfully.",
    });
    setIsSuccessModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
      setSuccessMessage({
        title: "Successfully Deleted!",
        message: "The user data has been deleted from the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
    }
  };

  const handleView = (user: typeof sampleUsers[0]) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (user: typeof sampleUsers[0]) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (user: typeof sampleUsers[0]) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Helper functions
  const getDepartmentName = (id: string) => {
    const departments: Record<string, string> = {
      "1": "Engineering",
      "2": "Human Resources",
      "3": "Finance",
      "4": "Marketing",
    };
    return departments[id] || "";
  };

  const getPositionName = (id: string) => {
    const positions: Record<string, string> = {
      "1": "Manager",
      "2": "Supervisor",
      "3": "Staff",
      "4": "Intern",
    };
    return positions[id] || "";
  };

  const getRoleName = (id: string) => {
    const roles: Record<string, string> = {
      "1": "Admin",
      "2": "User",
    };
    return roles[id] || "";
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
            <div className="size-8 lg:size-[34px] relative">
              <Image
                src="/assets/04a50ad105e936b2494be230cd07cdd14d10d4e1.png"
                alt="Notification"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <Image
                src="/assets/b67e969598fad8dfebcaaec93a901ad71da4fab6.png"
                alt="User avatar"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <span className="hidden sm:block text-black text-sm lg:text-base font-semibold">Annesa Ayu</span>
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
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className="h-[68px]">
                    <TableCell className="text-[#4db1d4] font-semibold">{user.id}</TableCell>
                    <TableCell className="text-[#384654]">{user.name}</TableCell>
                    <TableCell className="text-[#384654]">{user.email}</TableCell>
                    <TableCell className="text-[#384654]">{user.roleName}</TableCell>
                    <TableCell className="text-[#384654]">{user.departmentName}</TableCell>
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
                    <TableCell className="text-[#384654]">{user.lastLogin}</TableCell>
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
                ))}
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
                Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} entries
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
                Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
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
                id: selectedUser.id,
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
