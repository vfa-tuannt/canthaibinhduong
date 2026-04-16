import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EnrichedAdjustmentRecord } from "@/lib/api"

function formatVN(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function formatVNShort(isoStr: string): string {
  const d = new Date(isoStr)
  // Returns dd/MM/YYYY HH:mm:ss fixed format for the table
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d).replace(",", "")
}

interface HistoryTableProps {
  records: EnrichedAdjustmentRecord[]
}

export function HistoryTable({ records }: HistoryTableProps) {
  if (records.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        Không có dữ liệu phù hợp.
      </p>
    )
  }

  return (
    <>
      {/* Desktop: table (hidden below md) */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">Thời gian</TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead>Mẫu mã</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-right">SL</TableHead>
              <TableHead className="text-right">Trước</TableHead>
              <TableHead className="text-right">Sau</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-sm w-[160px]">
                  {formatVNShort(r.createdAt)}
                </TableCell>
                <TableCell className="font-medium">{r.productName}</TableCell>
                <TableCell>{r.variantName}</TableCell>
                <TableCell>
                  <Badge variant={r.adjustmentType === "IMPORT" ? "default" : "destructive"}>
                    {r.adjustmentType === "IMPORT" ? "Nhập" : "Xuất"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{r.quantity}</TableCell>
                <TableCell className="text-right">{r.stockBefore}</TableCell>
                <TableCell className="text-right">{r.stockAfter}</TableCell>
                <TableCell className="max-w-[200px] truncate">{r.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile & Tablet: card layout (visible below md) */}
      <div className="md:hidden space-y-3">
        {records.map((r) => (
          <div key={r.id} className="rounded-md border p-3 space-y-2">
            {/* Header: product name + badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{r.productName}</p>
                <p className="text-xs text-muted-foreground truncate">{r.variantName}</p>
              </div>
              <Badge
                variant={r.adjustmentType === "IMPORT" ? "default" : "destructive"}
                className="shrink-0"
              >
                {r.adjustmentType === "IMPORT" ? "Nhập kho" : "Xuất kho"}
              </Badge>
            </div>

            {/* Stock before → after + quantity */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tồn:</span>
              <span className="font-medium">{r.stockBefore}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">{r.stockAfter}</span>
              <span className="text-muted-foreground ml-auto">
                SL: <span className="font-medium text-foreground">{r.quantity}</span>
              </span>
            </div>

            {/* Note */}
            {r.note && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                <span className="font-medium text-foreground">Ghi chú:</span> {r.note}
              </p>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground text-right">
              {formatVN(r.createdAt)}
            </p>
          </div>
        ))}
      </div>
    </>
  )
}
