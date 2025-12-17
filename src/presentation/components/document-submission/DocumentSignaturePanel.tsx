"use client";

import { cn } from "@/lib/utils";
import { MousePointer2, Pencil, CheckCircle, Clock } from "lucide-react";
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
  status: 'PENDING' | 'SIGNED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION' | string;
  confirmedAt?: Date | string | null;
}

interface DocumentSignaturePanelProps {
  preparedBy: PreparedBy;
  approvals: Approval[];
  currentUserId?: string;
  onSign: (approvalId: string) => void;
}

// Helper function to check if user can sign or edit signature
function canSign(
  approval: Approval,
  allApprovals: Approval[],
  preparedBySignedAt: Date | string | null,
  currentUserId?: string
): boolean {
  // Must be the approver
  if (!currentUserId || approval.approver.id !== currentUserId) return false;

  // "Prepared By" must be signed first
  if (!preparedBySignedAt) return false;

  // If already fully approved (confirmed), cannot re-sign
  if (approval.status === 'APPROVED') return false;

  // If already signed (but not approved), user can still edit their signature
  if (approval.status === 'SIGNED' && approval.signedAt) return true;

  // Sort approvals by level, then by id (creation order)
  const sorted = [...allApprovals].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.id.localeCompare(b.id);
  });

  // Find index of current approval
  const currentIndex = sorted.findIndex((a) => a.id === approval.id);

  // All previous must be fully APPROVED (not just signed)
  return sorted.slice(0, currentIndex).every((a) => a.status === 'APPROVED');
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
  status: string;
  confirmedAt?: Date | string | null;
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
  status,
  confirmedAt,
  canSign,
  isCurrentUser,
  onClick,
}: SignatureCardProps) {
  const isClickable = canSign && isCurrentUser;
  const isSigned = status === 'SIGNED';
  const isApproved = status === 'APPROVED';

  return (
    <div
      className={cn(
        "border border-[#E1E2E3] rounded-lg bg-white p-4 flex flex-col min-w-[200px] flex-1 flex-shrink-0 relative",
        isClickable && "cursor-pointer hover:border-[#4DB1D4] hover:shadow-md transition-all",
        isSigned && "border-yellow-300 bg-yellow-50/50",
        isApproved && "border-green-300 bg-green-50/50"
      )}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Status Badge */}
      {isSigned && (
        <div className="absolute -top-2 -right-2 bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded-full border border-yellow-300 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Awaiting Approval</span>
        </div>
      )}
      {isApproved && (
        <div className="absolute -top-2 -right-2 bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full border border-green-300 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          <span>Approved</span>
        </div>
      )}

      {/* Title */}
      <div className="text-center mb-3">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
          {title}
        </span>
      </div>

      {/* Signature Area */}
      <div
        className={cn(
          "flex items-center justify-center h-16 rounded-md mb-3",
          signature
            ? "bg-transparent"
            : "border border-dashed border-[#D1D5DC] bg-[#FAFAFA]"
        )}
      >
        {signature ? (
          <div className="relative w-full h-full group">
            <Image
              src={signature}
              alt={`${name}'s signature`}
              fill
              className="object-contain"
              unoptimized
              sizes="(max-width: 200px) 100vw, 200px"
            />
            {/* Edit overlay for current user who can edit (only if SIGNED, not APPROVED) */}
            {isClickable && !isApproved && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex flex-col items-center text-white">
                  <Pencil className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">EDIT</span>
                </div>
              </div>
            )}
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
        {confirmedAt && (
          <p className="text-xs font-medium text-green-700 mt-1">Approved: {formatSignedDate(confirmedAt)}</p>
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
      <div className="flex items-center justify-center h-16 border border-dashed border-[#D1D5DC] rounded-md bg-[#FAFAFA] mb-3">
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
          status={preparedBy.signedAt ? "APPROVED" : "PENDING"}
          confirmedAt={preparedBy.signedAt}
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
              status={approval.status}
              confirmedAt={approval.confirmedAt}
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
              status={approval.status}
              confirmedAt={approval.confirmedAt}
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
              status={approval.status}
              confirmedAt={approval.confirmedAt}
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
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#6B7280]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 border border-dashed border-[#D1D5DC] rounded bg-[#FAFAFA]"></div>
          <span>Waiting for signature</span>
        </div>
        <div className="flex items-center gap-1">
          <MousePointer2 className="w-3 h-3 text-[#4DB1D4]" />
          <span>Click to sign</span>
        </div>
        <div className="flex items-center gap-1">
          <Pencil className="w-3 h-3 text-[#6B7280]" />
          <span>Click to edit</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-yellow-600" />
          <span>Signed, awaiting approval</span>
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span>Approved</span>
        </div>
      </div>
    </div>
  );
}
