import { SxProps, Theme } from "@mui/material";

export const tablePaperStyle: SxProps<Theme> = {
  border: "1px solid #e4e7ec",
  borderRadius: "0.5rem",
  boxShadow: "none",
  backgroundColor: "#fff",
};

export const tableHeaderStyle: SxProps<Theme> = {
  padding: "12px 16px",
  fontWeight: 500,
  fontSize: "13px",
  color: "#2B2F37", // darker text for header
  backgroundColor: "#F9FAFB",
  borderBottom: "1px solid #EAECF0",
  whiteSpace: "nowrap",
};

export const tableCellStyle: SxProps<Theme> = {
  fontSize: "0.85rem",
  verticalAlign: "middle",
  width: 200,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minHeight: 28,
  height: 28,
  lineHeight: 1.1,
};

export const subTableCellStyle: SxProps<Theme> = {
  px: 1,
  fontSize: "0.85rem",
  verticalAlign: "middle",
  width: 200,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  minHeight: 28,
  height: 28,
  lineHeight: 1.1,
};

export const actionCellStyle: SxProps<Theme> = {
  padding: "6px 12px",
  textAlign: "center",
  borderBottom: "1px solid #EAECF0",
  verticalAlign: "middle",
  width: "100px",
  whiteSpace: "nowrap",
};

export const tableRowHoverStyle: SxProps<Theme> = {
  "&:hover td": {
    backgroundColor: "#F9FAFB",
    cursor: "pointer",
  },
};

export const paperStyle: SxProps<Theme> = {
  border: "1px solid #EAECF0",
  overflow: "hidden",
  backgroundColor: "#FFFFFF",
};

export const tableContainerStyle: SxProps<Theme> = {
  maxHeight: "calc(100vh - 10rem)",
};
