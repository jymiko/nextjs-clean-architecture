"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PDFViewerProps {
  /** URL ke file PDF */
  file: string | null;
  className?: string;
  /** Tampilkan tombol download (default: false) */
  showDownload?: boolean;
}

export function PDFViewer({ file, className = "", showDownload = false }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);

  // Load pdfjs-dist dynamically
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        setPdfjsLib(pdfjs);
      } catch (err) {
        console.error("Failed to load pdfjs:", err);
        setError("Failed to load PDF library");
        setIsLoading(false);
      }
    };
    loadPdfjs();
  }, []);

  // Load PDF document
  useEffect(() => {
    if (!pdfjsLib || !file) return;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const loadingTask = pdfjsLib.getDocument(file);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        setError("Failed to load PDF document");
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfjsLib, file]);

  // Render all pages
  const renderAllPages = useCallback(async () => {
    if (!pdfDoc) return;

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const canvas = canvasRefs.current[pageNum - 1];
      if (!canvas) continue;

      try {
        const page = await pdfDoc.getPage(pageNum);
        const context = canvas.getContext("2d");

        if (!context) continue;

        const viewport = page.getViewport({ scale: 1.5 });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvas: canvas,
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (err) {
        console.error(`Failed to render page ${pageNum}:`, err);
      }
    }
  }, [pdfDoc]);

  useEffect(() => {
    if (pdfDoc && totalPages > 0) {
      renderAllPages();
    }
  }, [pdfDoc, totalPages, renderAllPages]);

  const downloadPdf = () => {
    if (file) {
      const link = document.createElement("a");
      link.href = file;
      link.download = file.split("/").pop() || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!file) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center bg-[#525659]">
          <div className="text-center text-white">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No document selected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* PDF Viewer - Scrollable */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-[#525659]"
      >
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
              <p className="text-sm text-gray-300">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-white">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">{error}</p>
              <Button
                variant="outline"
                onClick={downloadPdf}
                className="gap-2 mt-4"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex flex-col items-center gap-4 p-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <canvas
                key={index}
                ref={(el) => {
                  canvasRefs.current[index] = el;
                }}
                className="shadow-lg bg-white"
                style={{ maxWidth: "calc(100% - 32px)" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Download Control - Bottom Center */}
      {showDownload && (
        <div className="flex items-center justify-center px-4 py-2 bg-[#f5f5f5] border-t border-[#e1e2e3] shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadPdf}
            className="h-8 gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
}
