"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { Search, Plus, Eye, Pencil, Trash2, Building2, CheckCircle, XCircle, ChevronLeft, ChevronRight, User, Bell } from "lucide-react";
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
  headOfDivisionId?: string;
  headOfDivision?: {
    id: string;
    name: string;
  };
  departments?: Array<{
    id: string;
    name: string;
  }>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function DivisionPage() {
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  // Fetch divisions
  useEffect(() => {
    fetchDivisions();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchDivisions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/divisions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch divisions");

      const data = await response.json();
      setDivisions(data.data || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (error) {
      console.error("Error fetching divisions:", error);
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const totalDivisions = totalCount;
  const activeDivisions = divisions.filter((d) => d.isActive).length;
  const inactiveDivisions = divisions.filter((d) => !d.isActive).length;

  // Pagination calculations
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

  // Modal handlers
  const handleAddDivision = async (data: { code: string; name: string; headOfDivisionId?: string; isActive: boolean }) => {
    try {
      const response = await fetch("/api/divisions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add division");

      setIsAddModalOpen(false);
      setSuccessMessage({
        title: "Successfully Added!",
        message: "The Division data has been added to the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchDivisions();
    } catch (error) {
      console.error("Error adding division:", error);
      setIsAddModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const handleViewDivision = (division: Division) => {
    setSelectedDivision(division);
    setIsViewModalOpen(true);
  };

  const handleEditDivision = (division: Division) => {
    setSelectedDivision(division);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (data: Division) => {
    try {
      const response = await fetch(`/api/divisions/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update division");

      setIsEditModalOpen(false);
      setSuccessMessage({
        title: "Successfully Updated!",
        message: "The Division data has been updated in the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchDivisions();
    } catch (error) {
      console.error("Error updating division:", error);
      setIsEditModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const handleDeleteDivision = (division: Division) => {
    setSelectedDivision(division);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDivision) return;

    try {
      const response = await fetch(`/api/divisions/${selectedDivision.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete division");

      setIsDeleteModalOpen(false);
      setSuccessMessage({
        title: "Successfully Deleted!",
        message: "The Division data has been deleted from the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      setSelectedDivision(null);
      fetchDivisions();
    } catch (error) {
      console.error("Error deleting division:", error);
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(true);
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4db1d4]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : divisions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-[#384654]">
                      No divisions found
                    </TableCell>
                  </TableRow>
                ) : (
                  divisions.map((division) => (
                    <TableRow key={division.id} className="h-[68px]">
                      <TableCell className="text-[#4db1d4] font-semibold">{division.code}</TableCell>
                      <TableCell className="text-[#384654]">{division.name}</TableCell>
                      <TableCell className="text-[#384654]">
                        {division.headOfDivision?.name || "-"}
                      </TableCell>
                      <TableCell className="text-[#384654]">
                        {division.departments?.map(d => d.name).join(", ") || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            division.isActive
                              ? "bg-[#dbffe0] text-[#0e9211] hover:bg-[#dbffe0]"
                              : "bg-[#fff4d4] text-[#c08f2c] hover:bg-[#fff4d4]"
                          }`}
                        >
                          {division.isActive ? "Active" : "Inactive"}
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
                  ))
                )}
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
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} entries
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
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount}
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
