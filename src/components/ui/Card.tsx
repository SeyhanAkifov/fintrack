import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 p-5", className)}>
      {title && (
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      )}
      {children}
    </div>
  );
}
