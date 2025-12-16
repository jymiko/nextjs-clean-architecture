"use client";

import { cn } from "@/lib/utils";
import { MousePointer2 } from "lucide-react";
import Image from "next/image";

interface PersonInfo {
  name: string;
  position: string;
}

interface PreparedByInfo extends PersonInfo {
  signature: string | null;
}

export interface DocumentSubmissionSignaturePreviewProps {
  preparedBy: PreparedByInfo;
  reviewers: PersonInfo[];
  approvers: PersonInfo[];
  acknowledgers: PersonInfo[];
  className?: string;
}

interface SignatureCardProps {
  title: string;
  name: string;
  position: string;
  signature: string | null;
  showClickHere?: boolean;
}

function SignatureCard({
  title,
  name,
  position,
  signature,
  showClickHere = false,
}: SignatureCardProps) {
  return (
    <div className="border border-[#E1E2E3] rounded-lg bg-white p-4 flex flex-col min-w-[200px] flex-1 flex-shrink-0">
      {/* Title */}
      <div className="text-center mb-3">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          {title}
        </span>
      </div>

      {/* Signature Area */}
      <div className="flex items-center justify-center h-32 border border-dashed border-[#D1D5DC] rounded-md bg-[#FAFAFA] mb-3 overflow-hidden">
        {signature ? (
          <div className="relative w-full h-full">
            <Image
              src={signature}
              alt={`${name}'s signature`}
              fill
              className="object-cover p-2"
              unoptimized
            />
          </div>
        ) : showClickHere ? (
          <div className="flex flex-col items-center text-[#4DB1D4]">
            <MousePointer2 className="w-8 h-8 mb-1" />
            <span className="text-xs font-medium">CLICK HERE</span>
          </div>
        ) : (
          <span className="text-xs text-[#9CA3AF]">No signature</span>
        )}
      </div>

      {/* Name and Position */}
      <div className="text-center">
        <p className="text-sm font-medium text-[#384654] truncate">{name || "-"}</p>
        {position && <p className="text-xs text-[#6B7280] truncate">({position})</p>}
      </div>
    </div>
  );
}

interface EmptySignatureCardProps {
  title: string;
}

function EmptySignatureCard({ title }: EmptySignatureCardProps) {
  return (
    <div className="border border-[#E1E2E3] rounded-lg bg-white p-4 flex flex-col min-w-[200px] flex-1 flex-shrink-0">
      {/* Title */}
      <div className="text-center mb-3">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          {title}
        </span>
      </div>

      {/* Signature Area */}
      <div className="flex items-center justify-center h-32 border border-dashed border-[#D1D5DC] rounded-md bg-[#FAFAFA] mb-3">
        <span className="text-xs text-[#9CA3AF]">Not assigned</span>
      </div>

      {/* Name and Position */}
      <div className="text-center">
        <p className="text-sm font-medium text-[#384654] truncate">-</p>
        <p className="text-xs text-[#6B7280] truncate">(-)</p>
      </div>
    </div>
  );
}

export function DocumentSubmissionSignaturePreview({
  preparedBy,
  reviewers,
  approvers,
  acknowledgers,
  className,
}: DocumentSubmissionSignaturePreviewProps) {
  const hasReviewers = reviewers.length > 0;
  const hasApprovers = approvers.length > 0;
  const hasAcknowledgers = acknowledgers.length > 0;

  return (
    <div className={cn("bg-[#F9FAFB] rounded-lg p-4 border border-[#E1E2E3]", className)}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* Prepared By Card */}
        <SignatureCard
          title="Prepared By"
          name={preparedBy.name}
          position={preparedBy.position}
          signature={preparedBy.signature}
        />

        {/* Reviewer Cards */}
        {hasReviewers ? (
          reviewers.map((reviewer, index) => (
            <SignatureCard
              key={`reviewer-${index}`}
              title={reviewers.length > 1 ? `Reviewer ${index + 1}` : "Reviewer By"}
              name={reviewer.name}
              position={reviewer.position}
              signature={null}
              showClickHere
            />
          ))
        ) : (
          <EmptySignatureCard title="Reviewer By" />
        )}

        {/* Approver Cards */}
        {hasApprovers ? (
          approvers.map((approver, index) => (
            <SignatureCard
              key={`approver-${index}`}
              title={approvers.length > 1 ? `Approved By ${index + 1}` : "Approved By"}
              name={approver.name}
              position={approver.position}
              signature={null}
              showClickHere
            />
          ))
        ) : (
          <EmptySignatureCard title="Approved By" />
        )}

        {/* Acknowledger Cards */}
        {hasAcknowledgers ? (
          acknowledgers.map((acknowledger, index) => (
            <SignatureCard
              key={`acknowledger-${index}`}
              title={acknowledgers.length > 1 ? `Acknowledged ${index + 1}` : "Acknowledged By"}
              name={acknowledger.name}
              position={acknowledger.position}
              signature={null}
              showClickHere
            />
          ))
        ) : (
          <EmptySignatureCard title="Acknowledged By" />
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-xs text-[#6B7280]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-dashed border-[#D1D5DC] rounded bg-[#FAFAFA]"></div>
          <span>Waiting for signature</span>
        </div>
        <div className="flex items-center gap-1">
          <MousePointer2 className="w-3 h-3 text-[#4DB1D4]" />
          <span>Click to sign (after submission)</span>
        </div>
      </div>
    </div>
  );
}
