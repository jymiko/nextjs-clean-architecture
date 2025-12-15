"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface PDFViewerProps {
  /** URL ke file PDF */
  file: string | null;
  className?: string;
  /** Tampilkan tombol download (default: false) */
  showDownload?: boolean;
  /** Tampilkan zoom controls (default: true) */
  showZoomControls?: boolean;
}

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];
const DEFAULT_SCALE = 1.5;

export function PDFViewer({ file, className = "", showDownload = false, showZoomControls = true }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<typeof import("pdfjs-dist") | null>(null);
  const [scale, setScale] = useState(DEFAULT_SCALE);

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

        const viewport = page.getViewport({ scale });

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
  }, [pdfDoc, scale]);

  useEffect(() => {
    if (pdfDoc && totalPages > 0) {
      renderAllPages();
    }
  }, [pdfDoc, totalPages, renderAllPages, scale]);

  // Zoom controls
  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level >= scale);
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setScale(ZOOM_LEVELS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(level => level >= scale);
    if (currentIndex > 0) {
      setScale(ZOOM_LEVELS[currentIndex - 1]);
    }
  };

  const handleFitToWidth = useCallback(async () => {
    if (!pdfDoc || !containerRef.current) return;

    try {
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1 });
      const containerWidth = containerRef.current.clientWidth - 64; // Subtract padding
      const newScale = containerWidth / viewport.width;
      setScale(Math.min(Math.max(newScale, ZOOM_LEVELS[0]), ZOOM_LEVELS[ZOOM_LEVELS.length - 1]));
    } catch (err) {
      console.error("Failed to calculate fit width:", err);
    }
  }, [pdfDoc]);

  const zoomPercentage = Math.round(scale * 100);

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
      {/* Zoom Controls - Top */}
      {showZoomControls && !isLoading && !error && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#38383d] border-b border-[#2a2a2e] shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= ZOOM_LEVELS[0]}
            className="h-8 w-8 p-0 text-white hover:bg-[#4a4a4f] disabled:opacity-50"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          <span className="text-white text-sm min-w-[60px] text-center font-medium">
            {zoomPercentage}%
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            className="h-8 w-8 p-0 text-white hover:bg-[#4a4a4f] disabled:opacity-50"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="w-px h-5 bg-[#5a5a5f] mx-2" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleFitToWidth}
            className="h-8 w-8 p-0 text-white hover:bg-[#4a4a4f]"
            title="Fit to Width"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      )}

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
