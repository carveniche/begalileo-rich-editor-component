import React, { useEffect, useRef, useState } from "react";
import { Document, Page ,pdfjs } from "react-pdf";
import { PDFDocument } from "pdf-lib";
import Sketchpad from "./Sketchpad";
import ScratchPadIcons from "./SketchPadIcons";
import { CircularProgress } from "@mui/material";
import { useAppStore } from "../components/Store/AppContext";
// import pdfbase64 from "./pdfbase64";
// import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PdfViewer({ pdf }) {
    // pdf = pdfbase64()
    const [numPages, setNumPages] = useState(null);
    const pageCanvasRefs = useRef([]);
    const pageSizeRefs = useRef([]);
    const [strokeColor, setStrokeColor] = useState("#000000");
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [selectedColor, setSelectedColor] = useState("#000000");
    const [canvasColor] = useState("#ffffff");
    const [isEraser, setIsEraser] = useState(false);
    const [activePage, setActivePage] = useState(0); // page index
    const { userType } = useAppStore()

    /** Load PDF pages count */
    function onLoadSuccess({ numPages }) {
        setNumPages(numPages);

        pageCanvasRefs.current = Array(numPages)
            .fill()
            .map(() => React.createRef());
    }

    /** Store PDF page rendered size */
    function storePageSize(page, index) {
        const viewport = page.getViewport({ scale: 1 });
        pageSizeRefs.current[index] = {
            width: viewport.width,
            height: viewport.height,
        };
    }

    /** SAVE annotated PDF */
    async function generatePdfAnnotated() {
        const originalBytes = await fetch(pdf).then((res) => res.arrayBuffer());
        if(userType === "student"){
            return new Blob([originalBytes], { type: "application/pdf" });
        }
        if (!originalBytes) return null;
        const pdfDoc = await PDFDocument.load(originalBytes);
        const pages = pdfDoc.getPages();
        for (let i = 0; i < pages.length; i++) {
            const canvas = pageCanvasRefs.current[i]?.current;
            if (!canvas) continue;

            const pngData = await canvas.exportImage("png");
            const png = await pdfDoc.embedPng(pngData);

            const page = pages[i];
            const { width, height } = page.getSize();

            page.drawImage(png, {
                x: 0,
                y: 0,
                width,
                height,
            });
        }

        // const finalPdfBytes = await pdfDoc.save();
        const finalPdfBytes = await pdfDoc.save({
            useObjectStreams: false
        });

        // const blob = new Blob([finalPdfBytes], { type: "application/pdf" });
        // console.log(URL.createObjectURL(blob),"blob")
        // const base64Pdf = btoa(
        //     new Uint8Array(finalPdfBytes).reduce((data, byte) => data + String.fromCharCode(byte), "")
        // );
       return new Blob([finalPdfBytes], { type: "application/pdf" });

        // window.open(URL.createObjectURL(blob));
    }

    async function getAnnotatedPdf() {
        const pdf = await generatePdfAnnotated();
        return pdf;
    }
    
    useEffect(() => {
        window.getAnnotatedPdf = getAnnotatedPdf;
      
        return () => {
          delete window.getAnnotatedPdf;
        };
      }, [pdf]);
      
    // window.getAnnotatedPdf = getAnnotatedPdf;

    return (
        <div style={{ display:'flex', width: "fit-content", height: "fit-content", maxWidth: '100%', maxHeight: '100%', position: 'relative', margin: '0 auto' }}>

            {/* Toolbar */}
            {userType == "teacher_review" &&
                <ScratchPadIcons
                    strokeColor={strokeColor}
                    setStrokeColor={setStrokeColor}
                    isEraser={isEraser}
                    setIsEraser={setIsEraser}
                    setSelectedColor={setSelectedColor}
                    selectedColor={selectedColor}
                    canvasColor={canvasColor}
                    canvasAllRef={pageCanvasRefs} // or toolbar for single page
                    activePage={activePage}
                />}


            {/* PDF Pages */}
            <div style={{ maxWidth: '100%', maxHeight:'calc(100% - 30px)', overflow: 'auto' }}
                id="pdf__container"
>
              <Document file={pdf} onLoadSuccess={onLoadSuccess}
                loading={<div className="pdf-loader"><CircularProgress color="secondary" /> <br /> Loading PDF...</div>}
            >
                {numPages &&
                 Array.from(new Array(numPages), (_, index) => (
                    <div
                        key={index}
                        onClick={() => setActivePage(index)}
                        style={{
                            position: "relative",
                            marginBottom: 40,
                            maxWidth: '100%',
                            width: pageSizeRefs.current[index]?.width,
                            height: pageSizeRefs.current[index]?.height,
                        }}
                    >
                        <Page
                            pageNumber={index + 1}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            onLoadSuccess={(page) => storePageSize(page, index)}
                        />

                        {/* Drawing Layer */}
                        {userType == "teacher_review" &&
                            <Sketchpad
                                canvasRef={pageCanvasRefs.current[index]}
                                strokeColor={strokeColor}
                                eraseMode={isEraser}
                                strokeWidth={strokeWidth}
                                cursor={isEraser ? "cell" : "crosshair"}
                            />
                        }
                    </div>
                ))}
            </Document>
            </div>
        </div>
    );
}
