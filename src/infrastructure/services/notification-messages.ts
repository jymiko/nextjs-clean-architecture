/**
 * Notification Message Templates
 * Centralized messages with multi-language support (ID/EN)
 */

export type NotificationMessageKey =
  | 'REVIEW_REQUIRED'
  | 'APPROVAL_REQUIRED'
  | 'ACKNOWLEDGMENT_REQUIRED'
  | 'VALIDATION_REQUIRED'
  | 'DOCUMENT_SIGNED'
  | 'AWAITING_VALIDATION'
  | 'DOCUMENT_SUBMITTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_FINALIZED';

export type SupportedLanguage = 'id' | 'en';

export interface MessageParams {
  docTitle?: string;
  docNumber?: string;
  requesterName?: string;
  signerName?: string;
  role?: string;
  reason?: string;
  category?: string;
}

interface LocalizedMessage {
  title: string;
  message: (params: MessageParams) => string;
}

type NotificationMessages = {
  [key in NotificationMessageKey]: {
    [lang in SupportedLanguage]: LocalizedMessage;
  };
};

export const NOTIFICATION_MESSAGES: NotificationMessages = {
  REVIEW_REQUIRED: {
    id: {
      title: 'Dokumen Perlu Direview',
      message: (params) =>
        `Dokumen "${params.docTitle}" dari ${params.requesterName} membutuhkan review Anda.`,
    },
    en: {
      title: 'Document Review Required',
      message: (params) =>
        `Document "${params.docTitle}" by ${params.requesterName} requires your review.`,
    },
  },
  APPROVAL_REQUIRED: {
    id: {
      title: 'Dokumen Perlu Disetujui',
      message: (params) =>
        `Dokumen "${params.docTitle}" dari ${params.requesterName} membutuhkan persetujuan Anda.`,
    },
    en: {
      title: 'Document Approval Required',
      message: (params) =>
        `Document "${params.docTitle}" by ${params.requesterName} requires your approval.`,
    },
  },
  ACKNOWLEDGMENT_REQUIRED: {
    id: {
      title: 'Dokumen Perlu Acknowledge',
      message: (params) =>
        `Dokumen "${params.docTitle}" dari ${params.requesterName} membutuhkan acknowledge Anda.`,
    },
    en: {
      title: 'Document Acknowledgment Required',
      message: (params) =>
        `Document "${params.docTitle}" by ${params.requesterName} requires your acknowledgment.`,
    },
  },
  VALIDATION_REQUIRED: {
    id: {
      title: 'Dokumen Menunggu Validasi',
      message: (params) =>
        `Dokumen "${params.docTitle}" (${params.docNumber}) telah selesai disetujui dan menunggu validasi Anda.`,
    },
    en: {
      title: 'Document Awaiting Validation',
      message: (params) =>
        `Document "${params.docTitle}" (${params.docNumber}) has completed all approvals and awaits your validation.`,
    },
  },
  DOCUMENT_SIGNED: {
    id: {
      title: 'Dokumen Ditandatangani',
      message: (params) =>
        `${params.signerName} (${params.role}) telah menandatangani dokumen "${params.docTitle}".`,
    },
    en: {
      title: 'Document Signed',
      message: (params) =>
        `${params.signerName} (${params.role}) has signed your document "${params.docTitle}".`,
    },
  },
  AWAITING_VALIDATION: {
    id: {
      title: 'Menunggu Validasi Admin',
      message: (params) =>
        `Dokumen "${params.docTitle}" telah selesai ditandatangani dan menunggu validasi admin.`,
    },
    en: {
      title: 'Awaiting Admin Validation',
      message: (params) =>
        `Your document "${params.docTitle}" has completed all signatures and awaits admin validation.`,
    },
  },
  DOCUMENT_SUBMITTED: {
    id: {
      title: 'Dokumen Berhasil Diajukan',
      message: (params) =>
        `Dokumen "${params.docTitle}" telah berhasil diajukan untuk direview.`,
    },
    en: {
      title: 'Document Submitted',
      message: (params) =>
        `Your document "${params.docTitle}" has been submitted for review.`,
    },
  },
  DOCUMENT_APPROVED: {
    id: {
      title: 'Dokumen Disetujui',
      message: (params) =>
        `Dokumen "${params.docTitle}" telah divalidasi dan disetujui.`,
    },
    en: {
      title: 'Document Approved',
      message: (params) =>
        `Your document "${params.docTitle}" has been validated and approved.`,
    },
  },
  DOCUMENT_REJECTED: {
    id: {
      title: 'Dokumen Ditolak',
      message: (params) =>
        `Dokumen "${params.docTitle}" ditolak saat validasi.${params.reason ? ` Alasan: ${params.reason}` : ' Silakan periksa dan revisi.'}`,
    },
    en: {
      title: 'Document Rejected',
      message: (params) =>
        `Your document "${params.docTitle}" was rejected during validation.${params.reason ? ` Reason: ${params.reason}` : ' Please check and revise.'}`,
    },
  },
  DOCUMENT_FINALIZED: {
    id: {
      title: 'Dokumen Diselesaikan',
      message: (params) =>
        `Dokumen "${params.docTitle}" telah diselesaikan dan dikategorikan sebagai ${params.category === 'MANAGEMENT' ? 'Document Management' : 'Distributed Document'}.`,
    },
    en: {
      title: 'Document Finalized',
      message: (params) =>
        `Your document "${params.docTitle}" has been finalized and categorized as ${params.category === 'MANAGEMENT' ? 'Document Management' : 'Distributed Document'}.`,
    },
  },
};

/**
 * Get role label based on approval level
 */
export function getRoleLabelByLevel(level: number, language: SupportedLanguage): string {
  const roleLabels: { [key: number]: { id: string; en: string } } = {
    1: { id: 'Reviewer', en: 'Reviewer' },
    2: { id: 'Approver', en: 'Approver' },
    3: { id: 'Acknowledged', en: 'Acknowledged' },
  };
  return roleLabels[level]?.[language] || roleLabels[1][language];
}

/**
 * Get message key based on approval level
 */
export function getMessageKeyByLevel(level: number): NotificationMessageKey {
  switch (level) {
    case 1:
      return 'REVIEW_REQUIRED';
    case 2:
      return 'APPROVAL_REQUIRED';
    case 3:
      return 'ACKNOWLEDGMENT_REQUIRED';
    default:
      return 'REVIEW_REQUIRED';
  }
}

/**
 * Get localized notification content
 */
export function getLocalizedNotification(
  messageKey: NotificationMessageKey,
  language: SupportedLanguage,
  params: MessageParams
): { title: string; message: string } {
  const template = NOTIFICATION_MESSAGES[messageKey]?.[language] ||
    NOTIFICATION_MESSAGES[messageKey]?.en;

  if (!template) {
    return {
      title: 'Notification',
      message: 'You have a new notification.',
    };
  }

  return {
    title: template.title,
    message: template.message(params),
  };
}

/**
 * Normalize language code to supported language
 */
export function normalizeLanguage(language: string | null | undefined): SupportedLanguage {
  if (!language) return 'id'; // Default to Indonesian
  const normalized = language.toLowerCase().substring(0, 2);
  return normalized === 'en' ? 'en' : 'id';
}
