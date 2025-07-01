"use client";

import React from "react";
import { Box, Typography, TextField, Divider, Checkbox } from "@mui/material";
import CustomDropdown from "../customDropdown";
import SystemFields from "./SystemFields";
import { Props } from "@/interfaces/editProduct";

const EditProductOrder: React.FC<Props> = ({
  orderFields,
  systemFields,
  paxVersion,
  onChange,
  onPaxChange,
  mode,
}) => {
  return (
    <Box sx={{ backgroundColor: "white", borderRadius: 2, padding: 2 }}>
      <Typography gutterBottom fontSize={"1rem"} fontWeight={"600"}>
        Edit Product Order
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="column" gap={2}>
        {/* Table-like layout */}
        <Box display="flex" flexDirection="column">
          <Box display="flex">
            <Typography
              flexBasis="33.33%"
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.8rem"
              color="text.secondary"
            >
              Field
            </Typography>
            <Typography
              flexBasis="33.33%"
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.8rem"
              color="text.secondary"
            >
              Original Value{" "}
            </Typography>
            <Typography
              flexBasis="33.33%"
              variant="subtitle2"
              fontWeight={600}
              fontSize="0.8rem"
              color="text.secondary"
            >
              {mode === "edit" ? "New Value" : "Submitted Value"}
            </Typography>
          </Box>

          {orderFields.map((field) => (
            <Box
              key={field.key}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                my: 1,
              }}
            >
              <Typography
                flexBasis="33.33%"
                variant="subtitle1"
                fontSize="0.8rem"
                color="#334053"
                fontWeight={500}
              >
                {field.label}{" "}
              </Typography>

              <Typography
                flexBasis={mode === "view" ? "33.33%" : "30.33%"}
                variant="subtitle2"
                fontSize="0.8rem"
                fontWeight={500}
                color="text.secondary"
              >
                {field.original || "-"}
              </Typography>
              <Box flexBasis={mode === "view" ? "33.33%" : "36.33%"}>
                {field.options ? (
                  <CustomDropdown
                    width={280}
                    defaultOption={field.value}
                    allOptions={field.options}
                  />
                ) : (
                  <Typography
                    variant="subtitle1"
                    fontSize="0.8rem"
                    color="#00886F"
                    fontWeight={500}
                  >
                    {field.value}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>

        {mode === "edit" && (
          <>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle1" fontWeight={600}>
                System Fields
              </Typography>
              <Checkbox checked />
            </Box>

            <Divider sx={{ mb: 2, mt: -2 }} />

            <SystemFields
              mode="edit"
              systemFields={systemFields}
              onChange={onChange}
            />
          </>
        )}

        {/* PAX Version Fields */}
        {mode === "edit" && (
          <Box
            display="flex"
            justifyContent={"space-between"}
            gap={2}
            flexWrap="wrap"
            alignItems={"center"}
          >
            <Typography flexBasis="33.33%" variant="subtitle2" gutterBottom>
              PAx Version
            </Typography>
            <Box
              display="flex"
              justifyContent={"space-between"}
              flexBasis="64.33%"
              gap={2}
              flexWrap="wrap"
              alignItems={"center"}
            >
              <Box display={"flex"} flexBasis="43%" gap={2}>
                <Typography
                  display={"flex"}
                  alignItems={"center"}
                  variant="subtitle2"
                  gutterBottom
                >
                  Major
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={paxVersion.major}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "12px",
                      backgroundColor: "#F9FAFB",
                    },
                  }}
                  onChange={(e) => onPaxChange("major", e.target.value)}
                />
              </Box>

              <Box
                display={"flex"}
                flexBasis="43%"
                gap={2}
                alignItems={"center"}
              >
                <Typography
                  display={"flex"}
                  alignItems={"center"}
                  variant="subtitle2"
                  gutterBottom
                >
                  Minor
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={paxVersion.minor}
                  sx={{
                    "& .MuiInputBase-input": {
                      fontSize: "12px",
                      backgroundColor: "#F9FAFB",
                    },
                  }}
                  onChange={(e) => onPaxChange("minor", e.target.value)}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EditProductOrder;
