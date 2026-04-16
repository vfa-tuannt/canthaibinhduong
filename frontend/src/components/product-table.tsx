import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Product, Variant } from "@/lib/api"

interface ProductTableProps {
  products: Product[]
  onAdjust: (variant: Variant) => void
  onHistory: (variant: Variant) => void
  onAddVariant: (productId: string, productName: string) => void
  onRename: (productId: string, currentName: string) => void
  token: string
  onRefresh: () => void
}

export function ProductTable({ products, onAdjust, onHistory, onAddVariant, onRename }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Mẫu mã</TableHead>
            <TableHead className="hidden sm:table-cell">Mã SP</TableHead>
            <TableHead className="text-right">Tồn kho</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <>
              <TableRow key={product.id} className="bg-muted/50">
                <TableCell className="font-medium" colSpan={3}>
                  {product.name}
                </TableCell>
                <TableCell />
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] min-w-[44px]"
                      onClick={() => onRename(product.id, product.name)}
                      title="Đổi tên"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[44px] min-w-[44px]"
                      onClick={() => onAddVariant(product.id, product.name)}
                    >
                      + Mẫu mã
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {product.variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell />
                  <TableCell>{variant.variantName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{variant.variantCode}</TableCell>
                  <TableCell className={`text-right ${variant.currentStock === 0 ? "text-destructive font-semibold" : ""}`}>
                    {variant.currentStock}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <Button
                        variant="default"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => onAdjust(variant)}
                      >
                        Điều chỉnh
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="min-h-[44px]"
                        onClick={() => onHistory(variant)}
                      >
                        Lịch sử
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
