import { useState } from "react"
import { Toaster } from "@/components/ui/sonner"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/navbar"
import { LoginPage } from "@/pages/login"
import { ProductsPage } from "@/pages/products"
import { HistoryPage } from "@/pages/history"
import { DashboardPage } from "@/pages/dashboard"

export type View = "products" | "history" | "dashboard"

function App() {
  const { token, isAuthenticated, isLoading, login, logout } = useAuth()
  const [currentView, setCurrentView] = useState<View>("products")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!isAuthenticated || !token) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <LoginPage onLogin={login} />
        <Toaster />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar currentView={currentView} onNavigate={setCurrentView} onLogout={logout} />
      <main className="p-4">
        {currentView === "products" && <ProductsPage token={token} />}
        {currentView === "history" && <HistoryPage token={token} />}
        {currentView === "dashboard" && <DashboardPage token={token} />}
      </main>
      <Toaster />
    </div>
  )
}

export default App
