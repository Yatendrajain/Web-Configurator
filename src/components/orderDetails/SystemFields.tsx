// components/orderDetails/SystemFields.tsx
"use client";

import React from "react";
import { Box, Typography, TextField } from "@mui/material";
import CustomDropdown from "../customDropdown";
import { FieldItem } from "@/interfaces/editProduct";

interface Props {
  systemFields: FieldItem[];
  onChange: (key: string, value: string) => void;
  mode: string;
}

const SystemFields: React.FC<Props> = ({ systemFields, onChange, mode }) => {
  return (
    <Box className="system-field-flex">
      {systemFields.map((field) => (
        <Box key={field.key}>
          <Box
            key={field.key}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            gap={mode === "edit" ? 2 : 0}
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
            <Box flexBasis="66.33%">
              {mode === "view" ? (
                <Typography
                  variant="subtitle1"
                  fontSize="0.8rem"
                  color="#00886F"
                  fontWeight={500}
                >
                  {field.value}
                </Typography>
              ) : field.options ? (
                <CustomDropdown
                  width={600}
                  defaultOption={field.value}
                  allOptions={field.options}
                />
              ) : (
                <TextField
                  className="inputCustomStyle"
                  fullWidth
                  size="small"
                  value={field.value}
                  onChange={(e) => onChange(field.key, e.target.value)}
                />
              )}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SystemFields;
