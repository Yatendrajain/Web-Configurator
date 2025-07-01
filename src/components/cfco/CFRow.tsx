"use client";

import React, { useEffect, useState } from "react";
import { TableRow, TableCell, IconButton } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { CFData } from "@/interfaces/cfco";
import {
  subTableCellStyle,
  tableCellStyle,
} from "../DynamicTable/table.styles";

interface CFRowProps {
  row: CFData;
  forceOpen?: boolean;
}

export default function CFRow({ row, forceOpen }: CFRowProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof forceOpen === "boolean") {
      setOpen(forceOpen);
    }
  }, [forceOpen]);

  return (
    <>
      {/* Main row */}
      <TableRow hover sx={{ height: 36 }}>
        <TableCell sx={{ ...subTableCellStyle, width: 40 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell
          sx={{
            ...tableCellStyle,
            width: 100,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 120,
          }}
        >
          {row.type}
        </TableCell>
        <TableCell
          sx={{
            ...tableCellStyle,
            width: 160,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 180,
          }}
        >
          {row.id}
        </TableCell>
        <TableCell
          sx={{
            ...tableCellStyle,
            width: 200,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 220,
          }}
        >
          {row.description}
        </TableCell>
        <TableCell
          sx={{
            ...tableCellStyle,
            width: 160,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 180,
          }}
        >
          {row.parent}
        </TableCell>
        <TableCell
          sx={{
            ...tableCellStyle,
            width: 240,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 260,
          }}
        >
          {row.comment}
        </TableCell>
      </TableRow>

      {/* Collapsed children rows */}
      {open &&
        row.children.map((co) => (
          <TableRow key={co.id} sx={{ height: 36 }}>
            <TableCell sx={{ ...subTableCellStyle, width: 40 }} />
            <TableCell
              sx={{
                ...subTableCellStyle,
                width: 100,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 120,
              }}
            >
              {co.type}
            </TableCell>
            <TableCell
              sx={{
                ...tableCellStyle,
                width: 160,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 180,
              }}
            >
              {co.id}
            </TableCell>
            <TableCell
              sx={{
                ...tableCellStyle,
                width: 200,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 220,
              }}
            >
              {co.description}
            </TableCell>
            <TableCell
              sx={{
                ...tableCellStyle,
                width: 160,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 180,
              }}
            >
              {co.parent}
            </TableCell>
            <TableCell
              sx={{
                ...tableCellStyle,
                width: 240,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 260,
              }}
            >
              {co.comment}
            </TableCell>
          </TableRow>
        ))}
    </>
  );
}
