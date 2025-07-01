"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  Divider,
  MenuItem,
  Select,
  FormControl,
  Button,
  OutlinedInput,
} from "@mui/material";
import styles from "@/app/(pages)/role-mapping/roleMapping.module.scss";
import { RoleMappingItem } from "@/app/(pages)/role-mapping/interface";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface Props {
  roleMappings: RoleMappingItem[];
  onChange: (index: number, key: keyof RoleMappingItem, value: string) => void;
}

const permissionOptions = ["Read", "Write", "Admin"];

const RoleMappingWrapper: React.FC<Props> = ({ roleMappings, onChange }) => {
  return (
    <Box sx={{ backgroundColor: "white", borderRadius: 2, p: 2, mt: "-1rem" }}>
      <Typography gutterBottom fontSize={"1rem"} fontWeight={600}>
        Role Mapping
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box display="flex" flexDirection="column" gap={2} mb={2}>
        {/* Header Row */}
        <Box display="flex" gap={2} px={1}>
          <Typography
            flex={1}
            fontWeight={500}
            fontSize={"1rem"}
            color="text.secondary"
          >
            System Roles
          </Typography>
          <Typography
            flex={1}
            fontWeight={500}
            fontSize={"1rem"}
            color="text.secondary"
          >
            Azure AD Roles
          </Typography>
        </Box>

        {/* Mapping Rows */}
        {roleMappings.map((item, idx) => (
          <Box key={idx} display="flex" gap={2} alignItems="center">
            <TextField
              value={item.role}
              size="small"
              fullWidth
              placeholder="e.g., Reviewer"
              className={styles.grayInput}
              disabled
            />

            <FormControl size="small" fullWidth sx={{ flex: 1 }}>
              <Select
                value={item.permissions}
                onChange={(e) => onChange(idx, "permissions", e.target.value)}
                input={
                  <OutlinedInput
                    notched={false}
                    classes={{ root: "custom-select" }}
                  />
                }
                IconComponent={() => (
                  <ExpandMoreIcon className="custom-select-icon" />
                )}
                inputProps={{
                  "aria-label": "Select Product Type",
                  classes: { root: "custom-select-text" },
                }}
                MenuProps={{
                  PaperProps: {
                    className: "custom-select-menu",
                    style: { minWidth: 450, maxWidth: 500 },
                  },
                }}
              >
                {permissionOptions.map((value) => (
                  <MenuItem
                    key={value}
                    value={value}
                    style={{
                      maxWidth: 450,
                      overflow: "visible",
                      whiteSpace: "normal",
                      textOverflow: "initial",
                      wordBreak: "break-word",
                    }}
                    title={value}
                  >
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ))}
      </Box>
      <Box gap={2} display={"flex"} justifyContent={"flex-end"}>
        <Button
          variant="outlined"
          sx={{
            textTransform: "none",
            color: "#00886F",
            borderColor: "#00886F",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {}}
          variant="contained"
          sx={{
            textTransform: "none",
            backgroundColor: "#00886F",
            color: "#FFF",
          }}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default RoleMappingWrapper;
