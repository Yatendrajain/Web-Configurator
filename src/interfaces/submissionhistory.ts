export interface Submission {
  name: string;
  version: number;
  timestamp: string; // ISO string, e.g. "2025-06-21T15:35:00Z"
}

export interface SubmissionHistoryProps {
  open: boolean;
  onClose: () => void;
  submissions: Submission[];
}
