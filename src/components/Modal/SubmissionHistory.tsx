"use client";

import React from "react";
import styles from "@/styles/submissionHistoryPopup.module.scss";
import { SubmissionHistoryProps } from "@/interfaces/submissionhistory";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getTimeDifference } from "@/utils/app/date/dateUtils";
import Icon from "../IconConfig";

const SubmissionHistoryPopup: React.FC<SubmissionHistoryProps> = ({
  open,
  onClose,
  submissions,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ className: styles.popupWrapper }}
    >
      <DialogTitle className={styles.dialogTitle}>
        <div className={styles.titleRow}>
          <Typography variant="h6" className={styles.titleText}>
            Submission History
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
        <Typography variant="body2" className={styles.subTitle}>
          This log shows who submitted updates to this order and when.
        </Typography>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <div className={styles.listWrapper}>
          {submissions.map((entry, index) => (
            <div key={index} className={styles.entry}>
              <div className={styles.flex}>
                <span className={styles.statusDot} />

                <div className={styles.meta}>
                  <Typography variant="body1" className={styles.name}>
                    Submitted by {entry.name}
                  </Typography>
                  <Typography variant="body2" className={styles.version}>
                    Version {entry.version}
                  </Typography>
                </div>
              </div>

              <div className={styles.timeInfo}>
                <span className={styles.timeItem}>
                  <Icon name="calendar" size={15} />{" "}
                  {getTimeDifference(entry.timestamp)}
                </span>

                <span className={styles.divider} />

                <span className={styles.timeItem}>
                  <Icon name="clock" size={15} />{" "}
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubmissionHistoryPopup;
