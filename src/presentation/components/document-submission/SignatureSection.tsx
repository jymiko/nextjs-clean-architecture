"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export interface Signature {
  id: string;
  role: "prepared" | "reviewed" | "approved" | "acknowledged";
  name: string;
  position: string;
  date?: string;
  signatureUrl?: string;
}

interface SignatureSectionProps {
  signatures: Signature[];
  className?: string;
}

const roleLabels: Record<Signature["role"], string> = {
  prepared: "Prepared By",
  reviewed: "Reviewed By",
  approved: "Approved By",
  acknowledged: "Acknowledged By",
};

export function SignatureSection({ signatures, className }: SignatureSectionProps) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {signatures.map((signature) => (
        <SignatureCard key={signature.id} signature={signature} />
      ))}
    </div>
  );
}

interface SignatureCardProps {
  signature: Signature;
  className?: string;
}

export function SignatureCard({ signature, className }: SignatureCardProps) {
  return (
    <div className={cn("bg-white border border-[#E1E2E3] rounded-lg p-4", className)}>
      {/* Role Label */}
      <div className="text-[#738193] text-xs mb-3">
        {roleLabels[signature.role]}
      </div>

      {/* Signature Box */}
      <div className="bg-[#F9FBFF] border border-dashed border-[#E1E2E3] rounded-md h-24 flex items-center justify-center mb-3">
        {signature.signatureUrl ? (
          <Image
            src={signature.signatureUrl}
            alt={`${signature.name}'s signature`}
            width={120}
            height={60}
            className="object-contain"
          />
        ) : (
          <span className="text-[#A0AEC0] text-xs">No Signature</span>
        )}
      </div>

      {/* Name & Position */}
      <div className="text-center">
        <div className="text-[#384654] font-semibold text-sm">{signature.name}</div>
        <div className="text-[#738193] text-xs">{signature.position}</div>
        {signature.date && (
          <div className="text-[#738193] text-xs mt-1">{signature.date}</div>
        )}
      </div>
    </div>
  );
}

// Horizontal layout variant
interface SignatureSectionHorizontalProps {
  signatures: Signature[];
  className?: string;
}

export function SignatureSectionHorizontal({ signatures, className }: SignatureSectionHorizontalProps) {
  return (
    <div className={cn("bg-white border border-[#E1E2E3] rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-[#E9F5FE] px-6 py-4">
        <h3 className="text-[#384654] font-semibold text-base">Document Signatures</h3>
      </div>

      {/* Signatures Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {signatures.map((signature) => (
            <div key={signature.id} className="text-center">
              {/* Role Label */}
              <div className="text-[#738193] text-xs mb-2">
                {roleLabels[signature.role]}
              </div>

              {/* Signature Box */}
              <div className="bg-[#F9FBFF] border border-[#E1E2E3] rounded-md h-20 flex items-center justify-center mb-2">
                {signature.signatureUrl ? (
                  <Image
                    src={signature.signatureUrl}
                    alt={`${signature.name}'s signature`}
                    width={100}
                    height={50}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-[#A0AEC0] text-xs">-</span>
                )}
              </div>

              {/* Name & Position */}
              <div className="text-[#384654] font-medium text-sm">{signature.name}</div>
              <div className="text-[#738193] text-xs">{signature.position}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
