import React, { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import CustomSearchBar from "@/components/CustomSearchBar";
import { ChangeTypes } from "@/constants/common/enums/lookup_entries_upload";
import {
  AddCircle,
  RemoveCircle,
  Edit,
  CheckCircle,
} from "@mui/icons-material";
import { DiffEntry } from "@/constants/common/enums/diff_entry";
import CustomDropdown from "@/components/customDropdown";
import { Option } from "../../../../interfaces/dropDown";

const getChangeTypeIcon = (type: string) => {
  switch (type) {
    case ChangeTypes.ADDED:
      return <AddCircle style={{ color: "green", verticalAlign: "middle" }} />;
    case ChangeTypes.MODIFIED:
      return <Edit style={{ color: "orange", verticalAlign: "middle" }} />;
    case ChangeTypes.REMOVED:
      return <RemoveCircle style={{ color: "red", verticalAlign: "middle" }} />;
    case ChangeTypes.UNCHANGED:
    default:
      return <CheckCircle style={{ color: "gray", verticalAlign: "middle" }} />;
  }
};

interface ReviewStepProps {
  selectedFile: File | null;
  fileURL: string | null;
  sheetData: DiffEntry[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  selectedFile,
  fileURL,
  sheetData,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [changeTypeQuery, setChangeTypeQuery] = useState<string>("");

  const filteredData = useMemo<DiffEntry[]>(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sheetData = sheetData.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(query),
        ),
      );
    }
    if (changeTypeQuery && changeTypeQuery != "NONE") {
      sheetData = sheetData.filter(
        (row) => row.changeType.toUpperCase() == changeTypeQuery.toUpperCase(),
      );
    }
    return sheetData;
  }, [searchQuery, sheetData, changeTypeQuery]);

  const changeTypeOptions: Option[] = [
    ...Object.values(ChangeTypes).map((value) => ({
      value,
      label: value,
    })),
    { value: "NONE", label: "NONE" },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Review Changes in Version:&nbsp;
          <b
            style={{
              color: "#1E7CE7",
              textDecoration: "underline",
              cursor: "pointer",
              fontWeight: "400",
              fontSize: "13px",
            }}
            onClick={() => fileURL && window.open(fileURL, "_blank")}
          >
            {selectedFile?.name}
          </b>
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <CustomDropdown
            width={160}
            defaultOption={"NONE"}
            allOptions={changeTypeOptions}
            onChange={(value: string) => setChangeTypeQuery(value)}
          />
          <CustomSearchBar
            sx={{ height: 32, minHeight: 32, width: 160, marginBottom: 10 }}
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
          />
        </Box>
      </Box>

      <Box
        sx={{
          overflowX: "auto",
          height: "100%",
          minHeight: 200,
          maxHeight: 250,
        }}
      >
        {filteredData.length === 0 ? (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 150,
            }}
          >
            No data found for the current filter or file is empty.
          </Typography>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F5F5F5" }}>
                {sheetData.length > 0 &&
                  Object.keys(sheetData[0]).map((key) => (
                    <th
                      key={key}
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        position: "sticky",
                        top: 0,
                        background: "#F5F5F5",
                        zIndex: 1,
                        whiteSpace: "nowrap", // ✅ prevent wrapping
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>

            <tbody>
              {filteredData.map((row, idx) => (
                <tr key={idx}>
                  {Object.entries(row).map(([key, value], i, arr) => {
                    const isLast = i === arr.length - 1;
                    const noWrap = key === "identifier" || key === "parent";
                    const isChangeType = key === "changeType";

                    return (
                      <td
                        key={key}
                        style={{
                          padding: 12,
                          color: isLast ? "#047B00" : "inherit",
                          borderBottom: "1px solid #E0E0E0",
                          whiteSpace: noWrap ? "nowrap" : "normal",
                        }}
                      >
                        {isChangeType ? (
                          <span
                            style={{
                              marginLeft: 15,
                            }}
                          >
                            {getChangeTypeIcon(String(value))}
                          </span>
                        ) : (
                          String(
                            value === "" ||
                              value === null ||
                              value === undefined
                              ? "--"
                              : value,
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Box>
    </>
  );
};

export default ReviewStep;
