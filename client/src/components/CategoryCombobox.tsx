import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface CategoryComboboxProps {
  value?: number | null;
  onChange: (categoryId: number | null) => void;
  placeholder?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  placeholder = "Selecione ou crie uma categoria",
}: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: categories = [], refetch: refetchCategories } =
    trpc.expenseCategories.list.useQuery();
  const createCategoryMutation = trpc.expenseCategories.create.useMutation({
    onSuccess: () => {
      refetchCategories();
      setSearchInput("");
      setIsCreating(false);
    },
  });

  // Find selected category
  const selectedCategory = categories.find((cat) => cat.id === value);

  // Filter categories based on search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Check if search input matches any existing category
  const hasExactMatch = categories.some(
    (cat) => cat.nameLower === searchInput.toLowerCase()
  );

  // Handle category selection
  const handleSelectCategory = (categoryId: number) => {
    onChange(categoryId);
    setIsOpen(false);
    setSearchInput("");
  };

  // Handle create new category
  const handleCreateCategory = async () => {
    if (!searchInput.trim() || hasExactMatch) return;

    setIsCreating(true);
    try {
      const newCategory = await createCategoryMutation.mutateAsync({
        name: searchInput.trim(),
      });

      if (newCategory) {
        onChange(newCategory.id);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to create category:", error);
      setIsCreating(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-left bg-[#1a1a1a] border border-[#333333] rounded-lg text-sm text-[#e0e0e0] hover:border-[#444444] transition-colors flex items-center justify-between"
      >
        <span className="truncate">
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-[#333333] rounded-lg shadow-lg z-50">
          {/* Search Input */}
          <div className="p-2 border-b border-[#333333]">
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar ou criar..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full px-2 py-1.5 bg-[#0b0b0b] border border-[#333333] rounded text-sm text-[#e0e0e0] placeholder-[#666666] focus:outline-none focus:border-[#7c3aed]"
            />
          </div>

          {/* Categories List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleSelectCategory(category.id)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center justify-between ${
                    value === category.id
                      ? "bg-[#7c3aed] text-white"
                      : "text-[#e0e0e0] hover:bg-[#2a2a2a]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color || "#7c3aed" }}
                    />
                    {category.name}
                  </span>
                  {value === category.id && <Check size={16} />}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-[#666666]">
                Nenhuma categoria encontrada
              </div>
            )}
          </div>

          {/* Create New Category Button */}
          {searchInput.trim() && !hasExactMatch && (
            <div className="border-t border-[#333333] p-2">
              <button
                onClick={handleCreateCategory}
                disabled={isCreating}
                className="w-full px-3 py-2 text-left text-sm bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Plus size={16} />
                Criar "{searchInput.trim()}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
