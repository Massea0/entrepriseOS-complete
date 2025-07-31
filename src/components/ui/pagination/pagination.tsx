import React, { useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '../button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../select'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  ChevronsLeftIcon, 
  ChevronsRightIcon,
  MoreHorizontalIcon 
} from 'lucide-react'

import type {
  PaginationProps,
  PaginationItemProps,
  PaginationEllipsisProps,
  PaginationLinkProps,
  SimplePaginationProps
} from './pagination.types'

import {
  paginationVariants,
  paginationItemVariants,
  paginationEllipsisVariants,
  paginationNavVariants,
  paginationInfoVariants
} from './pagination.variants'

/**
 * Generate page numbers with ellipsis
 */
function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'ellipsis')[] {
  const range = (start: number, end: number): number[] => {
    const length = end - start + 1
    return Array.from({ length }, (_, idx) => idx + start)
  }

  // Calculate total numbers to show
  const totalPageNumbers = siblingCount + 5 // siblingCount + firstPage + lastPage + currentPage + 2*ellipsis

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const shouldShowLeftEllipsis = leftSiblingIndex > 2
  const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 2

  const firstPageIndex = 1
  const lastPageIndex = totalPages

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + 2 * siblingCount
    const leftRange = range(1, leftItemCount)
    return [...leftRange, 'ellipsis', totalPages]
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + 2 * siblingCount
    const rightRange = range(totalPages - rightItemCount + 1, totalPages)
    return [firstPageIndex, 'ellipsis', ...rightRange]
  }

  if (shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    return [firstPageIndex, 'ellipsis', ...middleRange, 'ellipsis', lastPageIndex]
  }

  return range(1, totalPages)
}

/**
 * Pagination Item Component
 */
export const PaginationItem = React.forwardRef<HTMLButtonElement, PaginationItemProps>(
  ({ className, isActive, isDisabled, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          paginationItemVariants({
            variant,
            size,
            state: isActive ? 'active' : isDisabled ? 'disabled' : 'default'
          }),
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
PaginationItem.displayName = 'PaginationItem'

/**
 * Pagination Ellipsis Component
 */
export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(paginationEllipsisVariants({ size }), className)}
        {...props}
      >
        <MoreHorizontalIcon className="h-4 w-4" />
        <span className="sr-only">Plus de pages</span>
      </span>
    )
  }
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

/**
 * Pagination Navigation Button
 */
export const PaginationNav = React.forwardRef<HTMLButtonElement, PaginationItemProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(paginationNavVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
PaginationNav.displayName = 'PaginationNav'

/**
 * Main Pagination Component
 */
export const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    className,
    currentPage,
    totalPages,
    onPageChange,
    siblingCount = 1,
    showFirstLast = true,
    showPrevNext = true,
    showPageSize = false,
    pageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    onPageSizeChange,
    totalItems,
    variant = 'default',
    size = 'md',
    disabled = false,
    ...props 
  }, ref) => {
    const pageNumbers = useMemo(
      () => generatePageNumbers(currentPage, totalPages, siblingCount),
      [currentPage, totalPages, siblingCount]
    )

    const canGoPrevious = currentPage > 1 && !disabled
    const canGoNext = currentPage < totalPages && !disabled

    const handlePageChange = (page: number) => {
      if (page !== currentPage && page >= 1 && page <= totalPages && !disabled) {
        onPageChange(page)
      }
    }

    const handlePageSizeChange = (newPageSize: string) => {
      if (onPageSizeChange) {
        onPageSizeChange(parseInt(newPageSize))
      }
    }

    // Calculate items display info
    const startItem = totalItems ? (currentPage - 1) * pageSize + 1 : 0
    const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : 0

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Page info */}
        {totalItems && (
          <div className={paginationInfoVariants({ size })}>
            Affichage de {startItem} à {endItem} sur {totalItems} résultats
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Page size selector */}
          {showPageSize && onPageSizeChange && (
            <div className="flex items-center gap-2">
              <span className={paginationInfoVariants({ size })}>
                Lignes par page :
              </span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Pagination navigation */}
          <nav
            ref={ref}
            className={cn(paginationVariants({ size }), className)}
            role="navigation"
            aria-label="Pagination"
            {...props}
          >
            {/* First page */}
            {showFirstLast && (
              <PaginationNav
                onClick={() => handlePageChange(1)}
                disabled={!canGoPrevious}
                variant={variant}
                size={size}
                aria-label="Aller à la première page"
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </PaginationNav>
            )}

            {/* Previous page */}
            {showPrevNext && (
              <PaginationNav
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoPrevious}
                variant={variant}
                size={size}
                aria-label="Page précédente"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </PaginationNav>
            )}

            {/* Page numbers */}
            {pageNumbers.map((pageNumber, index) => (
              pageNumber === 'ellipsis' ? (
                <PaginationEllipsis key={`ellipsis-${index}`} size={size} />
              ) : (
                <PaginationItem
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  isActive={pageNumber === currentPage}
                  isDisabled={disabled}
                  variant={variant}
                  size={size}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={pageNumber === currentPage ? 'page' : undefined}
                >
                  {pageNumber}
                </PaginationItem>
              )
            ))}

            {/* Next page */}
            {showPrevNext && (
              <PaginationNav
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoNext}
                variant={variant}
                size={size}
                aria-label="Page suivante"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </PaginationNav>
            )}

            {/* Last page */}
            {showFirstLast && (
              <PaginationNav
                onClick={() => handlePageChange(totalPages)}
                disabled={!canGoNext}
                variant={variant}
                size={size}
                aria-label="Aller à la dernière page"
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </PaginationNav>
            )}
          </nav>
        </div>
      </div>
    )
  }
)
Pagination.displayName = 'Pagination'

/**
 * Simple Pagination (for basic use cases)
 */
export const SimplePagination = React.forwardRef<HTMLDivElement, SimplePaginationProps>(
  ({ 
    currentPage,
    totalPages,
    onPageChange,
    variant = 'default',
    size = 'md',
    showInfo = true,
    totalItems,
    pageSize = 10,
    ...props 
  }, ref) => {
    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages

    return (
      <div className="flex items-center justify-between">
        {showInfo && totalItems && (
          <div className={paginationInfoVariants({ size })}>
            Page {currentPage} sur {totalPages} ({totalItems} éléments)
          </div>
        )}
        
        <div className={paginationVariants({ size })}>
          <PaginationNav
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious}
            variant={variant}
            size={size}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Précédent
          </PaginationNav>
          
          <PaginationNav
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext}
            variant={variant}
            size={size}
          >
            Suivant
            <ChevronRightIcon className="h-4 w-4" />
          </PaginationNav>
        </div>
      </div>
    )
  }
)
SimplePagination.displayName = 'SimplePagination'