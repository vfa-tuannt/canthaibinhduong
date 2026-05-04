import { useState, useCallback } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductTable } from "@/components/product-table"
import { AdjustDialog } from "@/components/adjust-dialog"
import { VariantDialog } from "@/components/variant-dialog"
import { VariantHistoryDialog } from "@/components/variant-history-dialog"
import { RenameDialog } from "@/components/rename-dialog"
import { getProducts, searchProducts, createProduct } from "@/lib/api"
import type { Product, Variant } from "@/lib/api"

interface ProductsPageProps {
  token: string
}

export function ProductsPage({ token }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const [newProductName, setNewProductName] = useState("")
  const [addLoading, setAddLoading] = useState(false)

  // Adjust dialog state
  const [adjustVariant, setAdjustVariant] = useState<Variant | null>(null)

  // Variant dialog state
  const [variantProductId, setVariantProductId] = useState<string | null>(null)
  const [variantProductName, setVariantProductName] = useState("")

  // History dialog state
  const [historyVariant, setHistoryVariant] = useState<Variant | null>(null)

  // Rename dialog state
  const [renameProductId, setRenameProductId] = useState<string | null>(null)
  const [renameProductName, setRenameProductName] = useState("")

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getProducts(token)
      if (result.success) {
        setProducts(result.data || [])
      } else {
        toast.error(result.error || "Lỗi tải sản phẩm")
      }
    } catch (err) {
      toast.error("Lỗi: " + (err instanceof Error ? err.message : "Unknown"))
    } finally {
      setLoading(false)
    }
  }, [token])

  // Load on mount
  useState(() => { loadProducts() })

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      loadProducts()
      return
    }
    setLoading(true)
    try {
      const result = await searchProducts(token, query)
      if (result.success) {
        setProducts(result.data || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [token, loadProducts])

  async function handleAddProduct() {
    const name = newProductName.trim()
    if (!name) {
      toast.error("Vui lòng nhập tên sản phẩm.")
      return
    }
    setAddLoading(true)
    try {
      const result = await createProduct(token, name)
      if (result.success) {
        toast.success("Đã thêm sản phẩm!")
        setAddOpen(false)
        setNewProductName("")
        loadProducts()
      } else {
        toast.error(result.error || "Lỗi thêm sản phẩm")
      }
    } catch (err) {
      toast.error("Lỗi: " + (err instanceof Error ? err.message : "Unknown"))
    } finally {
      setAddLoading(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold">Danh sách sản phẩm</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="sm:w-64"
          />
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger render={<Button className="min-h-[44px] whitespace-nowrap" />}>
              + Sản phẩm
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Thêm sản phẩm</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-product-name">Tên sản phẩm</Label>
                  <Input
                    id="new-product-name"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
                  />
                </div>
                <Button className="min-h-[44px]" onClick={handleAddProduct} disabled={addLoading}>
                  {addLoading ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading && products.length === 0 ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          Chưa có sản phẩm nào. Nhấn "+ Sản phẩm" để thêm.
        </p>
      ) : (
        <div className={loading ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
          <ProductTable
          products={products}
          onAdjust={setAdjustVariant}
          onHistory={setHistoryVariant}
          onAddVariant={(productId, productName) => {
            setVariantProductId(productId)
            setVariantProductName(productName)
          }}
          onRename={(productId, currentName) => {
            setRenameProductId(productId)
            setRenameProductName(currentName)
          }}
          token={token}
          onRefresh={loadProducts}
        />
        </div>
      )}

      <AdjustDialog
        variant={adjustVariant}
        token={token}
        onClose={() => setAdjustVariant(null)}
        onSuccess={loadProducts}
      />

      <VariantDialog
        productId={variantProductId}
        productName={variantProductName}
        token={token}
        onClose={() => setVariantProductId(null)}
        onSuccess={loadProducts}
      />

      <VariantHistoryDialog
        variant={historyVariant}
        token={token}
        onClose={() => setHistoryVariant(null)}
      />

      <RenameDialog
        productId={renameProductId}
        currentName={renameProductName}
        token={token}
        onClose={() => setRenameProductId(null)}
        onSuccess={loadProducts}
      />
    </div>
  )
}
