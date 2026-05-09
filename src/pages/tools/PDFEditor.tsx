import { useState, useEffect, useRef } from "react"
import { PDFDocument } from "pdf-lib"
import { fabric } from "fabric"
import { saveAs } from "file-saver"
import { FileEdit, Trash2, Pencil, Type, Square, Circle, Eraser, Undo, Redo, X, Check, Save, FolderOpen } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"
import { setupPdfWorker, pdfjsLib } from "@/lib/pdfWorker"
import PageThumbnail from "@/components/tools/PageThumbnail"
import DownloadAction from "@/components/tools/DownloadAction"
import ResultPreview from "@/components/tools/ResultPreview"
import ErrorModal from "@/components/tools/ErrorModal"
import { db } from "@/db/db"
import { motion } from "framer-motion"

interface PDFPageInfo {
  index: number
  url: string
  width: number
  height: number
  viewport: pdfjsLib.PageViewport
}

export default function PDFEditor() {
  const [file, setFile] = useState<File | null>(null)
  const [pages, setPages] = useState<PDFPageInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [fileError, setFileError] = useState<{ title: string, message: string, filename?: string, solution?: string } | null>(null)
  
  const [activePageIndex, setActivePageIndex] = useState<number | null>(null)
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "text" | "rect" | "circle">("select")
  const [color, setColor] = useState("#3b82f6") // blue-500
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<fabric.Canvas | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Store the annotated layers (transparent PNGs) for each page
  // Key: page index, Value: DataURL of the transparent PNG containing annotations
  const [annotations, setAnnotations] = useState<Record<number, string>>({})

  const addRecentTool = useAppStore(state => state.addRecentTool)

  useEffect(() => {
    addRecentTool("pdf-editor")
    setupPdfWorker()
  }, [addRecentTool])

  const handleFileSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return
    const selectedFile = newFiles[0]
    
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a PDF file.")
      return
    }

    setFile(selectedFile)
    setIsLoading(true)
    setLoadProgress(0)
    setAnnotations({})
    setActivePageIndex(null)
    setProcessedBlob(null)

    try {
      const arrayBuffer = await selectedFile.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      
      const pageInfoList: PDFPageInfo[] = []
      const pagesToLoad = Math.min(pdf.numPages, 30) // Limit for performance
      
      for (let i = 1; i <= pagesToLoad; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 0.8 })
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        await page.render({
          canvasContext: ctx!,
          viewport: viewport
        } as any).promise
        
        pageInfoList.push({
          index: i - 1,
          url: canvas.toDataURL(),
          width: viewport.width,
          height: viewport.height,
          viewport
        })
        setLoadProgress(Math.round((i / pagesToLoad) * 100))
      }
      
      setPages(pageInfoList)
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
      toast.error("Failed to read PDF file.")
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize Fabric Canvas when a page is selected
  useEffect(() => {
    if (activePageIndex !== null && canvasRef.current && pages[activePageIndex]) {
      const pageInfo = pages[activePageIndex]
      
      // Cleanup previous canvas
      if (fabricRef.current) {
        fabricRef.current.dispose()
      }

      // We set the canvas dimensions to match the PDF viewport
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: pageInfo.width,
        height: pageInfo.height,
        isDrawingMode: false,
      })
      
      fabricRef.current = canvas

      // Set background image (The PDF page)
      fabric.Image.fromURL(pageInfo.url, (img) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas))
      })

      // Load existing annotations if any
      if (annotations[activePageIndex]) {
        fabric.Image.fromURL(annotations[activePageIndex], (img) => {
          canvas.add(img)
          canvas.renderAll()
          saveHistory()
        })
      } else {
        saveHistory()
      }

      canvas.on('object:added', saveHistory)
      canvas.on('object:modified', saveHistory)
      canvas.on('object:removed', saveHistory)
      canvas.on('path:created', saveHistory)

      return () => {
        canvas.dispose()
      }
    }
  }, [activePageIndex, pages])

  // Update tool settings
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.isDrawingMode = activeTool === "draw"
    
    if (activeTool === "draw") {
      canvas.freeDrawingBrush.color = color
      canvas.freeDrawingBrush.width = 3
    }
  }, [activeTool, color])

  const saveHistory = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const json = canvas.toJSON()
    const jsonStr = JSON.stringify(json)
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(jsonStr)
      return newHistory
    })
    setHistoryIndex(prev => prev + 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0 && fabricRef.current) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      fabricRef.current.loadFromJSON(history[newIndex], () => {
        fabricRef.current?.renderAll()
      })
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1 && fabricRef.current) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      fabricRef.current.loadFromJSON(history[newIndex], () => {
        fabricRef.current?.renderAll()
      })
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = fabricRef.current
    if (!canvas || activeTool === "select" || activeTool === "draw") return

    const pointer = canvas.getPointer(e.nativeEvent)

    if (activeTool === "text") {
      const text = new fabric.IText('Click to edit', {
        left: pointer.x,
        top: pointer.y,
        fill: color,
        fontSize: 24,
        fontFamily: 'Inter',
      })
      canvas.add(text)
      canvas.setActiveObject(text)
      text.enterEditing()
      text.selectAll()
    } else if (activeTool === "rect") {
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 3,
        width: 100,
        height: 100,
      })
      canvas.add(rect)
      canvas.setActiveObject(rect)
    } else if (activeTool === "circle") {
      const circle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        fill: 'transparent',
        stroke: color,
        strokeWidth: 3,
        radius: 50,
      })
      canvas.add(circle)
      canvas.setActiveObject(circle)
    }

    canvas.renderAll()
    setActiveTool("select")
  }

  const handleDeleteSelected = () => {
    const canvas = fabricRef.current
    if (!canvas) return
    const activeObjects = canvas.getActiveObjects()
    if (activeObjects.length) {
      canvas.discardActiveObject()
      activeObjects.forEach(obj => canvas.remove(obj))
    }
  }

  const saveCurrentPageAnnotations = () => {
    const canvas = fabricRef.current
    if (!canvas || activePageIndex === null) return

    // Temporarily hide background to export only annotations
    const bg = canvas.backgroundImage
    canvas.backgroundImage = undefined
    canvas.renderAll()

    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1 // Match the viewport scale we used
    })

    setAnnotations(prev => ({ ...prev, [activePageIndex]: dataUrl }))

    // Restore background
    canvas.backgroundImage = bg
    canvas.renderAll()
    
    toast.success("Page annotations saved locally.")
    setActivePageIndex(null)
  }

  const handleExportPDF = async () => {
    if (!file) return

    setIsProcessing(true)
    const toastId = toast.loading("Generating final PDF...")

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      const pdfPages = pdfDoc.getPages()

      for (let i = 0; i < pdfPages.length; i++) {
        if (annotations[i]) {
          const page = pdfPages[i]
          const { width, height } = page.getSize()
          
          const pngImage = await pdfDoc.embedPng(annotations[i])
          
          // Draw the transparent PNG covering the whole page
          page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: width,
            height: height,
          })
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" })
      setProcessedBlob(blob)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`edited_${file.name}`, blob.size, "PDF Editor", "/tool/pdf-editor")
      
      toast.success("PDF generated! Ready to download.", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to export PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!file) return
    
    const toastId = toast.loading("Saving draft locally...")
    try {
      await db.drafts.put({
        fileName: file.name,
        toolSlug: 'pdf-editor',
        data: {
          annotations,
          activePageIndex
        },
        updatedAt: Date.now()
      })
      toast.success("Draft saved to workspace!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to save draft.", { id: toastId })
    }
  }

  const clearAll = () => {
    setFile(null)
    setPages([])
    setAnnotations({})
    setActivePageIndex(null)
  }

  // Handle keyboard deletes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && activePageIndex !== null) {
        // Only delete if we are not editing text
        const canvas = fabricRef.current
        if (canvas) {
          const activeObj = canvas.getActiveObject()
          if (activeObj && activeObj.isType('i-text') && (activeObj as fabric.IText).isEditing) {
            return
          }
          handleDeleteSelected()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activePageIndex])

  const sidebar = (
    <>
      <div className="flex flex-col gap-4">
        {activePageIndex !== null ? (
          <>
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Tools</label>
                <div className="grid grid-cols-5 gap-2">
                  <button onClick={() => setActiveTool("select")} className={`p-2 rounded-lg flex items-center justify-center transition-colors ${activeTool === "select" ? "bg-blue-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"}`} title="Select">
                    <div className="w-4 h-4 border-2 border-current border-t-0 border-l-0 -rotate-45 transform origin-center translate-y-[-2px]" />
                  </button>
                  <button onClick={() => setActiveTool("draw")} className={`p-2 rounded-lg flex items-center justify-center transition-colors ${activeTool === "draw" ? "bg-blue-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"}`} title="Draw">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => setActiveTool("text")} className={`p-2 rounded-lg flex items-center justify-center transition-colors ${activeTool === "text" ? "bg-blue-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"}`} title="Text">
                    <Type size={18} />
                  </button>
                  <button onClick={() => setActiveTool("rect")} className={`p-2 rounded-lg flex items-center justify-center transition-colors ${activeTool === "rect" ? "bg-blue-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"}`} title="Rectangle">
                    <Square size={18} />
                  </button>
                  <button onClick={() => setActiveTool("circle")} className={`p-2 rounded-lg flex items-center justify-center transition-colors ${activeTool === "circle" ? "bg-blue-500 text-white" : "bg-white/5 hover:bg-white/10 text-white/70"}`} title="Circle">
                    <Circle size={18} />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Color</label>
                <div className="flex gap-2">
                  {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#000000'].map(c => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c ? "border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]" : "border-transparent hover:scale-105"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Actions</label>
                <div className="flex gap-2">
                  <button onClick={handleUndo} disabled={historyIndex <= 0} className="flex-1 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white/70 transition-colors">
                    <Undo size={16} />
                  </button>
                  <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="flex-1 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center text-white/70 transition-colors">
                    <Redo size={16} />
                  </button>
                  <button onClick={handleDeleteSelected} className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center transition-colors" title="Delete Selected">
                    <Eraser size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={saveCurrentPageAnnotations}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
              <Check size={18} />
              Done Editing Page
            </button>
          </>
        ) : (
          <div className="text-sm text-white/50 p-4 bg-white/5 rounded-xl border border-white/10">
            Select a page from the grid to start annotating. Your annotations will be overlaid on the original PDF.
          </div>
        )}
      </div>
      
      <div className="h-px bg-white/10 my-4" />

      <button
        onClick={handleSaveDraft}
        disabled={!file || activePageIndex !== null || isProcessing}
        className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10 mb-2"
      >
        <FolderOpen size={18} className="text-purple-400" />
        Save Draft
      </button>

      {processedBlob ? (
        <DownloadAction 
          blob={processedBlob} 
          defaultFilename={`wow_edited_${file?.name || "document.pdf"}`}
          onDownload={() => setProcessedBlob(null)}
          onPreview={() => setShowPreview(true)}
        />
      ) : (
        <button
          onClick={handleExportPDF}
          disabled={!file || activePageIndex !== null || Object.keys(annotations).length === 0 || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)]"
        >
          {isProcessing ? (
            <span className="animate-pulse">Exporting...</span>
          ) : (
            <>
              <Save size={20} />
              Export Final PDF
            </>
          )}
        </button>
      )}

      {file && activePageIndex === null && (
        <button
          onClick={clearAll}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
        >
          <Trash2 size={16} />
          Start Over
        </button>
      )}
    </>
  )

  const secondarySidebar = pages.length > 0 ? (
    <>
      {pages.map((page, i) => (
        <PageThumbnail
          key={i}
          url={page.url}
          index={i}
          isActive={activePageIndex === i}
          label={annotations[i] ? "Edited" : undefined}
          onClick={() => {
            if (activePageIndex !== null) {
              saveCurrentPageAnnotations()
            }
            setActivePageIndex(i)
          }}
        />
      ))}
    </>
  ) : null

  return (
    <ToolLayout
      title="PDF Editor"
      description="Draw, highlight, and add text to your PDF documents natively in the browser."
      icon={<FileEdit size={24} className="text-blue-400" />}
      sidebar={sidebar}
      secondarySidebar={secondarySidebar}
      toolId="pdf-editor"
    >
      {!file ? (
        <FileUpload
          onFilesSelected={handleFileSelected}
          accept={{ 'application/pdf': ['.pdf'] }}
          acceptText="PDF files only"
        />
      ) : isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
          <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden mb-4">
            <motion.div 
              className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${loadProgress}%` }}
            />
          </div>
          <p className="text-sm font-medium animate-pulse">Processing document ({loadProgress}%)...</p>
        </div>
      ) : activePageIndex !== null ? (
        <div className="flex flex-col h-full items-center bg-black/40 rounded-2xl overflow-hidden border border-white/10">
          <div className="w-full p-2 bg-white/5 border-b border-white/10 flex justify-between items-center">
            <span className="text-sm font-medium text-white ml-2">Editing Page {activePageIndex + 1}</span>
            <button onClick={saveCurrentPageAnnotations} className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 transition-colors">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 w-full overflow-auto flex items-center justify-center p-4" onClick={handleCanvasClick}>
            {/* The canvas container needs a shadow to look like a paper */}
            <div className="shadow-2xl bg-white">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white truncate max-w-[70%]">{file.name}</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/40">
                {Object.keys(annotations).length} page(s) edited
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white/70">
                {pages.length} pages
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {pages.map((page) => (
                <div 
                  key={page.index} 
                  onClick={() => setActivePageIndex(page.index)}
                  className="relative aspect-[1/1.4] rounded-xl overflow-hidden cursor-pointer transition-all border-2 border-transparent hover:border-white/20 group bg-white"
                >
                  <img src={page.url} alt={`Page ${page.index + 1}`} className="w-full h-full object-cover" />
                  
                  {annotations[page.index] && (
                    <img src={annotations[page.index]} className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                    <div className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium shadow-xl flex items-center gap-2">
                      <Pencil size={16} /> Edit
                    </div>
                  </div>
                  
                  {annotations[page.index] && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] z-20" title="Edited" />
                  )}
                  
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white z-20">
                    {page.index + 1}
                  </div>
                </div>
              ))}
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
        filename={`wow_edited_${file?.name || "document.pdf"}`}
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
