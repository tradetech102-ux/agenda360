import { ReactNode } from "react";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: "sm" | "md" | "lg";
}

export function ResponsiveGrid({
  children,
  cols = { mobile: 1, tablet: 2, desktop: 4 },
  gap = "md",
}: ResponsiveGridProps) {
  const gapMap = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  const colsMap = {
    1: "grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={`grid ${colsMap[cols.mobile as keyof typeof colsMap]} ${
        cols.tablet ? colsMap[cols.tablet as keyof typeof colsMap] : ""
      } ${cols.desktop ? colsMap[cols.desktop as keyof typeof colsMap] : ""} ${
        gapMap[gap]
      }`}
    >
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
