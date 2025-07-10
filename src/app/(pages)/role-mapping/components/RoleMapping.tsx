"use client";

import React, { useState } from "react";
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
  onBack?: () => void;
  onSave?: (mappings: RoleMappingItem[]) => void;
}

const permissionOptions = ["Read", "Write", "Admin"];

const RoleMappingWrapper: React.FC<Props> = ({
  roleMappings,
  onChange,
  onBack,
  onSave,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempMappings, setTempMappings] = useState<RoleMappingItem[]>([]);

  const handleEditClick = () => {
    setTempMappings([...roleMappings]); // Store current state as backup
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    // Restore original values
    tempMappings.forEach((item, index) => {
      onChange(index, "permissions", item.permissions);
    });
    setIsEditMode(false);
    setTempMappings([]);
  };

  const handleSaveClick = () => {
    setIsEditMode(false);
    setTempMappings([]);
    if (onSave) {
      onSave(roleMappings);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    }
  };

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
            {/* System Roles - Always Read Only */}
            <TextField
              value={item.role}
              size="small"
              fullWidth
              placeholder="e.g., Reviewer"
              className={styles.grayInput}
              disabled
              InputProps={{
                readOnly: true,
              }}
              //Need this css here otherwise it's not working properly.
              sx={{
                "& .MuiInputBase-input": {
                  padding: "5.5px 12px",
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                },
              }}
            />

            {/* Azure AD Roles - Editable only in edit mode */}
            <FormControl size="small" fullWidth sx={{ flex: 1 }}>
              <Select
                value={item.permissions}
                onChange={(e) => onChange(idx, "permissions", e.target.value)}
                disabled={!isEditMode}
                input={
                  <OutlinedInput
                    notched={false}
                    classes={{ root: "custom-select" }}
                    readOnly={!isEditMode}
                  />
                }
                IconComponent={() => (
                  <ExpandMoreIcon
                    className="custom-select-icon"
                    sx={{
                      color: !isEditMode ? "rgba(0, 0, 0, 0.26)" : "inherit",
                    }}
                  />
                )}
                inputProps={{
                  "aria-label": "Select Azure AD Role",
                  classes: { root: "custom-select-text" },
                }}
                MenuProps={{
                  PaperProps: {
                    className: "custom-select-menu",
                    style: { minWidth: 450, maxWidth: 500 },
                  },
                }}
                sx={{
                  "&.Mui-disabled": {
                    backgroundColor: "#f5f5f5",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
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

      {/* Action Buttons */}
      <Box gap={2} display={"flex"} justifyContent={"flex-end"}>
        {!isEditMode ? (
          // Read-only mode buttons
          <>
            <Button
              variant="outlined"
              onClick={handleBackClick}
              sx={{
                textTransform: "none",
                color: "#00886F",
                borderColor: "#00886F",
                "&:hover": {
                  borderColor: "#00886F",
                  backgroundColor: "rgba(0, 136, 111, 0.04)",
                },
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleEditClick}
              sx={{
                textTransform: "none",
                backgroundColor: "#00886F",
                color: "#FFF",
                "&:hover": {
                  backgroundColor: "#006b57",
                },
              }}
            >
              Edit
            </Button>
          </>
        ) : (
          // Edit mode buttons
          <>
            <Button
              variant="outlined"
              onClick={handleCancelClick}
              sx={{
                textTransform: "none",
                color: "#00886F",
                borderColor: "#00886F",
                "&:hover": {
                  borderColor: "#00886F",
                  backgroundColor: "rgba(0, 136, 111, 0.04)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveClick}
              sx={{
                textTransform: "none",
                backgroundColor: "#00886F",
                color: "#FFF",
                "&:hover": {
                  backgroundColor: "#006b57",
                },
              }}
            >
              Save
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default RoleMappingWrapper;
