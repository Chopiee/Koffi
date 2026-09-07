import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array with ellipses if needed
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div className="px-5 py-3 bg-[#FAFAFA] border-t border-neutral-200/80 flex flex-wrap items-center justify-between gap-3 text-[12.5px] text-neutral-600 font-sans select-none">
      {/* Left side: Item count info & optional items per page custom dropdown */}
      <div className="flex items-center gap-3">
        <span className="text-neutral-500 font-normal">
          Showing <span className="font-normal text-neutral-800">{startItem}</span>–
          <span className="font-normal text-neutral-800">{endItem}</span> of{' '}
          <span className="font-normal text-neutral-800">{totalItems}</span> entries
        </span>

        {onItemsPerPageChange && (
          <div ref={dropdownRef} className="relative flex items-center gap-2 border-l border-neutral-200/80 pl-3.5">
            <span className="text-[12px] text-neutral-400 font-normal">Rows per page:</span>

            {/* Custom Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="bg-white hover:bg-neutral-50 border border-neutral-200/90 hover:border-neutral-300 rounded-full px-2.5 py-0.5 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs text-[12px] text-neutral-700 font-normal"
            >
              <span>{itemsPerPage}</span>
              <ChevronDown size={12} className="text-neutral-400 shrink-0" />
            </button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute bottom-[calc(100%+6px)] left-20 z-50 bg-white rounded-xl shadow-lg border border-neutral-200/80 p-1 w-24 animate-in fade-in zoom-in-95 duration-100">
                {[5, 10, 20, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => {
                      onItemsPerPageChange(num);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-2 py-1 rounded-lg text-left text-[12px] flex items-center justify-between cursor-pointer transition-colors font-normal ${
                      itemsPerPage === num
                        ? 'bg-neutral-100 text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span>{num}</span>
                    {itemsPerPage === num && <Check size={12} className="text-neutral-900 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right side: Page numbers & Prev/Next navigation */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60 active:bg-neutral-200/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Previous Page"
          aria-label="Previous Page"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-0.5">
          {pages.map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span
                  key={`ellipse-${idx}`}
                  className="px-1 text-neutral-400 select-none text-[12px] font-normal"
                >
                  ...
                </span>
              );
            }

            const isCurrent = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-[28px] h-7 px-1.5 rounded-md text-[12.5px] font-normal flex items-center justify-center transition-colors cursor-pointer ${
                  isCurrent
                    ? 'text-neutral-900 font-medium bg-neutral-200/60'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/60'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-7 h-7 rounded-md flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60 active:bg-neutral-200/50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer"
          title="Next Page"
          aria-label="Next Page"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
