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
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="hidden sm:table-cell">Mẫu mã</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">SL</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Trước</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Sau</TableHead>
            <TableHead className="hidden md:table-cell">Ghi chú</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="whitespace-nowrap text-sm">
                {r.createdAt.substring(0, 10)}
              </TableCell>
              <TableCell className="font-medium">{r.productName}</TableCell>
              <TableCell className="hidden sm:table-cell">{r.variantName}</TableCell>
              <TableCell>
                <Badge variant={r.adjustmentType === "IMPORT" ? "default" : "destructive"}>
                  {r.adjustmentType === "IMPORT" ? "Nhập" : "Xuất"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{r.quantity}</TableCell>
              <TableCell className="hidden sm:table-cell text-right">{r.stockBefore}</TableCell>
              <TableCell className="hidden sm:table-cell text-right">{r.stockAfter}</TableCell>
              <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                {r.note}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
