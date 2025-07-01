import React from "react";
import { Box, Button } from "@mui/material";

interface PaginationControlsProps {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPrevious: () => void;
  onNext: () => void;
  hidePageNumber?: boolean;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  rowsPerPage,
  totalItems,
  onPrevious,
  onNext,
  hidePageNumber = false,
}) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        p: 1.5,
        px: 2,
      }}
    >
      {!hidePageNumber && (
        <span style={{ fontSize: "0.8rem", minWidth: 90 }}>
          Page: {page + 1} of {totalPages}
        </span>
      )}
      <Box sx={{ flexGrow: 1 }} />
      <Box>
        <Button
          variant="outlined"
          onClick={onPrevious}
          disabled={page === 0}
          sx={{
            mr: 1,
            color: "#344054",
            borderColor: "#D0D5DD",
            p: "0.3rem",
            fontSize: "0.7rem",
            "&:hover": {
              borderColor: "#D0D5DD",
              backgroundColor: "#f9fafb",
            },
          }}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={onNext}
          disabled={page + 1 >= totalPages}
          sx={{
            mr: 1,
            color: "#344054",
            borderColor: "#D0D5DD",
            p: "0.3rem",
            fontSize: "0.7rem",
            "&:hover": {
              borderColor: "#D0D5DD",
              backgroundColor: "#f9fafb",
            },
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default PaginationControls;
