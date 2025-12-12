"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Check } from "lucide-react";
import { DocumentStatusBadge, DocumentStatus } from "../reports/DocumentStatusBadge";

export interface ManagementDocument {
  id: string;
  code: string;
  title: string;
  type: string;
  department?: string;
  approvedDate?: string;
  distributedDate: string;
  expiredDate: string;
  status: DocumentStatus;
  /** URL ke file PDF dari API */
  pdfUrl?: string;
}

interface DocumentManagementTableProps {
  documents: ManagementDocument[];
  onViewDocument?: (document: ManagementDocument) => void;
  onApproveDocument?: (document: ManagementDocument) => void;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export function DocumentManagementTable({
  documents,
  onViewDocument,
  onApproveDocument,
  isLoading,
  isAdmin = false,
}: DocumentManagementTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md overflow-hidden">
        <div className="bg-[#e9f5fe] px-6 py-5">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-full" />
        </div>
        <div className="p-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-md overflow-hidden">
        <div className="bg-[#e9f5fe] px-6 py-5">
          <div className="grid grid-cols-8 gap-4 text-sm font-semibold text-[#384654]">
            <span>Documents Code</span>
            <span>Documents Title</span>
            <span>Type</span>
            <span>{isAdmin ? "Approved Date" : "Department"}</span>
            <span>Distributed Date</span>
            <span>Expired Date</span>
            <span>Status</span>
            <span>Action</span>
          </div>
        </div>
        <div className="border border-[#e1e2e3] px-6 py-10 text-center text-[#384654]">
          No documents found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md overflow-hidden">
      {/* Desktop View */}
      <div className="hidden xl:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#e9f5fe]">
            <TableRow className="hover:bg-[#e9f5fe]">
              <TableHead className="text-[#384654] font-semibold text-sm h-[68px] px-6 whitespace-nowrap">
                Documents Code
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Documents Title
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Type
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                {isAdmin ? "Approved Date" : "Department"}
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Distributed Date
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Expired Date
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="border-[#e1e2e3] h-[68px]">
                <TableCell className="px-6">
                  <span className="text-[#4DB1D4] font-semibold text-sm">
                    {doc.code}
                  </span>
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  {doc.title}
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  {doc.type}
                </TableCell>
                <TableCell className="text-[#384654] text-sm whitespace-nowrap">
                  {isAdmin ? doc.approvedDate : doc.department}
                </TableCell>
                <TableCell className="text-[#384654] text-sm whitespace-nowrap">
                  {doc.distributedDate}
                </TableCell>
                <TableCell className="text-[#384654] text-sm whitespace-nowrap">
                  {doc.expiredDate}
                </TableCell>
                <TableCell>
                  <DocumentStatusBadge status={doc.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 w-11 p-0 border-[#e1e2e3]"
                      onClick={() => onViewDocument?.(doc)}
                      title="View Document"
                    >
                      <Eye className="h-5 w-5 text-[#384654]" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        className="h-11 w-11 p-0 bg-[#0E9211] hover:bg-[#0c7f0e] border-0"
                        onClick={() => onApproveDocument?.(doc)}
                        title="Approve Document"
                      >
                        <Check className="h-5 w-5 text-white" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block xl:hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#e9f5fe]">
            <TableRow className="hover:bg-[#e9f5fe]">
              <TableHead className="text-[#384654] font-semibold text-xs h-[60px] px-4">
                Code / Title
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-xs">
                Type
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-xs">
                {isAdmin ? "Approved" : "Department"}
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-xs">
                Dates
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-xs">
                Status
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-xs">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="border-[#e1e2e3]">
                <TableCell className="px-4">
                  <div>
                    <span className="text-[#4DB1D4] font-semibold text-xs block">
                      {doc.code}
                    </span>
                    <span className="text-[#384654] text-xs">{doc.title}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  {doc.type}
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  {isAdmin ? doc.approvedDate : doc.department}
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  <div className="space-y-1">
                    <div className="text-[#738193] text-[10px]">Distributed</div>
                    <div>{doc.distributedDate}</div>
                    <div className="text-[#738193] text-[10px]">Expired</div>
                    <div>{doc.expiredDate}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <DocumentStatusBadge status={doc.status} className="text-[10px] min-w-[80px]" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 border-[#e1e2e3]"
                      onClick={() => onViewDocument?.(doc)}
                    >
                      <Eye className="h-4 w-4 text-[#384654]" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        className="h-9 w-9 p-0 bg-[#0E9211] hover:bg-[#0c7f0e] border-0"
                        onClick={() => onApproveDocument?.(doc)}
                      >
                        <Check className="h-4 w-4 text-white" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="bg-[#e9f5fe] px-4 py-4 text-[#384654] font-semibold text-sm">
          Document Management
        </div>
        <div className="divide-y divide-[#e1e2e3]">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <span className="text-[#4DB1D4] font-semibold text-sm block truncate">
                    {doc.code}
                  </span>
                  <span className="text-[#384654] text-sm line-clamp-2">{doc.title}</span>
                </div>
                <DocumentStatusBadge status={doc.status} className="text-[10px] min-w-[80px] shrink-0" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#738193] text-xs block">Type</span>
                  <p className="text-[#384654] text-sm">{doc.type}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs block">
                    {isAdmin ? "Approved Date" : "Department"}
                  </span>
                  <p className="text-[#384654] text-sm">
                    {isAdmin ? doc.approvedDate : doc.department}
                  </p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs block">Distributed Date</span>
                  <p className="text-[#384654] text-sm">{doc.distributedDate}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs block">Expired Date</span>
                  <p className="text-[#384654] text-sm">{doc.expiredDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 border-[#e1e2e3]"
                  onClick={() => onViewDocument?.(doc)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                {isAdmin && (
                  <Button
                    size="sm"
                    className="h-9 flex-1 bg-[#0E9211] hover:bg-[#0c7f0e] text-white"
                    onClick={() => onApproveDocument?.(doc)}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
