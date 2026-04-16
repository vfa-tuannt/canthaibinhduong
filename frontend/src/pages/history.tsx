import { useState, useCallback, useMemo } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { HistoryTable } from "@/components/history-table"
import { getAllAdjustmentHistory } from "@/lib/api"
import type { EnrichedAdjustmentRecord } from "@/lib/api"

interface HistoryPageProps {
  token: string
}

export function HistoryPage({ token }: HistoryPageProps) {
  const [data, setData] = useState<EnrichedAdjustmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [selectedProduct, setSelectedProduct] = useState("")

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAllAdjustmentHistory(token)
      if (result.success) {
        setData(result.data || [])
      } else {
        toast.error(result.error || "Lỗi tải lịch sử")
      }
    } catch (err) {
      toast.error("Lỗi: " + (err instanceof Error ? err.message : "Unknown"))
    } finally {
      setLoading(false)
    }
  }, [token])

  // Load on mount
  useState(() => { loadHistory() })

  // Unique products for filter dropdown
  const productOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const r of data) {
      if (r.productId && !map.has(r.productId)) {
        map.set(r.productId, r.productName)
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [data])

  // Client-side filtered records
  const filteredRecords = useMemo(() => {
    return data.filter((r) => {
      const dateStr = r.createdAt.substring(0, 10)
      if (fromDate && dateStr < fromDate) return false
      if (toDate && dateStr > toDate) return false
      if (selectedProduct && r.productId !== selectedProduct) return false
      return true
    })
  }, [data, fromDate, toDate, selectedProduct])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Lịch sử toàn bộ</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="from-date">Từ ngày</Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="sm:w-40"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="to-date">Đến ngày</Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="sm:w-40"
          />
        </div>
        <div className="flex flex-col gap-1 sm:min-w-[200px]">
          <Label>Sản phẩm</Label>
          <Select
            value={selectedProduct}
            onValueChange={(val) => { setSelectedProduct(val ?? "") }}
          >
            <SelectTrigger className="min-h-[44px]">
              <SelectValue placeholder="Tất cả sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả sản phẩm</SelectItem>
              {productOptions.map(([id, name]) => (
                <SelectItem key={id} value={id}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <HistoryTable records={filteredRecords} />
      )}
    </div>
  )
}
