"use client"

import * as React from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"

// ── Types ──────────────────────────────────────────────────────────────

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  pagination?: PaginationState
  onPaginationChange?: (page: number, pageSize: number) => void
  onSearchChange?: (query: string) => void
  onSort?: (columnId: string, desc: boolean) => void
  onRowClick?: (row: TData) => void
  isLoading?: boolean
  emptyMessage?: string
  enableRowSelection?: boolean
  onRowSelectionChange?: (selectedRows: TData[]) => void
}

// ── Debounced search hook ──────────────────────────────────────────────

function useDebouncedCallback(
  callback: (value: string) => void,
  delay: number
) {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  return React.useCallback(
    (value: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callback(value), delay)
    },
    [callback, delay]
  )
}

// ── Component ──────────────────────────────────────────────────────────

export function DataTable<TData>({
  columns,
  data,
  pagination,
  onPaginationChange,
  onSearchChange,
  onSort,
  onRowClick,
  isLoading = false,
  emptyMessage = "No results found.",
  enableRowSelection = false,
  onRowSelectionChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [searchValue, setSearchValue] = React.useState("")

  const debouncedSearch = useDebouncedCallback(
    React.useCallback(
      (value: string) => {
        onSearchChange?.(value)
      },
      [onSearchChange]
    ),
    300
  )

  // Build columns with optional selection column
  const tableColumns = React.useMemo(() => {
    if (!enableRowSelection) return columns

    const selectColumn: ColumnDef<TData, unknown> = {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    }

    return [selectColumn, ...columns]
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    rowCount: pagination?.total ?? data.length,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: (updater) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting) : updater
      setSorting(newSorting)
      if (newSorting.length > 0 && onSort) {
        onSort(newSorting[0].id, newSorting[0].desc)
      }
    },
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(newSelection)

      if (onRowSelectionChange) {
        const selectedIndices = Object.keys(newSelection).filter(
          (k) => newSelection[k]
        )
        const selectedRows = selectedIndices
          .map((i) => data[Number(i)])
          .filter(Boolean)
        onRowSelectionChange(selectedRows)
      }
    },
    enableRowSelection,
  })

  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1
  const currentPage = pagination?.page ?? 1

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      {onSearchChange && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchValue(e.target.value)
              debouncedSearch(e.target.value)
            }}
            className="pl-8"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Loading skeleton rows
              Array.from({ length: pagination?.pageSize ?? 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {tableColumns.map((_, j) => (
                    <TableCell key={`skeleton-cell-${i}-${j}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // Empty state
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length}
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-sm text-muted-foreground">
                      {emptyMessage}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {enableRowSelection && Object.keys(rowSelection).length > 0
              ? `${Object.keys(rowSelection).length} of ${pagination.total} row(s) selected`
              : `Showing ${(currentPage - 1) * pagination.pageSize + 1}–${Math.min(
                  currentPage * pagination.pageSize,
                  pagination.total
                )} of ${pagination.total}`}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage <= 1}
              onClick={() =>
                onPaginationChange?.(currentPage - 1, pagination.pageSize)
              }
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm tabular-nums text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= totalPages}
              onClick={() =>
                onPaginationChange?.(currentPage + 1, pagination.pageSize)
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
