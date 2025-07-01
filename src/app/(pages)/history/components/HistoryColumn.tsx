// components/historyColumns.tsx
import { ColumnDefinition } from "@/interfaces/table";
import Chip from "@mui/material/Chip";
import HistoryActionButtons from "./HistoryActionButtons";
// import HistoryActionButtons from "./HistoryActionButtons";

export const historyColumns: ColumnDefinition[] = [
  {
    id: "orderIdVersion",
    label: "Order ID (Version)",
    sortable: false,
    render: (value) =>
      value !== undefined && value !== null ? String(value) : "-",
  },
  {
    id: "name",
    label: "Name",
    sortable: false,
  },
  {
    id: "updatedBy",
    label: "Updated By",
    sortByName: "userName",
    sortable: true,
  },
  {
    id: "status",
    label: "Status",
    sortable: false,
    render: (value) => (
      <Chip
        label={String(value ?? "-")}
        size="small"
        sx={{
          backgroundColor: value === "Failed" ? "#FEE4E2" : "#ECFDF3",
          color: value === "Failed" ? "#D92D20" : "#027A48",
          fontWeight: 500,
          fontSize: "0.7rem",
        }}
      />
    ),
  },
  {
    id: "lastSubmitted",
    label: "Last Submitted",
    sortByName: "createdAt",
    sortable: true,
  },
  {
    id: "submissionVersion",
    label: "Submission Version",
    align: "center",
    sortable: false,
  },
  {
    id: "actions",
    label: "Action",
    align: "center",
    sortable: false,
    render: (_, row) => (
      <HistoryActionButtons orderIdVersion={String(row.orderIdVersion)} />
    ),
  },
];
