"use client"
import * as React from "react"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, SortingState, getFilteredRowModel, ColumnFiltersState } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Pagniation from "./Pagniation";
import { SortableTableRow } from "./SortableTableRow";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from 'lucide-react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    pagination?: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    onPageChange?: (page: number) => void
    onSearch?: (searchTerm: string) => void
    loading?: boolean
    serverSide?: boolean;
    sortable?: boolean;
    onReorder?: (items: TData[]) => void;
    getRowId?: (row: TData) => string;
    sortTableData?: TData[];
    setSortTableData?: React.Dispatch<React.SetStateAction<TData[]>>;
    isDraggingRow?: boolean;
    setIsDraggingRow?: React.Dispatch<React.SetStateAction<boolean>>;
    handleSave?: () => void;
}

export function DataTable<TData, TValue>({
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
    sortTableData,
    setSortTableData,
    isDraggingRow,
    setIsDraggingRow,
    handleSave,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [searchValue, setSearchValue] = React.useState("");



    const table = useReactTable({
        data: sortTableData ?? data,
        columns,
        enableSorting: !sortable,
        getRowId: (row) =>
            getRowId ? getRowId(row) : String((row as any).id),
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
    })

    React.useEffect(() => {
        if (serverSide && onSearch) {
            const timeoutId = setTimeout(() => {
                onSearch(searchValue)
            }, 300)

            return () => clearTimeout(timeoutId)
        }
    }, [searchValue, onSearch, serverSide])

    React.useEffect(() => {
        setSortTableData?.(data);
    }, [data]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value
        setSearchValue(value)

        if (!serverSide && searchKey) {
            table.getColumn(searchKey)?.setFilterValue(value)
        }
    }

    const handlePageChange = (page: number) => {
        if (serverSide && onPageChange) {
            onPageChange(page)
        } else {
            table.setPageIndex(page - 1)
        }
    }

    const currentPage = serverSide ? (pagination?.page || 1) : table.getState().pagination.pageIndex + 1
    const totalPages = serverSide ? (pagination?.totalPages || 0) : table.getPageCount()


    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const rowIds = React.useMemo(() => {
        return table.getRowModel().rows.map((row) =>
            getRowId
                ? getRowId(row.original)
                : String((row.original as any).id ?? row.id)
        );
    }, [table.getRowModel().rows, getRowId]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setSortTableData?.((prev) => {
            const ids = prev.map((r) =>
                getRowId ? getRowId(r) : String((r as any).id)
            );

            const oldIndex = ids.indexOf(String(active.id));
            const newIndex = ids.indexOf(String(over.id));

            if (oldIndex === -1 || newIndex === -1) return prev;

            const reordered = arrayMove(prev, oldIndex, newIndex);
            onReorder?.(reordered);
            return reordered;
        });
    };

    const renderRows = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell
                        colSpan={columns.length + (sortable ? 1 : 0)}
                        className="h-24 text-center"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-primary" />
                            Loading...
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        if (!table.getRowModel().rows.length) {
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
            return table.getRowModel().rows.map((row) => (
                <SortableTableRow
                    key={row.id}
                    row={row}
                    id={row.id}
                />
            ));
        }

        return table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </TableCell>
                ))}
            </TableRow>
        ));
    };


    const tableMarkup = (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header) => (
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

                <TableBody>
                    <SortableContext
                        items={rowIds}
                        strategy={verticalListSortingStrategy}
                    >
                        {renderRows()}
                    </SortableContext>
                </TableBody>
            </Table>
        </div>
    );



    return (
        <div>
            {searchKey && (
                <div className="flex justify-start items-center gap-4 py-1">
                    <div className="flex items-center pb-3 w-1/2">
                        <Input
                            placeholder={searchPlaceholder}
                            value={serverSide ? searchValue : (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                            onChange={handleSearchChange}
                            className="max-w-sm"
                            disabled={loading}
                        />
                    </div>


                    {sortable ? (  <div className="flex justify-end items-center pb-3 gap-2 w-1/2">
                        <Checkbox.Root
                            checked={sortable}
                            onCheckedChange={(value) => {
                                setIsDraggingRow?.(value === true);
                            }}
                            className="h-4 w-4 rounded border border-gray-400 flex items-center justify-center"
                        >
                            <Checkbox.Indicator>
                                <CheckIcon className='w-4 h-4 font-medium' />
                            </Checkbox.Indicator>
                        </Checkbox.Root>

                        <label>Rearrange Order List</label>
                    </div>) : null}

                </div>
            )}
            {sortable ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {tableMarkup}
                    <div className="flex justify-end items-center pt-2">
                        <button
                            onClick={() => handleSave?.()}
                            className="px-6 py-2 bg-primary cursor-pointer text-white rounded-md disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </DndContext>
            ) : (
                tableMarkup
            )}
            {pagination && (
                <Pagniation pagination={pagination} currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} loading={loading} />
            )}
        </div>
    )
}
