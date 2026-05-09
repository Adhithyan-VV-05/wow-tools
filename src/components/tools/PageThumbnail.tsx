import { motion } from "framer-motion"

interface PageThumbnailProps {
  url: string
  index: number
  isActive: boolean
  onClick: () => void
  label?: string
}

export default function PageThumbnail({ url, index, isActive, onClick, label }: PageThumbnailProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        isActive 
          ? "border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
          : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"
      } w-24 aspect-[1/1.4] bg-white`}
    >
      <img src={url} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
      
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-sm">
        {label || index + 1}
      </div>
      
      {isActive && (
        <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
      )}
    </motion.div>
  )
}
