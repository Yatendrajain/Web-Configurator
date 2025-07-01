"use client";

import React, { JSX, useRef, useEffect, useCallback } from "react";
import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import {
  DynamicTableProps,
  RowData,
  ColumnDefinition,
} from "@/interfaces/table";
import {
  tableCellStyle,
  tableHeaderStyle,
  actionCellStyle,
  tableContainerStyle,
  paperStyle,
} from "@/components/DynamicTable/table.styles";
import Icon from "@/components/IconConfig";

interface MemoizedTableRowProps<T extends RowData> {
  row: T;
  columns: ColumnDefinition<T>[];
  onEdit?: (id: string) => void;
  showEditAction: boolean;
}

function TableRowComponent<T extends RowData>({
  row,
  columns,
  onEdit,
  showEditAction,
}: MemoizedTableRowProps<T>) {
  return (
    <TableRow hover>
      {columns.map((col) => (
        <TableCell
          key={col.id}
          sx={tableCellStyle}
          align={col.align as "left" | "center" | "right"}
        >
          {col.render
            ? col.render(row[col.id], row)
            : String(row[col.id] ?? "-")}
        </TableCell>
      ))}
      {showEditAction && onEdit && (
        <TableCell sx={actionCellStyle}>
          <Box display="flex" justifyContent="center" alignItems="center">
            <IconButton onClick={() => onEdit(String(row.id))}>
              <Icon name="edit" size={16} />
            </IconButton>
          </Box>
        </TableCell>
      )}
    </TableRow>
  );
}

const MemoizedTableRow = React.memo(
  TableRowComponent,
) as typeof TableRowComponent;

interface DynamicTablePropsWithInfinite<T>
  extends Omit<
    DynamicTableProps<T>,
    "page" | "rowsPerPage" | "totalItems" | "onPageChange"
  > {
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

const DynamicTable = <T extends RowData>({
  columns,
  data,
  onEdit,
  showEditAction = true,
  loading,
  sortBy,
  sortOrder,
  onSortChange,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}: DynamicTablePropsWithInfinite<T>) => {
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLTableRowElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loadingMore && onLoadMore) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, onLoadMore],
  );

  useEffect(() => {
    if (loadMoreRef.current && onLoadMore) {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(handleObserver, {
        threshold: 1.0,
      });
      observer.current.observe(loadMoreRef.current);
    }
    return () => observer.current?.disconnect();
  }, [data, handleObserver, onLoadMore]);

  return (
    <Box
      className="dynamic-table-wrapper"
      sx={{ width: "100%", overflowX: "auto" }}
    >
      <Paper elevation={0} sx={paperStyle}>
        <TableContainer sx={tableContainerStyle}>
          <Table
            stickyHeader
            sx={{ minWidth: 800, width: "100%", tableLayout: "fixed" }}
          >
            <TableHead>
              <TableRow>
                {columns.map((col) => {
                  const isActive = sortBy === col.sortByName;
                  return (
                    <TableCell
                      key={col.id}
                      sx={{ ...tableHeaderStyle, fontWeight: "bold" }}
                      sortDirection={isActive ? sortOrder : false}
                      align={
                        col.align as "left" | "center" | "right" | undefined
                      }
                      onClick={
                        col.sortable
                          ? () => onSortChange?.(col.sortByName as string)
                          : undefined
                      }
                    >
                      {col.sortable ? (
                        <TableSortLabel
                          active={isActive}
                          direction={isActive ? sortOrder : "asc"}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  );
                })}
                {showEditAction && (
                  <TableCell
                    sx={{
                      ...tableHeaderStyle,
                      width: "100px",
                      textAlign: "center",
                      fontWeight: "500",
                    }}
                  >
                    Actions
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            {loading ? (
              <TableBody sx={tableContainerStyle}>
                {[...Array(15)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell
                      colSpan={
                        columns.length == 5
                          ? columns.length + 1
                          : columns.length
                      }
                    >
                      <Skeleton
                        variant="rectangular"
                        height="1.4rem"
                        sx={{ borderRadius: "0.5rem" }}
                        animation="wave"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            ) : data.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {data.map((row, index) => (
                  <MemoizedTableRow
                    key={row.id ? String(row.id) : String(index)}
                    row={row}
                    columns={columns}
                    onEdit={onEdit}
                    showEditAction={showEditAction}
                  />
                ))}
                {onLoadMore &&
                  loadingMore &&
                  data.length > 0 &&
                  [...Array(4)].map((_, idx) => (
                    <TableRow key={`loading-more-skeleton-${idx}`}>
                      <TableCell
                        colSpan={columns.length + (showEditAction ? 1 : 0)}
                      >
                        <Skeleton
                          variant="rectangular"
                          height="1.3rem"
                          sx={{ borderRadius: "0.5rem", my: 1 }}
                          animation="wave"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                {onLoadMore && (
                  <TableRow ref={loadMoreRef} style={{ height: 0 }} />
                )}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DynamicTable as <T extends RowData>(
  props: DynamicTablePropsWithInfinite<T>,
) => JSX.Element;
