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
import ReviewStep from "./ReviewStep";
import CustomSnackbar from "@/components/CustomSnackbar";
import {
  DiffMasterDataApi,
  UploadMasterDataApi,
} from "@/services/cfco/cfco_service";
import { DiffEntry } from "@/constants/common/enums/diff_entry";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const PRODUCT_TYPE_ID = "4af28a55-b142-4348-bc7c-e1ee39578a3e";

const UploadMasterDataModal: React.FC<ModalProps> = ({ open, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [fileURL, setFileURL] = useState<string>("");
  const [sheetData, setSheetData] = useState<DiffEntry[]>([]);
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [isLoading, setIsLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [message, setMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const showToast = (msg: string, type: typeof snackbarType) => {
    setMessage(msg);
    setSnackbarType(type);
    setShowSnackbar(true);
  };

  const normalizeDiffData = (rawData: DiffEntry[]): DiffEntry[] => {
    return rawData.map(
      (item): DiffEntry => ({
        changeType: item.changeType,
        type: item.type || "--",
        identifier: item.identifier || "--",
        description: item.description ?? "--",
        parent: item.parent ?? "--",
        comment: item.comment ?? "--",
        changedField: item.changedField ?? "--",
        oldValue: item.oldValue ?? "--",
        newValue: item.newValue ?? "--",
      }),
    );
  };

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
  }, []);

  const handleClose = useCallback(() => {
    handleRemoveFile();
    onClose();
  }, [onClose]);

  const handleNext = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("productTypeId", PRODUCT_TYPE_ID);

      const response = await DiffMasterDataApi(formData);

      if (response?.error) {
        showToast(response?.response?.message || response.error, "error");
        return;
      }

      const data = normalizeDiffData(response);
      setSheetData(data);
      setStep("review");
    } catch (err) {
      showToast(`Unhandled error: ${err}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("productTypeId", PRODUCT_TYPE_ID);

      const response = await UploadMasterDataApi(formData);

      if (response?.error) {
        showToast(response?.response?.message || response.error, "error");
        return;
      }

      showToast(response.message, "success");
    } catch (err) {
      showToast(`Unhandled error: ${err}`, "error");
    } finally {
      setIsLoading(false);
      onClose();
      handleRemoveFile();
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={false}
        scroll="body"
        slotProps={{
          backdrop: { sx: { backgroundColor: "#D9D9D96B" } },
          paper: {
            sx: {
              width: step === "upload" ? 600 : 900,
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
          sx={{ maxHeight: "70vh", overflowY: "auto", px: 3, pt: 2 }}
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

        <DialogActions sx={{ justifyContent: "flex-end", pb: "30px", mt: 2 }}>
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
                onClick={() => setStep("upload")}
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
                Submit
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
