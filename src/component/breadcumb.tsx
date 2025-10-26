import React from "react";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (index: number, item: BreadcrumbItem) => void;
}

export function Breadcrumb({ items, onItemClick }: BreadcrumbProps) {
  const router = useRouter();

  const handleClick = (index: number, item: BreadcrumbItem) => {
    if (onItemClick) {
      onItemClick(index, item);
    } else {
      router.push(item.path);
    }
  };

  return (
    <div className="container py-4">
      <ol className="flex items-center gap-2 text-sm overflow-x-auto">
        <li>
          <button
            onClick={() => {
              if (onItemClick) onItemClick(0, { label: "Home", path: "/" });
              else router.push("/");
            }}
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            <span>Home</span>
          </button>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
            {index === items.length - 1 ? (
              <span className="text-gray-900 dark:text-white font-medium">
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => handleClick(index, item)}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
