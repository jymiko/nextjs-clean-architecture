import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import { DocumentFormData } from "@/presentation/components/document-submission";

// A4 page dimensions in points: 595 x 842
// With 40pt padding, content area is 515 x 762
// Header ~100pt, Footer ~80pt, Document title ~60pt
// Available content area per page: ~520pt (first page with title), ~580pt (subsequent pages)

const CONTENT_HEIGHT_FIRST_PAGE = 320; // First page has title + header + footer space (very conservative)
const CONTENT_HEIGHT_OTHER_PAGES = 380; // Subsequent pages with header + footer space (very conservative)
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
    logoBox: {
        width: 80,
        height: 60,
        border: "2pt solid #000",
        justifyContent: "center",
        alignItems: "center",
    },
    logoText: {
        fontSize: 9,
        fontWeight: "bold",
        textAlign: "center",
        lineHeight: 1.2,
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
    metaLabel: {
        fontWeight: "bold",
        width: 80,
    },
    metaValue: {
        flex: 1,
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
});

interface DocumentPdfTemplateProps {
    formData: DocumentFormData;
    additionalData: {
        documentTypeName: string;
        destinationDepartmentName: string;
        reviewerName?: string;
        approverName?: string;
        acknowledgedName?: string;
    };
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
        "Formulir": "FORMULIR",
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

// Helper to clean text from HTML tags and entities
const cleanText = (text: string): string => {
    return text
        .replace(/<strong>(.*?)<\/strong>/gi, "$1")
        .replace(/<b>(.*?)<\/b>/gi, "$1")
        .replace(/<em>(.*?)<\/em>/gi, "$1")
        .replace(/<i>(.*?)<\/i>/gi, "$1")
        .replace(/<u>(.*?)<\/u>/gi, "$1")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .trim();
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
    const tokens: { type: string; tag?: string; content?: string; isClosing?: boolean }[] = [];
    let match;

    while ((match = tagRegex.exec(normalizedHtml)) !== null) {
        if (match[2]) {
            tokens.push({
                type: 'tag',
                tag: match[2].toLowerCase(),
                isClosing: match[1] === '/',
            });
        } else if (match[4]) {
            tokens.push({
                type: 'text',
                content: match[4],
            });
        }
    }

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
                    let content = '';
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === tagName) {
                            i++;
                            break;
                        }
                        if (t.type === 'text') {
                            content += t.content;
                        }
                        i++;
                    }
                    const style = tagName === 'h1' ? styles.heading1 : tagName === 'h2' ? styles.heading2 : styles.heading3;
                    const cleaned = cleanText(content);
                    elements.push({
                        type: 'heading',
                        content: cleaned,
                        estimatedHeight: HEADING_HEIGHT,
                        element: <Text key={key++} style={style}>{cleaned}</Text>
                    });
                    continue;
                }

                // Handle paragraphs
                if (tagName === 'p') {
                    i++;
                    let content = '';
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'p') {
                            i++;
                            break;
                        }
                        if (t.type === 'text') {
                            content += t.content;
                        }
                        i++;
                    }
                    const cleaned = cleanText(content);
                    if (cleaned) {
                        elements.push({
                            type: 'paragraph',
                            content: cleaned,
                            estimatedHeight: estimateTextHeight(cleaned),
                            element: <Text key={key++} style={styles.paragraph}>{cleaned}</Text>
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
                            let liContent = '';
                            while (i < tokens.length) {
                                const liToken = tokens[i];
                                if (liToken.type === 'tag' && liToken.isClosing && liToken.tag === 'li') {
                                    i++;
                                    break;
                                }
                                if (liToken.type === 'text') {
                                    liContent += liToken.content;
                                }
                                i++;
                            }
                            const cleaned = cleanText(liContent);
                            elements.push({
                                type: 'listItem',
                                content: cleaned,
                                estimatedHeight: LIST_ITEM_HEIGHT,
                                element: (
                                    <View key={key++} style={styles.listItem}>
                                        <Text style={styles.listBullet}>•</Text>
                                        <Text style={styles.listText}>{cleaned}</Text>
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
                            let liContent = '';
                            while (i < tokens.length) {
                                const liToken = tokens[i];
                                if (liToken.type === 'tag' && liToken.isClosing && liToken.tag === 'li') {
                                    i++;
                                    break;
                                }
                                if (liToken.type === 'text') {
                                    liContent += liToken.content;
                                }
                                i++;
                            }
                            const cleaned = cleanText(liContent);
                            const bulletNum = orderedListCounter;
                            elements.push({
                                type: 'listItem',
                                content: cleaned,
                                estimatedHeight: LIST_ITEM_HEIGHT,
                                element: (
                                    <View key={key++} style={styles.listItem}>
                                        <Text style={styles.listBullet}>{bulletNum}.</Text>
                                        <Text style={styles.listText}>{cleaned}</Text>
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
                    let content = '';
                    while (i < tokens.length) {
                        const t = tokens[i];
                        if (t.type === 'tag' && t.isClosing && t.tag === 'blockquote') {
                            i++;
                            break;
                        }
                        if (t.type === 'text') {
                            content += t.content;
                        }
                        i++;
                    }
                    const cleaned = cleanText(content);
                    elements.push({
                        type: 'paragraph',
                        content: cleaned,
                        estimatedHeight: estimateTextHeight(cleaned) + 10,
                        element: (
                            <Text key={key++} style={[styles.paragraph, { fontStyle: 'italic', paddingLeft: 15, borderLeftWidth: 3, borderLeftColor: '#ccc' }]}>
                                {cleaned}
                            </Text>
                        )
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
                                    let cellContent = '';
                                    while (i < tokens.length) {
                                        const innerToken = tokens[i];
                                        if (innerToken.type === 'tag' && innerToken.isClosing && innerToken.tag === 'th') {
                                            i++;
                                            break;
                                        }
                                        if (innerToken.type === 'text') {
                                            cellContent += innerToken.content;
                                        }
                                        i++;
                                    }
                                    const isLastCell = currentCell === totalCells;
                                    cells.push(
                                        <View key={cellKey++} style={isLastCell ? styles.tableHeaderCellLast : styles.tableHeaderCell}>
                                            <Text>{cleanText(cellContent)}</Text>
                                        </View>
                                    );
                                    continue;
                                }

                                if (cellToken.type === 'tag' && !cellToken.isClosing && cellToken.tag === 'td') {
                                    i++;
                                    currentCell++;
                                    let cellContent = '';
                                    while (i < tokens.length) {
                                        const innerToken = tokens[i];
                                        if (innerToken.type === 'tag' && innerToken.isClosing && innerToken.tag === 'td') {
                                            i++;
                                            break;
                                        }
                                        if (innerToken.type === 'text') {
                                            cellContent += innerToken.content;
                                        }
                                        i++;
                                    }
                                    const isLastCell = currentCell === totalCells;
                                    cells.push(
                                        <View key={cellKey++} style={isLastCell ? styles.tableCellLast : styles.tableCell}>
                                            <Text>{cleanText(cellContent)}</Text>
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
}> = ({ documentTypeTitle, documentCode, departmentName, effectiveDate, pageNumber, totalPages }) => (
    <View style={styles.header}>
        <View style={styles.headerLogo}>
            <View style={styles.logoBox}>
                <Text style={styles.logoText}>PESTA{"\n"}PORA{"\n"}ABADI</Text>
            </View>
        </View>
        <View style={styles.headerContent}>
            <View style={styles.headerTitle}>
                <Text style={styles.headerTitleMain}>PT. PESTA PORA ABADI</Text>
                <Text style={styles.headerTitleSub}>{documentTypeTitle}</Text>
            </View>
            <View style={styles.headerMeta}>
                <View style={[styles.headerMetaCol, styles.headerMetaColLeft]}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>No. Dokumen</Text>
                        <Text style={styles.metaValue}>: {documentCode || "-"}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Factory</Text>
                        <Text style={styles.metaValue}>: {departmentName || "-"}</Text>
                    </View>
                </View>
                <View style={styles.headerMetaCol}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Tgl Efektif</Text>
                        <Text style={styles.metaValue}>: {effectiveDate}</Text>
                    </View>
                    <View style={styles.metaItem}>
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
    const totalPages = Math.max(contentPages.length, 1);

    return (
        <Document>
            {totalPages === 0 || contentPages.length === 0 ? (
                // Single empty page
                <Page size="A4" style={styles.page}>
                    <HeaderKopSurat
                        documentTypeTitle={documentTypeTitle}
                        documentCode={formData.documentCode}
                        departmentName={formData.departmentName}
                        effectiveDate={effectiveDate}
                        pageNumber={1}
                        totalPages={1}
                    />
                    <Text style={styles.docTitle}>{documentTitleLabel}</Text>
                    <Text style={[styles.docTitle, { marginTop: 5 }]}>{formData.documentTitle || ""}</Text>
                    <View style={styles.procedureContent}>
                        <Text style={styles.procedureText}>Isi dokumen akan muncul di sini...</Text>
                    </View>
                    <FooterDisclaimer />
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
                        />

                        {/* Document title only on first page */}
                        {pageIndex === 0 && (
                            <>
                                <Text style={styles.docTitle}>{documentTitleLabel}</Text>
                                <Text style={[styles.docTitle, { marginTop: 5 }]}>{formData.documentTitle || ""}</Text>
                            </>
                        )}

                        {/* Page content */}
                        <View style={styles.procedureContent}>
                            {pageElements.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    {item.element}
                                </React.Fragment>
                            ))}
                        </View>

                        <FooterDisclaimer />
                    </Page>
                ))
            )}
        </Document>
    );
};
