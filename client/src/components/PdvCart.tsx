import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface CartItem {
  id: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  subtotal: number;
}

interface PdvCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onUpdateDiscount: (itemId: string, discount: number, type: 'percentage' | 'fixed') => void;
  onRemoveItem: (itemId: string) => void;
  subtotal: number;
  totalDiscount: number;
  discountType: 'percentage' | 'fixed';
  onUpdateTotalDiscount: (discount: number, type: 'percentage' | 'fixed') => void;
}

export const PdvCart: React.FC<PdvCartProps> = ({
  items,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemoveItem,
  subtotal,
  totalDiscount,
  discountType,
  onUpdateTotalDiscount,
}) => {
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * totalDiscount) / 100 
    : totalDiscount;
  const total = subtotal - discountAmount;

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Carrinho</h2>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Nenhum item no carrinho</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => (
              <div key={item.id} className="p-3 space-y-2">
                {/* Product Name */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      R$ {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                    className="w-12 text-center text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium text-foreground ml-auto">
                    R$ {item.subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Item Discount */}
                {item.discount > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    Desconto: {item.discountType === 'percentage' 
                      ? `${item.discount}%` 
                      : `R$ ${item.discount.toFixed(2)}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="border-t border-border p-4 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium text-foreground">R$ {subtotal.toFixed(2)}</span>
        </div>

        {/* Total Discount */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Desconto</span>
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {discountType === 'percentage' 
                ? `-${totalDiscount.toFixed(2)}%` 
                : `-R$ ${totalDiscount.toFixed(2)}`}
            </span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={totalDiscount}
              onChange={(e) => onUpdateTotalDiscount(parseFloat(e.target.value) || 0, discountType)}
              placeholder="Valor"
              className="text-sm"
            />
            <select
              value={discountType}
              onChange={(e) => onUpdateTotalDiscount(totalDiscount, e.target.value as 'percentage' | 'fixed')}
              className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
            >
              <option value="fixed">R$</option>
              <option value="percentage">%</option>
            </select>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
          <span className="text-foreground">Total</span>
          <span className="text-primary">R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
