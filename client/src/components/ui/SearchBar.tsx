import { forwardRef, useState, useRef, useEffect } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'size'> {
  value: string;
  onChange: (val: string) => void;
  onSearch?: (val: string) => void;
  suggestions?: string[];
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
}

const sizes = {
  sm: 'h-8 text-sm pl-9 pr-9',
  md: 'h-11 text-sm pl-10 pr-10',
  lg: 'h-13 text-base pl-12 pr-12',
};

const iconSizes = {
  sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-5 w-5',
};

const iconOffsets = {
  sm: 'left-2.5', md: 'left-3', lg: 'left-3.5',
};

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ value, onChange, onSearch, suggestions = [], loading, size = 'md', clearable = true, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const showSuggestions = focused && suggestions.length > 0 && value.length > 0;

    useEffect(() => {
      setHighlightedIndex(-1);
    }, [suggestions]);

    const handleKey = (e: React.KeyboardEvent) => {
      if (!showSuggestions) {
        if (e.key === 'Enter') onSearch?.(value);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((p) => Math.min(p + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((p) => Math.max(p - 1, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0) {
          onChange(suggestions[highlightedIndex]);
          onSearch?.(suggestions[highlightedIndex]);
        } else {
          onSearch?.(value);
        }
        setFocused(false);
      } else if (e.key === 'Escape') {
        setFocused(false);
      }
    };

    return (
      <div ref={containerRef} className={cn('relative w-full', className)}>
        {/* Search Icon */}
        <div className={cn('pointer-events-none absolute inset-y-0 flex items-center text-muted-foreground', iconOffsets[size])}>
          {loading
            ? <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
            : <Search className={iconSizes[size]} />
          }
        </div>

        <input
          ref={ref}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={handleKey}
          className={cn(
            'w-full rounded-2xl border bg-background text-foreground transition-all duration-200',
            'placeholder:text-muted-foreground/60',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            focused ? 'border-primary shadow-sm' : 'border-border hover:border-primary/50',
            sizes[size]
          )}
          {...props}
        />

        {/* Clear button */}
        {clearable && value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className={cn(
              'absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors'
            )}
          >
            <X className={iconSizes[size]} />
          </button>
        )}

        {/* Suggestions dropdown */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1.5 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
            {suggestions.map((s, i) => (
              <button
                key={s}
                type="button"
                onMouseDown={() => {
                  onChange(s);
                  onSearch?.(s);
                  setFocused(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-colors',
                  i === highlightedIndex
                    ? 'bg-primary/8 text-primary'
                    : 'hover:bg-accent text-foreground'
                )}
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);
SearchBar.displayName = 'SearchBar';
