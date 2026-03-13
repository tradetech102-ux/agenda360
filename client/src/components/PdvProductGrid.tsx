import React from 'react';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export interface Product {
  id: number;
  name: string;
  price: number;
  code?: string;
  sku?: string;
  quantity?: number;
}

interface PdvProductGridProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onToggleFavorite?: (productId: number) => void;
  favorites?: number[];
  isLoading?: boolean;
}

export const PdvProductGrid: React.FC<PdvProductGridProps> = ({
  products,
  onSelectProduct,
  onToggleFavorite,
  favorites = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-muted animate-pulse rounded-lg h-24" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Nenhum produto encontrado</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-4">
      {products.map((product) => {
        const isFavorite = favorites.includes(product.id);
        
        return (
          <div
            key={product.id}
            className="relative group"
          >
            <Button
              onClick={() => onSelectProduct(product)}
              variant="outline"
              className="w-full h-24 flex flex-col items-center justify-center text-center p-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <div className="text-xs font-semibold line-clamp-2 mb-1">{product.name}</div>
              <div className="text-sm font-bold">R$ {product.price.toFixed(2)}</div>
              {product.quantity !== undefined && (
                <div className="text-xs text-muted-foreground mt-1">
                  {product.quantity > 0 ? `${product.quantity} em estoque` : 'Sem estoque'}
                </div>
              )}
            </Button>

            {/* Favorite Button */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(product.id);
                }}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Star
                  className={`w-4 h-4 ${
                    isFavorite
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground hover:text-yellow-400'
                  }`}
                />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
