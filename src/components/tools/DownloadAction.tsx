import React, { useState, useEffect } from "react"
import { Download, Edit3, Check, Eye } from "lucide-react"
import { saveAs } from "file-saver"
import { motion, AnimatePresence } from "framer-motion"

interface DownloadActionProps {
  blob: Blob | null
  defaultFilename: string
  onDownload?: (filename: string) => void
  previewUrl?: string | null
  onPreview?: () => void
}

export default function DownloadAction({ blob, defaultFilename, onDownload, previewUrl, onPreview }: DownloadActionProps) {
  const [filename, setFilename] = useState(defaultFilename)
  const [isEditing, setIsEditing] = useState(false)
  const [isPreviewed, setIsPreviewed] = useState(false)

  useEffect(() => {
    // If filename is empty or same as default, update it. 
    // Otherwise keep user's custom name.
    if (!filename || filename === defaultFilename) {
       setFilename(defaultFilename)
    }
  }, [defaultFilename])

  const handleDownload = () => {
    if (!blob) return
    const extension = defaultFilename.split('.').pop() || 'pdf'
    const finalFilename = filename.includes('.') ? filename : `${filename}.${extension}`
    saveAs(blob, finalFilename)
    if (onDownload) onDownload(finalFilename)
  }

  if (!blob) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 space-y-4"
    >
      <div className="space-y-1">
        <label className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
          <Check size={12} /> Ready to Download
        </label>
        
        <div className="group relative">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                onFocus={(e) => e.target.select()}
                className="w-full bg-black/40 border border-green-500/30 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-green-500"
              />
            </div>
          ) : (
            <div 
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-between cursor-pointer group-hover:bg-white/5 p-1 rounded transition-colors"
            >
              <span className="text-sm font-medium text-white truncate max-w-[180px]">{filename}</span>
              <Edit3 size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {!isPreviewed ? (
          <button
            onClick={() => {
              if (onPreview) onPreview()
              setIsPreviewed(true)
            }}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95 group"
          >
            <Eye size={20} className="group-hover:scale-110 transition-transform" />
            Preview Before Download
          </button>
        ) : (
          <button
            onClick={handleDownload}
            disabled={!filename}
            className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] active:scale-95 disabled:opacity-50"
          >
            <Download size={20} />
            Download {defaultFilename.split('.').pop()?.toUpperCase() || 'File'}
          </button>
        )}
        
        {isPreviewed && (
          <p className="text-[9px] text-center text-white/30 uppercase tracking-tighter">
            Verified & Ready for Download
          </p>
        )}
      </div>
    </motion.div>
  )
}
