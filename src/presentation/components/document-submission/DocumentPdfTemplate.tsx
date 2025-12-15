import React from "react";
import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
} from "@react-pdf/renderer";
import { DocumentFormData } from "@/presentation/components/document-submission";

// Define styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: "Helvetica",
        lineHeight: 1.5,
    },
    // Header / Kop Surat
    header: {
        flexDirection: "row",
        border: "2px solid #000",
        marginBottom: 20,
    },
    headerLogo: {
        width: 100,
        borderRight: "2px solid #000",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    logoBox: {
        width: 80,
        height: 60,
        border: "2px solid #000",
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
        borderBottom: "2px solid #000",
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
        borderRight: "2px solid #000",
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
        marginVertical: 20,
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
    // Footer
    footer: {
        marginTop: 30,
        paddingTop: 15,
        borderTop: "2px solid #000",
        fontSize: 9,
        textAlign: "center",
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

// Helper function to parse HTML and render as React PDF components
const parseHtmlContent = (html: string): React.ReactElement[] => {
    if (!html) return [];

    const elements: React.ReactElement[] = [];
    const blocks = html.split(/(<h[1-6]>.*?<\/h[1-6]>|<p>.*?<\/p>|<ul>.*?<\/ul>|<ol>.*?<\/ol>|<br\s*\/?>)/gi);

    let key = 0;

    blocks.forEach((block) => {
        if (!block.trim()) return;

        // Headings
        const h1Match = block.match(/<h1>(.*?)<\/h1>/i);
        if (h1Match) {
            elements.push(
                <Text key={key++} style={styles.heading1}>
                    {cleanText(h1Match[1])}
                </Text>
            );
            return;
        }

        const h2Match = block.match(/<h2>(.*?)<\/h2>/i);
        if (h2Match) {
            elements.push(
                <Text key={key++} style={styles.heading2}>
                    {cleanText(h2Match[1])}
                </Text>
            );
            return;
        }

        const h3Match = block.match(/<h3>(.*?)<\/h3>/i);
        if (h3Match) {
            elements.push(
                <Text key={key++} style={styles.heading3}>
                    {cleanText(h3Match[1])}
                </Text>
            );
            return;
        }

        // Paragraphs
        const pMatch = block.match(/<p>(.*?)<\/p>/i);
        if (pMatch) {
            const content = pMatch[1];
            elements.push(
                <Text key={key++} style={styles.paragraph}>
                    {renderInlineElements(content)}
                </Text>
            );
            return;
        }

        // Unordered lists
        const ulMatch = block.match(/<ul>([\s\S]*?)<\/ul>/i);
        if (ulMatch) {
            const items = ulMatch[1].match(/<li>(.*?)<\/li>/gi) || [];
            items.forEach((item) => {
                const itemContent = item.replace(/<\/?li>/gi, "");
                elements.push(
                    <View key={key++} style={styles.listItem}>
                        <Text style={styles.listBullet}>•</Text>
                        <Text style={styles.listText}>{cleanText(itemContent)}</Text>
                    </View>
                );
            });
            return;
        }

        // Ordered lists
        const olMatch = block.match(/<ol>([\s\S]*?)<\/ol>/i);
        if (olMatch) {
            const items = olMatch[1].match(/<li>(.*?)<\/li>/gi) || [];
            items.forEach((item, index) => {
                const itemContent = item.replace(/<\/?li>/gi, "");
                elements.push(
                    <View key={key++} style={styles.listItem}>
                        <Text style={styles.listBullet}>{index + 1}.</Text>
                        <Text style={styles.listText}>{cleanText(itemContent)}</Text>
                    </View>
                );
            });
            return;
        }

        // Line breaks
        if (block.match(/<br\s*\/?>/i)) {
            elements.push(<Text key={key++}>{"\n"}</Text>);
            return;
        }

        // Plain text (fallback)
        const cleaned = cleanText(block);
        if (cleaned) {
            elements.push(
                <Text key={key++} style={styles.paragraph}>
                    {cleaned}
                </Text>
            );
        }
    });

    return elements;
};

// Helper to render inline elements (bold, italic, underline)
const renderInlineElements = (text: string): string => {
    return cleanText(text);
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

export const DocumentPdfTemplate: React.FC<DocumentPdfTemplateProps> = ({
    formData,
    additionalData,
}) => {
    const procedureElements = parseHtmlContent(formData.procedureContent);
    const documentTypeTitle = getDocumentTypeTitle(additionalData.documentTypeName);
    const documentTitleLabel = getDocumentTitleLabel(additionalData.documentTypeName);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header / Kop Surat */}
                <View style={styles.header}>
                    <View style={styles.headerLogo}>
                        <View style={styles.logoBox}>
                            <Text style={styles.logoText}>PESTA{"\n"}PORA{"\n"}ABADI</Text>
                        </View>
                    </View>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTitle}>
                            <Text style={styles.headerTitleMain}>PT. PESTA PORA ABADI</Text>
                            <Text style={styles.headerTitleSub}>
                                {documentTypeTitle}
                            </Text>
                        </View>
                        <View style={styles.headerMeta}>
                            <View style={[styles.headerMetaCol, styles.headerMetaColLeft]}>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>No. Dokumen</Text>
                                    <Text style={styles.metaValue}>
                                        : {formData.documentCode || "-"}
                                    </Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>Factory</Text>
                                    <Text style={styles.metaValue}>
                                        : {formData.departmentName || "-"}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.headerMetaCol}>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>Tgl Efektif</Text>
                                    <Text style={styles.metaValue}>
                                        : {formatDate(formData.estimatedDistributionDate)}
                                    </Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Text style={styles.metaLabel}>Halaman</Text>
                                    <Text style={styles.metaValue}>: 1 dari XX</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Document Title */}
                <Text style={styles.docTitle}>
                    {documentTitleLabel}
                </Text>
                <Text style={[styles.docTitle, { marginTop: 5 }]}>
                    {formData.documentTitle || ""}
                </Text>

                {/* Procedure Content */}
                <View style={styles.procedureContent}>
                    {procedureElements.length > 0 ? (
                        procedureElements
                    ) : (
                        <Text style={styles.procedureText}>
                            Isi dokumen akan muncul di sini...
                        </Text>
                    )}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
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
            </Page>
        </Document>
    );
};
