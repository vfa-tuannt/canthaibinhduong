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
    <>
      {/* Desktop: traditional table (hidden below md) */}
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Mẫu mã</TableHead>
              <TableHead>Mã SP</TableHead>
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
                    <TableCell>{variant.variantCode}</TableCell>
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

      {/* Mobile & Tablet: card-based layout (visible below md) */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-md border">
            {/* Product header */}
            <div className="flex items-center justify-between gap-2 bg-muted/50 px-3 py-2">
              <span className="font-medium text-sm truncate">{product.name}</span>
              <div className="flex gap-1 shrink-0">
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
                  className="min-h-[44px]"
                  onClick={() => onAddVariant(product.id, product.name)}
                >
                  + Mẫu mã
                </Button>
              </div>
            </div>
            {/* Variant cards */}
            {product.variants.map((variant) => (
              <div key={variant.id} className="border-t px-3 py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{variant.variantName}</p>
                    {variant.variantCode && (
                      <p className="text-xs text-muted-foreground">{variant.variantCode}</p>
                    )}
                  </div>
                  <span className={`text-lg font-bold shrink-0 ${variant.currentStock === 0 ? "text-destructive" : ""}`}>
                    {variant.currentStock}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="min-h-[44px] flex-1"
                    onClick={() => onAdjust(variant)}
                  >
                    Điều chỉnh
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="min-h-[44px] flex-1"
                    onClick={() => onHistory(variant)}
                  >
                    Lịch sử
                  </Button>
                </div>
              </div>
            ))}
            {product.variants.length === 0 && (
              <div className="border-t px-3 py-3 text-sm text-muted-foreground">
                Chưa có mẫu mã.
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
