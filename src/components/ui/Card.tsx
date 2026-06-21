import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn("bg-white/70 dark:bg-gray-800/60 backdrop-blur rounded-2xl shadow-sm border border-white dark:border-gray-700 p-5", className)}>
      {title && (
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">{title}</p>
      )}
      {children}
    </div>
  );
}
