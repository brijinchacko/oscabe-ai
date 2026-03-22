"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

// ── Types ──────────────────────────────────────────────────────────────

export interface KanbanColumn {
  id: string
  title: string
  color: string
}

export interface KanbanItem {
  id: string
  columnId: string
  [key: string]: unknown
}

export interface KanbanBoardProps<T extends KanbanItem> {
  columns: KanbanColumn[]
  items: T[]
  onDragEnd: (itemId: string, newColumnId: string) => void
  renderCard: (item: T) => React.ReactNode
  onAddItem?: (columnId: string) => void
}

// ── Sortable Card Wrapper ──────────────────────────────────────────────

function SortableCard<T extends KanbanItem>({
  item,
  renderCard,
}: {
  item: T
  renderCard: (item: T) => React.ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderCard(item)}
    </div>
  )
}

// ── Column ─────────────────────────────────────────────────────────────

function Column<T extends KanbanItem>({
  column,
  items,
  renderCard,
  onAddItem,
  isOver,
}: {
  column: KanbanColumn
  items: T[]
  renderCard: (item: T) => React.ReactNode
  onAddItem?: (columnId: string) => void
  isOver: boolean
}) {
  return (
    <div className="flex w-72 min-w-72 flex-col rounded-xl bg-muted/50 border">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="text-sm font-semibold text-foreground">
            {column.title}
          </h3>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {items.length}
          </span>
        </div>
        {onAddItem && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onAddItem(column.id)}
          >
            <Plus className="size-3.5" />
          </Button>
        )}
      </div>

      {/* Column body */}
      <div
        className={`flex flex-1 flex-col gap-2 overflow-y-auto p-3 transition-colors ${
          isOver ? "bg-primary/5 ring-2 ring-inset ring-primary/20 rounded-b-xl" : ""
        }`}
        style={{ maxHeight: "calc(100vh - 220px)", minHeight: 120 }}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              renderCard={renderCard}
            />
          ))}
        </SortableContext>

        {items.length === 0 && !isOver && (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 py-8">
            <p className="text-xs text-muted-foreground">Drop items here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Mobile View ────────────────────────────────────────────────────────

function MobileKanbanView<T extends KanbanItem>({
  columns,
  items,
  renderCard,
  onAddItem,
}: Omit<KanbanBoardProps<T>, "onDragEnd">) {
  const [selectedColumnId, setSelectedColumnId] = React.useState(
    columns[0]?.id ?? ""
  )

  const filteredItems = items.filter((i) => i.columnId === selectedColumnId)
  const selectedColumn = columns.find((c) => c.id === selectedColumnId)

  return (
    <div className="flex flex-col gap-3">
      {/* Column selector */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {columns.map((col) => {
          const count = items.filter((i) => i.columnId === col.id).length
          return (
            <button
              key={col.id}
              onClick={() => setSelectedColumnId(col.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                selectedColumnId === col.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: col.color }}
              />
              {col.title}
              <span className="text-xs text-muted-foreground">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Items list */}
      <div className="flex flex-col gap-2">
        {filteredItems.map((item) => (
          <div key={item.id}>{renderCard(item)}</div>
        ))}
        {filteredItems.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed py-12">
            <p className="text-sm text-muted-foreground">No items</p>
          </div>
        )}
      </div>

      {onAddItem && selectedColumn && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onAddItem(selectedColumn.id)}
        >
          <Plus className="size-4" />
          Add to {selectedColumn.title}
        </Button>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────

export function KanbanBoard<T extends KanbanItem>({
  columns,
  items,
  onDragEnd,
  renderCard,
  onAddItem,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  })
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  })
  const sensors = useSensors(pointerSensor, touchSensor)

  const activeItem = items.find((i) => i.id === activeId)

  // Group items by column
  const itemsByColumn = React.useMemo(() => {
    const map = new Map<string, T[]>()
    for (const col of columns) {
      map.set(col.id, [])
    }
    for (const item of items) {
      const arr = map.get(item.columnId)
      if (arr) arr.push(item)
    }
    return map
  }, [columns, items])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    if (over) {
      // over could be a column id or another item id
      const overItem = items.find((i) => i.id === String(over.id))
      if (overItem) {
        setOverId(overItem.columnId)
      } else {
        setOverId(String(over.id))
      }
    } else {
      setOverId(null)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over) return

    const activeItemId = String(active.id)
    const overTarget = String(over.id)

    // Determine the target column
    const overItem = items.find((i) => i.id === overTarget)
    const targetColumnId = overItem ? overItem.columnId : overTarget

    // Only call if the column is valid
    if (columns.some((c) => c.id === targetColumnId)) {
      const draggedItem = items.find((i) => i.id === activeItemId)
      if (draggedItem && draggedItem.columnId !== targetColumnId) {
        onDragEnd(activeItemId, targetColumnId)
      }
    }
  }

  return (
    <>
      {/* Desktop view */}
      <div className="hidden md:block">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                items={itemsByColumn.get(column.id) ?? []}
                renderCard={renderCard}
                onAddItem={onAddItem}
                isOver={overId === column.id && activeId !== null}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem ? (
              <div className="rotate-2 scale-105 opacity-90 shadow-xl">
                {renderCard(activeItem)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        <MobileKanbanView
          columns={columns}
          items={items}
          renderCard={renderCard}
          onAddItem={onAddItem}
        />
      </div>
    </>
  )
}
