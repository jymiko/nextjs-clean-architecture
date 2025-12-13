"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/presentation/components/Sidebar";
import { Search, Plus, Eye, Pencil, Trash2, Briefcase, CheckCircle, XCircle, User, Bell } from "lucide-react";
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

// Position Modals
import {
  AddPositionModal,
  ViewPositionModal,
  EditPositionModal,
  DeleteConfirmModal,
  SuccessModal,
  ErrorModal,
} from "@/presentation/components/position";

// Position data type
interface Position {
  id: string;
  code: string;
  name: string;
  departmentId?: string | null;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
  isActive: boolean;
  totalEmployees?: number;
  createdAt?: string;
  updatedAt?: string;
}

export default function PositionPage() {
  const { user: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [successMessage, setSuccessMessage] = useState({ title: "", message: "" });

  // Fetch positions
  useEffect(() => {
    fetchPositions();
  }, [currentPage, itemsPerPage, searchQuery]);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/positions?${params}`);
      if (!response.ok) throw new Error("Failed to fetch positions");

      const data = await response.json();
      console.log('API Response:', data);
      console.log('Total from API:', data.total);
      setPositions(data.data || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setIsErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const totalPositions = totalCount;
  const activePositions = positions.filter((p) => p.isActive).length;
  const inactivePositions = positions.filter((p) => !p.isActive).length;

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Modal handlers
  const handleAddPosition = async (data: { code: string; name: string; departmentId?: string; isActive: boolean }) => {
    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add position");

      setIsAddModalOpen(false);
      setSuccessMessage({
        title: "Successfully Added!",
        message: "The Position data has been added to the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchPositions();
    } catch (error) {
      console.error("Error adding position:", error);
      setIsAddModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const handleViewPosition = (position: Position) => {
    setSelectedPosition(position);
    setIsViewModalOpen(true);
  };

  const handleEditPosition = (position: Position) => {
    setSelectedPosition(position);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (data: Position) => {
    try {
      const response = await fetch(`/api/positions/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: data.code,
          name: data.name,
          departmentId: data.departmentId || null,
          isActive: data.isActive,
        }),
      });

      if (!response.ok) throw new Error("Failed to update position");

      setIsEditModalOpen(false);
      setSuccessMessage({
        title: "Successfully Updated!",
        message: "The Position data has been updated in the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      fetchPositions();
    } catch (error) {
      console.error("Error updating position:", error);
      setIsEditModalOpen(false);
      setIsErrorModalOpen(true);
    }
  };

  const handleDeletePosition = (position: Position) => {
    setSelectedPosition(position);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPosition) return;

    try {
      const response = await fetch(`/api/positions/${selectedPosition.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete position");

      setIsDeleteModalOpen(false);
      setSuccessMessage({
        title: "Successfully Deleted!",
        message: "The Position data has been deleted from the system. The changes have been saved successfully.",
      });
      setIsSuccessModalOpen(true);
      setSelectedPosition(null);
      fetchPositions();
    } catch (error) {
      console.error("Error deleting position:", error);
      setIsDeleteModalOpen(false);
      setIsErrorModalOpen(true);
      setSelectedPosition(null);
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
              <h1 className="text-black text-lg lg:text-2xl font-bold">Master Data - Position</h1>
              <p className="hidden sm:block text-black text-xs lg:text-sm">Manage position master data</p>
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
            {/* Total Position */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Total Position</p>
                  <p className="text-[#151d48] text-2xl font-semibold leading-8">{totalPositions}</p>
                </div>
                <div className="size-[54px] bg-[#e9f5fe] rounded-full flex items-center justify-center">
                  <Briefcase className="size-6 text-[#4db1d4]" />
                </div>
              </CardContent>
            </Card>

            {/* Active Position */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Active Position</p>
                  <p className="text-[#0e9211] text-2xl font-semibold leading-8">{activePositions}</p>
                </div>
                <div className="size-[50px] bg-[#dbffe0] rounded-full flex items-center justify-center">
                  <CheckCircle className="size-6 text-[#0e9211]" />
                </div>
              </CardContent>
            </Card>

            {/* Inactive Position */}
            <Card className="border-[#e9f5fe]">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-[#425166] text-base font-medium leading-6">Inactive Position</p>
                  <p className="text-[#c08f2c] text-2xl font-semibold leading-8">{inactivePositions}</p>
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
              <span className="font-semibold text-sm lg:text-base">Add New Position</span>
            </Button>
          </div>

          {/* Table */}
          <div className="border border-[#e1e2e3] rounded-b-lg overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#e9f5fe]">
                <TableRow className="hover:bg-[#e9f5fe]">
                  <TableHead className="w-[12%] text-[#384654] font-semibold text-xs lg:text-sm">Code</TableHead>
                  <TableHead className="w-[30%] text-[#384654] font-semibold text-xs lg:text-sm">Position Name</TableHead>
                  <TableHead className="w-[28%] text-[#384654] font-semibold text-xs lg:text-sm">Department</TableHead>
                  <TableHead className="w-[12%] text-[#384654] font-semibold text-xs lg:text-sm">Status</TableHead>
                  <TableHead className="w-[18%] text-[#384654] font-semibold text-xs lg:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4db1d4]"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : positions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-[#384654]">
                      No positions found
                    </TableCell>
                  </TableRow>
                ) : (
                  positions.map((position) => (
                    <TableRow key={position.id} className="h-[68px]">
                      <TableCell className="text-[#4db1d4] font-semibold">{position.code}</TableCell>
                      <TableCell className="text-[#384654]">{position.name}</TableCell>
                      <TableCell className="text-[#384654]">
                        {position.department?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            position.isActive
                              ? "bg-[#dbffe0] text-[#0e9211] hover:bg-[#dbffe0]"
                              : "bg-[#fff4d4] text-[#c08f2c] hover:bg-[#fff4d4]"
                          }`}
                        >
                          {position.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleViewPosition(position)}
                          >
                            <Eye className="size-4 text-[#384654]" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleEditPosition(position)}
                          >
                            <Pencil className="size-4 text-[#4db1d4]" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 border-[#e1e2e3]"
                            onClick={() => handleDeletePosition(position)}
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
              totalItems={totalCount}
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
      <AddPositionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddPosition}
      />

      <ViewPositionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        position={selectedPosition}
      />

      <EditPositionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        position={selectedPosition}
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
