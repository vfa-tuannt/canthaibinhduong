import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import type { View } from "@/App"

interface NavbarProps {
  currentView: View
  onNavigate: (view: View) => void
  onLogout: () => void
}

const navItems: { view: View; label: string }[] = [
  { view: "products", label: "Sản phẩm" },
  { view: "history", label: "Lịch sử" },
  { view: "dashboard", label: "Dashboard" },
]

export function Navbar({ currentView, onNavigate, onLogout }: NavbarProps) {
  const [open, setOpen] = useState(false)

  function handleNavigate(view: View) {
    onNavigate(view)
    setOpen(false)
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        <span className="font-semibold text-lg">Quản lý tồn kho</span>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <Button
              key={item.view}
              variant={currentView === item.view ? "secondary" : "ghost"}
              className="min-h-[44px] min-w-[44px]"
              onClick={() => onNavigate(item.view)}
            >
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="min-h-[44px] min-w-[44px] text-destructive"
            onClick={onLogout}
          >
            Đăng xuất
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="sm:hidden"
            render={<Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]" />}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="font-semibold mb-4">Menu</SheetTitle>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.view}
                  variant={currentView === item.view ? "secondary" : "ghost"}
                  className="justify-start min-h-[44px]"
                  onClick={() => handleNavigate(item.view)}
                >
                  {item.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                className="justify-start min-h-[44px] text-destructive"
                onClick={() => { onLogout(); setOpen(false) }}
              >
                Đăng xuất
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
