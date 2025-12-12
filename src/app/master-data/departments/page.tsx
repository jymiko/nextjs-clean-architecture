"use client";

import { useState } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { Search, Plus, Eye, Pencil, Trash2, Building2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Department Modals
import {
  AddDepartmentModal,
  ViewDepartmentModal,
  EditDepartmentModal,
  DeleteConfirmModal,
  SuccessModal,
  ErrorModal,
} from "@/presentation/components/department";

// Department data type
interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  divisionId: string;
  divisionName: string;
  status: "Active" | "Inactive";
}

// Division data type for dropdowns
interface Division {
  id: string;
  code: string;
  name: string;
}

// Sample divisions
const sampleDivisions: Division[] = [
  { id: "IT", code: "IT", name: "Information Technology" },
  { id: "OPS", code: "OPS", name: "Operations" },
  { id: "FSC", code: "FSC", name: "Food Safety & Compliance" },
  { id: "HR", code: "HR", name: "Human Resources" },
  { id: "FIN", code: "FIN", name: "Finance & Accounting" },
];

// Sample data matching Figma design
const initialDepartments: Department[] = [
  {
    id: "1",
    code: "DT",
    name: "Digital Transformation",
    headOfDepartment: "Khoirul Ma'arif",
    divisionId: "IT",
    divisionName: "Information Technology",
    status: "Active",
  },
  {
    id: "2",
    code: "QA",
    name: "Quality Assurance",
    headOfDepartment: "Sari Siwandari",
    divisionId: "OPS",
    divisionName: "Operations",
    status: "Active",
  },
  {
    id: "3",
    code: "FS",
    name: "Food Safety",
    headOfDepartment: "Trisna Piliandy",
    divisionId: "FSC",
    divisionName: "Food Safety & Compliance",
    status: "Active",
  },
  {
    id: "4",
    code: "EHS",
    name: "Environment, Health and Safety",
    headOfDepartment: "Kristo Suharto",
    divisionId: "FSC",
    divisionName: "Food Safety & Compliance",
    status: "Inactive",
  },
  {
    id: "5",
    code: "WH",
    name: "Warehouse",
    headOfDepartment: "Hamdan Mursyid",
    divisionId: "OPS",
    divisionName: "Operations",
    status: "Inactive",
  },
];

export default function DepartmentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.status === "Active").length;
  const inactiveDepartments = departments.filter((d) => d.status === "Inactive").length;

  const filteredDepartments = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.headOfDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.divisionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  // Modal handlers
  const handleAddDepartment = (data: { code: string; name: string; headOfDepartment: string; divisionId: string; status: string }) => {
    const division = sampleDivisions.find(d => d.id === data.divisionId);
    const newDepartment: Department = {
      id: String(departments.length + 1),
      code: data.code,
      name: data.name,
      headOfDepartment: data.headOfDepartment,
      divisionId: data.divisionId,
      divisionName: division ? division.name : "",
      status: data.status as "Active" | "Inactive",
    };
    setDepartments([...departments, newDepartment]);
    setIsAddModalOpen(false);
    setSuccessMessage({
      title: "Successfully Added!",
      message: "The department data has been added to the system. The changes have been saved successfully.",
    });
    setIsSuccessModalOpen(true);
  };

  const handleViewDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (data: Department) => {
    setDepartments(departments.map((d) => (d.id === data.id ? { ...d, ...data } : d)));
    setIsEditModalOpen(false);
    setSuccessMessage({
      title: "Successfully Updated!",
      message: "The department data has been updated in the system. The changes have been saved successfully.",
    });
    setIsSuccessModalOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDepartment) {
      setDepartments(departments.filter((d) => d.id !== selectedDepartment.id));
      setIsDeleteModalOpen(false);
      setSuccessMessage({
        title: "Successfully Deleted!",
        message: "The department data has been deleted from the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      setSelectedDepartment(null);
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-[40px] lg:h-[44px] bg-white border-[#e1e2e3]"
              />
            </div>
            <Button
              className="h-[40px] lg:h-[44px] bg-[#4db1d4] hover:bg-[#3a9fc2] shadow-[0px_6px_12px_0px_rgba(10,141,208,0.2)]"
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
                  <TableHead className="w-[80px] text-[#384654] font-semibold text-xs lg:text-sm">Code</TableHead>
                  <TableHead className="w-[200px] text-[#384654] font-semibold text-xs lg:text-sm">Department Name</TableHead>
                  <TableHead className="w-[180px] text-[#384654] font-semibold text-xs lg:text-sm">Head of Department</TableHead>
                  <TableHead className="w-[200px] text-[#384654] font-semibold text-xs lg:text-sm">Division</TableHead>
                  <TableHead className="w-[120px] text-[#384654] font-semibold text-xs lg:text-sm">Status</TableHead>
                  <TableHead className="w-[150px] text-[#384654] font-semibold text-xs lg:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDepartments.map((department) => (
                  <TableRow key={department.id} className="h-[68px]">
                    <TableCell className="text-[#4db1d4] font-semibold">{department.code}</TableCell>
                    <TableCell className="text-[#384654]">{department.name}</TableCell>
                    <TableCell className="text-[#384654]">{department.headOfDepartment}</TableCell>
                    <TableCell className="text-[#384654]">{department.divisionName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${
                          department.status === "Active"
                            ? "bg-[#dbffe0] text-[#0e9211] hover:bg-[#dbffe0]"
                            : "bg-[#fff4d4] text-[#c08f2c] hover:bg-[#fff4d4]"
                        }`}
                      >
                        {department.status}
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
                Showing {filteredDepartments.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredDepartments.length)} of {filteredDepartments.length} entries
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
                Showing {filteredDepartments.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredDepartments.length)} of {filteredDepartments.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDepartmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddDepartment}
        divisions={sampleDivisions}
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
        divisions={sampleDivisions}
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
      />
    </div>
  );
}
