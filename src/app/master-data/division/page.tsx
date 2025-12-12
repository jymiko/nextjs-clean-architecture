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

// Division Modals
import {
  AddDivisionModal,
  ViewDivisionModal,
  EditDivisionModal,
  DeleteConfirmModal,
  SuccessModal,
  ErrorModal,
} from "@/presentation/components/division";

// Division data type
interface Division {
  id: string;
  code: string;
  name: string;
  headOfDivision: string;
  departments: string;
  status: "Active" | "Inactive";
}

// Sample data
const initialDivisions: Division[] = [
  {
    id: "1",
    code: "OPS",
    name: "Operations",
    headOfDivision: "Khoirul Ma'arif",
    departments: "Production, QA, QC, Warehouse, Logistics, Maintenance",
    status: "Active",
  },
  {
    id: "2",
    code: "HR",
    name: "Human Resources",
    headOfDivision: "Sari Siwandari",
    departments: "Recruitment, Training, Payroll, Industrial Relations, GA",
    status: "Active",
  },
  {
    id: "3",
    code: "IT",
    name: "Information Technology",
    headOfDivision: "Trisna Piliandy",
    departments: "Digital Transformation, IT Infra, App Dev, Cybersecurity",
    status: "Active",
  },
  {
    id: "4",
    code: "SC",
    name: "Supply Chain",
    headOfDivision: "Kristo Suharto",
    departments: "Planning, Procurement, Distribution, Inventory Control",
    status: "Inactive",
  },
  {
    id: "5",
    code: "FIN",
    name: "Finance & Accounting",
    headOfDivision: "Hamdan Mursyid",
    departments: "Finance, Accounting, Cost Control",
    status: "Inactive",
  },
];

export default function DivisionPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [divisions, setDivisions] = useState<Division[]>(initialDivisions);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  const totalDivisions = divisions.length;
  const activeDivisions = divisions.filter((d) => d.status === "Active").length;
  const inactiveDivisions = divisions.filter((d) => d.status === "Inactive").length;

  const filteredDivisions = divisions.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredDivisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDivisions = filteredDivisions.slice(startIndex, endIndex);

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
  const handleAddDivision = (data: { code: string; name: string; headOfDivision: string; status: string }) => {
    const newDivision: Division = {
      id: String(divisions.length + 1),
      code: data.code,
      name: data.name,
      headOfDivision: data.headOfDivision,
      departments: "",
      status: data.status as "Active" | "Inactive",
    };
    setDivisions([...divisions, newDivision]);
    setIsAddModalOpen(false);
    setSuccessMessage({
      title: "Successfully Added!",
      message: "The Division data has been added to the system. The changes have been saved successfully.",
    });
    setIsSuccessModalOpen(true);
  };

  const handleViewDivision = (division: Division) => {
    setSelectedDivision(division);
    setIsViewModalOpen(true);
  };

  const handleEditDivision = (division: Division) => {
    setSelectedDivision(division);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (data: Division) => {
    setDivisions(divisions.map((d) => (d.id === data.id ? { ...d, ...data } : d)));
    setIsEditModalOpen(false);
    setSuccessMessage({
      title: "Successfully Updated!",
      message: "The Division data has been updated in the system. The changes have been saved successfully.",
    });
    setIsSuccessModalOpen(true);
  };

  const handleDeleteDivision = (division: Division) => {
    setSelectedDivision(division);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedDivision) {
      setDivisions(divisions.filter((d) => d.id !== selectedDivision.id));
      setIsDeleteModalOpen(false);
      setSuccessMessage({
        title: "Successfully Deleted!",
        message: "The Division data has been deleted from the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      setSelectedDivision(null);
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
              <h1 className="text-black text-lg lg:text-2xl font-bold">Master Data - Division</h1>
              <p className="hidden sm:block text-black text-xs lg:text-sm">Manage system user and their access permissions</p>
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
            {/* Total Division */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Total Division</p>
                  <p className="text-[#151d48] text-2xl font-semibold leading-8">{totalDivisions}</p>
                </div>
                <div className="size-[54px] bg-[#e9f5fe] rounded-full flex items-center justify-center">
                  <Building2 className="size-6 text-[#4db1d4]" />
                </div>
              </CardContent>
            </Card>

            {/* Active Division */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Active Division</p>
                  <p className="text-[#0e9211] text-2xl font-semibold leading-8">{activeDivisions}</p>
                </div>
                <div className="size-[50px] bg-[#dbffe0] rounded-full flex items-center justify-center">
                  <CheckCircle className="size-6 text-[#0e9211]" />
                </div>
              </CardContent>
            </Card>

            {/* Inactive Division */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Inactive Division</p>
                  <p className="text-[#c08f2c] text-2xl font-semibold leading-8">{inactiveDivisions}</p>
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
              <span className="font-semibold text-sm lg:text-base">Add New Division</span>
            </Button>
          </div>

          {/* Table */}
          <div className="border border-[#e1e2e3] rounded-b-lg overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-[#e9f5fe]">
                <TableRow className="hover:bg-[#e9f5fe]">
                  <TableHead className="w-[80px] text-[#384654] font-semibold text-xs lg:text-sm">Code</TableHead>
                  <TableHead className="w-[180px] text-[#384654] font-semibold text-xs lg:text-sm">Division Name</TableHead>
                  <TableHead className="w-[180px] text-[#384654] font-semibold text-xs lg:text-sm">Head of Division</TableHead>
                  <TableHead className="text-[#384654] font-semibold text-xs lg:text-sm">Division Departments</TableHead>
                  <TableHead className="w-[120px] text-[#384654] font-semibold text-xs lg:text-sm">Status</TableHead>
                  <TableHead className="w-[150px] text-[#384654] font-semibold text-xs lg:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDivisions.map((division) => (
                  <TableRow key={division.id} className="h-[68px]">
                    <TableCell className="text-[#4db1d4] font-semibold">{division.code}</TableCell>
                    <TableCell className="text-[#384654]">{division.name}</TableCell>
                    <TableCell className="text-[#384654]">{division.headOfDivision}</TableCell>
                    <TableCell className="text-[#384654]">{division.departments}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${
                          division.status === "Active"
                            ? "bg-[#dbffe0] text-[#0e9211] hover:bg-[#dbffe0]"
                            : "bg-[#fff4d4] text-[#c08f2c] hover:bg-[#fff4d4]"
                        }`}
                      >
                        {division.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 border-[#e1e2e3]"
                          onClick={() => handleViewDivision(division)}
                        >
                          <Eye className="size-4 text-[#384654]" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 border-[#e1e2e3]"
                          onClick={() => handleEditDivision(division)}
                        >
                          <Pencil className="size-4 text-[#4db1d4]" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 border-[#e1e2e3]"
                          onClick={() => handleDeleteDivision(division)}
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
            <div className="hidden lg:flex items-center justify-between px-6 py-4 border-t border-[#e1e2e3]">
              {/* Items per page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#384654]">Show</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[70px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-[#384654]">entries</span>
              </div>

              {/* Page info */}
              <div className="text-sm text-[#384654]">
                Showing {filteredDivisions.length === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, filteredDivisions.length)} of {filteredDivisions.length} entries
              </div>

              {/* Page navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className={`h-9 w-9 ${
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
                  className="h-9 w-9"
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
                Showing {filteredDivisions.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredDivisions.length)} of {filteredDivisions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDivisionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddDivision}
      />

      <ViewDivisionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        division={selectedDivision}
      />

      <EditDivisionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        division={selectedDivision}
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
