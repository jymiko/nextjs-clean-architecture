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
import { Eye } from "lucide-react";
import { DocumentStatusBadge } from "./DocumentStatusBadge";

export interface ReportDocument {
  id: string;
  code: string;
  title: string;
  department: string;
  type: string;
  status: "active" | "obsolete";
  date: string;
}

interface ReportDocumentsTableProps {
  documents: ReportDocument[];
  onViewDocument?: (document: ReportDocument) => void;
  isLoading?: boolean;
}

export function ReportDocumentsTable({
  documents,
  onViewDocument,
  isLoading,
}: ReportDocumentsTableProps) {
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
          <div className="grid grid-cols-7 gap-4 text-sm font-semibold text-[#384654]">
            <span>Documents Code</span>
            <span>Documents Title</span>
            <span>Department</span>
            <span>Type</span>
            <span>Status</span>
            <span>Date</span>
            <span>Action</span>
          </div>
        </div>
        <div className="border border-[#e1e2e3] px-6 py-5 text-center text-[#384654]">
          Data Empty
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md overflow-hidden">
      {/* Desktop View */}
      <div className="hidden lg:block">
        <Table>
          <TableHeader className="bg-[#e9f5fe]">
            <TableRow className="hover:bg-[#e9f5fe]">
              <TableHead className="text-[#384654] font-semibold text-base h-[60px] px-6">
                Documents Code
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-base">
                Documents Title
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-base">
                Department
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-base">
                Type
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-base">
                Status
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-base">
                Date
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-base">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id} className="border-[#e1e2e3] h-[60px]">
                <TableCell className="px-6">
                  <span className="text-[#4DB1D4] font-semibold text-base">
                    {doc.code}
                  </span>
                </TableCell>
                <TableCell className="text-[#384654] text-base">
                  {doc.title}
                </TableCell>
                <TableCell className="text-[#384654] text-base">
                  {doc.department}
                </TableCell>
                <TableCell className="text-[#384654] text-base">
                  {doc.type}
                </TableCell>
                <TableCell>
                  <DocumentStatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="text-[#384654] text-base">
                  {doc.date}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 w-10 p-0 border-[#e1e2e3]"
                    onClick={() => onViewDocument?.(doc)}
                  >
                    <Eye className="h-5 w-5 text-[#384654]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile/Tablet View */}
      <div className="lg:hidden">
        <div className="bg-[#e9f5fe] px-4 py-4 text-[#384654] font-semibold text-sm">
          Report Documents
        </div>
        <div className="divide-y divide-[#e1e2e3]">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[#4DB1D4] font-semibold text-sm block">
                    {doc.code}
                  </span>
                  <span className="text-[#384654] text-sm">{doc.title}</span>
                </div>
                <DocumentStatusBadge status={doc.status} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[#738193] text-xs">Department</span>
                  <p className="text-[#384654]">{doc.department}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs">Type</span>
                  <p className="text-[#384654]">{doc.type}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs">Date</span>
                  <p className="text-[#384654]">{doc.date}</p>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 border-[#e1e2e3]"
                    onClick={() => onViewDocument?.(doc)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
