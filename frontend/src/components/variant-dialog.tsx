import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createVariant } from "@/lib/api"

interface VariantDialogProps {
  productId: string | null
  productName: string
  token: string
  onClose: () => void
  onSuccess: () => void
}

export function VariantDialog({ productId, productName, token, onClose, onSuccess }: VariantDialogProps) {
  const [variantName, setVariantName] = useState("")
  const [variantCode, setVariantCode] = useState("")
  const [initialStock, setInitialStock] = useState("0")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productId) {
      setVariantName("")
      setVariantCode("")
      setInitialStock("0")
    }
  }, [productId])

  async function handleSubmit() {
    const name = variantName.trim()
    const code = variantCode.trim()
    const stock = parseInt(initialStock, 10)
    if (!name || !code) {
      toast.error("Vui lòng nhập đầy đủ thông tin.")
      return
    }
    if (isNaN(stock) || stock < 0) {
      toast.error("Số lượng phải >= 0.")
      return
    }
    setLoading(true)
    try {
      const result = await createVariant(token, productId!, name, code, stock)
      if (result.success) {
        toast.success("Đã thêm mẫu mã!")
        onClose()
        onSuccess()
      } else {
        toast.error(result.error || "Lỗi thêm mẫu mã")
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
          <DialogTitle>Thêm mẫu mã – {productName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tên mẫu mã</Label>
            <Input value={variantName} onChange={(e) => setVariantName(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Mã sản phẩm</Label>
            <Input value={variantCode} onChange={(e) => setVariantCode(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Số lượng tồn ban đầu</Label>
            <Input
              type="number"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
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
