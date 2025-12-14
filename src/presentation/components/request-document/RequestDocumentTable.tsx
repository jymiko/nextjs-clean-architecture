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
import { cn } from "@/lib/utils";

export type RequestStatus = "pending" | "approved" | "rejected";

export interface RequestDocument {
  id: string;
  requestCode: string;
  documentCode: string;
  documentTitle: string;
  type: string;
  requestBy: string;
  requestByPosition?: string;
  ownedBy: string;
  requestDate: string;
  status: RequestStatus;
  remarks: string;
}

interface RequestDocumentTableProps {
  documents: RequestDocument[];
  onViewDocument?: (document: RequestDocument) => void;
  isLoading?: boolean;
}

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-[#FFF4D4] text-[#C08F2C]",
  },
  approved: {
    label: "Approved",
    className: "bg-[#DBFFE0] text-[#0E9211]",
  },
  rejected: {
    label: "Rejected",
    className: "bg-[#FFD6CD] text-[#F24822]",
  },
};

function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-3 py-2.5 rounded-lg text-xs font-normal min-w-[100px] text-center leading-tight",
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function RequestDocumentTable({
  documents,
  onViewDocument,
  isLoading,
}: RequestDocumentTableProps) {
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
          <div className="grid grid-cols-9 gap-4 text-sm font-semibold text-[#384654]">
            <span>Request Code</span>
            <span>Documents Title</span>
            <span>Type</span>
            <span>Request By</span>
            <span>Owned By</span>
            <span>Request Date</span>
            <span>Status</span>
            <span>Remarks</span>
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
                Request Code
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap min-w-[200px]">
                Documents Title
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Type
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap min-w-[150px]">
                Request By
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap min-w-[150px]">
                Owned By
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Request Date
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Status
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap min-w-[180px]">
                Remarks
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
                    {doc.requestCode}
                  </span>
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  <div>
                    <span className="font-bold">{doc.documentCode}</span>
                    {doc.documentCode && doc.documentTitle && " - "}
                    {doc.documentTitle}
                  </div>
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  {doc.type}
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  <div className="max-w-[200px]">
                    {doc.requestBy}
                    {doc.requestByPosition && (
                      <span className="block text-xs text-[#738193]">
                        {doc.requestByPosition}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-[#384654] text-sm whitespace-nowrap">
                  {doc.ownedBy}
                </TableCell>
                <TableCell className="text-[#384654] text-sm whitespace-nowrap">
                  {doc.requestDate}
                </TableCell>
                <TableCell>
                  <RequestStatusBadge status={doc.status} />
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  <div className="max-w-[200px]">{doc.remarks}</div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-11 w-11 p-0 border-[#e1e2e3]"
                    onClick={() => onViewDocument?.(doc)}
                    title="View Document"
                  >
                    <Eye className="h-5 w-5 text-[#384654]" />
                  </Button>
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
                Request By / Owned By
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-xs">
                Date / Status
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
                      {doc.requestCode}
                    </span>
                    <span className="text-[#384654] text-xs font-bold">{doc.documentCode}</span>
                    <span className="text-[#384654] text-xs block">{doc.documentTitle}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  {doc.type}
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  <div className="space-y-1">
                    <div className="text-[#738193] text-[10px]">Request By</div>
                    <div>{doc.requestBy}</div>
                    <div className="text-[#738193] text-[10px]">Owned By</div>
                    <div>{doc.ownedBy}</div>
                  </div>
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  <div className="space-y-2">
                    <div>{doc.requestDate}</div>
                    <RequestStatusBadge status={doc.status} />
                  </div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 border-[#e1e2e3]"
                    onClick={() => onViewDocument?.(doc)}
                  >
                    <Eye className="h-4 w-4 text-[#384654]" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="bg-[#e9f5fe] px-4 py-4 text-[#384654] font-semibold text-sm">
          Request Documents
        </div>
        <div className="divide-y divide-[#e1e2e3]">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <span className="text-[#4DB1D4] font-semibold text-sm block truncate">
                    {doc.requestCode}
                  </span>
                  <span className="text-[#384654] text-sm font-bold block">{doc.documentCode}</span>
                  <span className="text-[#384654] text-sm line-clamp-2">{doc.documentTitle}</span>
                </div>
                <RequestStatusBadge status={doc.status} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#738193] text-xs block">Type</span>
                  <p className="text-[#384654] text-sm">{doc.type}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs block">Request Date</span>
                  <p className="text-[#384654] text-sm">{doc.requestDate}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs block">Request By</span>
                  <p className="text-[#384654] text-sm">{doc.requestBy}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs block">Owned By</span>
                  <p className="text-[#384654] text-sm">{doc.ownedBy}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#738193] text-xs block">Remarks</span>
                  <p className="text-[#384654] text-sm">{doc.remarks}</p>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
