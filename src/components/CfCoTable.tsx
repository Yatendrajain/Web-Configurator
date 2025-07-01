"use client";

import React, { useState, useMemo } from "react";
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  TableBody,
  IconButton,
  Skeleton,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { CFData, HeadCell } from "@/interfaces/cfco";
import { sortBy } from "@/utils/app/table/sorting";
import CFRow from "./cfco/CFRow";
import {
  tableHeaderStyle,
  tablePaperStyle,
  tableContainerStyle,
} from "./DynamicTable/table.styles";

const headCells: HeadCell[] = [
  { id: "type", label: "Type" },
  { id: "id", label: "Identifier" },
  { id: "description", label: "Description" },
  { id: "parent", label: "Parent" },
  { id: "comment", label: "Comment" },
];

interface CFCOExpandableTableProps {
  data: CFData[];
  error?: string | null;
  loading?: boolean;
}

const CFCOExpandableTable: React.FC<CFCOExpandableTableProps> = ({
  data,
  error,
  loading,
}) => {
  const [orderBy, setOrderBy] = useState<keyof CFData>("id");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [allExpanded, setAllExpanded] = useState(false);

  const handleSort = (property: keyof CFData) => {
    setOrder((prev) =>
      orderBy === property && prev === "asc" ? "desc" : "asc",
    );
    setOrderBy(property);
  };

  const sortedData = useMemo(
    () => sortBy(data, orderBy, order),
    [data, orderBy, order],
  );

  return (
    <Paper elevation={0} sx={tablePaperStyle}>
      <TableContainer
        sx={{
          ...tableContainerStyle,
          width: "100%",
          overflowX: "auto",
          maxHeight: "calc(100vh - 9rem)",
        }}
      >
        <Table
          stickyHeader
          sx={{ minWidth: 800, width: "100%", tableLayout: "fixed" }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...tableHeaderStyle, fontWeight: "bold" }}>
                <IconButton
                  size="small"
                  sx={{ color: "#0a0908" }}
                  onClick={() => setAllExpanded((prev) => !prev)}
                >
                  {allExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                </IconButton>
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sx={{ ...tableHeaderStyle, fontWeight: "bold" }}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={() => handleSort(headCell.id)}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(8)].map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell colSpan={headCells.length + 1}>
                    <Skeleton
                      variant="rectangular"
                      height="1.5rem"
                      sx={{ borderRadius: "0.5rem" }}
                      animation="wave"
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={headCells.length + 1}
                  align="center"
                  style={{ color: "red" }}
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : data.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={headCells.length + 1} align="center">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row) => (
                <CFRow key={row.id} row={row} forceOpen={allExpanded} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CFCOExpandableTable;
