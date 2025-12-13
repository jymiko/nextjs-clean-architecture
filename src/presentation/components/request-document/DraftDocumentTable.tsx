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
import { Pencil, Trash2, FileSearch } from "lucide-react";

export interface DraftDocument {
  id: string;
  documentCode: string;
  documentTitle: string;
  type: string;
  createdBy: string;
  lastEdited: string;
}

interface DraftDocumentTableProps {
  documents: DraftDocument[];
  onViewDocument?: (document: DraftDocument) => void;
  onEditDocument?: (document: DraftDocument) => void;
  onDeleteDocument?: (document: DraftDocument) => void;
  isLoading?: boolean;
}

export function DraftDocumentTable({
  documents,
  onViewDocument,
  onEditDocument,
  onDeleteDocument,
  isLoading,
}: DraftDocumentTableProps) {
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
          <div className="grid grid-cols-6 gap-4 text-sm font-semibold text-[#384654]">
            <span>Documents Code</span>
            <span>Documents Title</span>
            <span>Type</span>
            <span>Create By</span>
            <span>Last Edited</span>
            <span>Action</span>
          </div>
        </div>
        <div className="border border-[#e1e2e3] px-6 py-10 text-center text-[#384654]">
          No draft documents found
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
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap min-w-[250px]">
                Documents Title
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Type
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap min-w-[150px]">
                Create By
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-sm whitespace-nowrap">
                Last Edited
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
                  <button
                    onClick={() => onViewDocument?.(doc)}
                    className="text-[#4DB1D4] font-semibold text-sm hover:underline cursor-pointer"
                  >
                    {doc.documentCode}
                  </button>
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  {doc.documentTitle}
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  {doc.type}
                </TableCell>
                <TableCell className="text-[#384654] text-sm">
                  {doc.createdBy}
                </TableCell>
                <TableCell className="text-[#384654] text-sm whitespace-nowrap">
                  {doc.lastEdited}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-[5px]">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 w-11 p-0 border-[#e1e2e3]"
                      onClick={() => onViewDocument?.(doc)}
                      title="View Document"
                    >
                      <FileSearch className="h-5 w-5 text-[#4DB1D4]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 w-11 p-0 border-[#e1e2e3]"
                      onClick={() => onEditDocument?.(doc)}
                      title="Edit Document"
                    >
                      <Pencil className="h-5 w-5 text-[#F7931A]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-11 w-11 p-0 border-[#e1e2e3]"
                      onClick={() => onDeleteDocument?.(doc)}
                      title="Delete Document"
                    >
                      <Trash2 className="h-5 w-5 text-[#F24822]" />
                    </Button>
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
                Create By
              </TableHead>
              <TableHead className="text-[#384654] font-semibold text-xs">
                Last Edited
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
                    <button
                      onClick={() => onViewDocument?.(doc)}
                      className="text-[#4DB1D4] font-semibold text-xs block hover:underline cursor-pointer"
                    >
                      {doc.documentCode}
                    </button>
                    <span className="text-[#384654] text-xs">{doc.documentTitle}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  {doc.type}
                </TableCell>
                <TableCell className="text-[#384654] text-xs">
                  {doc.createdBy}
                </TableCell>
                <TableCell className="text-[#384654] text-xs whitespace-nowrap">
                  {doc.lastEdited}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 border-[#e1e2e3]"
                      onClick={() => onViewDocument?.(doc)}
                    >
                      <FileSearch className="h-4 w-4 text-[#4DB1D4]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 border-[#e1e2e3]"
                      onClick={() => onEditDocument?.(doc)}
                    >
                      <Pencil className="h-4 w-4 text-[#F7931A]" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0 border-[#e1e2e3]"
                      onClick={() => onDeleteDocument?.(doc)}
                    >
                      <Trash2 className="h-4 w-4 text-[#F24822]" />
                    </Button>
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
          Draft Documents
        </div>
        <div className="divide-y divide-[#e1e2e3]">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <button
                    onClick={() => onViewDocument?.(doc)}
                    className="text-[#4DB1D4] font-semibold text-sm block truncate hover:underline cursor-pointer"
                  >
                    {doc.documentCode}
                  </button>
                  <span className="text-[#384654] text-sm line-clamp-2">{doc.documentTitle}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[#738193] text-xs block">Type</span>
                  <p className="text-[#384654] text-sm">{doc.type}</p>
                </div>
                <div>
                  <span className="text-[#738193] text-xs block">Last Edited</span>
                  <p className="text-[#384654] text-sm">{doc.lastEdited}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#738193] text-xs block">Create By</span>
                  <p className="text-[#384654] text-sm">{doc.createdBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 border-[#e1e2e3]"
                  onClick={() => onViewDocument?.(doc)}
                >
                  <FileSearch className="h-4 w-4 mr-2 text-[#4DB1D4]" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 border-[#e1e2e3]"
                  onClick={() => onEditDocument?.(doc)}
                >
                  <Pencil className="h-4 w-4 mr-2 text-[#F7931A]" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 flex-1 border-[#e1e2e3]"
                  onClick={() => onDeleteDocument?.(doc)}
                >
                  <Trash2 className="h-4 w-4 mr-2 text-[#F24822]" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
