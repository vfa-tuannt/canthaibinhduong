import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getDashboardData } from "@/lib/api"
import type { MonthlyData, ProductSummary } from "@/lib/api"

interface DashboardPageProps {
  token: string
}

const MONTH_NAMES = [
  "", "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
]

export function DashboardPage({ token }: DashboardPageProps) {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(String(currentYear))
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)

  const years = Array.from({ length: 4 }, (_, i) => String(currentYear - i))

  const loadData = useCallback(async (y: number) => {
    setLoading(true)
    try {
      const result = await getDashboardData(token, y)
      if (result.success) {
        setMonthly(result.monthly || [])
        setProducts(result.products || [])
      } else {
        toast.error(result.error || "Lỗi tải dashboard")
      }
    } catch (err) {
      toast.error("Lỗi: " + (err instanceof Error ? err.message : "Unknown"))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadData(parseInt(year, 10))
  }, [year, loadData])

  function getMonthData(month: number): MonthlyData {
    return monthly.find((m) => m.month === month) || {
      month,
      totalImport: 0,
      totalExport: 0,
      adjustmentCount: 0,
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={year} onValueChange={(val) => { if (val) setYear(val) }}>
            <SelectTrigger className="min-h-[44px] w-full sm:w-32">
              <SelectValue placeholder="Năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
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
        <>
          <h3 className="text-lg font-medium mb-2">Thống kê theo tháng</h3>
          <div className="overflow-x-auto rounded-md border mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tháng</TableHead>
                  <TableHead className="text-right">Tổng nhập</TableHead>
                  <TableHead className="text-right">Tổng xuất</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Chênh lệch</TableHead>
                  <TableHead className="text-right">Số lần</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const d = getMonthData(m)
                  const net = d.totalImport - d.totalExport
                  return (
                    <TableRow key={m}>
                      <TableCell>{MONTH_NAMES[m]}</TableCell>
                      <TableCell className="text-right">{d.totalImport}</TableCell>
                      <TableCell className="text-right">{d.totalExport}</TableCell>
                      <TableCell className="text-right hidden sm:table-cell">
                        {net >= 0 ? "+" : ""}{net}
                      </TableCell>
                      <TableCell className="text-right">{d.adjustmentCount}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <h3 className="text-lg font-medium mb-2">Tổng hợp theo sản phẩm</h3>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Tổng tồn kho</TableHead>
                  <TableHead className="text-right">Số mẫu mã</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell>{p.productName}</TableCell>
                    <TableCell className="text-right">{p.totalStock}</TableCell>
                    <TableCell className="text-right">{p.variantCount}</TableCell>
                  </TableRow>
                ))}
                {products.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Chưa có sản phẩm
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
