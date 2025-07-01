"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useRef, useState } from "react";
import UploadStep from "./UploadStep";
import CustomSnackbar from "@/components/CustomSnackbar";
import { UploadMasterDataApi } from "@/services/cfco/cfco_service";
import ReviewStep from "./ReviewStep";

type RowData = Record<string, string | number>;
interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const UploadMasterDataModal: React.FC<ModalProps> = ({ open, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sheetData, setSheetData] = useState<RowData[]>([]);
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".xlsx")) {
      alert("Please upload a valid .xlsx file.");
      return;
    }
    setSelectedFile(file);
    setUploadProgress(0);
    setStep("upload");
    let progress = 0;
    const interval = setInterval(() => {
      progress += 100 / (3000 / 100);
      setUploadProgress(() => {
        const next = Math.min(100, Math.round(progress));
        if (next >= 100) clearInterval(interval);
        return next;
      });
    }, 100);
  };

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setUploadProgress(null);
    setSheetData([]);
    setFileURL("");
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [
    setSelectedFile,
    setUploadProgress,
    setSheetData,
    setFileURL,
    setStep,
    fileInputRef,
  ]);

  const handleNext = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("lookup_version", "4af28a55-b142-4348-bc7c-e1ee39578a3e");

      const response = await UploadMasterDataApi(formData);

      if (response?.error) {
        setSnackbarType("error");
        setMessage(response.error);
        setShowSnackbar(true);
        return;
      }

      if (response?.response?.data) {
        setSheetData(response.response.data);
        setMessage("New version of file has been uploaded successfully");
        setSnackbarType("success");
        setShowSnackbar(true);
        setStep("review");
      } else {
        setSnackbarType("error");
        setMessage("No data received from the server.");
        setShowSnackbar(true);
      }
    } catch (err) {
      setSnackbarType("error");
      setMessage(`Unhandled error: ${err}`);
      setShowSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => setStep("upload");
  const handleUpload = () => {
    setShowSnackbar(true);
    onClose();
    handleRemoveFile();
  };
  const handleClose = useCallback(() => {
    handleRemoveFile();
    onClose();
  }, [handleRemoveFile, onClose]);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        scroll="body"
        slotProps={{
          backdrop: {
            sx: { backgroundColor: "#D9D9D96B" },
          },
          paper: {
            sx: {
              minWidth: 600,
              maxWidth: "80vw",
              width: "fit-content",
              borderRadius: 3,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          Upload New Version
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            maxHeight: "70vh",
            overflowY: "auto",
            px: 3,
            pt: 2,
          }}
        >
          {step === "upload" ? (
            <UploadStep
              fileInputRef={fileInputRef}
              selectedFile={selectedFile}
              uploadProgress={uploadProgress}
              fileURL={fileURL}
              onBoxClick={() => fileInputRef.current?.click()}
              onFileChange={handleFileChange}
              onRemoveFile={handleRemoveFile}
            />
          ) : (
            <ReviewStep
              selectedFile={selectedFile}
              fileURL={fileURL}
              sheetData={sheetData}
            />
          )}
        </DialogContent>

        <DialogActions
          sx={{ justifyContent: "flex-end", paddingBottom: "30px", mt: 2 }}
        >
          {step === "upload" ? (
            <>
              <Button
                onClick={handleClose}
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
                onClick={handleNext}
                disabled={!selectedFile || uploadProgress !== 100 || isLoading}
                variant="contained"
                sx={{
                  textTransform: "none",
                  backgroundColor:
                    selectedFile && uploadProgress === 100
                      ? "#00886F"
                      : "#D3D3D3",
                  color: "#FFF",
                }}
              >
                {isLoading ? "Processing..." : "Next"}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleBack}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  color: "#00886F",
                  borderColor: "#00886F",
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleUpload}
                variant="contained"
                sx={{
                  textTransform: "none",
                  backgroundColor: "#00886F",
                  color: "#FFF",
                }}
              >
                Upload
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      <CustomSnackbar
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message={message}
        severity={snackbarType}
      />
    </>
  );
};

export default UploadMasterDataModal;
