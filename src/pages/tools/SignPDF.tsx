import { useState, useRef, useEffect } from "react"
import { PDFDocument } from "pdf-lib"
import { fabric } from "fabric"
import SignatureCanvas from "react-signature-canvas"
import { PenTool, Download, Trash2, Plus, Type, Check, X, ShieldCheck, MousePointer2 } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/db"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"

import PageThumbnail from "@/components/tools/PageThumbnail"
import DownloadAction from "@/components/tools/DownloadAction"
import ResultPreview from "@/components/tools/ResultPreview"
import ErrorModal from "@/components/tools/ErrorModal"

export default function SignPDF() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<{ url: string, index: number }[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [fileError, setFileError] = useState<{ title: string, message: string, filename?: string, solution?: string } | null>(null)
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null)
  const [showSignModal, setShowSignModal] = useState(false)
  const [signType, setSignType] = useState<'draw' | 'type' | 'upload'>('draw')
  const [typedSign, setTypedSign] = useState("")
  const [signColor, setSignColor] = useState("#000000")
  const [placedSigns, setPlacedSigns] = useState<Record<number, string>>({}) // DataURLs of signature overlays per page

  const sigCanvas = useRef<SignatureCanvas>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  
  const savedSignatures = useLiveQuery(() => db.signatures.toArray())
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("sign-pdf")
    setupPdfWorker()
  }, [addRecentTool])

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setPlacedSigns({})
    setProcessedBlob(null)
    const toastId = toast.loading("Processing PDF...")

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pageList: { url: string, index: number }[] = []
      const pagesToLoad = Math.min(pdf.numPages, 30)

      for (let i = 1; i <= pagesToLoad; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.0 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({ canvasContext: ctx!, viewport, canvas }).promise
        pageList.push({ url: canvas.toDataURL(), index: i - 1 })
      }

      setPages(pageList)
      toast.success("Ready to sign!", { id: toastId })
    } catch (error: any) {
      console.error("PDF Load Error:", error)
      let title = "File Error"
      let message = "We couldn't open this PDF file."
      let solution = "Try a different file or ensure it's not password protected."

      if (error.name === "PasswordException") {
        title = "Password Protected"
        message = "This PDF is encrypted with a password and cannot be processed."
        solution = "Remove the password using a PDF unlocker tool first."
      } else if (error.message.includes("Invalid PDF structure")) {
        title = "Corrupted File"
        message = "The PDF structure is invalid or the file is corrupted."
        solution = "Try opening it in a PDF viewer and 'Printing to PDF' to create a healthy copy."
      }

      setFileError({ title, message, filename: selectedFile.name, solution })
      setFile(null)
      toast.error("Failed to load PDF.", { id: toastId })
    } finally {
      // Done
    }
  }

  // Initialize Fabric Canvas for the active page
  useEffect(() => {
    if (activePageIndex !== null && canvasRef.current && pages[activePageIndex]) {
      const img = new Image()
      img.src = pages[activePageIndex].url
      
      img.onload = () => {
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: img.width,
          height: img.height,
        })
        
        fabricRef.current = canvas

        // Set background
        fabric.Image.fromURL(pages[activePageIndex].url, (fImg) => {
          canvas.setBackgroundImage(fImg, canvas.renderAll.bind(canvas))
        })

        // Restore existing signs for this page if any
        // Note: For simplicity in this demo, we'll start fresh per page session
        // but we could store objects in state.
      }

      return () => {
        fabricRef.current?.dispose()
        fabricRef.current = null
      }
    }
  }, [activePageIndex, pages])

  const saveSignature = async () => {
    let dataUrl = ""
    if (signType === 'draw') {
      if (sigCanvas.current?.isEmpty()) return
      dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL() || ""
    } else if (signType === 'type') {
      if (!typedSign) return
      // Create a temporary canvas to render text as image
      const tempCanvas = document.createElement("canvas")
      tempCanvas.width = 400
      tempCanvas.height = 100
      const ctx = tempCanvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = signColor
        ctx.font = "italic 48px 'Brush Script MT', cursive"
        ctx.fillText(typedSign, 20, 60)
        dataUrl = tempCanvas.toDataURL()
      }
    }

    if (dataUrl) {
      await db.signatures.add({
        name: typedSign || "Handwritten",
        dataUrl,
        type: signType,
        createdAt: Date.now()
      })
      toast.success("Signature saved to library!")
      setShowSignModal(false)
      setTypedSign("")
      sigCanvas.current?.clear()
    }
  }

  const addSignatureToCanvas = (dataUrl: string) => {
    if (!fabricRef.current) return
    fabric.Image.fromURL(dataUrl, (fImg) => {
      fImg.scale(0.5)
      fImg.set({
        left: 100,
        top: 100,
        cornerColor: '#3b82f6',
        cornerStrokeColor: '#ffffff',
        transparentCorners: false,
        cornerSize: 10
      })
      fabricRef.current?.add(fImg)
      fabricRef.current?.setActiveObject(fImg)
    })
  }

  const savePageSignatures = () => {
    if (!fabricRef.current || activePageIndex === null) return
    
    // Export only the added objects (signatures)
    const canvas = fabricRef.current
    const bg = canvas.backgroundImage
    canvas.backgroundImage = undefined
    canvas.renderAll()
    
    const dataUrl = canvas.toDataURL({ format: 'png' })
    setPlacedSigns(prev => ({ ...prev, [activePageIndex]: dataUrl }))
    
    canvas.backgroundImage = bg
    canvas.renderAll()
    
    toast.success("Page signatures fixed.")
    setActivePageIndex(null)
  }

  const handleExport = async () => {
    if (!file) return
    setIsProcessing(true)
    const toastId = toast.loading("Finalizing signed PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pdfPages = pdfDoc.getPages()

      for (let i = 0; i < pdfPages.length; i++) {
        if (placedSigns[i]) {
          const page = pdfPages[i]
          const { width, height } = page.getSize()
          const img = await pdfDoc.embedPng(placedSigns[i])
          page.drawImage(img, { x: 0, y: 0, width, height })
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      setProcessedBlob(blob)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`signed_${file.name}`, blob.size, "Sign PDF", "/tool/sign-pdf")
      
      toast.success("PDF generated! Ready to download.", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to export PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Signature Library</h3>
        <div className="space-y-3">
          {savedSignatures?.map(sig => (
            <div 
              key={sig.id} 
              className="group relative p-2 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/50 cursor-pointer transition-all"
              onClick={() => addSignatureToCanvas(sig.dataUrl)}
            >
              <img src={sig.dataUrl} alt="Signature" className="h-12 w-full object-contain invert grayscale brightness-200" />
              <button 
                onClick={(e) => { e.stopPropagation(); db.signatures.delete(sig.id!) }}
                className="absolute top-1 right-1 p-1 bg-red-500/20 text-red-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setShowSignModal(true)}
            className="w-full py-3 rounded-xl border border-dashed border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 text-white/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} /> Create New
          </button>
        </div>
      </div>

      {processedBlob ? (
        <DownloadAction 
          blob={processedBlob} 
          defaultFilename={`wow_signed_${file?.name || "document.pdf"}`}
          onDownload={() => setProcessedBlob(null)}
          onPreview={() => setShowPreview(true)}
        />
      ) : (
        <button
          onClick={handleExport}
          disabled={!file || Object.keys(placedSigns).length === 0 || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          {isProcessing ? (
            <span className="animate-pulse">Finalizing...</span>
          ) : (
            <>
              <Download size={20} />
              Finalize & Save
            </>
          )}
        </button>
      )}

      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1 uppercase">
          <ShieldCheck size={14} /> Legally Binding
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed">
          Browser-native digital signatures are stored locally. Always verify with local laws regarding electronic signatures.
        </p>
      </div>
    </div>
  )

  const secondarySidebar = pages.length > 0 ? (
    <>
      {pages.map((page, i) => (
        <PageThumbnail
          key={i}
          url={page.url}
          index={i}
          isActive={activePageIndex === i}
          label={placedSigns[i] ? "Signed" : undefined}
          onClick={() => {
            if (activePageIndex !== null) {
              savePageSignatures()
            }
            setActivePageIndex(i)
          }}
        />
      ))}
    </>
  ) : null

  return (
    <ToolLayout
      title="Sign PDF"
      description="Create your digital signature and sign documents securely in your browser."
      icon={<PenTool size={24} className="text-blue-400" />}
      sidebar={sidebar}
      secondarySidebar={secondarySidebar}
      toolId="sign-pdf"
    >
      <div className="flex flex-col h-full">
        {!file ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/pdf': ['.pdf'] }}
            acceptText="PDF documents only"
          />
        ) : activePageIndex !== null ? (
          <div className="flex-1 flex flex-col items-center bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
            <div className="w-full p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <MousePointer2 size={16} className="text-blue-400" />
                <span className="text-sm font-medium text-white">Placing Signature on Page {activePageIndex + 1}</span>
              </div>
              <button onClick={savePageSignatures} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2">
                <Check size={14} /> Apply to Page
              </button>
            </div>
            <div className="flex-1 w-full overflow-auto p-8 flex justify-center">
              <div className="shadow-2xl bg-white">
                <canvas ref={canvasRef} />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto pr-2">
            {pages.map((page) => (
              <div 
                key={page.index}
                onClick={() => setActivePageIndex(page.index)}
                className="relative aspect-[1/1.4] rounded-xl overflow-hidden cursor-pointer group bg-white border-2 border-transparent hover:border-blue-500/50 transition-all shadow-lg"
              >
                <img src={page.url} alt={`Page ${page.index + 1}`} className="w-full h-full object-cover" />
                {placedSigns[page.index] && (
                  <img src={placedSigns[page.index]} className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                   <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-xs shadow-xl flex items-center gap-2">
                     <PenTool size={14} /> Sign Page
                   </div>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white z-20">
                  {page.index + 1}
                </div>
                {placedSigns[page.index] && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] z-20" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature Creator Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowSignModal(false)} />
          <div className="relative w-full max-w-xl bg-[#16171d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Create Signature</h3>
              <button onClick={() => setShowSignModal(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/50"><X size={20}/></button>
            </div>
            
            <div className="p-6">
              <div className="flex gap-4 mb-6">
                <button onClick={() => setSignType('draw')} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${signType === 'draw' ? "bg-blue-500/10 border-blue-500 text-blue-400" : "bg-white/5 border-transparent text-white/40"}`}>
                  <PenTool size={18} /> Draw
                </button>
                <button onClick={() => setSignType('type')} className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${signType === 'type' ? "bg-blue-500/10 border-blue-500 text-blue-400" : "bg-white/5 border-transparent text-white/40"}`}>
                  <Type size={18} /> Type
                </button>
              </div>

              <div className="aspect-[4/1] bg-white rounded-2xl overflow-hidden relative border-2 border-white/10">
                {signType === 'draw' ? (
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor={signColor}
                    canvasProps={{ className: "w-full h-full" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <input 
                      type="text" 
                      value={typedSign}
                      onChange={(e) => setTypedSign(e.target.value)}
                      placeholder="Type your name..."
                      className="w-full text-center text-4xl italic font-serif bg-transparent text-black outline-none"
                      style={{ color: signColor, fontFamily: "'Brush Script MT', cursive" }}
                    />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 flex gap-2">
                  {['#000000', '#0000ff', '#ff0000'].map(c => (
                    <button 
                      key={c} 
                      onClick={() => setSignColor(c)}
                      className={`w-6 h-6 rounded-full border-2 ${signColor === c ? "border-black/20" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/5 flex gap-4">
              <button 
                onClick={() => { sigCanvas.current?.clear(); setTypedSign("") }}
                className="flex-1 py-3 rounded-xl font-bold bg-white/5 text-white/60 hover:bg-white/10 transition-all"
              >
                Clear
              </button>
              <button 
                onClick={saveSignature}
                className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all shadow-xl"
              >
                Save to Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ResultPreview
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        url={processedBlob ? URL.createObjectURL(processedBlob) : null}
        type="pdf"
        filename={`wow_signed_${file?.name || "document.pdf"}`}
        onConfirm={() => toast.success("Preview confirmed!")}
      />

      <ErrorModal
        isOpen={!!fileError}
        onClose={() => setFileError(null)}
        error={fileError}
      />
    </ToolLayout>
  )
}
