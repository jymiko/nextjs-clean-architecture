"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { Search, Plus, Eye, Pencil, Trash2, Building2, CheckCircle, XCircle, User, Bell } from "lucide-react";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/use-current-user";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";

// Department Modals
import {
  AddDepartmentModal,
  ViewDepartmentModal,
  EditDepartmentModal,
  DeleteConfirmModal,
  SuccessModal,
  ErrorModal,
} from "@/presentation/components/department";

// Department data type from API
interface Department {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  headOfDepartmentId?: string | null;
  headOfDepartment?: {
    id: string;
    name: string;
    email: string;
  } | null;
  isActive: boolean;
  totalEmployees?: number;
  createdAt: string;
  updatedAt: string;
}

export default function DepartmentPage() {
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });
  const [errorMessage, setErrorMessage] = useState({ title: "", message: "" });

  const activeDepartments = departments.filter((d) => d.isActive).length;
  const inactiveDepartments = departments.filter((d) => !d.isActive).length;

  // Fetch departments from API
  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/departments?${params}`);
      if (!response.ok) throw new Error('Failed to fetch departments');

      const data = await response.json();
      setDepartments(data.data);
      setTotalDepartments(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setErrorMessage({
        title: "Error",
        message: "Failed to fetch departments. Please try again.",
      });
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments on mount and when dependencies change
  useEffect(() => {
    fetchDepartments();
  }, [currentPage, itemsPerPage, searchQuery]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Search with debounce
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Modal handlers
  const handleAddDepartment = async (data: { 
    code: string; 
    name: string; 
    description?: string;
    headOfDepartmentId?: string; 
    isActive: boolean;
  }) => {
    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create department');
      }

      setIsAddModalOpen(false);
      setSuccessMessage({
        title: "Successfully Added!",
        message: "The department data has been added to the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchDepartments(); // Refresh data
    } catch (error: unknown) {
      console.error('Error creating department:', error);
      setIsAddModalOpen(false);
      setErrorMessage({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to create department. Please try again.",
      });
      setIsErrorModalOpen(true);
    }
  };

  const handleViewDepartment = async (department: Department) => {
    try {
      const response = await fetch(`/api/departments/${department.id}`);
      if (!response.ok) throw new Error('Failed to fetch department details');
      
      const data = await response.json();
      setSelectedDepartment(data);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching department:', error);
      setErrorMessage({
        title: "Error",
        message: "Failed to fetch department details. Please try again.",
      });
      setIsErrorModalOpen(true);
    }
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (data: {
    code: string;
    name: string;
    description?: string | null;
    headOfDepartmentId?: string | null;
    isActive: boolean;
  }) => {
    if (!selectedDepartment) return;

    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update department');
      }

      setIsEditModalOpen(false);
      setSuccessMessage({
        title: "Successfully Updated!",
        message: "The department data has been updated in the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchDepartments(); // Refresh data
    } catch (error: unknown) {
      console.error('Error updating department:', error);
      setIsEditModalOpen(false);
      setErrorMessage({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to update department. Please try again.",
      });
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDepartment) return;

    try {
      const response = await fetch(`/api/departments/${selectedDepartment.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete department');
      }

      setIsDeleteModalOpen(false);
      setSuccessMessage({
        title: "Successfully Deleted!",
        message: "The department data has been deleted from the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      setSelectedDepartment(null);
      fetchDepartments(); // Refresh data
    } catch (error: unknown) {
      console.error('Error deleting department:', error);
      setIsDeleteModalOpen(false);
      setErrorMessage({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to delete department. Please try again.",
      });
      setIsErrorModalOpen(true);
    }
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
              <h1 className="text-black text-lg lg:text-2xl font-bold">Master Data - Departments</h1>
              <p className="hidden sm:block text-black text-xs lg:text-sm">Manage and organize department data across your organization</p>
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
            {/* Total Departments */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Total Departments</p>
                  <p className="text-[#151d48] text-2xl font-semibold leading-8">{totalDepartments}</p>
                </div>
                <div className="size-[54px] bg-[#e9f5fe] rounded-full flex items-center justify-center">
                  <Building2 className="size-6 text-[#4db1d4]" />
                </div>
              </CardContent>
            </Card>

            {/* Active Departments */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Active Departments</p>
                  <p className="text-[#0e9211] text-2xl font-semibold leading-8">{activeDepartments}</p>
                </div>
                <div className="size-[50px] bg-[#dbffe0] rounded-full flex items-center justify-center">
                  <CheckCircle className="size-6 text-[#0e9211]" />
                </div>
              </CardContent>
            </Card>

            {/* Inactive Departments */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Inactive Departments</p>
                  <p className="text-[#c08f2c] text-2xl font-semibold leading-8">{inactiveDepartments}</p>
                </div>
                <div className="size-[50px] bg-[#fff4d4] rounded-full flex items-center justify-center">
                  <XCircle className="size-6 text-[#c08f2c]" />
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
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 h-10 lg:h-11 bg-white border-[#e1e2e3]"
              />
            </div>
            <Button
              className="h-10 lg:h-11 bg-[#4db1d4] hover:bg-[#3a9fc2] shadow-[0px_6px_12px_0px_rgba(10,141,208,0.2)]"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="size-[18px] mr-2" />
              <span className="font-semibold text-sm lg:text-base">Add New Department</span>
            </Button>
          </div>

          {/* Table */}
          <div className="border border-[#e1e2e3] rounded-b-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-[#e9f5fe]">
                <TableRow className="hover:bg-[#e9f5fe]">
                  <TableHead className="w-20 text-[#384654] font-semibold text-xs lg:text-sm">Code</TableHead>
                  <TableHead className="w-[200px] text-[#384654] font-semibold text-xs lg:text-sm">Department Name</TableHead>
                  <TableHead className="w-[180px] text-[#384654] font-semibold text-xs lg:text-sm">Head of Department</TableHead>
                  <TableHead className="w-[120px] text-[#384654] font-semibold text-xs lg:text-sm">Employees</TableHead>
                  <TableHead className="w-[120px] text-[#384654] font-semibold text-xs lg:text-sm">Status</TableHead>
                  <TableHead className="w-[150px] text-[#384654] font-semibold text-xs lg:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4db1d4]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : departments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#6b7280]">
                      No departments found
                    </TableCell>
                  </TableRow>
                ) : (
                  departments.map((department) => (
                    <TableRow key={department.id} className="h-[68px]">
                      <TableCell className="text-[#4db1d4] font-semibold">{department.code}</TableCell>
                      <TableCell className="text-[#384654]">{department.name}</TableCell>
                      <TableCell className="text-[#384654]">
                        {department.headOfDepartment?.name || '-'}
                      </TableCell>
                      <TableCell className="text-[#384654]">
                        {department.totalEmployees || 0}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            department.isActive
                              ? "bg-[#dbffe0] text-[#0e9211] hover:bg-[#dbffe0]"
                              : "bg-[#fff4d4] text-[#c08f2c] hover:bg-[#fff4d4]"
                          }`}
                        >
                          {department.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleViewDepartment(department)}
                          >
                            <Eye className="size-4 text-[#384654]" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleEditDepartment(department)}
                          >
                            <Pencil className="size-4 text-[#4db1d4]" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleDeleteDepartment(department)}
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalDepartments}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              showItemsPerPage={true}
              showPageInfo={true}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddDepartment}
      />

      <ViewDepartmentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        department={selectedDepartment}
      />

      <EditDepartmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        department={selectedDepartment}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
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
        title={errorMessage.title}
        message={errorMessage.message}
      />
    </div>
  );
}
