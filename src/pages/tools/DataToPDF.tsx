import { useState } from "react"
import { jsPDF } from "jspdf"
import { FileJson, FileSpreadsheet, Download, Trash2, Table as TableIcon } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function DataToPDF() {
  const [data, setData] = useState<any>(null)
  const [fileType, setFileType] = useState<'json' | 'csv' | null>(null)
  const [fileName, setFileName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("data-to-pdf")
  })

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    setFileName(file.name)
    
    try {
      const text = await file.text()
      const ext = file.name.split('.').pop()?.toLowerCase()
      
      if (ext === 'json') {
        setData(JSON.parse(text))
        setFileType('json')
      } else if (ext === 'csv') {
        setData(text)
        setFileType('csv')
      } else {
        toast.error("Unsupported file format.")
      }
    } catch (error) {
      toast.error("Failed to parse file.")
    }
  }

  const convertToPDF = async () => {
    if (!data) return

    setIsProcessing(true)
    const toastId = toast.loading("Generating PDF...")

    try {
      const doc = new jsPDF()
      doc.setFont("courier")
      doc.setFontSize(10)
      
      let text = ""
      if (fileType === 'json') {
        text = JSON.stringify(data, null, 2)
      } else {
        text = data
      }

      const splitText = doc.splitTextToSize(text, 180)
      let y = 20
      const margin = 15
      const pageHeight = doc.internal.pageSize.height

      doc.text(`${fileType?.toUpperCase()} Export`, margin, 10)
      doc.line(margin, 12, 195, 12)

      splitText.forEach((line: string) => {
        if (y > pageHeight - 20) {
          doc.addPage()
          y = 20
        }
        doc.text(line, margin, y)
        y += 5
      })

      doc.save(`data_export_${fileName}.pdf`)
      
      const recordHistory = useAppStore.getState().recordHistory
      await recordHistory(`data_export_${fileName}.pdf`, text.length, "Data to PDF", "/tool/data-to-pdf")
      
      toast.success("PDF generated!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <>
      <div className="space-y-4">
        <button
          onClick={convertToPDF}
          disabled={!data || isProcessing}
          className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          <Download size={20} />
          Export PDF
        </button>

        {data && (
          <button
            onClick={() => setData(null)}
            className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10"
          >
            <Trash2 size={16} />
            Clear
          </button>
        )}
      </div>
    </>
  )

  return (
    <ToolLayout
      title="Data to PDF"
      description="Convert JSON or CSV data files into clean PDF reports locally."
      icon={<TableIcon size={24} className="text-emerald-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full gap-4">
        {!data ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/json': ['.json'], 'text/csv': ['.csv'] }}
            acceptText="JSON or CSV files"
          />
        ) : (
          <div className="flex-1 rounded-2xl overflow-hidden bg-black/40 border border-white/10 flex flex-col">
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/70">
                {fileType === 'json' ? <FileJson size={18} /> : <FileSpreadsheet size={18} />}
                <span className="text-sm font-medium">{fileName}</span>
              </div>
            </div>
            <pre className="flex-1 p-6 overflow-auto font-mono text-xs text-white/50 leading-relaxed">
              {fileType === 'json' ? JSON.stringify(data, null, 2) : data}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
