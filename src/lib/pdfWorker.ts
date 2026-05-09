import * as pdfjsLib from "pdfjs-dist"
// @ts-ignore - This is a Vite feature to get the worker URL
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url"

export const setupPdfWorker = () => {
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
  }
}

export { pdfjsLib }
