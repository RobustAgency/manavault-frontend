"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import Pagniation from "./Pagniation";
import { SortableTableRow } from "./SortableTableRow";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (searchTerm: string) => void;
  loading?: boolean;
  serverSide?: boolean;
  // New drag-and-drop props
  sortable?: boolean;
  onReorder?: (items: TData[]) => void;
  getRowId?: (row: TData) => string;
}

export function ToggleDataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  pagination,
  onPageChange,
  onSearch,
  loading = false,
  serverSide = false,
  sortable = false,
  onReorder,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [searchValue, setSearchValue] = React.useState("");
const [tableData, setTableData] = React.useState<TData[]>(data);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  React.useEffect(() => {
  setTableData(data);
}, [data]);

  const table = useReactTable({
    data : tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverSide ? undefined : getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: serverSide ? undefined : getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    manualPagination: serverSide,
    manualFiltering: serverSide,
    pageCount: serverSide ? pagination?.totalPages || 0 : undefined,
  });

  React.useEffect(() => {
    if (serverSide && onSearch) {
      const timeoutId = setTimeout(() => {
        onSearch(searchValue);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchValue, onSearch, serverSide]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    if (!serverSide && searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    }
  };

  const handlePageChange = (page: number) => {
    if (serverSide && onPageChange) {
      onPageChange(page);
    } else {
      table.setPageIndex(page - 1);
    }
  };

  const currentPage = serverSide
    ? pagination?.page || 1
    : table.getState().pagination.pageIndex + 1;
  const totalPages = serverSide
    ? pagination?.totalPages || 0
    : table.getPageCount();

  // Get row IDs for sortable context
  const rowIds = React.useMemo(() => {
    return table.getRowModel().rows.map((row) => {
      if (getRowId) {
        return getRowId(row.original);
      }
      // Try common ID patterns
      const original = row.original as Record<string, unknown>;
      return String(original.id ?? original._id ?? row.id);
    });
  }, [table.getRowModel().rows, getRowId]);

 const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;

  if (!over || active.id === over.id) return;

  setTableData((prev) => {
    const oldIndex = rowIds.indexOf(String(active.id));
    const newIndex = rowIds.indexOf(String(over.id));

    if (oldIndex === -1 || newIndex === -1) return prev;

    const reordered = arrayMove(prev, oldIndex, newIndex);

    onReorder?.(reordered); // notify parent if needed
    return reordered;
  });
};


  const renderTableBody = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length + (sortable ? 1 : 0)}
            className="h-24 text-center"
          >
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading...
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (!table.getRowModel().rows?.length) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length + (sortable ? 1 : 0)}
            className="h-24 text-center"
          >
            No results.
          </TableCell>
        </TableRow>
      );
    }

    if (sortable) {
      return table.getRowModel().rows.map((row, index) => (
        <SortableTableRow key={rowIds[index]} row={row} id={rowIds[index]} />
      ));
    }

    return table.getRowModel().rows.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const tableContent = (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {sortable && <TableHead className="w-10" />}
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="flex items-center py-4">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
        </div>
      )}

      {sortable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
            {tableContent}
          </SortableContext>
        </DndContext>
      ) : (
        tableContent
      )}

      {pagination && (
         <Pagniation pagination={pagination} currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} loading={loading} />
            )}
    </div>
  );
}