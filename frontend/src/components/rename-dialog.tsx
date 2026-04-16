import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { renameProduct } from "@/lib/api"

interface RenameDialogProps {
  productId: string | null
  currentName: string
  token: string
  onClose: () => void
  onSuccess: () => void
}

export function RenameDialog({ productId, currentName, token, onClose, onSuccess }: RenameDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productId) {
      setName(currentName)
    }
  }, [productId, currentName])

  async function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Tên sản phẩm không được để trống.")
      return
    }
    if (trimmed === currentName) {
      onClose()
      return
    }
    setLoading(true)
    try {
      const result = await renameProduct(token, productId!, trimmed)
      if (result.success) {
        toast.success("Đã đổi tên sản phẩm!")
        onClose()
        onSuccess()
      } else {
        toast.error(result.error || "Lỗi đổi tên")
      }
    } catch (err) {
      toast.error("Lỗi: " + (err instanceof Error ? err.message : "Unknown"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!productId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Đổi tên sản phẩm</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tên sản phẩm</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
          <Button className="min-h-[44px]" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
