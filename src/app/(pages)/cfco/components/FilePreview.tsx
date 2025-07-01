import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import Icon from "@/components/IconConfig";

interface FilePreviewProps {
  selectedFile: {
    name: string;
    size: number;
  };
  fileURL?: string;
  uploadProgress: number | null;
  onRemoveFile: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({
  selectedFile,
  fileURL,
  uploadProgress,
  onRemoveFile,
}) => {
  const formatFileSize = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

  return (
    <Box
      sx={{
        mt: 2,
        px: 2,
        py: 1.5,
        border: "1px solid #E0E0E0",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Icon name="fileType" size={30} />
          <Box>
            <Typography
              sx={{
                fontWeight: 500,
                color: "#00886F",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={() => fileURL && window.open(fileURL, "_blank")}
            >
              {selectedFile.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatFileSize(selectedFile.size)}
            </Typography>
          </Box>
        </Box>
        {uploadProgress === 100 && (
          <IconButton onClick={onRemoveFile}>
            <Icon name="delete" size={20} />
          </IconButton>
        )}
      </Box>

      {uploadProgress !== null && uploadProgress < 100 && (
        <Box
          sx={{
            height: 6,
            backgroundColor: "#E0E0E0",
            borderRadius: "4px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${uploadProgress}%`,
              backgroundColor: "#00886F",
              borderRadius: "4px",
              transition: "width 0.3s ease-in-out",
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default FilePreview;
