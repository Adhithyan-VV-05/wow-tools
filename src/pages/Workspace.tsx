import { motion } from "framer-motion"
import { History, FileText, Clock, ExternalLink, Trash2, FolderOpen, ShieldCheck } from "lucide-react"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "@/db/db"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"

export default function Workspace() {
  const history = useLiveQuery(() => db.history.orderBy('timestamp').reverse().limit(20).toArray())

  const clearHistory = async () => {
    await db.history.clear()
    toast.success("History cleared")
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp))
  }

  return (
    <div className="max-w-6xl mx-auto pt-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Workspace</h1>
          <p className="text-white/50">Manage your local drafts and processed file history.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <ShieldCheck size={14} /> Local Persistence Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <History size={20} className="text-blue-400" /> Recent Activity
            </h2>
            {history && history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-xs text-white/30 hover:text-red-400 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Clear History
              </button>
            )}
          </div>

          <div className="space-y-3">
            {history === undefined ? (
              <div className="h-40 flex items-center justify-center text-white/20 font-mono animate-pulse">Loading History...</div>
            ) : history.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center text-center border border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 mb-4">
                  <Clock size={32} />
                </div>
                <h3 className="text-white/60 font-medium mb-1">No activity yet</h3>
                <p className="text-white/30 text-sm max-w-xs">Files you process will appear here for easy access to your recent tools.</p>
              </div>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-4 rounded-2xl hover:bg-white/[0.04] transition-all flex items-center justify-between group border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm truncate max-w-[200px] md:max-w-[300px]">{item.fileName}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-white/30">{item.toolName}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-xs text-white/20">{formatSize(item.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-white/20 font-mono hidden md:block">{formatDate(item.timestamp)}</span>
                    <Link
                      to={item.toolPath}
                      className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Saved Drafts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FolderOpen size={20} className="text-purple-400" /> Saved Drafts
          </h2>
          <div className="glass-panel p-8 rounded-3xl text-center border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/10 mx-auto mb-4">
              <FolderOpen size={24} />
            </div>
            <p className="text-sm text-white/30 leading-relaxed">Auto-save for PDF Editor and OCR tools keeps your work safe locally.</p>
          </div>
          
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Privacy Guarantee</h3>
              <p className="text-xs text-white/50 leading-relaxed">
                Your history and drafts are stored locally using **IndexedDB**. No data ever touches a server. You have full control.
              </p>
            </div>
            <div className="absolute top-0 right-0 p-4 text-white/5">
              <ShieldCheck size={64} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
