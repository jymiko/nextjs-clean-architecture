"use client";

import { cn } from "@/lib/utils";
import { MousePointer2 } from "lucide-react";
import Image from "next/image";

interface PreparedBy {
  id?: string;
  name: string;
  position: string;
  signature: string | null;
  signedAt: Date | string | null;
}

interface Approval {
  id: string;
  level: number;
  approver: {
    id: string;
    name: string;
    position: string;
  };
  signatureImage: string | null;
  signedAt: Date | string | null;
  status: string;
}

interface DocumentSignaturePanelProps {
  preparedBy: PreparedBy;
  approvals: Approval[];
  currentUserId?: string;
  onSign: (approvalId: string) => void;
}

// Helper function to check if user can sign
function canSign(
  approval: Approval,
  allApprovals: Approval[],
  preparedBySignedAt: Date | string | null,
  currentUserId?: string
): boolean {
  // Must be the approver
  if (!currentUserId || approval.approver.id !== currentUserId) return false;

  // Already signed
  if (approval.signedAt) return false;

  // "Prepared By" must be signed first
  if (!preparedBySignedAt) return false;

  // Sort approvals by level, then by id (creation order)
  const sorted = [...allApprovals].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.id.localeCompare(b.id);
  });

  // Find index of current approval
  const currentIndex = sorted.findIndex((a) => a.id === approval.id);

  // All previous must be signed
  return sorted.slice(0, currentIndex).every((a) => a.signedAt !== null);
}

// Format date for display
function formatSignedDate(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface SignatureCardProps {
  title: string;
  name: string;
  position: string;
  signature: string | null;
  signedAt: Date | string | null;
  canSign: boolean;
  isCurrentUser: boolean;
  onClick?: () => void;
}

function SignatureCard({
  title,
  name,
  position,
  signature,
  signedAt,
  canSign,
  isCurrentUser,
  onClick,
}: SignatureCardProps) {
  const isClickable = canSign && isCurrentUser;

  return (
    <div
      className={cn(
        "border border-[#E1E2E3] rounded-lg bg-white p-4 flex flex-col min-w-[200px] flex-1 flex-shrink-0",
        isClickable && "cursor-pointer hover:border-[#4DB1D4] hover:shadow-md transition-all"
      )}
      onClick={isClickable ? onClick : undefined}
    >
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
        ) : canSign && isCurrentUser ? (
          <div className="flex flex-col items-center text-[#4DB1D4]">
            <MousePointer2 className="w-8 h-8 mb-1" />
            <span className="text-xs font-medium">CLICK HERE</span>
          </div>
        ) : signedAt ? (
          <span className="text-xs text-[#9CA3AF]">Signed</span>
        ) : (
          <span className="text-xs text-[#9CA3AF]">No signature</span>
        )}
      </div>

      {/* Name and Position */}
      <div className="text-center">
        <p className="text-sm font-medium text-[#384654] truncate">{name || "-"}</p>
        {position && <p className="text-xs text-[#6B7280] truncate">({position})</p>}
        {signedAt && (
          <p className="text-xs text-[#9CA3AF] mt-1">{formatSignedDate(signedAt)}</p>
        )}
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

export function DocumentSignaturePanel({
  preparedBy,
  approvals = [],
  currentUserId,
  onSign,
}: DocumentSignaturePanelProps) {
  // Separate reviewers (level 1), approvers (level 2), and acknowledgers (level 3)
  const reviewers = approvals.filter((a) => a.level === 1);
  const approvers = approvals.filter((a) => a.level === 2);
  const acknowledgers = approvals.filter((a) => a.level === 3);

  // Always show at least 4 cards: Prepared By, Reviewer By, Approved By, Acknowledged By
  const hasReviewers = reviewers.length > 0;
  const hasApprovers = approvers.length > 0;
  const hasAcknowledgers = acknowledgers.length > 0;

  return (
    <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E1E2E3]">
      <h4 className="text-sm font-medium text-[#384654] mb-4">Document Signatures</h4>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* Prepared By Card */}
        <SignatureCard
          title="Prepared By"
          name={preparedBy.name}
          position={preparedBy.position}
          signature={preparedBy.signature}
          signedAt={preparedBy.signedAt}
          canSign={false}
          isCurrentUser={preparedBy.id === currentUserId}
        />

        {/* Reviewer Cards */}
        {hasReviewers ? (
          reviewers.map((approval, index) => (
            <SignatureCard
              key={approval.id}
              title={reviewers.length > 1 ? `Reviewer ${index + 1}` : "Reviewer By"}
              name={approval.approver.name}
              position={approval.approver.position}
              signature={approval.signatureImage}
              signedAt={approval.signedAt}
              canSign={canSign(approval, approvals, preparedBy.signedAt, currentUserId)}
              isCurrentUser={approval.approver.id === currentUserId}
              onClick={() => onSign(approval.id)}
            />
          ))
        ) : (
          <EmptySignatureCard title="Reviewer By" />
        )}

        {/* Approver Cards */}
        {hasApprovers ? (
          approvers.map((approval, index) => (
            <SignatureCard
              key={approval.id}
              title={approvers.length > 1 ? `Approved By ${index + 1}` : "Approved By"}
              name={approval.approver.name}
              position={approval.approver.position}
              signature={approval.signatureImage}
              signedAt={approval.signedAt}
              canSign={canSign(approval, approvals, preparedBy.signedAt, currentUserId)}
              isCurrentUser={approval.approver.id === currentUserId}
              onClick={() => onSign(approval.id)}
            />
          ))
        ) : (
          <EmptySignatureCard title="Approved By" />
        )}

        {/* Acknowledger Cards */}
        {hasAcknowledgers ? (
          acknowledgers.map((approval, index) => (
            <SignatureCard
              key={approval.id}
              title={acknowledgers.length > 1 ? `Acknowledged ${index + 1}` : "Acknowledged By"}
              name={approval.approver.name}
              position={approval.approver.position}
              signature={approval.signatureImage}
              signedAt={approval.signedAt}
              canSign={canSign(approval, approvals, preparedBy.signedAt, currentUserId)}
              isCurrentUser={approval.approver.id === currentUserId}
              onClick={() => onSign(approval.id)}
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
          <span>Click to sign</span>
        </div>
      </div>
    </div>
  );
}
