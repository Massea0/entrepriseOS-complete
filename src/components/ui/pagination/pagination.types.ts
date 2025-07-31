import { type HTMLAttributes, type ButtonHTMLAttributes } from 'react'
import { type VariantProps } from 'class-variance-authority'
import { paginationVariants } from './pagination.variants'

// Base pagination props
export interface PaginationProps extends HTMLAttributes<HTMLDivElement> {
  // Current page (1-based)
  currentPage: number
  // Total number of pages
  totalPages: number
  // Callback when page changes
  onPageChange: (page: number) => void
  // Number of page buttons to show around current page
  siblingCount?: number
  // Show first/last page buttons
  showFirstLast?: boolean
  // Show previous/next buttons
  showPrevNext?: boolean
  // Show page size selector
  showPageSize?: boolean
  // Current page size
  pageSize?: number
  // Available page sizes
  pageSizeOptions?: number[]
  // Callback when page size changes
  onPageSizeChange?: (pageSize: number) => void
  // Total number of items (for display)
  totalItems?: number
  // Variant styling
  variant?: 'default' | 'outline' | 'ghost'
  // Size
  size?: 'sm' | 'md' | 'lg'
  // Disabled state
  disabled?: boolean
}

// Pagination item props
export interface PaginationItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  isDisabled?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

// Pagination ellipsis props
export interface PaginationEllipsisProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg'
}

// Pagination link props (for custom routing)
export interface PaginationLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  href: string
  isActive?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

// Simple pagination props (for basic use cases)
export interface SimplePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showInfo?: boolean
  totalItems?: number
  pageSize?: number
}