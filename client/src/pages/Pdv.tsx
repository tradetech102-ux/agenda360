import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PdvSearchBar } from '@/components/PdvSearchBar';
import { PdvProductGrid, type Product } from '@/components/PdvProductGrid';
import { PdvPaymentModal, type PaymentData } from '@/components/PdvPaymentModal';
import { trpc } from '@/lib/trpc';
import { Search, Trash2, Plus, Minus } from 'lucide-react';
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

export const Pdv: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Queries
  const { data: favorites = [], isLoading: favoritesLoading } = trpc.pdv.getFavorites.useQuery();
  const { data: allProducts = [] } = trpc.products.list.useQuery();
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);

  // Mutations
  const createOrderMutation = trpc.pdv.createOrder.useMutation();

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = discountType === 'percentage' 
    ? (subtotal * totalDiscount) / 100 
    : totalDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  // Cart operations
  const addToCart = useCallback((product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          unitPrice: product.price,
          quantity: 1,
          subtotal: product.price,
          discount: 0,
          discountType: 'fixed',
        },
      ];
    });
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.unitPrice - (item.discountType === 'percentage' ? (quantity * item.unitPrice * item.discount) / 100 : item.discount),
            } as CartItem
          : item
      )
    );
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const handleSearch = useCallback(async (query: string): Promise<Product[]> => {
    setSearchLoading(true);
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }

      if (!allProducts || allProducts.length === 0) {
        setSearchResults([]);
        return [];
      }

      const results = allProducts.filter(p => {
        try {
          if (!p) return false;
          const name = String(p.name || '').toLowerCase();
          const code = p.code ? String(p.code).toLowerCase() : '';
          const sku = p.sku ? String(p.sku).toLowerCase() : '';
          const q = query.toLowerCase();
          return name.includes(q) || code.includes(q) || sku.includes(q);
        } catch (e) {
          return false;
        }
      });
      
      const mappedResults = results.map((p: any) => ({
        id: p.id || 0,
        name: p.name || 'Sem nome',
        price: p.price ? parseFloat(String(p.price)) : 0,
        code: p.code || undefined,
        sku: p.sku || undefined,
        quantity: p.quantity || 0,
      })) as Product[];
      
      setSearchResults(mappedResults);
      return mappedResults;
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      return [];
    } finally {
      setSearchLoading(false);
    }
  }, [allProducts]);

  const handlePayment = async (paymentData: PaymentData) => {
    if (cartItems.length === 0) {
      alert('Adicione produtos ao carrinho!');
      return;
    }

    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: String(item.unitPrice),
          subtotal: String(item.subtotal),
          discount: item.discount > 0 ? String(item.discount) : undefined,
          discountType: item.discountType,
        })),
        subtotal: String(subtotal),
        total: String(total),
        paymentMethod: paymentData.paymentMethod as 'cash' | 'pix' | 'check' | 'mixed' | 'card',
        amountPaid: String(paymentData.amountPaid),
        change: String(paymentData.change),
        notes: paymentData.notes,
      };

      await createOrderMutation.mutateAsync(orderData);

      setCartItems([]);
      setTotalDiscount(0);
      setShowPaymentModal(false);
      alert('Venda finalizada com sucesso!');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Erro ao finalizar venda');
    }
  };

  const convertedFavorites = (favorites as any[]).map(p => ({
    id: p.id,
    name: p.name,
    price: parseFloat(p.price as any),
    code: p.code,
    sku: p.sku,
    quantity: p.quantity,
  })) as Product[];

  const displayProducts = searchQuery ? searchResults : convertedFavorites;

  return (
    <div className="dark flex h-screen bg-background">
      {/* LEFT SIDE - PRODUCTS */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background border-r border-border">
        {/* Header com Busca */}
        <div className="p-4 bg-card border-b border-border">
          <h1 className="text-2xl font-bold text-foreground mb-4">PDV</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produto..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  handleSearch(e.target.value);
                } else {
                  setSearchResults([]);
                }
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="bg-card border border-border rounded-lg p-3 hover:bg-muted transition-colors text-left"
              >
                <div className="text-3xl mb-2">🍌</div>
                <p className="font-semibold text-foreground text-sm truncate">{product.name}</p>
                <p className="text-lg font-bold text-primary">R$ {product.price.toFixed(2)}</p>
              </button>
            ))}
          </div>
          
          {displayProducts.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              {searchQuery ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE - CART */}
      <div className="w-96 flex flex-col bg-card border-l border-border">
        {/* Cart Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">
            {cartItems.length} itens
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {cartItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Nenhum produto no carrinho
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="bg-background border border-border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x R$ {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="flex-1 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="font-bold text-foreground">R$ {item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary - Fixed at bottom */}
        <div className="p-4 border-t border-border space-y-2 bg-background flex-shrink-0">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground font-semibold">R$ {subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Desconto ({discountType === 'percentage' ? totalDiscount + '%' : 'R$'}):</span>
              <span className="text-destructive">-R$ {discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="text-lg font-bold text-foreground">Total:</span>
            <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
          </div>

          {/* Discount Input */}
          <div className="mt-4 space-y-2">
            <label className="text-xs text-muted-foreground">Desconto:</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Valor"
                value={totalDiscount}
                onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                className="flex-1"
              />
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="px-2 py-1 bg-muted border border-border rounded text-sm"
              >
                <option value="fixed">R$</option>
                <option value="percentage">%</option>
              </select>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            onClick={() => setShowPaymentModal(true)}
            disabled={cartItems.length === 0}
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-lg"
          >
            PAGAR
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PdvPaymentModal
          total={total}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePayment}
        />
      )}
    </div>
  );
};
