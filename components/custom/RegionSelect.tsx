'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { XIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGetProductRegionsQuery } from '@/lib/redux/features';

interface RegionSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allowMultiple?: boolean;
  helperText?: string;
  disabled?: boolean;
}

const normalizeRegionValue = (value: string) =>
  value
    .split(',')
    .map((region) => region.trim())
    .filter((region) => region.length > 0);

export function RegionSelect({
  value,
  onChange,
  placeholder = 'Search regions...',
  allowMultiple = true,
  helperText,
  disabled = false,
}: RegionSelectProps) {
  const selectedRegions = useMemo(() => normalizeRegionValue(value), [value]);
  const selectedSet = useMemo(() => new Set(selectedRegions), [selectedRegions]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const { data: regionOptions = [], isFetching } = useGetProductRegionsQuery(
    debouncedSearch ? { search: debouncedSearch } : undefined,
    { skip: !isOpen }
  );

  const filteredOptions = useMemo(() => {
    return regionOptions
      .map((region) => region.trim())
      .filter((region) => region.length > 0)
      .filter((region) => (allowMultiple ? !selectedSet.has(region) : true));
  }, [regionOptions, allowMultiple, selectedSet]);

  const updateValue = (regions: string[]) => {
    onChange(regions.join(', '));
  };

  const handleSelect = (region: string) => {
    if (!region.trim()) {
      return;
    }
    if (allowMultiple) {
      if (selectedSet.has(region)) {
        return;
      }
      updateValue([...selectedRegions, region]);
      setSearchTerm('');
      setIsOpen(true);
      return;
    }
    updateValue([region]);
    setSearchTerm('');
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleRemove = (region: string) => {
    updateValue(selectedRegions.filter((item) => item !== region));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') {
      return;
    }
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return;
    }
    event.preventDefault();
    handleSelect(trimmed.toUpperCase());
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          onClick={() => {
            if (!disabled) {
              inputRef.current?.focus();
            }
          }}
        >
          {selectedRegions.map((region) => (
            <Badge key={region} variant="outlined" className="flex items-center gap-1">
              {region}
              <button
                type="button"
                onClick={() => handleRemove(region)}
                className="ml-1 rounded-sm cursor-pointer text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${region}`}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <input
            ref={inputRef}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value.toUpperCase())}
            onFocus={() => {
              if (disabled) {
                return;
              }
              setIsOpen(true);
              setIsFocused(true);
              if (!allowMultiple) {
                setSearchTerm('');
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setIsOpen(false);
                setIsFocused(false);
                setSearchTerm('');
              }, 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={selectedRegions.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="min-w-[120px] flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {isOpen && !disabled && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover p-1 shadow">
            {isFetching && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading regions...</div>
            )}
            {!isFetching && filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No regions found.
              </div>
            )}
            {!isFetching &&
              filteredOptions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(region);
                  }}
                  className="flex w-full items-center rounded-sm px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {region}
                </button>
              ))}
          </div>
        )}
      </div>

      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  );
}
