import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Clock, Zap } from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { useNavigate } from "react-router-dom"
import { ALL_TOOLS } from "@/constants/tools"

export default function SpotlightSearch() {
  const { isOpen, close } = useAppStore((state) => state.search)
  const recentToolIds = useAppStore((state) => state.recentTools)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  const recentTools = useMemo(() => {
    return recentToolIds
      .map(id => ALL_TOOLS.find(t => t.id === id))
      .filter(t => !!t) as typeof ALL_TOOLS
  }, [recentToolIds])

  const filteredTools = useMemo(() => {
    if (!query) return []
    return ALL_TOOLS.filter(t => 
      t.name.toLowerCase().includes(query.toLowerCase()) || 
      t.category.toLowerCase().includes(query.toLowerCase()) ||
      t.desc.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)
  }, [query])

  const items = query ? filteredTools : recentTools

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        useAppStore.getState().search.toggle()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleSelect = (tool: typeof ALL_TOOLS[0]) => {
    useAppStore.getState().addRecentTool(tool.id)
    navigate(tool.path)
    close()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % items.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
    } else if (e.key === "Enter" && items.length > 0) {
      e.preventDefault()
      handleSelect(items[selectedIndex])
    } else if (e.key === "Escape") {
      close()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 bg-[#0a0a0b]/80 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-[#121217] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden"
        >
          <div className="flex items-center px-6 py-5 border-b border-white/5 bg-white/[0.02]">
            <Search className="w-5 h-5 text-blue-500 mr-4" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What are you looking for?"
              className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-white/20"
            />
            <div className="flex items-center gap-2">
               <span className="hidden md:block text-[10px] font-bold text-white/20 border border-white/10 px-1.5 py-0.5 rounded bg-white/5 uppercase tracking-tighter">ESC</span>
               <button onClick={close} className="p-1.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto p-3 custom-scrollbar">
            {!query && recentTools.length > 0 && (
              <div className="px-3 py-2 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={10} /> Recently Used
              </div>
            )}
            
            {query && filteredTools.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white/20">
                  <Search size={24} />
                </div>
                <p className="text-white/40 text-sm">No tools found matching "{query}"</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {items.map((tool, index) => {
                  const Icon = tool.categoryIcon
                  const isSelected = index === selectedIndex
                  
                  return (
                    <button
                      key={`${tool.id}-${index}`}
                      onClick={() => handleSelect(tool)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center w-full px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                        isSelected ? "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]" : "text-white/60 hover:bg-white/[0.03] hover:text-white"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                        isSelected ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                      }`}>
                        <Icon size={20} className={isSelected ? "text-white" : "text-white/40"} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-bold flex items-center gap-2 text-sm">
                          {tool.name}
                          {tool.isNew && (
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-widest font-black ${
                              isSelected ? "bg-white text-blue-600" : "bg-blue-500 text-white"
                            }`}>New</span>
                          )}
                        </div>
                        <div className={`text-xs leading-tight mt-0.5 ${isSelected ? "text-white/70" : "text-white/30"}`}>
                          {tool.desc}
                        </div>
                      </div>
                      <span className={`text-[9px] px-2 py-1 rounded-lg uppercase font-black tracking-widest transition-colors ${
                        isSelected ? "bg-white/10 text-white/80" : "bg-white/5 text-white/30"
                      }`}>
                        {tool.category}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {!query && recentTools.length === 0 && (
               <div className="py-12 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-blue-500 animate-pulse">
                  <Zap size={32} />
                </div>
                <h3 className="text-white font-bold mb-2">Search for Tools</h3>
                <p className="text-white/30 text-xs max-w-[200px] mx-auto leading-relaxed">
                  Start typing to explore our suite of 130+ document utilities.
                </p>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-6 text-[9px] text-white/20 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <kbd className="bg-white/5 px-1.5 py-1 rounded border border-white/10 text-white/40 font-mono">↑↓</kbd>
                <span>Move</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="bg-white/5 px-2 py-1 rounded border border-white/10 text-white/40 font-mono">ENTER</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em]">
               wow-tools v1.2
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
