import React from "react";
import { Box, Typography } from "@mui/material";
import FilePreview from "./FilePreview";
import Icon from "@/components/IconConfig";

interface UploadStepProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedFile: File | null;
  uploadProgress: number | null;
  fileURL: string;
  onBoxClick: () => void;
  onFileChange: React.ChangeEventHandler<HTMLInputElement>;
  onRemoveFile: () => void;
}

const UploadStep: React.FC<UploadStepProps> = ({
  fileInputRef,
  selectedFile,
  uploadProgress,
  fileURL,
  onBoxClick,
  onFileChange,
  onRemoveFile,
}) => (
  <>
    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
      Upload the file and review the changes.
    </Typography>

    <input
      type="file"
      accept=".xlsx"
      ref={fileInputRef}
      style={{ display: "none" }}
      onChange={onFileChange}
    />

    <Box
      onClick={onBoxClick}
      sx={{
        border: "1px solid #E0E0E0",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        mt: 2,
        cursor: "pointer",
        "&:hover": { backgroundColor: "#F7FBFA", border: "1px solid #00886F" },
      }}
    >
      <Icon name="uploadCloud" size={40} />
      <Box
        sx={{ display: "flex", justifyContent: "center", gap: "4px", mt: 1 }}
      >
        <Typography sx={{ fontWeight: 600, color: "#00886F" }}>
          Click to upload
        </Typography>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          or drag and drop
        </Typography>
      </Box>
      <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
        XLSX as a format.
      </Typography>
    </Box>

    {selectedFile && (
      <FilePreview
        selectedFile={selectedFile}
        fileURL={fileURL}
        uploadProgress={uploadProgress}
        onRemoveFile={onRemoveFile}
      />
    )}
  </>
);

export default UploadStep;
