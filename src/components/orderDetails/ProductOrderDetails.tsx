"use client";
import React, { useState } from "react";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { Props } from "@/interfaces/order";
import SubmissionHistoryPopup from "../Modal/SubmissionHistory";
import { Submission } from "@/interfaces/submissionhistory";
import submissionData from "@/dummy_data/submission-data.json";
import Icon from "../IconConfig";

const ProductDetails: React.FC<Props> = ({ productDetails, mode }) => {
  const [open, setOpen] = useState(false);
  const submissions: Submission[] = submissionData;

  const filteredFields = productDetails.filter((field) => {
    return (
      field.visibleIn === "both" ||
      field.visibleIn === mode || // mode = "edit" or "view"
      !field.visibleIn // fallback to show if not defined
    );
  });

  return (
    <Box p={2} sx={{ backgroundColor: "white", borderRadius: 2 }}>
      <Typography gutterBottom fontSize="1rem" fontWeight={"600"}>
        Product Details
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          px: 2,
        }}
      >
        {filteredFields.map((field) => (
          <Box
            key={field.key}
            sx={{
              minWidth: mode === "view" ? "22vw" : "", // optional minimum width
            }}
          >
            <Typography
              variant="subtitle2"
              fontSize="0.9rem"
              color="text.secondary"
            >
              {field.label}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                fontSize="0.9rem"
                color={
                  field.original && field.original !== field.submitted
                    ? "primary"
                    : "textPrimary"
                }
              >
                {field.submitted}
              </Typography>
              {(field.label === "Submission History" ||
                field.label === "Submission Version") && (
                <IconButton
                  onClick={() => setOpen(true)}
                  sx={{ color: "#0288D1" }}
                  aria-label="View Submission History"
                >
                  <Icon name="view" size={15} />
                </IconButton>
              )}
            </Box>
            {field.original && field.original !== field.submitted && (
              <Typography
                variant="caption"
                color="text.secondary"
                fontSize="0.9rem"
              >
                Original: {field.original}
              </Typography>
            )}
          </Box>
        ))}
      </Box>

      <SubmissionHistoryPopup
        open={open}
        onClose={() => setOpen(false)}
        submissions={submissions}
      />
    </Box>
  );
};

export default ProductDetails;
