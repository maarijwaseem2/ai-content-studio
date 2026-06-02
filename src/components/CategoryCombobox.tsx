import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const PRODUCT_CATEGORIES = [
  "Furniture",
  "Electronics",
  "Clothing & Apparel",
  "Footwear",
  "Beauty & Skincare",
  "Health & Wellness",
  "Food & Beverage",
  "Home & Kitchen",
  "Home Decor",
  "Sports & Outdoor",
  "Toys & Games",
  "Books & Stationery",
  "Jewelry & Accessories",
  "Bags & Luggage",
  "Automotive",
  "Pet Supplies",
  "Baby & Kids",
  "Office & Business",
  "Tools & Hardware",
  "Software & Digital",
];

interface CategoryComboboxProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  placeholder = "Select or type a category",
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(value || "");
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRODUCT_CATEGORIES;
    return PRODUCT_CATEGORIES.filter((c) =>
      c.toLowerCase().includes(q),
    );
  }, [query]);

  const exactMatch = useMemo(
    () =>
      PRODUCT_CATEGORIES.some(
        (c) => c.toLowerCase() === query.trim().toLowerCase(),
      ),
    [query],
  );

  function commit(val: string) {
    onChange(val);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
            "ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate text-left">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width]"
        align="start"
      >
        <div className="p-2 border-b border-border">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (query.trim()) commit(query.trim());
              }
            }}
            placeholder="Search or type custom..."
            className="h-8 text-sm"
          />
        </div>
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 && !query.trim() && (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              No categories found
            </div>
          )}
          {filtered.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => commit(cat)}
              className={cn(
                "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm transition-colors",
                "hover:bg-secondary/60",
                value === cat && "bg-secondary",
              )}
            >
              <span>{cat}</span>
              {value === cat && <Check className="size-4 text-highlight" />}
            </button>
          ))}
          {query.trim() && !exactMatch && (
            <button
              type="button"
              onClick={() => commit(query.trim())}
              className="mt-1 flex w-full items-center gap-2 rounded-sm border-t border-border px-2 py-2 text-sm hover:bg-secondary/60"
            >
              <PenLine className="size-3.5 text-muted-foreground" />
              <span>
                Use custom:{" "}
                <span className="font-medium">"{query.trim()}"</span>
              </span>
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
