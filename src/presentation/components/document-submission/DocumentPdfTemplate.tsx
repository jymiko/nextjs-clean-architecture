import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";

// Type for react-pdf styles
type PdfStyle = ReturnType<typeof StyleSheet.create>[string];
import { DocumentFormData } from "@/presentation/components/document-submission";

// A4 page dimensions in points: 595 x 842
// With 40pt padding, content area is 515 x 762
// Header ~130pt (includes document title inside), Footer ~80pt
// Available content area per page: ~550pt

const CONTENT_HEIGHT_FIRST_PAGE = 480; // First page with header (includes title) + footer
const CONTENT_HEIGHT_OTHER_PAGES = 500; // Subsequent pages with header + footer
const LINE_HEIGHT = 16; // Approximate height per line of text
const PARAGRAPH_MARGIN = 12;
const LIST_ITEM_HEIGHT = 22;
const TABLE_ROW_HEIGHT = 28;
const HEADING_HEIGHT = 30;

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: "Helvetica",
        lineHeight: 1.5,
        flexDirection: "column",
        height: "100%",
    },
    // Header / Kop Surat
    header: {
        flexDirection: "row",
        border: "2pt solid #000",
        marginBottom: 20,
    },
    headerLogo: {
        width: 100,
        borderRight: "2pt solid #000",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    logoImage: {
        width: 80,
        height: 60,
        objectFit: "contain",
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        borderBottom: "2pt solid #000",
        padding: 8,
        textAlign: "center",
    },
    headerTitleMain: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    headerTitleSub: {
        fontSize: 11,
        fontWeight: "bold",
    },
    headerMeta: {
        flexDirection: "row",
    },
    headerMetaCol: {
        flex: 1,
        padding: 5,
        fontSize: 9,
    },
    headerMetaColLeft: {
        borderRight: "2pt solid #000",
    },
    metaItem: {
        flexDirection: "row",
        paddingVertical: 2,
        minHeight: 18,
    },
    metaItemWithBorder: {
        flexDirection: "row",
        paddingVertical: 4,
        paddingHorizontal: 5,
        minHeight: 20,
        borderBottom: "2pt solid #000",
    },
    metaItemLast: {
        flexDirection: "row",
        paddingVertical: 4,
        paddingHorizontal: 5,
        minHeight: 20,
    },
    metaLabel: {
        fontWeight: "bold",
        width: 80,
    },
    metaValue: {
        flex: 1,
    },
    // Header Body Layout (new structure with document title inside)
    headerBody: {
        flexDirection: "row",
    },
    headerBodyLeft: {
        flex: 1,
        borderRight: "2pt solid #000",
    },
    headerBodyRight: {
        flex: 1,
        fontSize: 9,
    },
    headerDocType: {
        borderBottom: "2pt solid #000",
        padding: 8,
        textAlign: "center",
    },
    headerDocTypeText: {
        fontSize: 11,
        fontWeight: "bold",
    },
    headerDocTitleBox: {
        padding: 8,
        textAlign: "center",
        minHeight: 40,
    },
    headerDocTitleLabel: {
        fontSize: 10,
        fontWeight: "bold",
        marginBottom: 4,
    },
    headerDocTitleValue: {
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    // Document Title
    docTitle: {
        textAlign: "center",
        fontSize: 14,
        fontWeight: "bold",
        marginVertical: 20,
        textTransform: "uppercase",
    },
    // Procedure Content
    procedureContent: {
        lineHeight: 1.6,
    },
    procedureText: {
        marginBottom: 8,
        textAlign: "justify",
    },
    heading1: {
        fontSize: 13,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 10,
    },
    heading2: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 8,
    },
    heading3: {
        fontSize: 11,
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 6,
    },
    paragraph: {
        marginBottom: 8,
        textAlign: "justify",
    },
    listItem: {
        flexDirection: "row",
        marginBottom: 5,
        marginLeft: 20,
    },
    listBullet: {
        width: 15,
    },
    listText: {
        flex: 1,
    },
    // Table styles
    table: {
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    },
    tableRowLast: {
        flexDirection: 'row',
    },
    tableHeaderCell: {
        flex: 1,
        padding: 5,
        backgroundColor: '#f0f0f0',
        borderRightWidth: 1,
        borderRightColor: '#000',
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'center',
    },
    tableHeaderCellLast: {
        flex: 1,
        padding: 5,
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
        fontSize: 10,
        textAlign: 'center',
    },
    tableCell: {
        flex: 1,
        padding: 5,
        borderRightWidth: 1,
        borderRightColor: '#000',
        fontSize: 10,
    },
    tableCellLast: {
        flex: 1,
        padding: 5,
        fontSize: 10,
    },
    // Footer - positioned at bottom of content area (page already has 40pt padding)
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 10,
        borderTop: "2pt solid #000",
        fontSize: 9,
        textAlign: "center",
        backgroundColor: "#ffffff",
    },
    footerNotice: {
        color: "#d32f2f",
        fontStyle: "italic",
        marginBottom: 5,
    },
    footerApproval: {
        marginTop: 10,
        fontSize: 10,
    },
    // Signature section styles
    signatureSection: {
        marginTop: 30,
        paddingTop: 20,
        borderTop: "1pt solid #000",
    },
    signatureSectionTitle: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 15,
        textAlign: "center",
    },
    signatureRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginBottom: 20,
    },
    signatureBox: {
        width: 95,
        alignItems: "center",
    },
    signatureTitle: {
        fontSize: 9,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
    },
    signatureImageContainer: {
        width: 80,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 5,
        justifyContent: "center",
        alignItems: "center",
    },
    signatureImage: {
        maxWidth: 75,
        maxHeight: 35,
        objectFit: "contain",
    },
    signatureName: {
        fontSize: 8,
        textAlign: "center",
        fontWeight: "bold",
    },
    signaturePosition: {
        fontSize: 7,
        textAlign: "center",
        color: "#666",
    },
    signatureDate: {
        fontSize: 7,
        textAlign: "center",
        color: "#999",
        marginTop: 2,
    },
    stampBox: {
        width: 100,
        alignItems: "center",
    },
    stampImage: {
        width: 80,
        height: 80,
        objectFit: "contain",
    },
    stampOverlay: {
        position: "absolute",
        bottom: 60,
        right: 0,
    },
    stampOverlayImage: {
        width: 70,
        height: 70,
        objectFit: "contain",
    },
});

// Signature data for PDF
export interface PdfSignatureData {
    title: string;
    name: string;
    position: string;
    signature: string | null; // base64 image
    signedAt?: string | null;
}

// Extended additional data with signatures for final PDF
export interface PdfAdditionalData {
    documentTypeName: string;
    destinationDepartmentName: string;
    reviewerName?: string;
    approverName?: string;
    acknowledgedName?: string;
    reviewerNames?: string[];
    approverNames?: string[];
    acknowledgedNames?: string[];
    // Signature data for final PDF
    signatures?: {
        preparedBy?: PdfSignatureData;
        reviewers?: PdfSignatureData[];
        approvers?: PdfSignatureData[];
        acknowledgers?: PdfSignatureData[];
    };
    companyStamp?: string; // base64 image
    includeSignatures?: boolean; // Flag to include signature section
}

interface DocumentPdfTemplateProps {
    formData: DocumentFormData;
    additionalData: PdfAdditionalData;
}

interface ParsedElement {
    type: 'heading' | 'paragraph' | 'listItem' | 'table' | 'text' | 'br';
    content?: string;
    style?: object;
    estimatedHeight: number;
    element: React.ReactElement;
}

// Helper function to format date
const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    return `${String(date.getDate()).padStart(2, "0")} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Helper function to get document type title
const getDocumentTypeTitle = (documentTypeName: string): string => {
    const typeMap: Record<string, string> = {
        "Standard Operating Procedure": "STANDARD OPERATING PROCEDURES",
        "Work Instruction": "WORK INSTRUCTION",
        "Specification": "SPECIFICATION",
        "Form": "FORM",
        "Formulir": "FORMULIR",
        "Policy": "POLICY",
        "Manual": "MANUAL",
        "Standard": "STANDARD",
        "One Point Lessons": "ONE POINT LESSONS",
        "Quality Standard": "QUALITY STANDARD",
    };
    return typeMap[documentTypeName] || "DOCUMENT";
};

// Helper function to get document title label
const getDocumentTitleLabel = (documentTypeName: string): string => {
    const labelMap: Record<string, string> = {
        "Formulir": "JUDUL FORMULIR",
    };
    return labelMap[documentTypeName] || "JUDUL DOKUMEN";
};

// Helper to clean text from HTML entities only (preserve for plain text extraction)
const cleanText = (text: string): string => {
    return text
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();
};

// Helper to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
    return text
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
};

// Interface for styled text segments
interface StyledSegment {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
}

// Parse inline formatting (bold, italic, underline) from HTML
const parseInlineFormatting = (html: string): StyledSegment[] => {
    const segments: StyledSegment[] = [];

    // Simple regex-based parsing for inline tags
    const tagPattern = /<(\/?)(?:strong|b|em|i|u)>|([^<]+)/gi;
    let match;

    let bold = false;
    let italic = false;
    let underline = false;

    while ((match = tagPattern.exec(html)) !== null) {
        const isClosing = match[1] === '/';
        const tagMatch = match[0].toLowerCase();
        const textContent = match[2];

        if (tagMatch.includes('<strong') || tagMatch.includes('<b>') || tagMatch.includes('</strong') || tagMatch.includes('</b>')) {
            bold = !isClosing;
        } else if (tagMatch.includes('<em') || tagMatch.includes('<i>') || tagMatch.includes('</em') || tagMatch.includes('</i>')) {
            italic = !isClosing;
        } else if (tagMatch.includes('<u') || tagMatch.includes('</u')) {
            underline = !isClosing;
        } else if (textContent) {
            const decodedText = decodeHtmlEntities(textContent);
            if (decodedText.trim() || decodedText.includes(' ')) {
                segments.push({
                    text: decodedText,
                    bold,
                    italic,
                    underline,
                });
            }
        }
    }

    return segments;
};

// Render styled segments as react-pdf Text elements
const renderStyledText = (segments: StyledSegment[], baseStyle: PdfStyle | PdfStyle[], key: number): React.ReactElement => {
    if (segments.length === 0) {
        return <Text key={key} style={baseStyle}></Text>;
    }

    // If all segments have no special styling, just render plain text
    const hasFormatting = segments.some(s => s.bold || s.italic || s.underline);
    if (!hasFormatting) {
        return <Text key={key} style={baseStyle}>{segments.map(s => s.text).join('')}</Text>;
    }

    return (
        <Text key={key} style={baseStyle}>
            {segments.map((segment, idx) => {
                const textStyle: { fontFamily?: string; textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through' } = {};

                if (segment.bold && segment.italic) {
                    textStyle.fontFamily = 'Helvetica-BoldOblique';
                } else if (segment.bold) {
                    textStyle.fontFamily = 'Helvetica-Bold';
                } else if (segment.italic) {
                    textStyle.fontFamily = 'Helvetica-Oblique';
                }

                if (segment.underline) {
                    textStyle.textDecoration = 'underline';
                }

                if (Object.keys(textStyle).length > 0) {
                    return <Text key={idx} style={textStyle}>{segment.text}</Text>;
                }
                return segment.text;
            })}
        </Text>
    );
};

// Estimate text height based on content length (conservative estimate)
const estimateTextHeight = (text: string, fontSize: number = 11): number => {
    const charsPerLine = 65; // Conservative: fewer chars per line = more lines estimated
    const lines = Math.ceil(text.length / charsPerLine);
    return Math.max(lines * LINE_HEIGHT, LINE_HEIGHT) + PARAGRAPH_MARGIN;
};

// Helper function to parse HTML and render as React PDF components with height estimation
const parseHtmlContentWithHeight = (html: string): ParsedElement[] => {
    if (!html) return [];

    const elements: ParsedElement[] = [];
    let key = 0;

    const normalizedHtml = html.replace(/>\s+</g, '><').trim();
    const tagRegex = /<(\/?)(\w+)([^>]*)>|([^<]+)/g;
    const tokens: { type: string; tag?: string; content?: string; isClosing?: boolean; raw?: string }[] = [];
    let match;

    while ((match = tagRegex.exec(normalizedHtml)) !== null) {
        if (match[2]) {
            tokens.push({
                type: 'tag',
                tag: match[2].toLowerCase(),
                isClosing: match[1] === '/',
                raw: match[0], // Keep raw HTML tag
            });
        } else if (match[4]) {
            tokens.push({
                type: 'text',
                content: match[4],
                raw: match[4],
            });
        }
    }

    // Inline tags that should be preserved when collecting content
    const inlineTags = ['strong', 'b', 'em', 'i', 'u'];

    let i = 0;
    let orderedListCounter = 0;

    const processTokens = (): void => {
        while (i < tokens.length) {
            const token = tokens[i];

            if (token.type === 'tag' && !token.isClosing) {
                const tagName = token.tag;

                // Handle headings
                if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
                    i++;
                    let rawContent = '';
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === tagName) {
                            i++;
                            break;
                        }
                        // Preserve inline formatting tags
                        if (t.type === 'tag' && inlineTags.includes(t.tag || '')) {
                            rawContent += t.raw || '';
                        } else if (t.type === 'text') {
                            rawContent += t.raw || t.content || '';
                        }
                        i++;
                    }
                    const style = tagName === 'h1' ? styles.heading1 : tagName === 'h2' ? styles.heading2 : styles.heading3;
                    const segments = parseInlineFormatting(rawContent);
                    const plainText = cleanText(rawContent);
                    elements.push({
                        type: 'heading',
                        content: plainText,
                        estimatedHeight: HEADING_HEIGHT,
                        element: renderStyledText(segments, style, key++)
                    });
                    continue;
                }

                // Handle paragraphs
                if (tagName === 'p') {
                    i++;
                    let rawContent = '';
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'p') {
                            i++;
                            break;
                        }
                        // Preserve inline formatting tags
                        if (t.type === 'tag' && inlineTags.includes(t.tag || '')) {
                            rawContent += t.raw || '';
                        } else if (t.type === 'text') {
                            rawContent += t.raw || t.content || '';
                        }
                        i++;
                    }
                    const plainText = cleanText(rawContent);
                    if (plainText) {
                        const segments = parseInlineFormatting(rawContent);
                        elements.push({
                            type: 'paragraph',
                            content: plainText,
                            estimatedHeight: estimateTextHeight(plainText),
                            element: renderStyledText(segments, styles.paragraph, key++)
                        });
                    }
                    continue;
                }

                // Handle unordered lists
                if (tagName === 'ul') {
                    i++;
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'ul') {
                            i++;
                            break;
                        }
                        if (t.type === 'tag' && !t.isClosing && t.tag === 'li') {
                            i++;
                            let rawContent = '';
                            while (i < tokens.length) {
                                const liToken = tokens[i];
                                if (liToken.type === 'tag' && liToken.isClosing && liToken.tag === 'li') {
                                    i++;
                                    break;
                                }
                                // Preserve inline formatting tags
                                if (liToken.type === 'tag' && inlineTags.includes(liToken.tag || '')) {
                                    rawContent += liToken.raw || '';
                                } else if (liToken.type === 'text') {
                                    rawContent += liToken.raw || liToken.content || '';
                                }
                                i++;
                            }
                            const plainText = cleanText(rawContent);
                            const segments = parseInlineFormatting(rawContent);
                            const listKey = key++;
                            elements.push({
                                type: 'listItem',
                                content: plainText,
                                estimatedHeight: LIST_ITEM_HEIGHT,
                                element: (
                                    <View key={listKey} style={styles.listItem}>
                                        <Text style={styles.listBullet}>•</Text>
                                        {renderStyledText(segments, styles.listText, listKey * 1000)}
                                    </View>
                                )
                            });
                            continue;
                        }
                        i++;
                    }
                    continue;
                }

                // Handle ordered lists
                if (tagName === 'ol') {
                    i++;
                    orderedListCounter = 0;
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'ol') {
                            i++;
                            break;
                        }
                        if (t.type === 'tag' && !t.isClosing && t.tag === 'li') {
                            i++;
                            orderedListCounter++;
                            let rawContent = '';
                            while (i < tokens.length) {
                                const liToken = tokens[i];
                                if (liToken.type === 'tag' && liToken.isClosing && liToken.tag === 'li') {
                                    i++;
                                    break;
                                }
                                // Preserve inline formatting tags
                                if (liToken.type === 'tag' && inlineTags.includes(liToken.tag || '')) {
                                    rawContent += liToken.raw || '';
                                } else if (liToken.type === 'text') {
                                    rawContent += liToken.raw || liToken.content || '';
                                }
                                i++;
                            }
                            const plainText = cleanText(rawContent);
                            const segments = parseInlineFormatting(rawContent);
                            const bulletNum = orderedListCounter;
                            const listKey = key++;
                            elements.push({
                                type: 'listItem',
                                content: plainText,
                                estimatedHeight: LIST_ITEM_HEIGHT,
                                element: (
                                    <View key={listKey} style={styles.listItem}>
                                        <Text style={styles.listBullet}>{bulletNum}.</Text>
                                        {renderStyledText(segments, styles.listText, listKey * 1000)}
                                    </View>
                                )
                            });
                            continue;
                        }
                        i++;
                    }
                    continue;
                }

                // Handle blockquote
                if (tagName === 'blockquote') {
                    i++;
                    let rawContent = '';
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'blockquote') {
                            i++;
                            break;
                        }
                        // Preserve inline formatting tags
                        if (t.type === 'tag' && inlineTags.includes(t.tag || '')) {
                            rawContent += t.raw || '';
                        } else if (t.type === 'text') {
                            rawContent += t.raw || t.content || '';
                        }
                        i++;
                    }
                    const plainText = cleanText(rawContent);
                    const segments = parseInlineFormatting(rawContent);
                    const blockquoteStyle = [styles.paragraph, { fontStyle: 'italic' as const, paddingLeft: 15, borderLeftWidth: 3, borderLeftColor: '#ccc' }];
                    elements.push({
                        type: 'paragraph',
                        content: plainText,
                        estimatedHeight: estimateTextHeight(plainText) + 10,
                        element: renderStyledText(segments, blockquoteStyle, key++)
                    });
                    continue;
                }

                // Handle tables
                if (tagName === 'table') {
                    i++;
                    const tableRows: React.ReactElement[] = [];
                    let rowKey = 0;
                    let totalRows = 0;

                    let tempI = i;
                    while (tempI < tokens.length) {
                        const t = tokens[tempI];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'table') break;
                        if (t.type === 'tag' && !t.isClosing && t.tag === 'tr') totalRows++;
                        tempI++;
                    }

                    let currentRow = 0;
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'table') {
                            i++;
                            break;
                        }

                        if (t.type === 'tag' && !t.isClosing && (t.tag === 'thead' || t.tag === 'tbody')) {
                            i++;
                            continue;
                        }
                        if (t.type === 'tag' && t.isClosing && (t.tag === 'thead' || t.tag === 'tbody')) {
                            i++;
                            continue;
                        }

                        if (t.type === 'tag' && !t.isClosing && t.tag === 'tr') {
                            i++;
                            currentRow++;
                            const cells: React.ReactElement[] = [];
                            let cellKey = 0;
                            let totalCells = 0;

                            let tempJ = i;
                            while (tempJ < tokens.length) {
                                const ct = tokens[tempJ];
                                if (ct.type === 'tag' && ct.isClosing && ct.tag === 'tr') break;
                                if (ct.type === 'tag' && !ct.isClosing && (ct.tag === 'th' || ct.tag === 'td')) totalCells++;
                                tempJ++;
                            }

                            let currentCell = 0;
                            while (i < tokens.length) {
                                const cellToken = tokens[i];
                                if (cellToken.type === 'tag' && cellToken.isClosing && cellToken.tag === 'tr') {
                                    i++;
                                    break;
                                }

                                if (cellToken.type === 'tag' && !cellToken.isClosing && cellToken.tag === 'th') {
                                    i++;
                                    currentCell++;
                                    let rawContent = '';
                                    while (i < tokens.length) {
                                        const innerToken = tokens[i];
                                        if (innerToken.type === 'tag' && innerToken.isClosing && innerToken.tag === 'th') {
                                            i++;
                                            break;
                                        }
                                        // Preserve inline formatting tags
                                        if (innerToken.type === 'tag' && inlineTags.includes(innerToken.tag || '')) {
                                            rawContent += innerToken.raw || '';
                                        } else if (innerToken.type === 'text') {
                                            rawContent += innerToken.raw || innerToken.content || '';
                                        }
                                        i++;
                                    }
                                    const isLastCell = currentCell === totalCells;
                                    const segments = parseInlineFormatting(rawContent);
                                    const thKey = cellKey++;
                                    cells.push(
                                        <View key={thKey} style={isLastCell ? styles.tableHeaderCellLast : styles.tableHeaderCell}>
                                            {renderStyledText(segments, {}, thKey * 1000)}
                                        </View>
                                    );
                                    continue;
                                }

                                if (cellToken.type === 'tag' && !cellToken.isClosing && cellToken.tag === 'td') {
                                    i++;
                                    currentCell++;
                                    let rawContent = '';
                                    while (i < tokens.length) {
                                        const innerToken = tokens[i];
                                        if (innerToken.type === 'tag' && innerToken.isClosing && innerToken.tag === 'td') {
                                            i++;
                                            break;
                                        }
                                        // Preserve inline formatting tags
                                        if (innerToken.type === 'tag' && inlineTags.includes(innerToken.tag || '')) {
                                            rawContent += innerToken.raw || '';
                                        } else if (innerToken.type === 'text') {
                                            rawContent += innerToken.raw || innerToken.content || '';
                                        }
                                        i++;
                                    }
                                    const isLastCell = currentCell === totalCells;
                                    const segments = parseInlineFormatting(rawContent);
                                    const tdKey = cellKey++;
                                    cells.push(
                                        <View key={tdKey} style={isLastCell ? styles.tableCellLast : styles.tableCell}>
                                            {renderStyledText(segments, {}, tdKey * 1000)}
                                        </View>
                                    );
                                    continue;
                                }

                                i++;
                            }

                            const isLastRow = currentRow === totalRows;
                            tableRows.push(
                                <View key={rowKey++} style={isLastRow ? styles.tableRowLast : styles.tableRow}>
                                    {cells}
                                </View>
                            );
                            continue;
                        }

                        i++;
                    }

                    const tableHeight = (totalRows + 1) * TABLE_ROW_HEIGHT + 20; // +1 for header, +20 for margins
                    elements.push({
                        type: 'table',
                        estimatedHeight: tableHeight,
                        element: (
                            <View key={key++} style={styles.table}>
                                {tableRows}
                            </View>
                        )
                    });
                    continue;
                }

                // Handle line breaks
                if (tagName === 'br') {
                    elements.push({
                        type: 'br',
                        estimatedHeight: LINE_HEIGHT,
                        element: <Text key={key++}>{"\n"}</Text>
                    });
                    i++;
                    continue;
                }
            }

            // Handle standalone text
            if (token.type === 'text') {
                const cleaned = cleanText(token.content || '');
                if (cleaned) {
                    elements.push({
                        type: 'text',
                        content: cleaned,
                        estimatedHeight: estimateTextHeight(cleaned),
                        element: <Text key={key++} style={styles.paragraph}>{cleaned}</Text>
                    });
                }
            }

            i++;
        }
    };

    processTokens();
    return elements;
};

// Split elements into pages based on estimated heights
const splitIntoPages = (elements: ParsedElement[], firstPageHeight: number, otherPagesHeight: number): ParsedElement[][] => {
    const pages: ParsedElement[][] = [];
    let currentPage: ParsedElement[] = [];
    let currentHeight = 0;
    let isFirstPage = true;
    const maxHeight = isFirstPage ? firstPageHeight : otherPagesHeight;

    for (const element of elements) {
        const pageMaxHeight = isFirstPage ? firstPageHeight : otherPagesHeight;

        if (currentHeight + element.estimatedHeight > pageMaxHeight && currentPage.length > 0) {
            // Start new page
            pages.push(currentPage);
            currentPage = [element];
            currentHeight = element.estimatedHeight;
            isFirstPage = false;
        } else {
            currentPage.push(element);
            currentHeight += element.estimatedHeight;
        }
    }

    // Add last page
    if (currentPage.length > 0) {
        pages.push(currentPage);
    }

    return pages;
};

// Header Component
const HeaderKopSurat: React.FC<{
    documentTypeTitle: string;
    documentCode: string;
    departmentName: string;
    effectiveDate: string;
    pageNumber: number;
    totalPages: number;
    documentTitleLabel?: string;
    documentTitle?: string;
}> = ({ documentTypeTitle, documentCode, departmentName, effectiveDate, pageNumber, totalPages, documentTitleLabel, documentTitle }) => (
    <View style={styles.header}>
        {/* Logo Section - Left */}
        <View style={styles.headerLogo}>
            <Image style={styles.logoImage} src="/PPA.jpg" />
        </View>

        {/* Main Header Content - Right */}
        <View style={styles.headerContent}>
            {/* Company Title - Top */}
            <View style={styles.headerTitle}>
                <Text style={styles.headerTitleMain}>PT. PESTA PORA ABADI</Text>
            </View>

            {/* Body - 2 columns */}
            <View style={styles.headerBody}>
                {/* Left Column - Document Type + Title */}
                <View style={styles.headerBodyLeft}>
                    <View style={styles.headerDocType}>
                        <Text style={styles.headerDocTypeText}>{documentTypeTitle}</Text>
                    </View>
                    <View style={styles.headerDocTitleBox}>
                        <Text style={styles.headerDocTitleLabel}>{documentTitleLabel || ""}</Text>
                        <Text style={styles.headerDocTitleValue}>{documentTitle || ""}</Text>
                    </View>
                </View>

                {/* Right Column - Meta Information */}
                <View style={styles.headerBodyRight}>
                    <View style={styles.metaItemWithBorder}>
                        <Text style={styles.metaLabel}>No. Dokumen</Text>
                        <Text style={styles.metaValue}>: {documentCode || "-"}</Text>
                    </View>
                    <View style={styles.metaItemWithBorder}>
                        <Text style={styles.metaLabel}>Factory</Text>
                        <Text style={styles.metaValue}>: {departmentName || "-"}</Text>
                    </View>
                    <View style={styles.metaItemWithBorder}>
                        <Text style={styles.metaLabel}>Tgl Efektif</Text>
                        <Text style={styles.metaValue}>: {effectiveDate}</Text>
                    </View>
                    <View style={styles.metaItemLast}>
                        <Text style={styles.metaLabel}>Halaman</Text>
                        <Text style={styles.metaValue}>: {pageNumber} dari {totalPages}</Text>
                    </View>
                </View>
            </View>
        </View>
    </View>
);

// Footer Component
const FooterDisclaimer: React.FC = () => (
    <View style={styles.footer} fixed>
        <Text style={styles.footerNotice}>
            Dokumen ini ditandatangani secara elektronik melalui aplikasi DCMS
            {"\n"}
            Versi dokumen tercetak hanya tersedia pada aplikasi DCMS QMS Department. Semua dokumen yang berada diluar
            {"\n"}
            dari aplikasi DCMS, merupakan versi tidak tercontrol
        </Text>
        <Text style={styles.footerApproval}>
            Dikontrol oleh : QMS Department PT. Pesta Pora Abadi
        </Text>
    </View>
);

// Signature Box Component for PDF
const SignatureBox: React.FC<{
    data: PdfSignatureData;
}> = ({ data }) => {
    const formatSignatureDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return "";
        }
    };

    return (
        <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>{data.title}</Text>
            <View style={styles.signatureImageContainer}>
                {data.signature ? (
                    <Image style={styles.signatureImage} src={data.signature} />
                ) : (
                    <Text style={{ fontSize: 7, color: "#999" }}>-</Text>
                )}
            </View>
            <Text style={styles.signatureName}>{data.name}</Text>
            <Text style={styles.signaturePosition}>({data.position})</Text>
            {data.signedAt && (
                <Text style={styles.signatureDate}>{formatSignatureDate(data.signedAt)}</Text>
            )}
        </View>
    );
};

// Signature Section Component for PDF
const SignatureSection: React.FC<{
    signatures?: {
        preparedBy?: PdfSignatureData;
        reviewers?: PdfSignatureData[];
        approvers?: PdfSignatureData[];
        acknowledgers?: PdfSignatureData[];
    };
}> = ({ signatures }) => {
    if (!signatures) return null;

    const allSignatures: PdfSignatureData[] = [];

    // Add prepared by
    if (signatures.preparedBy) {
        allSignatures.push(signatures.preparedBy);
    }

    // Add reviewers
    if (signatures.reviewers) {
        allSignatures.push(...signatures.reviewers);
    }

    // Add approvers
    if (signatures.approvers) {
        allSignatures.push(...signatures.approvers);
    }

    // Add acknowledgers
    if (signatures.acknowledgers) {
        allSignatures.push(...signatures.acknowledgers);
    }

    // Split signatures into rows of 5
    const rows: PdfSignatureData[][] = [];
    for (let i = 0; i < allSignatures.length; i += 5) {
        rows.push(allSignatures.slice(i, i + 5));
    }

    return (
        <View style={styles.signatureSection}>
            <Text style={styles.signatureSectionTitle}>LEMBAR PENGESAHAN</Text>

            {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.signatureRow}>
                    {row.map((sig, sigIndex) => (
                        <SignatureBox key={sigIndex} data={sig} />
                    ))}
                </View>
            ))}
        </View>
    );
};

export const DocumentPdfTemplate: React.FC<DocumentPdfTemplateProps> = ({
    formData,
    additionalData,
}) => {
    const parsedElements = parseHtmlContentWithHeight(formData.procedureContent);
    const documentTypeTitle = getDocumentTypeTitle(additionalData.documentTypeName);
    const documentTitleLabel = getDocumentTitleLabel(additionalData.documentTypeName);
    const effectiveDate = formatDate(formData.estimatedDistributionDate);

    // Split content into pages
    const contentPages = splitIntoPages(parsedElements, CONTENT_HEIGHT_FIRST_PAGE, CONTENT_HEIGHT_OTHER_PAGES);

    // Ensure at least one page
    const basePages = Math.max(contentPages.length, 1);
    // Add signature page if includeSignatures is true
    const hasSignatures = additionalData.includeSignatures && additionalData.signatures;
    const totalPages = hasSignatures ? basePages + 1 : basePages;

    return (
        <Document>
            {basePages === 0 || contentPages.length === 0 ? (
                // Single empty page
                <Page size="A4" style={styles.page}>
                    <HeaderKopSurat
                        documentTypeTitle={documentTypeTitle}
                        documentCode={formData.documentCode}
                        departmentName={formData.departmentName}
                        effectiveDate={effectiveDate}
                        pageNumber={1}
                        totalPages={totalPages}
                        documentTitleLabel={documentTitleLabel}
                        documentTitle={formData.documentTitle}
                    />
                    <View style={styles.procedureContent}>
                        <Text style={styles.procedureText}>Isi dokumen akan muncul di sini...</Text>
                    </View>
                    <FooterDisclaimer />
                    {/* Stamp overlay - bottom right corner */}
                    {additionalData.companyStamp && (
                        <View style={styles.stampOverlay}>
                            <Image style={styles.stampOverlayImage} src={additionalData.companyStamp} />
                        </View>
                    )}
                </Page>
            ) : (
                // Multiple pages with content
                contentPages.map((pageElements, pageIndex) => (
                    <Page key={pageIndex} size="A4" style={styles.page}>
                        <HeaderKopSurat
                            documentTypeTitle={documentTypeTitle}
                            documentCode={formData.documentCode}
                            departmentName={formData.departmentName}
                            effectiveDate={effectiveDate}
                            pageNumber={pageIndex + 1}
                            totalPages={totalPages}
                            documentTitleLabel={pageIndex === 0 ? documentTitleLabel : ""}
                            documentTitle={pageIndex === 0 ? formData.documentTitle : ""}
                        />

                        {/* Page content */}
                        <View style={styles.procedureContent}>
                            {pageElements.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    {item.element}
                                </React.Fragment>
                            ))}
                        </View>

                        <FooterDisclaimer />
                        {/* Stamp overlay - bottom right corner */}
                        {additionalData.companyStamp && (
                            <View style={styles.stampOverlay}>
                                <Image style={styles.stampOverlayImage} src={additionalData.companyStamp} />
                            </View>
                        )}
                    </Page>
                ))
            )}

            {/* Signature Page - Added at the end when includeSignatures is true */}
            {hasSignatures && (
                <Page size="A4" style={styles.page}>
                    <HeaderKopSurat
                        documentTypeTitle={documentTypeTitle}
                        documentCode={formData.documentCode}
                        departmentName={formData.departmentName}
                        effectiveDate={effectiveDate}
                        pageNumber={totalPages}
                        totalPages={totalPages}
                        documentTitleLabel=""
                        documentTitle=""
                    />

                    <SignatureSection
                        signatures={additionalData.signatures}
                    />

                    <FooterDisclaimer />
                    {/* Stamp overlay - bottom right corner */}
                    {additionalData.companyStamp && (
                        <View style={styles.stampOverlay}>
                            <Image style={styles.stampOverlayImage} src={additionalData.companyStamp} />
                        </View>
                    )}
                </Page>
            )}
        </Document>
    );
};
