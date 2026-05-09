import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertCircle, RefreshCcw, ShieldAlert, FileWarning } from "lucide-react"

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  error: {
    title: string
    message: string
    filename?: string
    solution?: string
  } | null
}

export default function ErrorModal({ isOpen, onClose, error }: ErrorModalProps) {
  if (!error) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#1a1b23] border border-red-500/20 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 mx-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <ShieldAlert size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-white text-center mb-2">{error.title}</h3>
              
              {error.filename && (
                <div className="flex items-center justify-center gap-2 mb-4 bg-white/5 py-1.5 px-3 rounded-full w-fit mx-auto border border-white/5">
                  <FileWarning size={14} className="text-red-400" />
                  <span className="text-[11px] font-mono text-white/50">{error.filename}</span>
                </div>
              )}
              
              <p className="text-white/60 text-center leading-relaxed mb-8">
                {error.message}
              </p>
              
              {error.solution && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-8">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <RefreshCcw size={12} /> Suggested Solution
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed italic">
                    "{error.solution}"
                  </p>
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10"
                >
                  Dismiss
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-bold bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/20 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
