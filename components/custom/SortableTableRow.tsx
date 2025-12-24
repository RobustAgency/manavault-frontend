"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Row, flexRender } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface SortableTableRowProps<TData> {
  row: Row<TData>;
  id: string;
}

export function SortableTableRow<TData>({ row, id }: SortableTableRowProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
  <TableRow
  ref={setNodeRef}
  style={style}
  data-state={row.getIsSelected() && "selected"}
  className={isDragging ? "bg-muted" : ""}
>
  {row.getVisibleCells().map((cell, index) => (
    <TableCell key={cell.id}>
      {index === 0 ? (
        <div className="flex items-center gap-2">
          {/* Drag handle */}
          <span
            {...attributes}
            {...listeners}
            className="cursor-move text-muted-foreground"
          >
            <GripVertical className="h-4 w-4" />
          </span>

          {/* Cell content (Name) */}
          {flexRender(
            cell.column.columnDef.cell,
            cell.getContext()
          )}
        </div>
      ) : (
        flexRender(
          cell.column.columnDef.cell,
          cell.getContext()
        )
      )}
    </TableCell>
  ))}
</TableRow>

  );
}