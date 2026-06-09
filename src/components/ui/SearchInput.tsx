import { forwardRef, type InputHTMLAttributes } from "react";
import { IconSearch } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className, containerClassName, ...rest }, ref) {
    return (
      <div className={cn("relative", containerClassName)}>
        <IconSearch
          width={20}
          height={20}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          ref={ref}
          type="search"
          className={cn(
            "h-12 w-full rounded-full border border-border bg-surface pl-12 pr-5 text-text outline-none transition-colors placeholder:text-text-muted/60 focus:border-fwd-azul focus:ring-4 focus:ring-fwd-azul/10",
            className,
          )}
          {...rest}
        />
      </div>
    );
  },
);

export default SearchInput;
