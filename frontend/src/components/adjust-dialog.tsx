import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { adjustStock } from "@/lib/api"
import type { Variant } from "@/lib/api"

interface AdjustDialogProps {
  variant: Variant | null
  token: string
  onClose: () => void
  onSuccess: () => void
}

export function AdjustDialog({ variant, token, onClose, onSuccess }: AdjustDialogProps) {
  const [type, setType] = useState("IMPORT")
  const [quantity, setQuantity] = useState("1")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (variant) {
      setType("IMPORT")
      setQuantity("1")
      setNote("")
    }
  }, [variant])

  async function handleSubmit() {
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty <= 0) {
      toast.error("Số lượng phải > 0.")
      return
    }
    setLoading(true)
    try {
      const result = await adjustStock(token, variant!.id, type, qty, note)
      if (result.success) {
        toast.success(`Thành công! Trước: ${result.stockBefore} → Sau: ${result.stockAfter}`)
        onClose()
        onSuccess()
      } else {
        toast.error(result.error || "Lỗi điều chỉnh")
      }
    } catch (err) {
      toast.error("Lỗi: " + (err instanceof Error ? err.message : "Unknown"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={!!variant} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho – {variant?.variantName}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Tồn hiện tại: <strong>{variant?.currentStock}</strong>
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Loại</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["IMPORT", "EXPORT"] as const).map((option) => {
                const selected = type === option
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setType(option)}
                    className={[
                      "relative min-h-[56px] rounded-md border-2 px-4 text-base font-medium transition-colors",
                      selected
                        ? "border-pink-400 bg-pink-50 text-pink-700"
                        : "border-input bg-background text-foreground hover:bg-muted",
                    ].join(" ")}
                  >
                    {option === "IMPORT" ? "Nhập kho" : "Xuất kho"}
                    {selected && (
                      <span className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-pink-400">
                        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Số lượng</Label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Ghi chú</Label>
            <Textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <Button className="min-h-[44px]" onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
