"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem } from "@mui/material";
import { FieldItem, PaxVersion } from "@/interfaces/editProduct";

interface Props {
  systemFields: FieldItem[];
  paxVersion?: PaxVersion;
  onChange: (key: string, value: string) => void;
  onValidityChange?: (isValid: boolean) => void;
  mode: string;
  onPaxChange: (key: "major" | "minor", value: string) => void;
}

const SystemFields: React.FC<Props> = ({
  systemFields,
  paxVersion,
  onPaxChange,
  onChange,
  onValidityChange,
  mode,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (key: string, value: string): string => {
    switch (key) {
      case "productNo":
        if (!value.trim()) return "Product No is required";
        return /^(0[1-9]|[1-9][0-9])$/.test(value)
          ? ""
          : "Must be two digits from 01 to 99";
      case "unitId": {
        if (!value) return "Unit Id is required";
        const num = parseInt(value, 10);
        return !/^[0-9]+$/.test(value) || num < 1 || num > 254
          ? "Must be between 1 and 254"
          : "";
      }
      case "dataServerArea":
        if (!value.trim()) return "Data server area is required";
        return /^L(0[1-9]|[1-9][0-9])$/.test(value)
          ? ""
          : "Must be 'L' followed by 01–99";
      case "alarmServerArea":
        if (!value.trim()) return "Alarm service area is required";
        return /^A(0[1-9]|[1-9][0-9])$/.test(value)
          ? ""
          : "Must be 'A' followed by 01–99";
      case "processArea":
        if (!value.trim()) return "Process area is required";
        return value.trim() === "" ? "Process Area is required" : "";
      case "major":
        if (!value.trim()) return "Major is required";
        return !/^[0-9]+$/.test(value) ? "Must be a whole number" : "";
      case "minor":
        if (!value.trim()) return "Minor is required";
        return !/^[0-9]+$/.test(value) ? "Must be a whole number" : "";
      default:
        return "";
    }
  };

  useEffect(() => {
    const allValidSystemFields = systemFields.every((field) => {
      const error = validateField(field.key!, field.value!);
      return !error;
    });

    const majorError = validateField(
      "major",
      paxVersion?.major?.toString() || "",
    );
    const minorError = validateField(
      "minor",
      paxVersion?.minor?.toString() || "",
    );
    const allValid = allValidSystemFields && !majorError && !minorError;

    if (onValidityChange) {
      onValidityChange(allValid);
    }
  }, [systemFields, paxVersion, onValidityChange]);

  return (
    <Box className="system-field-flex">
      {systemFields.map((field) => {
        const errorMsg = errors[field.key!] || "";
        const isTouched = touched[field.key!];

        return (
          <Box key={field.key} mb={2}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Typography
                flexBasis="33.33%"
                fontSize="0.8rem"
                fontWeight={500}
                color="#334053"
              >
                {field.label}
                {mode === "edit" && (
                  <span style={{ color: "red", marginLeft: 2 }}>*</span>
                )}
              </Typography>

              <Box flexBasis="66.33%">
                {mode === "view" ? (
                  <Typography fontSize="0.8rem">{field.value}</Typography>
                ) : field.label === "Process Area" ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    className="inputCustomStyle"
                    value={field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      onChange(field.key!, value);
                      const error = validateField(field.key!, value);
                      setErrors((prev) => ({ ...prev, [field.key!]: error }));
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, [field.key!]: true }));
                      const error = validateField(field.key!, field.value!);
                      setErrors((prev) => ({ ...prev, [field.key!]: error }));
                    }}
                    error={isTouched && Boolean(errorMsg)}
                    helperText={isTouched && errorMsg}
                  >
                    {["USP", "DSP", "PREP"].map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    fullWidth
                    size="small"
                    className="inputCustomStyle"
                    value={field.value}
                    onChange={(e) => {
                      const value = e.target.value;
                      onChange(field.key!, value);
                      const error = validateField(field.key!, value);
                      setErrors((prev) => ({ ...prev, [field.key!]: error }));
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, [field.key!]: true }));
                      const error = validateField(field.key!, field.value!);
                      setErrors((prev) => ({ ...prev, [field.key!]: error }));
                    }}
                    error={isTouched && Boolean(errorMsg)}
                    helperText={isTouched && errorMsg}
                  />
                )}
              </Box>
            </Box>
          </Box>
        );
      })}

      {mode === "view" && paxVersion ? (
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Typography
            flexBasis="20.33%"
            color="#334053"
            fontSize="0.8rem"
            fontWeight={500}
          >
            PAx Version
          </Typography>
          <Box display="flex" flexBasis="66.33%" flexWrap="wrap">
            <Box display="flex" flexBasis="43%">
              <Typography fontSize="0.8rem" fontWeight={500}>
                Major:
              </Typography>
              <Typography fontSize="0.8rem" ml={1} fontWeight={500}>
                {paxVersion.major}
              </Typography>
            </Box>
            <Box display="flex" flexBasis="43%">
              <Typography fontSize="0.8rem" fontWeight={500}>
                Minor:
              </Typography>
              <Typography fontSize="0.8rem" ml={1} fontWeight={500}>
                {paxVersion.minor}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          display="flex"
          justifyContent={"space-between"}
          gap={2}
          alignItems={"center"}
        >
          <Typography
            flexBasis="33.33%"
            color="#334053"
            variant="subtitle2"
            gutterBottom
          >
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
                color="#334053"
                gutterBottom
              >
                Major
                {mode === "edit" && (
                  <span style={{ color: "red", marginLeft: 2 }}>*</span>
                )}
              </Typography>
              {(() => {
                const errorMsg = errors["major"] || "";
                const isTouched = touched["major"!];

                return (
                  <TextField
                    fullWidth
                    size="small"
                    value={paxVersion!.major}
                    className="inputCustomStyle"
                    // onChange={(e) => onPaxChange("major", e.target.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      onPaxChange("major", e.target.value);
                      const error = validateField("major", value);
                      setErrors((prev) => ({ ...prev, ["major"]: error }));
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, ["major"]: true }));
                      const error = validateField("major", paxVersion!.major);
                      setErrors((prev) => ({ ...prev, ["major"]: error }));
                    }}
                    error={isTouched && Boolean(errorMsg)}
                    helperText={isTouched && errorMsg}
                  />
                );
              })()}
            </Box>

            <Box display={"flex"} flexBasis="43%" gap={2} alignItems={"center"}>
              <Typography
                display={"flex"}
                alignItems={"center"}
                variant="subtitle2"
                color="#334053"
                gutterBottom
              >
                Minor
                {mode === "edit" && (
                  <span style={{ color: "red", marginLeft: 2 }}>*</span>
                )}
              </Typography>
              {(() => {
                const errorMsg = errors["minor"] || "";
                const isTouched = touched["minor"!];

                return (
                  <TextField
                    fullWidth
                    size="small"
                    value={paxVersion!.minor}
                    className="inputCustomStyle"
                    // onChange={(e) => onPaxChange("major", e.target.value)}
                    onChange={(e) => {
                      const value = e.target.value;
                      onPaxChange("minor", e.target.value);
                      const error = validateField("minor", value);
                      setErrors((prev) => ({ ...prev, ["minor"]: error }));
                    }}
                    onBlur={() => {
                      setTouched((prev) => ({ ...prev, ["minor"]: true }));
                      const error = validateField("minor", paxVersion!.major);
                      setErrors((prev) => ({ ...prev, ["minor"]: error }));
                    }}
                    error={isTouched && Boolean(errorMsg)}
                    helperText={isTouched && errorMsg}
                  />
                );
              })()}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SystemFields;
