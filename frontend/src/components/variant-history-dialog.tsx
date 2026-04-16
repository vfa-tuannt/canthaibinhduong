import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdjustmentHistory } from "@/lib/api"
import type { Variant, AdjustmentRecord } from "@/lib/api"

interface VariantHistoryDialogProps {
  variant: Variant | null
  token: string
  onClose: () => void
}

export function VariantHistoryDialog({ variant, token, onClose }: VariantHistoryDialogProps) {
  const [data, setData] = useState<AdjustmentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")

  useEffect(() => {
    if (!variant) return
    setFromDate("")
    setToDate("")
    setLoading(true)
    getAdjustmentHistory(token, variant.id)
      .then((result) => {
        if (result.success) {
          setData(result.data || [])
        } else {
          toast.error(result.error || "Lỗi tải lịch sử")
        }
      })
      .catch((err) => {
        toast.error("Lỗi: " + (err instanceof Error ? err.message : "Unknown"))
      })
      .finally(() => setLoading(false))
  }, [variant, token])

  const filtered = data.filter((r) => {
    const d = r.createdAt.substring(0, 10)
    if (fromDate && d < fromDate) return false
    if (toDate && d > toDate) return false
    return true
  })

  return (
    <Dialog open={!!variant} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lịch sử – {variant?.variantName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Từ ngày</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Đến ngày</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">Chưa có lịch sử điều chỉnh.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">SL</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Trước</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Sau</TableHead>
                  <TableHead className="hidden sm:table-cell">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {r.createdAt.substring(0, 10)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.adjustmentType === "IMPORT" ? "default" : "destructive"}>
                        {r.adjustmentType === "IMPORT" ? "Nhập" : "Xuất"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{r.quantity}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{r.stockBefore}</TableCell>
                    <TableCell className="text-right hidden sm:table-cell">{r.stockAfter}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{r.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
