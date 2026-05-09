import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Eye, Download, FileText, Image as ImageIcon } from "lucide-react"

interface ResultPreviewProps {
  isOpen: boolean
  onClose: () => void
  url: string | null
  type: 'pdf' | 'image'
  filename: string
  onConfirm: () => void
}

export default function ResultPreview({ isOpen, onClose, url, type, filename, onConfirm }: ResultPreviewProps) {
  if (!url) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl h-full max-h-[90vh] bg-[#16171d] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Previewing Result</h3>
                  <p className="text-xs text-white/40 font-mono truncate max-w-[200px] md:max-w-md">{filename}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-black/40 relative">
              {type === 'pdf' ? (
                <iframe 
                  src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <img src={url} alt="Preview" className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-white/50 text-sm">
                <Eye size={18} className="text-blue-400" />
                Please verify the changes before downloading.
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 md:flex-none px-8 py-3 rounded-2xl font-bold text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                >
                  Back to Edit
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className="flex-1 md:flex-none px-8 py-3 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-2"
                >
                  Confirm & Download
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
