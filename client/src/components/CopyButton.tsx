import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  onCopySuccess?: () => void;
}

/**
 * CopyButton - Botão com feedback visual imediato
 *
 * Características:
 * - Feedback instantâneo ao clique (sem esperar async)
 * - Efeito de pressão (scale) no clique
 * - Animação suave (150ms) de transição
 * - Ícone muda para checkmark por 2 segundos
 * - Totalmente responsivo
 *
 * Uso:
 * <CopyButton text="Texto para copiar" label="Copiar" />
 */
export function CopyButton({
  text,
  label = "Copiar",
  className,
  variant = "default",
  size = "md",
  showIcon = true,
  onCopySuccess,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Feedback IMEDIATO - sem esperar async
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // 1. Feedback visual de pressão INSTANTÂNEO
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 100);

    // 2. Mudar para "Copiado" INSTANTÂNEO (não espera a cópia)
    setIsCopied(true);

    // 3. Copiar para clipboard (background, sem bloquear UI)
    navigator.clipboard
      .writeText(text)
      .then(() => {
        onCopySuccess?.();
      })
      .catch((err) => {
        console.error("Falha ao copiar:", err);
      });

    // 4. Retornar ao estado original após 2 segundos
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  // Variantes de estilo
  const variantStyles = {
    default: isCopied
      ? "bg-green-600 text-white hover:bg-green-700"
      : "bg-purple-600 text-white hover:bg-purple-700",
    outline: isCopied
      ? "border-2 border-green-600 text-green-600 bg-transparent"
      : "border-2 border-purple-600 text-purple-600 bg-transparent hover:bg-purple-50 dark:hover:bg-purple-950",
    ghost: isCopied
      ? "text-green-600 hover:bg-green-100 dark:hover:bg-green-950"
      : "text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-950",
  };

  // Tamanhos
  const sizeStyles = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-2",
    lg: "px-4 py-3 text-base gap-2",
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base
        "inline-flex items-center justify-center font-medium rounded-lg",
        "transition-all duration-150 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "active:outline-none",
        // Efeito de pressão (scale)
        isPressed ? "scale-95" : "scale-100",
        // Variante
        variantStyles[variant],
        // Tamanho
        sizeStyles[size],
        // Custom
        className
      )}
      title={isCopied ? "Copiado!" : "Copiar para área de transferência"}
      disabled={isCopied}
    >
      {showIcon && (
        <span
          className={cn(
            "transition-all duration-150",
            isCopied ? "scale-100 opacity-100" : "scale-100 opacity-100"
          )}
        >
          {isCopied ? (
            <Check className="w-4 h-4" strokeWidth={3} />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </span>
      )}

      <span
        className={cn(
          "transition-all duration-150 font-semibold",
          isCopied ? "text-green-600 dark:text-green-400" : ""
        )}
      >
        {isCopied ? "✓ Copiado!" : label}
      </span>
    </button>
  );
}

export default CopyButton;
