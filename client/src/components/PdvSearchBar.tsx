import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export interface SearchResult {
  id: number;
  name: string;
  price: number;
  code?: string;
  sku?: string;
  quantity?: number;
}

interface PdvSearchBarProps {
  onSearch: (query: string) => Promise<SearchResult[]>;
  onSelectProduct: (product: SearchResult) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export const PdvSearchBar: React.FC<PdvSearchBarProps> = ({
  onSearch,
  onSelectProduct,
  placeholder = 'Buscar por nome, código ou SKU...',
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setSearching(true);
    try {
      const searchResults = await onSearch(searchQuery);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [onSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query);
      }
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [query, onSearch]); // Only depend on query and onSearch, not handleSearch

  const handleSelectProduct = (product: SearchResult) => {
    onSelectProduct(product);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {searching ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>Buscando...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>Nenhum produto encontrado</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.code && `Código: ${product.code}`}
                      {product.code && product.sku && ' • '}
                      {product.sku && `SKU: ${product.sku}`}
                    </p>
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <p className="font-bold text-foreground">R$ {product.price.toFixed(2)}</p>
                    {product.quantity !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {product.quantity > 0 ? `${product.quantity} em estoque` : 'Sem estoque'}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
