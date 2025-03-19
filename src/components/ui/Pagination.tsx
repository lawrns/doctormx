import React from 'react';
import { ChevronLeft, ChevronRight } from '../icons/IconProvider';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

/**
 * Pagination component
 */
const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className = '',
}) => {
  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  // Create array of page numbers
  const getPageNumbers = () => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    
    // If the total pages is less than the total numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate left and right sibling indices
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Show ellipsis when needed
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
    
    // Define arrays to hold the actual page numbers
    const pageNumbers = [];
    
    // Always show the first page
    pageNumbers.push(1);
    
    // Add left ellipsis if needed
    if (shouldShowLeftDots) {
      pageNumbers.push(-1); // Using -1 to represent left ellipsis
    } else if (leftSiblingIndex > 1) {
      // If we're not showing left ellipsis but leftSiblingIndex > 1,
      // add all pages from 2 to leftSiblingIndex
      for (let i = 2; i <= leftSiblingIndex; i++) {
        pageNumbers.push(i);
      }
    }
    
    // Add pages around current page
    for (let i = Math.max(2, leftSiblingIndex); i <= Math.min(totalPages - 1, rightSiblingIndex); i++) {
      if (!pageNumbers.includes(i)) {
        pageNumbers.push(i);
      }
    }
    
    // Add right ellipsis if needed
    if (shouldShowRightDots) {
      pageNumbers.push(-2); // Using -2 to represent right ellipsis
    } else if (rightSiblingIndex < totalPages) {
      // If we're not showing right ellipsis but rightSiblingIndex < totalPages,
      // add all pages from rightSiblingIndex to totalPages - 1
      for (let i = rightSiblingIndex + 1; i < totalPages; i++) {
        pageNumbers.push(i);
      }
    }
    
    // Always show the last page
    if (!pageNumbers.includes(totalPages)) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevClick = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className={`flex items-center justify-center ${className}`} aria-label="Pagination">
      <ul className="inline-flex items-center -space-x-px">
        {/* Previous button */}
        <li>
          <button
            onClick={handlePrevClick}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
        </li>

        {/* Page numbers */}
        {pageNumbers.map((pageNumber, index) => {
          // For ellipsis
          if (pageNumber < 0) {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
              </li>
            );
          }

          // For page numbers
          return (
            <li key={pageNumber}>
              <button
                onClick={() => onPageChange(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  currentPage === pageNumber
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                }`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
                aria-label={`Page ${pageNumber}`}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        {/* Next button */}
        <li>
          <button
            onClick={handleNextClick}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;