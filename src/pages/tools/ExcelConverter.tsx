import { useState } from "react"
import { utils, read, write } from "xlsx"
import { jsPDF } from "jspdf"
import { FileSpreadsheet, Download, Trash2, ArrowRightLeft, FileType, Table as TableIcon } from "lucide-react"
import toast from "react-hot-toast"
import ToolLayout from "@/components/tools/ToolLayout"
import FileUpload from "@/components/tools/FileUpload"
import { useAppStore } from "@/store/useAppStore"

export default function ExcelConverter() {
  const [data, setData] = useState<any[][] | null>(null)
  const [fileName, setFileName] = useState("")
  const [mode, setMode] = useState<'excel-to-pdf' | 'pdf-to-excel'>('excel-to-pdf')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const addRecentTool = useAppStore(state => state.addRecentTool)

  useState(() => {
    addRecentTool("excel-converter")
  })

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]
    setFileName(file.name)
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
      setMode('excel-to-pdf')
      const buffer = await file.arrayBuffer()
      const wb = read(buffer)
      const wsname = wb.SheetNames[0]
      const ws = wb.Sheets[wsname]
      const rows = utils.sheet_to_json(ws, { header: 1 }) as any[][]
      setData(rows)
    } else if (file.type === 'application/pdf') {
      setMode('pdf-to-excel')
      toast.error("PDF to Excel requires server-side parsing for accuracy. Attempting basic extraction...")
      // Basic extraction logic would go here, but usually needs a specialized library like pdf2json
      // For this demo, we'll focus on Excel to PDF which is highly reliable browser-side.
    }
  }

  const exportPDF = () => {
    if (!data) return
    setIsProcessing(true)
    const toastId = toast.loading("Generating PDF from spreadsheet...")

    try {
      const doc = new jsPDF()
      doc.setFontSize(10)
      
      let y = 20
      const margin = 10
      const colWidth = 40
      
      data.forEach((row, rowIndex) => {
        if (y > 280) {
          doc.addPage()
          y = 20
        }
        
        row.forEach((cell, colIndex) => {
          doc.text(String(cell || ""), margin + (colIndex * colWidth), y)
        })
        y += 7
      })

      doc.save(`${fileName.split('.')[0]}.pdf`)
      
      const recordHistory = useAppStore.getState().recordHistory
      recordHistory(`${fileName.split('.')[0]}.pdf`, data.length * 100, "Excel to PDF", "/tool/excel-converter")
      
      toast.success("PDF generated!", { id: toastId })
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate PDF.", { id: toastId })
    } finally {
      setIsProcessing(false)
    }
  }

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Conversion Mode</h3>
        <div className="space-y-2">
          <button 
            onClick={() => setMode('excel-to-pdf')}
            className={`w-full py-2 rounded-xl text-sm transition-all ${mode === 'excel-to-pdf' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}
          >
            Excel to PDF
          </button>
          <button 
            onClick={() => setMode('pdf-to-excel')}
            className={`w-full py-2 rounded-xl text-sm transition-all ${mode === 'pdf-to-excel' ? "bg-blue-500 text-white" : "bg-white/5 text-white/40 hover:text-white"}`}
          >
            PDF to Excel
          </button>
        </div>
      </div>

      <button
        onClick={exportPDF}
        disabled={!data || isProcessing}
        className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
      >
        <Download size={20} />
        Export PDF
      </button>

      {data && (
        <button
          onClick={() => { setData(null); setFileName("") }}
          className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all text-white/50 hover:text-white hover:bg-white/5 border border-white/10 mt-3"
        >
          <Trash2 size={16} /> Clear
        </button>
      )}
    </div>
  )

  return (
    <ToolLayout
      title="Spreadsheet Converter"
      description="Convert Excel (XLSX, XLS, CSV) to PDF documents locally in your browser."
      icon={<FileSpreadsheet size={24} className="text-green-400" />}
      sidebar={sidebar}
    >
      <div className="flex flex-col h-full">
        {!data ? (
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept={{ 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'], 'text/csv': ['.csv'] }}
            acceptText="Excel or CSV files"
          />
        ) : (
          <div className="flex-1 bg-black/40 rounded-3xl border border-white/10 overflow-hidden flex flex-col">
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/70">
                <TableIcon size={18} className="text-green-400" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-bold uppercase">
                {data.length} Rows Detected
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    {data[0]?.map((cell, i) => (
                      <th key={i} className="p-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">{cell}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-sm text-white/60">
                  {data.slice(1, 20).map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      {row.map((cell, j) => (
                        <td key={j} className="p-3 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.length > 20 && (
                <div className="p-8 text-center text-white/20 text-xs italic">
                  Showing first 20 rows... (Export to see all {data.length} rows)
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}
