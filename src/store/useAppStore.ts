import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "@/db/db"

interface SearchState {
  isOpen: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

interface AppState {
  search: SearchState
  recentTools: string[]
  addRecentTool: (toolId: string) => void
  clearRecentTools: () => void
  recordHistory: (fileName: string, fileSize: number, toolName: string, toolPath: string) => Promise<void>
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      search: {
        isOpen: false,
        toggle: () => set((state) => ({ search: { ...state.search, isOpen: !state.search.isOpen } })),
        open: () => set((state) => ({ search: { ...state.search, isOpen: true } })),
        close: () => set((state) => ({ search: { ...state.search, isOpen: false } })),
      },
      recentTools: [],
      addRecentTool: (toolId) => 
        set((state) => {
          const filtered = state.recentTools.filter(id => id !== toolId)
          return { recentTools: [toolId, ...filtered].slice(0, 5) }
        }),
      clearRecentTools: () => set({ recentTools: [] }),
      recordHistory: async (fileName, fileSize, toolName, toolPath) => {
        await db.history.add({
          fileName,
          fileSize,
          toolName,
          toolPath,
          timestamp: Date.now()
        })
      },
    }),
    {
      name: "wow-tools-storage",
      partialize: (state) => ({ recentTools: state.recentTools }),
    }
  )
)
