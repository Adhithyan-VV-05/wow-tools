import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "./Navbar"
import Footer from "./Footer"
import SpotlightSearch from "./SpotlightSearch"
import { Toaster } from "react-hot-toast"

export default function Layout() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex flex-col mesh-bg">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <SpotlightSearch />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 20, 25, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </div>
  )
}
